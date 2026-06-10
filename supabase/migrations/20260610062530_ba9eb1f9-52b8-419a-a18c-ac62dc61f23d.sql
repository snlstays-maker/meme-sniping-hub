
-- Referral tracking table
CREATE TABLE public.partner_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_referrals TO authenticated;
GRANT ALL ON public.partner_referrals TO service_role;
ALTER TABLE public.partner_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pref_select_partner_or_admin" ON public.partner_referrals FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.partner_profiles pp WHERE pp.id = partner_id AND (pp.user_id = auth.uid() OR public.is_admin(auth.uid())))
);
CREATE POLICY "pref_insert_admin" ON public.partner_referrals FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_partner_referrals_partner ON public.partner_referrals(partner_id);

-- Generate unique referral code (8 char alphanumeric, retry on collision)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
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

-- Approve application (admin): creates partner_profile + assigns role
CREATE OR REPLACE FUNCTION public.approve_partner_application(_app_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  app RECORD;
  new_code TEXT;
  pp_id UUID;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  SELECT * INTO app FROM public.partner_applications WHERE id = _app_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'application_not_found'; END IF;
  IF app.status = 'approved' THEN RAISE EXCEPTION 'already_approved'; END IF;
  IF app.user_id IS NULL THEN RAISE EXCEPTION 'application_has_no_user'; END IF;

  -- Existing profile? reactivate
  SELECT id INTO pp_id FROM public.partner_profiles WHERE user_id = app.user_id;
  IF pp_id IS NULL THEN
    new_code := public.generate_referral_code();
    INSERT INTO public.partner_profiles (user_id, referral_code, partner_role, wallet_address, telegram, x_profile, discord)
    VALUES (app.user_id, new_code, app.role_applying, app.wallet_address, app.telegram, app.x_profile, app.discord)
    RETURNING id INTO pp_id;
  ELSE
    UPDATE public.partner_profiles SET is_active = true, partner_role = app.role_applying WHERE id = pp_id;
  END IF;

  -- Grant role
  INSERT INTO public.user_roles (user_id, role) VALUES (app.user_id, app.role_applying)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Mark application
  UPDATE public.partner_applications
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = _app_id;

  RETURN pp_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_partner_application(_app_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'not_authorized'; END IF;
  UPDATE public.partner_applications
  SET status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = _app_id AND status = 'pending';
END;
$$;

-- Extend handle_new_user to capture referral_code from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ref_code TEXT;
  ref_partner RECORD;
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  ref_code := NEW.raw_user_meta_data->>'referral_code';
  IF ref_code IS NOT NULL AND length(ref_code) > 0 THEN
    SELECT id, user_id INTO ref_partner FROM public.partner_profiles WHERE referral_code = upper(ref_code) AND is_active = true;
    IF FOUND AND ref_partner.user_id <> NEW.id THEN
      INSERT INTO public.partner_referrals (partner_id, referred_user_id, referral_code, source)
      VALUES (ref_partner.id, NEW.id, upper(ref_code), NEW.raw_user_meta_data->>'referral_source')
      ON CONFLICT (referred_user_id) DO NOTHING;
      -- Award contribution XP for referral
      UPDATE public.partner_profiles
      SET xp = xp + 50, contribution_score = contribution_score + 10
      WHERE id = ref_partner.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
