-- KosovaBNB: roles, profilet, dhomat, rezervimet, pagesat, rregullat e çmimit, chat, vlerësimet
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TYPE public.app_role AS ENUM ('guest', 'host', 'admin');

CREATE TABLE public.user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    public.app_role NOT NULL,
  PRIMARY KEY (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  phone      TEXT,
  language   TEXT NOT NULL DEFAULT 'sq' CHECK (language IN ('sq', 'en')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'guest');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;

CREATE TABLE public.rooms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  room_type  TEXT NOT NULL DEFAULT 'standard'
             CHECK (room_type IN ('standard', 'deluxe', 'suite', 'family', 'entire_place')),
  capacity   INTEGER NOT NULL DEFAULT 2 CHECK (capacity > 0),
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  min_price  NUMERIC(10,2),
  max_price  NUMERIC(10,2),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (min_price IS NULL OR max_price IS NULL OR min_price <= max_price)
);
GRANT SELECT ON public.rooms TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
CREATE INDEX idx_rooms_listing ON public.rooms(listing_id);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms are publicly readable" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Hosts manage rooms of own listings" ON public.rooms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id
            AND (l.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id
            AND (l.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );

CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TABLE public.bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  room_id         UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  guest_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name      TEXT NOT NULL,
  guest_email     TEXT NOT NULL,
  guest_phone     TEXT,
  check_in        DATE NOT NULL,
  check_out       DATE NOT NULL,
  guests          INTEGER NOT NULL DEFAULT 1 CHECK (guests > 0),
  nights          INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
  price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
  subtotal        NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  service_fee     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  total_price     NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status          public.booking_status NOT NULL DEFAULT 'pending',
  source          TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'chatbot', 'admin')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in),
  CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status IN ('pending', 'confirmed'))
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
CREATE INDEX idx_bookings_listing_dates ON public.bookings(listing_id, check_in, check_out);
CREATE INDEX idx_bookings_guest ON public.bookings(guest_id);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Guests read own bookings" ON public.bookings
  FOR SELECT USING (guest_id = auth.uid());
CREATE POLICY "Hosts read bookings of own listings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Guests create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (guest_id = auth.uid() AND status = 'pending');
CREATE POLICY "Guests cancel own bookings" ON public.bookings
  FOR UPDATE USING (guest_id = auth.uid()) WITH CHECK (guest_id = auth.uid() AND status = 'cancelled');
CREATE POLICY "Hosts update bookings of own listings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE TYPE public.payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

CREATE TABLE public.payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency       CHAR(3) NOT NULL DEFAULT 'EUR',
  method         TEXT NOT NULL DEFAULT 'card_simulated'
                 CHECK (method IN ('card_simulated', 'cash_on_arrival', 'bank_transfer_simulated')),
  status         public.payment_status NOT NULL DEFAULT 'pending',
  card_brand     TEXT,
  card_last4     CHAR(4),
  provider_ref   TEXT,
  failure_reason TEXT,
  is_simulated   BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Guests read own payments" ON public.payments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.bookings b
                            WHERE b.id = booking_id AND b.guest_id = auth.uid()));
CREATE POLICY "Hosts and admins read payments" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings b JOIN public.listings l ON l.id = b.listing_id
            WHERE b.id = booking_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE TABLE public.pricing_rules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('season', 'weekend', 'holiday', 'last_minute', 'long_stay')),
  start_date DATE,
  end_date   DATE,
  multiplier NUMERIC(4,2) NOT NULL CHECK (multiplier > 0 AND multiplier <= 5),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);
GRANT SELECT ON public.pricing_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pricing_rules TO authenticated;
GRANT ALL ON public.pricing_rules TO service_role;
CREATE INDEX idx_pricing_rules_listing ON public.pricing_rules(listing_id);
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing rules are publicly readable" ON public.pricing_rules FOR SELECT USING (is_active);
CREATE POLICY "Hosts manage own pricing rules" ON public.pricing_rules
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid())
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid())
  );

CREATE TYPE public.recommendation_status AS ENUM ('suggested', 'accepted', 'rejected');

CREATE TABLE public.price_recommendations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id           UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  stay_date         DATE NOT NULL,
  current_price     NUMERIC(10,2) NOT NULL,
  recommended_price NUMERIC(10,2) NOT NULL CHECK (recommended_price >= 0),
  confidence        NUMERIC(3,2) CHECK (confidence BETWEEN 0 AND 1),
  factors           JSONB NOT NULL DEFAULT '{}',
  explanation       TEXT,
  model_version     TEXT NOT NULL DEFAULT 'rules-v1',
  status            public.recommendation_status NOT NULL DEFAULT 'suggested',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at        TIMESTAMPTZ,
  UNIQUE (room_id, stay_date, model_version)
);
GRANT SELECT, UPDATE ON public.price_recommendations TO authenticated;
GRANT ALL ON public.price_recommendations TO service_role;
CREATE INDEX idx_price_reco_room_date ON public.price_recommendations(room_id, stay_date);
ALTER TABLE public.price_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts and admins read recommendations" ON public.price_recommendations
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.rooms r JOIN public.listings l ON l.id = r.listing_id
               WHERE r.id = room_id AND l.owner_id = auth.uid())
  );
CREATE POLICY "Hosts and admins decide recommendations" ON public.price_recommendations
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.rooms r JOIN public.listings l ON l.id = r.listing_id
               WHERE r.id = room_id AND l.owner_id = auth.uid())
  );

CREATE TABLE public.chat_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  language   TEXT NOT NULL DEFAULT 'sq',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
CREATE INDEX idx_chat_conv_user ON public.chat_conversations(user_id);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content         TEXT NOT NULL,
  tool_name       TEXT,
  tool_payload    JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
CREATE INDEX idx_chat_msg_conv ON public.chat_messages(conversation_id, created_at);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own conversations" ON public.chat_conversations
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_conversations c
            WHERE c.id = conversation_id
              AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );

CREATE TABLE public.reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  guest_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
CREATE INDEX idx_reviews_listing ON public.reviews(listing_id);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Guests review own completed bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    guest_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.bookings b
                WHERE b.id = booking_id AND b.guest_id = auth.uid() AND b.status = 'completed')
  );

CREATE OR REPLACE FUNCTION public.nightly_price(_room_id UUID, _night DATE)
RETURNS NUMERIC LANGUAGE plpgsql STABLE AS $$
DECLARE
  _room public.rooms%ROWTYPE;
  _mult NUMERIC := 1;
  _price NUMERIC;
BEGIN
  SELECT * INTO _room FROM public.rooms WHERE id = _room_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

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
GRANT EXECUTE ON FUNCTION public.nightly_price(UUID, DATE) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.quote_stay(_room_id UUID, _check_in DATE, _check_out DATE)
RETURNS TABLE (nights INTEGER, subtotal NUMERIC, service_fee NUMERIC, total NUMERIC)
LANGUAGE sql STABLE AS $$
  WITH s AS (
    SELECT COUNT(*)::INTEGER AS n,
           COALESCE(SUM(public.nightly_price(_room_id, d::date)), 0) AS sub
    FROM generate_series(_check_in, _check_out - 1, interval '1 day') AS d
  )
  SELECT n, sub, round(sub * 0.12, 2), sub + round(sub * 0.12, 2) FROM s;
$$;
GRANT EXECUTE ON FUNCTION public.quote_stay(UUID, DATE, DATE) TO anon, authenticated;

CREATE OR REPLACE VIEW public.listing_occupancy_30d AS
SELECT l.id AS listing_id,
       COUNT(DISTINCT r.id) AS rooms,
       COALESCE(SUM(
         LEAST(b.check_out, CURRENT_DATE + 30) - GREATEST(b.check_in, CURRENT_DATE)
       ) FILTER (WHERE b.status IN ('pending', 'confirmed')
                  AND b.check_in < CURRENT_DATE + 30 AND b.check_out > CURRENT_DATE), 0) AS booked_nights,
       CASE WHEN COUNT(DISTINCT r.id) = 0 THEN 0
            ELSE round(
              COALESCE(SUM(
                LEAST(b.check_out, CURRENT_DATE + 30) - GREATEST(b.check_in, CURRENT_DATE)
              ) FILTER (WHERE b.status IN ('pending', 'confirmed')
                         AND b.check_in < CURRENT_DATE + 30 AND b.check_out > CURRENT_DATE), 0)::numeric
              / (COUNT(DISTINCT r.id) * 30), 3)
       END AS occupancy_rate
FROM public.listings l
LEFT JOIN public.rooms r ON r.listing_id = l.id AND r.is_active
LEFT JOIN public.bookings b ON b.room_id = r.id
GROUP BY l.id;

INSERT INTO public.rooms (listing_id, name, room_type, capacity, base_price, min_price, max_price)
SELECT l.id,
       CASE WHEN l.type = 'Hotele' THEN 'Dhomë standarde' ELSE l.title END,
       CASE WHEN l.type = 'Hotele' THEN 'standard' ELSE 'entire_place' END,
       COALESCE(l.guests, 2),
       l.price,
       round(l.price * 0.7, 2),
       round(l.price * 1.8, 2)
FROM public.listings l
WHERE NOT EXISTS (SELECT 1 FROM public.rooms r WHERE r.listing_id = l.id);

INSERT INTO public.rooms (listing_id, name, room_type, capacity, base_price, min_price, max_price)
SELECT l.id, 'Dhomë deluxe', 'deluxe', 3, round(l.price * 1.3, 2), round(l.price * 0.9, 2), round(l.price * 2.2, 2)
FROM public.listings l WHERE l.type = 'Hotele'
  AND NOT EXISTS (SELECT 1 FROM public.rooms r WHERE r.listing_id = l.id AND r.room_type = 'deluxe');
INSERT INTO public.rooms (listing_id, name, room_type, capacity, base_price, min_price, max_price)
SELECT l.id, 'Suite', 'suite', 4, round(l.price * 2.0, 2), round(l.price * 1.4, 2), round(l.price * 3.2, 2)
FROM public.listings l WHERE l.type = 'Hotele'
  AND NOT EXISTS (SELECT 1 FROM public.rooms r WHERE r.listing_id = l.id AND r.room_type = 'suite');

INSERT INTO public.pricing_rules (listing_id, name, kind, start_date, end_date, multiplier) VALUES
  (NULL, 'Sezoni i lartë verë',        'season',  DATE '2027-06-15', DATE '2027-08-31', 1.25),
  (NULL, 'Sezoni i skive (dimër)',     'season',  DATE '2026-12-15', DATE '2027-02-28', 1.20),
  (NULL, 'Dita e Pavarësisë (17 Shk)', 'holiday', DATE '2027-02-15', DATE '2027-02-18', 1.30),
  (NULL, 'Fundjava',                   'weekend', NULL, NULL, 1.10),
  (NULL, 'Last-minute (0-3 ditë)',     'last_minute', NULL, NULL, 0.90);