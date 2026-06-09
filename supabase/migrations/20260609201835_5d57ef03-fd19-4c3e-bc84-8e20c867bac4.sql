
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('user','ambassador','dev_consultant','growth_partner','strategic_partner','admin','super_admin');
CREATE TYPE public.partner_application_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.partner_payout_status AS ENUM ('pending','approved','rejected','paid');
CREATE TYPE public.partner_contribution_status AS ENUM ('pending','approved','rejected');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'))
$$;

CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============ AUTO-CREATE PROFILE + DEFAULT ROLE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ POSITIONS ============
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  token_name TEXT,
  chain TEXT NOT NULL DEFAULT 'solana',
  entry_price NUMERIC NOT NULL DEFAULT 0,
  current_price NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  entry_value NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  profit_loss_percent NUMERIC NOT NULL DEFAULT 0,
  profit_loss_value NUMERIC NOT NULL DEFAULT 0,
  profit_take_percent NUMERIC NOT NULL DEFAULT 100,
  stop_loss_percent NUMERIC NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'open',
  exit_reason TEXT,
  exit_price NUMERIC,
  exit_tx_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.positions TO authenticated;
GRANT ALL ON public.positions TO service_role;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "positions_own" ON public.positions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER positions_updated BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SNIPER SETTINGS ============
CREATE TABLE public.user_sniper_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  min_liquidity NUMERIC NOT NULL DEFAULT 300,
  profit_take_percentage NUMERIC NOT NULL DEFAULT 100,
  stop_loss_percentage NUMERIC NOT NULL DEFAULT 20,
  trade_amount NUMERIC NOT NULL DEFAULT 0.1,
  max_concurrent_trades INTEGER NOT NULL DEFAULT 3,
  priority TEXT NOT NULL DEFAULT 'normal',
  category_filters TEXT[] NOT NULL DEFAULT ARRAY['animals','parody','trend','utility'],
  token_blacklist TEXT[] NOT NULL DEFAULT '{}',
  token_whitelist TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sniper_settings TO authenticated;
GRANT ALL ON public.user_sniper_settings TO service_role;
ALTER TABLE public.user_sniper_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sniper_own" ON public.user_sniper_settings FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER sniper_updated BEFORE UPDATE ON public.user_sniper_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ COPY TRADES ============
CREATE TABLE public.copy_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leader_address TEXT NOT NULL,
  leader_name TEXT,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  action TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  tx_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.copy_trades TO authenticated;
GRANT ALL ON public.copy_trades TO service_role;
ALTER TABLE public.copy_trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "copy_trades_own" ON public.copy_trades FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- ============ API CONFIGS (admin) ============
CREATE TABLE public.api_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_type TEXT NOT NULL,
  api_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_key_encrypted TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'inactive',
  last_checked_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_configurations TO authenticated;
GRANT ALL ON public.api_configurations TO service_role;
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api_cfg_admin" ON public.api_configurations FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER api_cfg_updated BEFORE UPDATE ON public.api_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DISCLAIMER ============
CREATE TABLE public.disclaimer_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.disclaimer_acknowledgments TO authenticated;
GRANT ALL ON public.disclaimer_acknowledgments TO service_role;
ALTER TABLE public.disclaimer_acknowledgments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disc_own_sel" ON public.disclaimer_acknowledgments FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "disc_own_ins" ON public.disclaimer_acknowledgments FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);

-- ============================================
-- GROWTH PARTNERS MODULE — PHASE 1
-- ============================================

-- Applications
CREATE TABLE public.partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  wallet_address TEXT,
  telegram TEXT,
  x_profile TEXT,
  discord TEXT,
  country TEXT,
  experience TEXT,
  role_applying public.app_role NOT NULL,
  why_join TEXT,
  status public.partner_application_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partner_applications TO authenticated;
GRANT ALL ON public.partner_applications TO service_role;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apps_insert_self" ON public.partner_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "apps_select_self_or_admin" ON public.partner_applications FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "apps_update_admin" ON public.partner_applications FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Partner profiles (approved partners)
CREATE TABLE public.partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  partner_role public.app_role NOT NULL,
  tier TEXT NOT NULL DEFAULT 'scout',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  wallet_address TEXT,
  telegram TEXT,
  x_profile TEXT,
  discord TEXT,
  contribution_score NUMERIC NOT NULL DEFAULT 0,
  revenue_score NUMERIC NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  pending_payout NUMERIC NOT NULL DEFAULT 0,
  paid_total NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partner_profiles TO authenticated;
GRANT SELECT ON public.partner_profiles TO anon;
GRANT ALL ON public.partner_profiles TO service_role;
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pp_select_public" ON public.partner_profiles FOR SELECT USING (true);
CREATE POLICY "pp_update_own_or_admin" ON public.partner_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "pp_insert_admin" ON public.partner_profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER pp_updated BEFORE UPDATE ON public.partner_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contributions
CREATE TABLE public.partner_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  source_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status public.partner_contribution_status NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_contributions TO authenticated;
GRANT ALL ON public.partner_contributions TO service_role;
ALTER TABLE public.partner_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pc_select_own_or_admin" ON public.partner_contributions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.partner_profiles pp WHERE pp.id = partner_id AND (pp.user_id = auth.uid() OR public.is_admin(auth.uid())))
);
CREATE POLICY "pc_insert_admin" ON public.partner_contributions FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- Revenue attribution
CREATE TABLE public.partner_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  commission_percent NUMERIC NOT NULL DEFAULT 0,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_revenue TO authenticated;
GRANT ALL ON public.partner_revenue TO service_role;
ALTER TABLE public.partner_revenue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pr_select_own_or_admin" ON public.partner_revenue FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.partner_profiles pp WHERE pp.id = partner_id AND (pp.user_id = auth.uid() OR public.is_admin(auth.uid())))
);
CREATE POLICY "pr_insert_admin" ON public.partner_revenue FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- Commission settings (singleton row managed by admin)
CREATE TABLE public.partner_commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_fee_pct NUMERIC NOT NULL DEFAULT 20,
  promotion_pct NUMERIC NOT NULL DEFAULT 20,
  campaign_pct NUMERIC NOT NULL DEFAULT 15,
  premium_pct NUMERIC NOT NULL DEFAULT 10,
  trading_fee_pct NUMERIC NOT NULL DEFAULT 5,
  growth_pool_pct NUMERIC NOT NULL DEFAULT 20,
  contribution_weight NUMERIC NOT NULL DEFAULT 40,
  revenue_weight NUMERIC NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_commission_settings TO authenticated, anon;
GRANT ALL ON public.partner_commission_settings TO service_role;
ALTER TABLE public.partner_commission_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pcs_read_all" ON public.partner_commission_settings FOR SELECT USING (true);
CREATE POLICY "pcs_admin_write" ON public.partner_commission_settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
INSERT INTO public.partner_commission_settings DEFAULT VALUES;
