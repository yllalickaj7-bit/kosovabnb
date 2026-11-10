-- ===== supabase/migrations/20260219221210_3484ead2-7f17-4851-aeb5-6e255180477b.sql =====

-- Create listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Apartamente', 'Hotele', 'Motele', 'Vila', 'Kamping', 'Dizajn')),
  price INTEGER NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 4.50,
  location TEXT NOT NULL,
  distance TEXT NOT NULL DEFAULT '200 km larg',
  dates TEXT NOT NULL DEFAULT '15-20 Gusht',
  images_url TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  host_name TEXT DEFAULT 'Host',
  host_avatar TEXT,
  guests INTEGER DEFAULT 2,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Public read access (listings are public)
CREATE POLICY "Listings are publicly readable"
ON public.listings
FOR SELECT
USING (true);

-- Seed with Kosovo listings data
INSERT INTO public.listings (title, type, price, rating, location, distance, dates, images_url, description, host_name, guests, bedrooms, bathrooms, amenities) VALUES
('Apartament Luksoz në Qendër', 'Apartamente', 65, 4.92, 'Prishtinë, Kosovë', '5 km larg', '12-17 Gusht', ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'], 'Apartament i bukur në zemër të Prishtinës me pamje të mahnitshme', 'Ardian H.', 4, 2, 1, ARRAY['Wi-Fi', 'Kuzhinë', 'Lavatriçe', 'Parking', 'Ajër i kondicionuar']),
('Hotel Boutique Dukagjini', 'Hotele', 89, 4.87, 'Pejë, Kosovë', '130 km larg', '8-13 Shtator', ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800'], 'Hotel 4-ylësh me pamje mahnitëse mbi Alpet Shqiptare', 'Blerim D.', 2, 1, 1, ARRAY['Restorant', 'Pishinë', 'Spa', 'Wi-Fi', 'Parking']),
('Vila Tradicionale Prizrenase', 'Vila', 120, 4.95, 'Prizren, Kosovë', '85 km larg', '20-25 Korrik', ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800', 'https://images.unsplash.com/photo-1505873242700-f289a29e1724?w=800', 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800'], 'Vila e vjetër prizrenase e renovuar me oborr privat dhe pamje mbi kalanë', 'Vjosa K.', 8, 4, 2, ARRAY['Oborr', 'Kuzhinë', 'Wi-Fi', 'Qebaptore', 'Parking']),
('Motel Alpine Rugova', 'Motele', 45, 4.73, 'Grykë Rugovës, Kosovë', '140 km larg', '1-6 Shtator', ARRAY['https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'], 'Motel i qetë në zemër të Grykës së Rugovës, rrethuar nga pyje', 'Mehmet A.', 2, 1, 1, ARRAY['Wi-Fi', 'Parking', 'Kafe falas', 'Pishinë']),
('Shtëpi Kamping Brezovicë', 'Kamping', 28, 4.81, 'Brezovicë, Kosovë', '160 km larg', '15-20 Gusht', ARRAY['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800', 'https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=800', 'https://images.unsplash.com/photo-1526491109672-74740652b963?w=800'], 'Eksperiencë kamping origjinale në malin e Brezovicës me pamje të jashtëzakonshme', 'Liridon M.', 4, 2, 1, ARRAY['Zjarr kamping', 'Wi-Fi', 'Tualete', 'Natyrë']),
('Design Studio Gjakova', 'Dizajn', 95, 4.98, 'Gjakovë, Kosovë', '110 km larg', '3-8 Tetor', ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'], 'Studio minimalist e dizajnuar nga arkitektë me çdo detaj të menduar mirë', 'Rina B.', 2, 1, 1, ARRAY['Wi-Fi', 'Smart TV', 'Kuzhinë', 'Lavatriçe', 'Ajër i kondicionuar']),
('Apartament me Pamje Kalaja', 'Apartamente', 75, 4.89, 'Prizren, Kosovë', '85 km larg', '10-15 Gusht', ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], 'Apartament me pamje direkte mbi Kalanë e Prizrenit, lokacion i rrallë', 'Drita S.', 3, 2, 1, ARRAY['Wi-Fi', 'Kuzhinë', 'Ballkon', 'Ajër i kondicionuar']),
('Hotel Grand Pristina', 'Hotele', 110, 4.76, 'Prishtinë, Kosovë', '3 km larg', '5-10 Tetor', ARRAY['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800'], 'Hotel 5-ylësh në qendër të Prishtinës me restorant dhe qendër wellness', 'Grand Hotels', 2, 1, 1, ARRAY['Restorant', 'Gym', 'Spa', 'Wi-Fi', 'Parking', 'Room service']),
('Vila Malet e Sharrit', 'Vila', 150, 4.94, 'Sharr, Kosovë', '170 km larg', '18-23 Korrik', ARRAY['https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800', 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800'], 'Vila luksoze në malin e Sharrit me pistë ski dhe natyrë mahnitëse', 'Faton G.', 10, 5, 3, ARRAY['Pishinë', 'Sauna', 'Kuzhinë', 'Wi-Fi', 'Parking', 'Zjarr']),
('Motel Drini Gjakovë', 'Motele', 38, 4.65, 'Gjakovë, Kosovë', '110 km larg', '22-27 Gusht', ARRAY['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'], 'Motel pranë lumit Drini me ambient të qetë dhe çmim të volitshëm', 'Skender T.', 2, 1, 1, ARRAY['Wi-Fi', 'Parking', 'Kafe falas']),
('Eco Kamping Bjeshkët', 'Kamping', 22, 4.88, 'Bjeshkët e Nemuna, Kosovë', '180 km larg', '5-10 Shtator', ARRAY['https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'https://images.unsplash.com/photo-1526491109672-74740652b963?w=800', 'https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=800'], 'Kamping eco-friendly në Bjeshkët e Nemuna me udhëzues lokal', 'Nita R.', 6, 3, 2, ARRAY['Natyrë', 'Udhëzues', 'Zjarr kamping']),
('Penthouse Design Mitrovicë', 'Dizajn', 105, 4.91, 'Mitrovicë, Kosovë', '50 km larg', '12-17 Tetor', ARRAY['https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800', 'https://images.unsplash.com/photo-'||'586023492125-27b2c045efd7?w=800', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'], 'Penthouse i dizajnuar çmimtar me tarracë panoramike mbi qytet', 'Kushtrim P.', 4, 2, 2, ARRAY['Tarracë', 'Smart Home', 'Wi-Fi', 'Kuzhinë', 'Parkim']);

-- ===== supabase/migrations/20260315174253_d955ccb3-e009-48af-9061-d8f2e7e17a2a.sql =====
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS lng double precision;

UPDATE public.listings SET lat = 42.6629, lng = 21.1655 WHERE location ILIKE '%prishtinë%' OR location ILIKE '%prishtine%';
UPDATE public.listings SET lat = 42.2139, lng = 20.7397 WHERE location ILIKE '%prizren%';
UPDATE public.listings SET lat = 42.6583, lng = 20.2889 WHERE location ILIKE '%pejë%' OR location ILIKE '%peje%';
UPDATE public.listings SET lat = 42.3803, lng = 20.4308 WHERE location ILIKE '%gjakovë%' OR location ILIKE '%gjakove%';
UPDATE public.listings SET lat = 42.8914, lng = 20.8660 WHERE location ILIKE '%mitrovicë%' OR location ILIKE '%mitrovice%';
UPDATE public.listings SET lat = 42.3700, lng = 21.1553 WHERE location ILIKE '%ferizaj%';
UPDATE public.listings SET lat = 42.4631, lng = 21.4694 WHERE location ILIKE '%gjilan%';
UPDATE public.listings SET lat = 42.5714, lng = 20.9675 WHERE location ILIKE '%vushtrri%';
UPDATE public.listings SET lat = 42.5, lng = 21.0 WHERE lat IS NULL;
-- ===== supabase/migrations/20261110000000_hotel_management_schema.sql =====
-- =====================================================================
-- KosovaBNB – Sistem Inteligjent për Menaxhimin e Hotelit
-- Migrimi: roles, dhoma, rezervime, pagesa (simulim), çmime dinamike, chatbot AI
-- Varet nga tabela ekzistuese public.listings (pronat/hotelet).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;   -- për EXCLUDE (parandalon rezervime të mbivendosura)

-- ---------------------------------------------------------------------
-- 0. Funksion i përbashkët: updated_at
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------
-- 1. Rolet dhe profilet
--    (zëvendëson fjalëkalimin e koduar te edge function "admin-auth")
-- ---------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('guest', 'host', 'admin');

CREATE TABLE public.user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    public.app_role NOT NULL,
  PRIMARY KEY (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER: shmang rekursionin e RLS kur policy-t pyesin për rolin
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Krijo profil + rol "guest" automatikisht kur regjistrohet përdoruesi
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'guest');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. Listings: pronari (host) dhe monedha
-- ---------------------------------------------------------------------
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE POLICY "Hosts manage own listings" ON public.listings
  FOR ALL USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- 3. Dhomat (njësitë e rezervueshme brenda një prone)
-- ---------------------------------------------------------------------
CREATE TABLE public.rooms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  room_type  TEXT NOT NULL DEFAULT 'standard'
             CHECK (room_type IN ('standard', 'deluxe', 'suite', 'family', 'entire_place')),
  capacity   INTEGER NOT NULL DEFAULT 2 CHECK (capacity > 0),
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  min_price  NUMERIC(10,2),            -- kufiri i poshtëm për rekomandimin e çmimit
  max_price  NUMERIC(10,2),            -- kufiri i sipërm
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (min_price IS NULL OR max_price IS NULL OR min_price <= max_price)
);
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

-- ---------------------------------------------------------------------
-- 4. Rezervimet
-- ---------------------------------------------------------------------
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
  price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),  -- snapshot në momentin e rezervimit
  subtotal        NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  service_fee     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  total_price     NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status          public.booking_status NOT NULL DEFAULT 'pending',
  source          TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'chatbot', 'admin')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in),
  -- Një dhomë nuk mund të ketë dy rezervime aktive që mbivendosen
  CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status IN ('pending', 'confirmed'))
);
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

-- ---------------------------------------------------------------------
-- 5. Pagesat (SIMULIM – pa procesues real; asnjë e dhënë reale karte)
-- ---------------------------------------------------------------------
CREATE TYPE public.payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

CREATE TABLE public.payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency       CHAR(3) NOT NULL DEFAULT 'EUR',
  method         TEXT NOT NULL DEFAULT 'card_simulated'
                 CHECK (method IN ('card_simulated', 'cash_on_arrival', 'bank_transfer_simulated')),
  status         public.payment_status NOT NULL DEFAULT 'pending',
  card_brand     TEXT,                               -- p.sh. 'visa' (nga numri provë)
  card_last4     CHAR(4),                            -- vetëm 4 shifrat e fundit; kurrë numri i plotë
  provider_ref   TEXT,                               -- ID e simuluar, p.sh. 'SIM-20261110-ab12cd'
  failure_reason TEXT,
  is_simulated   BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Klienti lexon vetëm; shkrimi bëhet nga edge function "simulate-payment" (service role)
CREATE POLICY "Guests read own payments" ON public.payments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.bookings b
                            WHERE b.id = booking_id AND b.guest_id = auth.uid()));
CREATE POLICY "Hosts and admins read payments" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings b JOIN public.listings l ON l.id = b.listing_id
            WHERE b.id = booking_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- ---------------------------------------------------------------------
-- 6. Rregullat e çmimit (sezon, fundjavë, festa, last-minute)
-- ---------------------------------------------------------------------
CREATE TABLE public.pricing_rules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,  -- NULL = rregull global
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('season', 'weekend', 'holiday', 'last_minute', 'long_stay')),
  start_date DATE,
  end_date   DATE,
  multiplier NUMERIC(4,2) NOT NULL CHECK (multiplier > 0 AND multiplier <= 5),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);
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

-- ---------------------------------------------------------------------
-- 7. Rekomandimet e çmimit nga AI
-- ---------------------------------------------------------------------
CREATE TYPE public.recommendation_status AS ENUM ('suggested', 'accepted', 'rejected');

CREATE TABLE public.price_recommendations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id           UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  stay_date         DATE NOT NULL,
  current_price     NUMERIC(10,2) NOT NULL,
  recommended_price NUMERIC(10,2) NOT NULL CHECK (recommended_price >= 0),
  confidence        NUMERIC(3,2) CHECK (confidence BETWEEN 0 AND 1),
  factors           JSONB NOT NULL DEFAULT '{}',   -- p.sh. {"occupancy":0.82,"season":1.2,"weekend":1.1,"lead_days":4}
  explanation       TEXT,                          -- shpjegim në gjuhë natyrore (LLM)
  model_version     TEXT NOT NULL DEFAULT 'rules-v1',
  status            public.recommendation_status NOT NULL DEFAULT 'suggested',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at        TIMESTAMPTZ,
  UNIQUE (room_id, stay_date, model_version)
);
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

-- ---------------------------------------------------------------------
-- 8. Chatbot AI: bisedat dhe mesazhet
-- ---------------------------------------------------------------------
CREATE TABLE public.chat_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,   -- NULL = vizitor anonim
  session_id TEXT,                                                 -- identifikues i shfletuesit për anonimët
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  language   TEXT NOT NULL DEFAULT 'sq',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_conv_user ON public.chat_conversations(user_id);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content         TEXT NOT NULL,
  tool_name       TEXT,        -- p.sh. 'check_availability', 'create_booking', 'get_price_quote'
  tool_payload    JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_msg_conv ON public.chat_messages(conversation_id, created_at);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Edge function "chat" shkruan me service role; përdoruesi i kyçur lexon bisedat e veta
CREATE POLICY "Users read own conversations" ON public.chat_conversations
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_conversations c
            WHERE c.id = conversation_id
              AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );

-- ---------------------------------------------------------------------
-- 9. Vlerësimet
-- ---------------------------------------------------------------------
CREATE TABLE public.reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  guest_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_listing ON public.reviews(listing_id);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Guests review own completed bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    guest_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.bookings b
                WHERE b.id = booking_id AND b.guest_id = auth.uid() AND b.status = 'completed')
  );

-- ---------------------------------------------------------------------
-- 10. Funksione ndihmëse (përdoren nga chatbot-i dhe widget-i i rezervimit)
-- ---------------------------------------------------------------------

-- Dhomat e lira për një prone në një periudhë
CREATE OR REPLACE FUNCTION public.check_availability(
  _listing_id UUID, _check_in DATE, _check_out DATE, _guests INTEGER DEFAULT 1
) RETURNS TABLE (room_id UUID, room_name TEXT, room_type TEXT, capacity INTEGER, base_price NUMERIC)
LANGUAGE sql STABLE AS $$
  SELECT r.id, r.name, r.room_type, r.capacity, r.base_price
  FROM public.rooms r
  WHERE r.listing_id = _listing_id
    AND r.is_active
    AND r.capacity >= _guests
    AND NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.room_id = r.id
        AND b.status IN ('pending', 'confirmed')
        AND daterange(b.check_in, b.check_out, '[)') && daterange(_check_in, _check_out, '[)')
    )
  ORDER BY r.base_price;
$$;

-- Çmimi për një natë = çmimi bazë × shumëzuesit e rregullave aktive, brenda [min_price, max_price]
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

-- Çmimi total i qëndrimit (shuma e çmimeve ditore) + tarifa e shërbimit 12%
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

-- Zënia (occupancy) e çdo prone për 30 ditët e ardhshme – hyrje për rekomandimin e çmimit
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

-- ---------------------------------------------------------------------
-- 11. Seed: një dhomë për çdo prone ekzistuese + rregulla çmimi globale
-- ---------------------------------------------------------------------
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

-- Hotelet marrin edhe një dhomë deluxe dhe një suite (demonstron shumë dhoma për pronë)
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

-- ===== supabase/migrations/20261110010000_booking_payment_pricing_functions.sql =====
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

