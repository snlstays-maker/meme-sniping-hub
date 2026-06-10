import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function GrowthPartnerReferral() {
  const { code } = useParams<{ code: string }>();
  const [params] = useSearchParams();
  const [done, setDone] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!code) return setValid(false);
      const upper = code.toUpperCase();
      const { data } = await supabase
        .from("partner_profiles")
        .select("referral_code")
        .eq("referral_code", upper)
        .eq("is_active", true)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        localStorage.setItem("referral_code", upper);
        const src = params.get("src");
        if (src) localStorage.setItem("referral_source", src);
        setValid(true);
      } else {
        setValid(false);
      }
      setDone(true);
    })();
    return () => { cancelled = true; };
  }, [code, params]);

  if (!done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (valid) return <Navigate to="/auth" replace />;
  return <Navigate to="/" replace />;
}
