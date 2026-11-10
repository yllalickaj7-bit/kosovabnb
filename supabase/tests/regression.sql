-- Teste regresioni për logjikën e bazës (Java 7). Çdo test përdor ASSERT; dështimi ndalon me mesazh të qartë.
\set ON_ERROR_STOP on
\set QUIET on
CREATE TEMP TABLE ctx (k text PRIMARY KEY, v text);
GRANT ALL ON ctx TO PUBLIC;

DO $$
DECLARE
  _a uuid := gen_random_uuid(); _b uuid := gen_random_uuid(); _host uuid := gen_random_uuid();
  _l uuid; _room uuid; _room_small uuid; _bk uuid; _bk2 uuid; _n int; _msg text; _p numeric;
  _in date := CURRENT_DATE + 40; _out date := CURRENT_DATE + 43;
BEGIN
  INSERT INTO auth.users (id, raw_user_meta_data) VALUES (_a, '{}'), (_b, '{}'), (_host, '{}');
  SELECT id INTO _l FROM public.listings LIMIT 1;
  UPDATE public.listings SET owner_id = _host WHERE id = _l;
  INSERT INTO public.rooms (listing_id, name, room_type, capacity, base_price, min_price, max_price)
    VALUES (_l, 'T1', 'standard', 4, 100, 70, 180) RETURNING id INTO _room;
  INSERT INTO public.rooms (listing_id, name, room_type, capacity, base_price)
    VALUES (_l, 'T2', 'standard', 1, 50) RETURNING id INTO _room_small;
  INSERT INTO ctx VALUES ('a', _a), ('b', _b), ('host', _host), ('l', _l), ('room', _room), ('small', _room_small);

  -- T1: përdorues i ri merr rol guest dhe profil automatikisht
  SELECT count(*) INTO _n FROM public.user_roles WHERE user_id = _a AND role = 'guest';
  ASSERT _n = 1, 'T1: roli guest mungon pas regjistrimit';

  -- T2: pa kyçje nuk rezervohet
  PERFORM set_config('app.uid', '', false);
  BEGIN PERFORM public.create_booking(_room, _in, _out, 2, 'X', 'x@x.com'); ASSERT false, 'T2: rezervim pa kyçje u pranua';
  EXCEPTION WHEN raise_exception THEN NULL; END;

  -- T3: rezervim i vlefshëm; totali = subtotal + tarifa
  PERFORM set_config('app.uid', _a::text, false);
  _bk := public.create_booking(_room, _in, _out, 2, 'Ana', 'ana@x.com');
  SELECT subtotal + service_fee INTO _p FROM public.bookings WHERE id = _bk;
  ASSERT _p = (SELECT total_price FROM public.bookings WHERE id = _bk), 'T3: total_price nuk përputhet';
  ASSERT (SELECT status FROM public.bookings WHERE id = _bk) = 'pending', 'T3: statusi fillestar duhet pending';

  -- T4: mbivendosja e datave refuzohet (edhe pjesërisht)
  PERFORM set_config('app.uid', _b::text, false);
  BEGIN PERFORM public.create_booking(_room, _in + 1, _out + 2, 2, 'Beni', 'b@x.com'); ASSERT false, 'T4: mbivendosja u pranua';
  EXCEPTION WHEN raise_exception THEN GET STACKED DIAGNOSTICS _msg = MESSAGE_TEXT; ASSERT _msg LIKE '%nuk është e lirë%', 'T4: mesazh i papritur: ' || _msg; END;

  -- T5: back-to-back lejohet (check-out = check-in i tjetrit)
  _bk2 := public.create_booking(_room, _out, _out + 2, 2, 'Beni', 'b@x.com');
  ASSERT _bk2 IS NOT NULL, 'T5: back-to-back u refuzua';

  -- T6: kapaciteti, datat e së kaluarës, qëndrimi > 30 net, mysafirë 0
  BEGIN PERFORM public.create_booking(_room_small, _in, _out, 2, 'B', 'b@x.com'); ASSERT false, 'T6a'; EXCEPTION WHEN raise_exception THEN NULL; END;
  BEGIN PERFORM public.create_booking(_room, CURRENT_DATE - 1, CURRENT_DATE + 1, 1, 'B', 'b@x.com'); ASSERT false, 'T6b'; EXCEPTION WHEN raise_exception THEN NULL; END;
  BEGIN PERFORM public.create_booking(_room, _in + 100, _in + 140, 1, 'B', 'b@x.com'); ASSERT false, 'T6c'; EXCEPTION WHEN raise_exception THEN NULL; END;
  BEGIN PERFORM public.create_booking(_room, _in + 100, _in + 102, 0, 'B', 'b@x.com'); ASSERT false, 'T6d'; EXCEPTION WHEN raise_exception THEN NULL; END;

  -- T7: check_availability sheh rezervimet e të tjerëve (SECURITY DEFINER), pra dhoma e zënë nuk shfaqet
  SELECT count(*) INTO _n FROM public.check_availability(_l, _in, _out, 1) WHERE room_id = _room;
  ASSERT _n = 0, 'T7: dhoma e zënë del e lirë';
  SELECT count(*) INTO _n FROM public.check_availability(_l, _in + 60, _in + 62, 1) WHERE room_id = _room;
  ASSERT _n = 1, 'T7: dhoma e lirë nuk del';

  -- T8: çmimi respekton min/max me rregulla ekstreme
  INSERT INTO public.pricing_rules (listing_id, name, kind, start_date, end_date, multiplier)
    VALUES (_l, 'x5', 'season', _in + 200, _in + 210, 5.00);
  _p := public.nightly_price(_room, _in + 205);
  ASSERT _p <= 180 AND _p >= 70, 'T8: çmimi jashtë kufijve: ' || _p;
END $$;

-- T9–T12: pagesat (si përdoruesi a)
DO $$
DECLARE _a uuid := (SELECT v::uuid FROM ctx WHERE k='a'); _room uuid := (SELECT v::uuid FROM ctx WHERE k='room');
  _bk uuid; _r record; _n int; _in date := CURRENT_DATE + 80;
BEGIN
  PERFORM set_config('app.uid', _a::text, false);
  -- refuzim
  _bk := public.create_booking(_room, _in, _in + 2, 2, 'Ana', 'ana@x.com');
  SELECT * INTO _r FROM public.simulate_payment(_bk, '4000 0000 0000 0002', '12/30');
  ASSERT _r.status = 'failed', 'T9: karta e refuzuar duhej të dështonte, u kthye ' || _r.status;
  ASSERT (SELECT status FROM public.bookings WHERE id = _bk) = 'pending', 'T9: rezervimi duhet të mbetet pending';
  -- fonde të pamjaftueshme
  SELECT * INTO _r FROM public.simulate_payment(_bk, '4000 0000 0000 9995', '12/30');
  ASSERT _r.status = 'failed', 'T10: fonde të pamjaftueshme';
  -- skaduar
  SELECT * INTO _r FROM public.simulate_payment(_bk, '4242 4242 4242 4242', '01/20');
  ASSERT _r.status = 'failed', 'T10b: kartë e skaduar duhej të dështonte';
  -- sukses
  SELECT * INTO _r FROM public.simulate_payment(_bk, '4242 4242 4242 4242', '12/30');
  ASSERT _r.status = 'succeeded', 'T11: pagesa duhej të kalonte';
  ASSERT (SELECT status FROM public.bookings WHERE id = _bk) = 'confirmed', 'T11: rezervimi duhej të konfirmohet';
  -- asnjëherë numri i plotë
  SELECT count(*) INTO _n FROM public.payments WHERE booking_id = _bk AND card_last4 = '4242' AND is_simulated;
  ASSERT _n >= 1, 'T12: card_last4/is_simulated mungon';
  ASSERT NOT EXISTS (SELECT 1 FROM public.payments p WHERE to_jsonb(p)::text LIKE '%4242424242424242%' OR to_jsonb(p)::text LIKE '%4242 4242%'), 'T12: numri i plotë i kartës u ruajt!';
  -- pagesë e dytë mbi rezervim të konfirmuar
  BEGIN PERFORM * FROM public.simulate_payment(_bk, '4242 4242 4242 4242', '12/30'); ASSERT false, 'T12b: pagesë e dyfishtë u pranua';
  EXCEPTION WHEN raise_exception THEN NULL; END;
END $$;

-- T13: përdoruesi tjetër nuk paguan rezervimin e dikujt
DO $$
DECLARE _a uuid := (SELECT v::uuid FROM ctx WHERE k='a'); _b uuid := (SELECT v::uuid FROM ctx WHERE k='b');
  _room uuid := (SELECT v::uuid FROM ctx WHERE k='room'); _bk uuid;
BEGIN
  PERFORM set_config('app.uid', _a::text, false);
  _bk := public.create_booking(_room, CURRENT_DATE + 120, CURRENT_DATE + 122, 2, 'Ana', 'ana@x.com');
  PERFORM set_config('app.uid', _b::text, false);
  BEGIN PERFORM * FROM public.simulate_payment(_bk, '4242 4242 4242 4242', '12/30'); ASSERT false, 'T13: pagesë nga përdorues i huaj u pranua';
  EXCEPTION WHEN raise_exception THEN NULL; END;
END $$;

-- T14: RLS: përdoruesi b nuk i sheh rezervimet e a-së; hosti i sheh ato të pronës së vet
DO $$
DECLARE _a uuid := (SELECT v::uuid FROM ctx WHERE k='a'); _b uuid := (SELECT v::uuid FROM ctx WHERE k='b'); _h uuid := (SELECT v::uuid FROM ctx WHERE k='host'); _n int;
BEGIN
  SET LOCAL ROLE authenticated;
  PERFORM set_config('app.uid', _b::text, true);
  SELECT count(*) INTO _n FROM public.bookings WHERE guest_id = _a;
  ASSERT _n = 0, 'T14: b sheh rezervimet e a: ' || _n;
  PERFORM set_config('app.uid', _h::text, true);
  SELECT count(*) INTO _n FROM public.bookings;
  ASSERT _n >= 3, 'T14: hosti nuk i sheh rezervimet e pronës së vet: ' || _n;
  PERFORM set_config('app.uid', _a::text, true);
  BEGIN INSERT INTO public.payments (booking_id, amount, status, is_simulated) SELECT id, 1, 'succeeded', true FROM public.bookings LIMIT 1;
    ASSERT false, 'T14: klienti shkroi direkt te payments';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN NULL; END;
  RESET ROLE;
END $$;

-- T15: rekomandimet e çmimit dhe vendimi
DO $$
DECLARE _h uuid := (SELECT v::uuid FROM ctx WHERE k='host'); _a uuid := (SELECT v::uuid FROM ctx WHERE k='a');
  _l uuid := (SELECT v::uuid FROM ctx WHERE k='l'); _n int; _id uuid; _room uuid := (SELECT v::uuid FROM ctx WHERE k='room'); _p numeric; _d date;
BEGIN
  PERFORM set_config('app.uid', _a::text, false);
  BEGIN PERFORM public.generate_price_recommendations(_l, 14); ASSERT false, 'T15a: jo-host gjeneroi rekomandime';
  EXCEPTION WHEN raise_exception OR insufficient_privilege THEN NULL; END;
  PERFORM set_config('app.uid', _h::text, false);
  _n := public.generate_price_recommendations(_l, 14);
  ASSERT _n > 0, 'T15b: asnjë rekomandim u krijua';
  ASSERT NOT EXISTS (SELECT 1 FROM public.price_recommendations pr JOIN public.rooms r ON r.id = pr.room_id
                     WHERE pr.recommended_price < coalesce(r.min_price, 0) OR pr.recommended_price > coalesce(r.max_price, 1e9)),
         'T15c: rekomandim jashtë kufijve min/max';
  SELECT id, stay_date, room_id, recommended_price INTO _id, _d, _room, _p FROM public.price_recommendations WHERE status = 'suggested' LIMIT 1;
  PERFORM public.decide_price_recommendation(_id, true);
  ASSERT (SELECT status FROM public.price_recommendations WHERE id = _id) = 'accepted', 'T15d: statusi nuk u bë accepted';
  ASSERT public.nightly_price(_room, _d) = _p, 'T15e: çmimi i pranuar nuk zbatohet te nightly_price';
END $$;

\echo 'TESTET SQL: 15 grupe kontrollesh, të gjitha kaluan'
