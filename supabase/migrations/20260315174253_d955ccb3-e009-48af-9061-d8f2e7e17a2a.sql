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