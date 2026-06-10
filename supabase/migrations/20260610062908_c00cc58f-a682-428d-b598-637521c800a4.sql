
-- ============ PAYOUTS ============
CREATE TABLE public.partner_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  wallet_address TEXT,
  status public.partner_payout_status NOT NULL DEFAULT 'pending',
  tx_hash TEXT,
  notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);
GRANT SELECT ON public.partner_payouts TO authenticated;
GRANT ALL ON public.partner_payouts TO service_role;
ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_select_own_or_admin" ON public.partner_payouts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.partner_profiles pp WHERE pp.id = partner_id AND (pp.user_id = auth.uid() OR public.is_admin(auth.uid())))
);
CREATE INDEX idx_partner_payouts_partner ON public.partner_payouts(partner_id);
CREATE INDEX idx_partner_payouts_status ON public.partner_payouts(status);

-- ============ REQUEST PAYOUT (partner) ============
CREATE OR REPLACE FUNCTION public.request_partner_payout(_amount NUMERIC, _wallet TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pp RECORD;
  new_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  SELECT * INTO pp FROM public.partner_profiles WHERE user_id = auth.uid() AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_a_partner'; END IF;
  IF pp.pending_payout < _amount THEN RAISE EXCEPTION 'insufficient_balance'; END IF;

  INSERT INTO public.partner_payouts (partner_id, amount, wallet_address)
  VALUES (pp.id, _amount, COALESCE(_wallet, pp.wallet_address))
  RETURNING id INTO new_id;

  UPDATE public.partner_profiles
  SET pending_payout = pending_payout - _amount
  WHERE id = pp.id;

  RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.request_partner_payout(NUMERIC, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_partner_payout(NUMERIC, TEXT) TO authenticated;

-- ============ PROCESS PAYOUT (admin) ============
CREATE OR REPLACE FUNCTION public.process_partner_payout(_payout_id UUID, _action TEXT, _tx_hash TEXT DEFAULT NULL, _notes TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  po RECORD;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'not_authorized'; END IF;
  SELECT * INTO po FROM public.partner_payouts WHERE id = _payout_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'payout_not_found'; END IF;

  IF _action = 'approve' THEN
    IF po.status <> 'pending' THEN RAISE EXCEPTION 'invalid_state'; END IF;
    UPDATE public.partner_payouts
    SET status = 'approved', processed_by = auth.uid(), processed_at = now(), notes = COALESCE(_notes, notes)
    WHERE id = _payout_id;

  ELSIF _action = 'paid' THEN
    IF po.status NOT IN ('pending','approved') THEN RAISE EXCEPTION 'invalid_state'; END IF;
    UPDATE public.partner_payouts
    SET status = 'paid', tx_hash = COALESCE(_tx_hash, tx_hash), processed_by = auth.uid(), processed_at = now(), notes = COALESCE(_notes, notes)
    WHERE id = _payout_id;
    UPDATE public.partner_profiles
    SET paid_total = paid_total + po.amount, total_earnings = total_earnings + po.amount
    WHERE id = po.partner_id;

  ELSIF _action = 'reject' THEN
    IF po.status NOT IN ('pending','approved') THEN RAISE EXCEPTION 'invalid_state'; END IF;
    UPDATE public.partner_payouts
    SET status = 'rejected', processed_by = auth.uid(), processed_at = now(), notes = COALESCE(_notes, notes)
    WHERE id = _payout_id;
    -- Return funds to pending
    UPDATE public.partner_profiles
    SET pending_payout = pending_payout + po.amount
    WHERE id = po.partner_id;

  ELSE
    RAISE EXCEPTION 'invalid_action';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.process_partner_payout(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_partner_payout(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- ============ RECORD REVENUE (admin) ============
CREATE OR REPLACE FUNCTION public.record_partner_revenue(_partner_user_id UUID, _event_type TEXT, _amount NUMERIC, _metadata JSONB DEFAULT '{}'::jsonb)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pp RECORD;
  cs RECORD;
  pct NUMERIC;
  commission NUMERIC;
  new_id UUID;
  xp_award INT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'not_authorized'; END IF;
  IF _amount IS NULL OR _amount < 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  SELECT * INTO pp FROM public.partner_profiles WHERE user_id = _partner_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'partner_not_found'; END IF;

  SELECT * INTO cs FROM public.partner_commission_settings ORDER BY updated_at DESC LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'no_commission_settings'; END IF;

  pct := CASE _event_type
    WHEN 'launch_fee'   THEN cs.launch_fee_pct
    WHEN 'promotion'    THEN cs.promotion_pct
    WHEN 'campaign'     THEN cs.campaign_pct
    WHEN 'premium'      THEN cs.premium_pct
    WHEN 'trading_fee'  THEN cs.trading_fee_pct
    ELSE cs.growth_pool_pct
  END;
  commission := round(_amount * pct / 100.0, 4);
  xp_award := greatest(10, floor(commission)::int);

  INSERT INTO public.partner_revenue (partner_id, user_id, event_type, amount, commission_percent, commission_amount, metadata)
  VALUES (pp.id, _partner_user_id, _event_type, _amount, pct, commission, _metadata)
  RETURNING id INTO new_id;

  UPDATE public.partner_profiles
  SET revenue_score = revenue_score + _amount,
      pending_payout = pending_payout + commission,
      xp = xp + xp_award,
      level = greatest(level, 1 + ((xp + xp_award) / 1000))
  WHERE id = pp.id;

  RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.record_partner_revenue(UUID, TEXT, NUMERIC, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_partner_revenue(UUID, TEXT, NUMERIC, JSONB) TO authenticated;
