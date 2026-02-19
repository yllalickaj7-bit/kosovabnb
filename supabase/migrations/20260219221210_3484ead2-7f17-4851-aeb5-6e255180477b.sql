
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
