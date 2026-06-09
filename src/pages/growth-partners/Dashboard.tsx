import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGrowthPartner } from "@/hooks/useGrowthPartner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Trophy,
  Activity,
  Copy,
  ArrowUpRight,
  Target,
  Coins,
} from "lucide-react";
import { toast } from "sonner";

const TIER_LEVELS = ["Scout", "Builder", "Promoter", "Growth Expert", "Meme General", "Legend"];
const XP_PER_LEVEL = 1000;

interface Contribution {
  id: string;
  type: string;
  points: number;
  created_at: string;
}
interface RevenueRow {
  id: string;
  event_type: string;
  amount: number;
  commission_amount: number;
  created_at: string;
}

export default function GrowthPartnerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { partner, application, loading, refresh } = useGrowthPartner();
  const navigate = useNavigate();
  const [contribs, setContribs] = useState<Contribution[]>([]);
  const [revenue, setRevenue] = useState<RevenueRow[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!partner) return;
    (async () => {
      const [c, r] = await Promise.all([
        supabase
          .from("partner_contributions")
          .select("id,type,points,created_at")
          .eq("partner_id", partner.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("partner_revenue")
          .select("id,event_type,amount,commission_amount,created_at")
          .eq("partner_id", partner.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      setContribs((c.data as Contribution[]) ?? []);
      setRevenue((r.data as RevenueRow[]) ?? []);
    })();
  }, [partner]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading partner dashboard…
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">You're not a Growth Partner yet</h1>
          <p className="text-muted-foreground mb-6">
            {application?.status === "pending"
              ? "Your application is being reviewed."
              : application?.status === "rejected"
              ? "Your last application was rejected. You can re-apply with more detail."
              : "Apply to join the Growth Partner program and start earning from measurable impact."}
          </p>
          <Button onClick={() => navigate("/growth-partners/apply")}>
            {application ? "View / Re-apply" : "Apply Now"}
          </Button>
        </div>
      </div>
    );
  }

  const referralUrl = `${window.location.origin}/r/${partner.referral_code}`;
  const copyRef = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied");
  };
  const tierName = TIER_LEVELS[Math.min(partner.level - 1, TIER_LEVELS.length - 1)] ?? "Scout";
  const xpInLevel = partner.xp % XP_PER_LEVEL;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Partner Dashboard</h1>
              <p className="text-muted-foreground text-sm capitalize">
                {partner.partner_role.replace("_", " ")} • Level {partner.level} {tierName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono bg-secondary/40">{partner.referral_code}</Badge>
            <Button size="sm" variant="outline" onClick={copyRef}>
              <Copy className="w-4 h-4 mr-1.5" /> Copy Link
            </Button>
            <Button size="sm" onClick={() => navigate("/growth-partners/apply")}>
              <ArrowUpRight className="w-4 h-4 mr-1.5" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Level progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium">{tierName}</span>
              <span className="text-muted-foreground">{xpInLevel} / {XP_PER_LEVEL} XP to next level</span>
            </div>
            <Progress value={(xpInLevel / XP_PER_LEVEL) * 100} />
          </CardContent>
        </Card>

        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Coins} label="Revenue Generated" value={`$${partner.revenue_score.toFixed(2)}`} accent="text-primary" />
          <StatCard icon={Target} label="Contribution Score" value={partner.contribution_score.toFixed(0)} accent="text-accent" />
          <StatCard icon={Wallet} label="Total Earnings" value={`$${partner.total_earnings.toFixed(2)}`} accent="text-warning" />
          <StatCard icon={TrendingUp} label="Pending Payout" value={`$${partner.pending_payout.toFixed(2)}`} accent="text-success" />
        </div>

        {/* Referral link card */}
        <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Users className="w-4 h-4" /> Your Referral Link
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-background/60 rounded-lg text-sm font-mono truncate">{referralUrl}</code>
              <Button size="sm" onClick={copyRef}><Copy className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-primary" /> Recent Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contribs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No contributions yet — start sharing your link!</p>
              ) : (
                <ul className="space-y-2">
                  {contribs.map((c) => (
                    <li key={c.id} className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                      <div>
                        <p className="text-sm font-medium capitalize">{c.type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary/30">+{c.points} pts</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-success" /> Revenue Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenue.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No revenue events yet.</p>
              ) : (
                <ul className="space-y-2">
                  {revenue.map((r) => (
                    <li key={r.id} className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                      <div>
                        <p className="text-sm font-medium capitalize">{r.event_type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono">${r.amount.toFixed(2)}</p>
                        <p className="text-xs text-success">+${r.commission_amount.toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <Icon className={`w-4 h-4 ${accent}`} />
        </div>
        <div className={`text-xl font-bold ${accent}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
