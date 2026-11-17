DROP POLICY "Overrides are publicly readable" ON public.room_price_overrides;
DROP POLICY "Rooms are publicly readable" ON public.rooms;

-- Preserve public booking quotes without exposing private room or override rows.
CREATE OR REPLACE FUNCTION public.quote_stay(_room_id uuid, _check_in date, _check_out date)
RETURNS TABLE(nights integer, subtotal numeric, service_fee numeric, total numeric)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF _check_in IS NULL OR _check_out IS NULL
     OR _check_in < CURRENT_DATE
     OR _check_out <= _check_in
     OR _check_out - _check_in > 30 THEN
    RAISE EXCEPTION 'Invalid stay dates';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.rooms r
    JOIN public.listings l ON l.id = r.listing_id
    WHERE r.id = _room_id AND r.is_active AND l.is_active
  ) THEN
    RAISE EXCEPTION 'Room unavailable';
  END IF;

  RETURN QUERY
  WITH s AS (
    SELECT COUNT(*)::INTEGER AS n,
           COALESCE(SUM(public.nightly_price(_room_id, d::date)), 0) AS sub
    FROM generate_series(_check_in, _check_out - 1, interval '1 day') AS d
  )
  SELECT n, sub, round(sub * 0.12, 2), sub + round(sub * 0.12, 2) FROM s;
END;
$function$;

REVOKE ALL ON FUNCTION public.quote_stay(uuid, date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quote_stay(uuid, date, date) TO anon, authenticated, service_role;