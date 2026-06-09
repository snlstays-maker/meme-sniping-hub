import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PartnerProfile {
  id: string;
  user_id: string;
  referral_code: string;
  partner_role: string;
  tier: string;
  level: number;
  xp: number;
  bio: string | null;
  wallet_address: string | null;
  telegram: string | null;
  x_profile: string | null;
  discord: string | null;
  contribution_score: number;
  revenue_score: number;
  total_earnings: number;
  pending_payout: number;
  paid_total: number;
  is_active: boolean;
  created_at: string;
}

export interface PartnerApplication {
  id: string;
  status: "pending" | "approved" | "rejected";
  role_applying: string;
  created_at: string;
}

export function useGrowthPartner() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [application, setApplication] = useState<PartnerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setPartner(null);
      setApplication(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [partnerRes, appRes] = await Promise.all([
      supabase.from("partner_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("partner_applications")
        .select("id,status,role_applying,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    setPartner((partnerRes.data as PartnerProfile) ?? null);
    setApplication((appRes.data as PartnerApplication) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { partner, application, loading, refresh };
}
