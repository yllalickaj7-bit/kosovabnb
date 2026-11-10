-- =====================================================================
-- KosovaBNB – Funksione për rezervim, pagesë të simuluar, rekomandim çmimi dhe role
-- Varet nga 20261110000000_hotel_management_schema.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Çmime të miratuara për një natë të caktuar (nga rekomandimi AI ose manualisht)
-- ---------------------------------------------------------------------
CREATE TABLE public.room_price_overrides (
  room_id    UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  stay_date  DATE NOT NULL,
  price      NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  source     TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, stay_date)
);
ALTER TABLE public.room_price_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Overrides are publicly readable" ON public.room_price_overrides FOR SELECT USING (true);
CREATE POLICY "Hosts manage overrides of own rooms" ON public.room_price_overrides
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.rooms r JOIN public.listings l ON l.id = r.listing_id
               WHERE r.id = room_id AND l.owner_id = auth.uid())
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.rooms r JOIN public.listings l ON l.id = r.listing_id
               WHERE r.id = room_id AND l.owner_id = auth.uid())
  );

-- nightly_price: çmimi i miratuar për datën ka përparësi mbi rregullat
CREATE OR REPLACE FUNCTION public.nightly_price(_room_id UUID, _night DATE)
RETURNS NUMERIC LANGUAGE plpgsql STABLE AS $$
DECLARE
  _room public.rooms%ROWTYPE;
  _override NUMERIC;
  _mult NUMERIC := 1;
  _price NUMERIC;
BEGIN
  SELECT * INTO _room FROM public.rooms WHERE id = _room_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT price INTO _override FROM public.room_price_overrides
  WHERE room_id = _room_id AND stay_date = _night;
  IF _override IS NOT NULL THEN RETURN _override; END IF;

  SELECT COALESCE(exp(sum(ln(pr.multiplier))), 1) INTO _mult
  FROM public.pricing_rules pr
  WHERE pr.is_active
    AND (pr.listing_id IS NULL OR pr.listing_id = _room.listing_id)
    AND (
      (pr.kind IN ('season', 'holiday') AND _night BETWEEN pr.start_date AND pr.end_date)
      OR (pr.kind = 'weekend' AND extract(isodow FROM _night) IN (5, 6))
      OR (pr.kind = 'last_minute' AND _night - CURRENT_DATE BETWEEN 0 AND 3)
    );

  _price := round(_room.base_price * _mult, 2);
  IF _room.min_price IS NOT NULL THEN _price := GREATEST(_price, _room.min_price); END IF;
  IF _room.max_price IS NOT NULL THEN _price := LEAST(_price, _room.max_price); END IF;
  RETURN _price;
END;
$$;

-- check_availability: rezervimet "pending" më të vjetra se 30 minuta nuk e bllokojnë dhomën.
-- SECURITY DEFINER: duhet t'i shohë rezervimet e të gjithë përdoruesve (RLS i fsheh), por kthen vetëm të dhëna dhome.
CREATE OR REPLACE FUNCTION public.check_availability(
  _listing_id UUID, _check_in DATE, _check_out DATE, _guests INTEGER DEFAULT 1
) RETURNS TABLE (room_id UUID, room_name TEXT, room_type TEXT, capacity INTEGER, base_price NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.name, r.room_type, r.capacity, r.base_price
  FROM public.rooms r
  WHERE r.listing_id = _listing_id
    AND r.is_active
    AND r.capacity >= _guests
    AND NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.room_id = r.id
        AND (b.status = 'confirmed' OR (b.status = 'pending' AND b.created_at > now() - interval '30 minutes'))
        AND daterange(b.check_in, b.check_out, '[)') && daterange(_check_in, _check_out, '[)')
    )
  ORDER BY r.base_price;
$$;

-- ---------------------------------------------------------------------
-- 2. Roli "host"
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.become_host()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Duhet të kyçeni'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'host') ON CONFLICT DO NOTHING;
END;
$$;

-- ---------------------------------------------------------------------
-- 3. Krijimi i rezervimit (çmimi llogaritet në server, jo nga klienti)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking(
  _room_id UUID, _check_in DATE, _check_out DATE, _guests INTEGER,
  _guest_name TEXT, _guest_email TEXT, _guest_phone TEXT DEFAULT NULL,
  _source TEXT DEFAULT 'web'
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
  _room public.rooms%ROWTYPE;
  _q RECORD;
  _id UUID;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Duhet të kyçeni për të rezervuar'; END IF;
  IF _source NOT IN ('web', 'chatbot') THEN RAISE EXCEPTION 'Burim i pavlefshëm'; END IF;
  IF _check_in IS NULL OR _check_out IS NULL OR _check_out <= _check_in THEN
    RAISE EXCEPTION 'Datat nuk janë të vlefshme';
  END IF;
  IF _check_in < CURRENT_DATE THEN RAISE EXCEPTION 'Data e check-in nuk mund të jetë në të kaluarën'; END IF;
  IF _check_out - _check_in > 30 THEN RAISE EXCEPTION 'Qëndrimi maksimal është 30 net'; END IF;
  IF _guests IS NULL OR _guests < 1 THEN RAISE EXCEPTION 'Numri i mysafirëve nuk është i vlefshëm'; END IF;
  IF coalesce(trim(_guest_name), '') = '' OR coalesce(trim(_guest_email), '') = '' THEN
    RAISE EXCEPTION 'Emri dhe email-i janë të detyrueshëm';
  END IF;

  SELECT * INTO _room FROM public.rooms WHERE id = _room_id AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'Dhoma nuk ekziston'; END IF;
  IF _guests > _room.capacity THEN
    RAISE EXCEPTION 'Dhoma pranon maksimumi % mysafirë', _room.capacity;
  END IF;

  -- liro dhomat nga rezervimet pending të vjetruara
  UPDATE public.bookings SET status = 'cancelled'
  WHERE status = 'pending' AND created_at < now() - interval '30 minutes';

  SELECT * INTO _q FROM public.quote_stay(_room_id, _check_in, _check_out);

  BEGIN
    INSERT INTO public.bookings (
      listing_id, room_id, guest_id, guest_name, guest_email, guest_phone,
      check_in, check_out, guests, price_per_night, subtotal, service_fee, total_price, status, source
    ) VALUES (
      _room.listing_id, _room_id, _uid, trim(_guest_name), trim(_guest_email), _guest_phone,
      _check_in, _check_out, _guests, round(_q.subtotal / _q.nights, 2), _q.subtotal, _q.service_fee, _q.total,
      'pending', _source
    ) RETURNING id INTO _id;
  EXCEPTION WHEN exclusion_violation THEN
    RAISE EXCEPTION 'Dhoma nuk është e lirë në këto data';
  END;

  RETURN _id;
END;
$$;

-- ---------------------------------------------------------------------
-- 4. Pagesa e simuluar. Asnjë e dhënë reale: ruhen vetëm brand dhe 4 shifrat e fundit.
--    Karta provë: 4242424242424242 = sukses, 4000000000000002 = refuzuar,
--                 4000000000009995 = fonde të pamjaftueshme.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.simulate_payment(
  _booking_id UUID, _card_number TEXT, _expiry TEXT
) RETURNS TABLE (payment_id UUID, status public.payment_status, message TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _b public.bookings%ROWTYPE;
  _digits TEXT := regexp_replace(coalesce(_card_number, ''), '\D', '', 'g');
  _status public.payment_status := 'succeeded';
  _reason TEXT := NULL;
  _brand TEXT;
  _pid UUID;
  _exp_m INTEGER;
  _exp_y INTEGER;
  _sum INTEGER := 0;
  _i INTEGER;
  _d INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Duhet të kyçeni'; END IF;

  SELECT * INTO _b FROM public.bookings WHERE id = _booking_id AND guest_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Rezervimi nuk u gjet'; END IF;
  IF _b.status <> 'pending' THEN RAISE EXCEPTION 'Rezervimi nuk është në pritje të pagesës'; END IF;

  _brand := CASE left(_digits, 1) WHEN '4' THEN 'visa' WHEN '5' THEN 'mastercard' ELSE 'other' END;

  IF length(_digits) <> 16 THEN
    _status := 'failed'; _reason := 'Numri i kartës duhet të ketë 16 shifra';
  ELSIF _expiry !~ '^(0[1-9]|1[0-2])/[0-9]{2}$' THEN
    _status := 'failed'; _reason := 'Data e skadimit duhet të jetë në formatin MM/VV';
  ELSE
    _exp_m := split_part(_expiry, '/', 1)::INTEGER;
    _exp_y := 2000 + split_part(_expiry, '/', 2)::INTEGER;
    IF make_date(_exp_y, _exp_m, 1) + interval '1 month' <= CURRENT_DATE THEN
      _status := 'failed'; _reason := 'Karta ka skaduar';
    ELSIF _digits = '4000000000000002' THEN
      _status := 'failed'; _reason := 'Karta u refuzua nga banka (simulim)';
    ELSIF _digits = '4000000000009995' THEN
      _status := 'failed'; _reason := 'Fonde të pamjaftueshme (simulim)';
    ELSE
      -- kontrolli Luhn për numra të tjerë
      FOR _i IN 1..16 LOOP
        _d := substr(reverse(_digits), _i, 1)::INTEGER;
        IF _i % 2 = 0 THEN
          _d := _d * 2;
          IF _d > 9 THEN _d := _d - 9; END IF;
        END IF;
        _sum := _sum + _d;
      END LOOP;
      IF _sum % 10 <> 0 THEN
        _status := 'failed'; _reason := 'Numri i kartës nuk është i vlefshëm';
      END IF;
    END IF;
  END IF;

  INSERT INTO public.payments (booking_id, amount, currency, method, status, card_brand, card_last4,
                               provider_ref, failure_reason, is_simulated)
  VALUES (_b.id, _b.total_price, 'EUR', 'card_simulated', _status, _brand, right(_digits, 4),
          'SIM-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6),
          _reason, true)
  RETURNING id INTO _pid;

  IF _status = 'succeeded' THEN
    UPDATE public.bookings SET status = 'confirmed' WHERE id = _b.id;
  END IF;

  RETURN QUERY SELECT _pid, _status,
    CASE WHEN _status = 'succeeded' THEN 'Pagesa (simulim) u krye me sukses' ELSE _reason END;
END;
$$;

-- ---------------------------------------------------------------------
-- 5. Rekomandimi i çmimit (statistikë + rregulla; shpjegimi në shqip)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_price_recommendations(_listing_id UUID, _days INTEGER DEFAULT 30)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _room public.rooms%ROWTYPE;
  _day DATE;
  _nrooms INTEGER;
  _booked NUMERIC;
  _occ NUMERIC;
  _lead INTEGER;
  _adj NUMERIC;
  _cur NUMERIC;
  _rec NUMERIC;
  _why TEXT;
  _count INTEGER := 0;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin')
          OR EXISTS (SELECT 1 FROM public.listings WHERE id = _listing_id AND owner_id = auth.uid())) THEN
    RAISE EXCEPTION 'Nuk keni leje për këtë pronë';
  END IF;
  _days := LEAST(GREATEST(coalesce(_days, 30), 1), 90);

  SELECT COUNT(*) INTO _nrooms FROM public.rooms WHERE listing_id = _listing_id AND is_active;
  IF _nrooms = 0 THEN RETURN 0; END IF;

  -- sugjerimet e vjetra, ende të pavendosura, zëvendësohen
  DELETE FROM public.price_recommendations pr USING public.rooms r
  WHERE pr.room_id = r.id AND r.listing_id = _listing_id
    AND pr.status = 'suggested' AND pr.model_version = 'rules-v1';

  FOR _room IN SELECT * FROM public.rooms WHERE listing_id = _listing_id AND is_active LOOP
    FOR _day IN SELECT d::date FROM generate_series(CURRENT_DATE, CURRENT_DATE + (_days - 1), interval '1 day') d LOOP
      -- nuk sugjerojmë çmim për natë tashmë të rezervuar
      IF EXISTS (SELECT 1 FROM public.bookings b
                 WHERE b.room_id = _room.id AND b.status IN ('pending', 'confirmed')
                   AND _day >= b.check_in AND _day < b.check_out) THEN
        CONTINUE;
      END IF;

      -- zënia e dritares ±7 ditë në nivel prone (net të rezervuara / net të disponueshme)
      SELECT COALESCE(SUM(LEAST(b.check_out, _day + 7) - GREATEST(b.check_in, _day - 7)), 0)
        INTO _booked
      FROM public.bookings b JOIN public.rooms rm ON rm.id = b.room_id
      WHERE rm.listing_id = _listing_id AND b.status IN ('pending', 'confirmed')
        AND b.check_in < _day + 7 AND b.check_out > _day - 7;
      _occ := least(1, _booked / (_nrooms * 14.0));
      _lead := _day - CURRENT_DATE;

      _adj := 1;
      IF _occ >= 0.8 THEN _adj := 1.15;
      ELSIF _occ >= 0.6 THEN _adj := 1.08;
      ELSIF _occ < 0.25 AND _lead <= 14 THEN _adj := 0.90;
      ELSIF _occ < 0.4 AND _lead <= 30 THEN _adj := 0.95;
      END IF;

      _cur := public.nightly_price(_room.id, _day);
      _rec := round(_cur * _adj, 2);
      IF _room.min_price IS NOT NULL THEN _rec := GREATEST(_rec, _room.min_price); END IF;
      IF _room.max_price IS NOT NULL THEN _rec := LEAST(_rec, _room.max_price); END IF;
      IF abs(_rec - _cur) < 1 THEN CONTINUE; END IF;

      _why := format('Çmimi sugjerohet më %s: zënia e dritares 14-ditore është %s%% dhe mbeten %s ditë deri në qëndrim.',
                     CASE WHEN _rec > _cur THEN 'i lartë' ELSE 'i ulët' END,
                     round(_occ * 100), _lead);

      INSERT INTO public.price_recommendations
        (room_id, stay_date, current_price, recommended_price, confidence, factors, explanation, model_version)
      VALUES (_room.id, _day, _cur, _rec,
              CASE WHEN _booked > 0 THEN 0.70 ELSE 0.45 END,
              jsonb_build_object('occupancy', round(_occ, 3), 'lead_days', _lead, 'demand_multiplier', _adj,
                                 'booked_room_nights', _booked),
              _why, 'rules-v1')
      ON CONFLICT (room_id, stay_date, model_version) DO UPDATE
        SET current_price = EXCLUDED.current_price, recommended_price = EXCLUDED.recommended_price,
            confidence = EXCLUDED.confidence, factors = EXCLUDED.factors,
            explanation = EXCLUDED.explanation, status = 'suggested', decided_at = NULL
        WHERE public.price_recommendations.status = 'suggested';
      _count := _count + 1;
    END LOOP;
  END LOOP;

  RETURN _count;
END;
$$;

CREATE OR REPLACE FUNCTION public.decide_price_recommendation(_id UUID, _accept BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _r public.price_recommendations%ROWTYPE;
BEGIN
  SELECT pr.* INTO _r FROM public.price_recommendations pr
  JOIN public.rooms rm ON rm.id = pr.room_id
  JOIN public.listings l ON l.id = rm.listing_id
  WHERE pr.id = _id AND (l.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
  IF NOT FOUND THEN RAISE EXCEPTION 'Rekomandimi nuk u gjet ose nuk keni leje'; END IF;
  IF _r.status <> 'suggested' THEN RAISE EXCEPTION 'Rekomandimi është vendosur tashmë'; END IF;

  UPDATE public.price_recommendations
  SET status = CASE WHEN _accept THEN 'accepted'::public.recommendation_status ELSE 'rejected'::public.recommendation_status END,
      decided_at = now()
  WHERE id = _id;

  IF _accept THEN
    INSERT INTO public.room_price_overrides (room_id, stay_date, price, source)
    VALUES (_r.room_id, _r.stay_date, _r.recommended_price, 'ai')
    ON CONFLICT (room_id, stay_date) DO UPDATE SET price = EXCLUDED.price, source = 'ai';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------
-- 6. Të drejtat e ekzekutimit
-- ---------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.become_host() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_booking(UUID, DATE, DATE, INTEGER, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.simulate_payment(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.generate_price_recommendations(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decide_price_recommendation(UUID, BOOLEAN) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.become_host() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking(UUID, DATE, DATE, INTEGER, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.simulate_payment(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_price_recommendations(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_price_recommendation(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_availability(UUID, DATE, DATE, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.quote_stay(UUID, DATE, DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nightly_price(UUID, DATE) TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. Prona mund të krijojë vetëm host ose admin (jo çdo përdorues i kyçur)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Hosts manage own listings" ON public.listings;
CREATE POLICY "Hosts manage own listings" ON public.listings
  FOR ALL
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (
    (owner_id = auth.uid() AND public.has_role(auth.uid(), 'host'))
    OR public.has_role(auth.uid(), 'admin')
  );
