
-- Set search_path on helper
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  code TEXT;
  exists_count INT;
BEGIN
  LOOP
    code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    SELECT count(*) INTO exists_count FROM public.partner_profiles WHERE referral_code = code;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN code;
END;
$$;

-- Restrict execution of admin RPCs
REVOKE ALL ON FUNCTION public.approve_partner_application(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reject_partner_application(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_partner_application(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_partner_application(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
