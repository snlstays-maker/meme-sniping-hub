import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGrowthPartner } from "@/hooks/useGrowthPartner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  wallet_address: z.string().trim().max(120).optional().or(z.literal("")),
  telegram: z.string().trim().max(80).optional().or(z.literal("")),
  x_profile: z.string().trim().max(120).optional().or(z.literal("")),
  discord: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  experience: z.string().trim().max(1000).optional().or(z.literal("")),
  role_applying: z.enum(["ambassador", "dev_consultant", "growth_partner"]),
  why_join: z.string().trim().min(20).max(2000),
});

type FormState = z.infer<typeof schema>;

const initial: FormState = {
  name: "",
  wallet_address: "",
  telegram: "",
  x_profile: "",
  discord: "",
  country: "",
  experience: "",
  role_applying: "ambassador",
  why_join: "",
};

export default function GrowthPartnerApply() {
  const { user } = useAuth();
  const { application, refresh } = useGrowthPartner();
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete the form");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("partner_applications").insert({
      name: parsed.data.name,
      wallet_address: parsed.data.wallet_address || null,
      telegram: parsed.data.telegram || null,
      x_profile: parsed.data.x_profile || null,
      discord: parsed.data.discord || null,
      country: parsed.data.country || null,
      experience: parsed.data.experience || null,
      role_applying: parsed.data.role_applying,
      why_join: parsed.data.why_join,
      user_id: user.id,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Application submitted — we'll review it shortly");
    await refresh();
  };

  const statusBadge = () => {
    if (!application) return null;
    const map = {
      pending: { color: "bg-warning/15 text-warning border-warning/30", icon: Clock, label: "Pending Review" },
      approved: { color: "bg-success/15 text-success border-success/30", icon: CheckCircle2, label: "Approved" },
      rejected: { color: "bg-destructive/15 text-destructive border-destructive/30", icon: XCircle, label: "Rejected" },
    } as const;
    const s = map[application.status];
    const Icon = s.icon;
    return (
      <Badge variant="outline" className={`${s.color} gap-1.5 px-3 py-1.5`}>
        <Icon className="w-3.5 h-3.5" /> {s.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Become a Growth Partner</h1>
            <p className="text-muted-foreground">Earn rewards based on measurable impact — revenue, referrals, contributions.</p>
          </div>
          {statusBadge()}
        </div>

        {application && application.status === "pending" && (
          <Card className="mb-6 border-warning/30 bg-warning/5">
            <CardContent className="pt-6 text-sm">
              Your application is under review. You'll be notified once a decision is made.
            </CardContent>
          </Card>
        )}
        {application && application.status === "approved" && (
          <Card className="mb-6 border-success/30 bg-success/5">
            <CardContent className="pt-6 flex items-center justify-between gap-4">
              <p className="text-sm">You're approved! Visit your Partner Dashboard.</p>
              <Button onClick={() => navigate("/growth-partners/dashboard")}>Open Dashboard</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>Tell us about you and how you'll grow the ecosystem.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name *">
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} required maxLength={80} />
                </Field>
                <Field label="Role Applying For *">
                  <Select value={form.role_applying} onValueChange={(v) => update("role_applying", v as FormState["role_applying"]) }>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ambassador">Ambassador</SelectItem>
                      <SelectItem value="dev_consultant">Dev Consultant</SelectItem>
                      <SelectItem value="growth_partner">Growth Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Wallet Address">
                  <Input value={form.wallet_address} onChange={(e) => update("wallet_address", e.target.value)} placeholder="0x... or Solana addr" maxLength={120} />
                </Field>
                <Field label="Country">
                  <Input value={form.country} onChange={(e) => update("country", e.target.value)} maxLength={60} />
                </Field>
                <Field label="Telegram">
                  <Input value={form.telegram} onChange={(e) => update("telegram", e.target.value)} placeholder="@handle" maxLength={80} />
                </Field>
                <Field label="X / Twitter">
                  <Input value={form.x_profile} onChange={(e) => update("x_profile", e.target.value)} placeholder="@handle" maxLength={120} />
                </Field>
                <Field label="Discord">
                  <Input value={form.discord} onChange={(e) => update("discord", e.target.value)} placeholder="username" maxLength={80} />
                </Field>
              </div>

              <Field label="Relevant Experience">
                <Textarea value={form.experience} onChange={(e) => update("experience", e.target.value)} rows={3} maxLength={1000} placeholder="Communities, launches, contributions, audience size…" />
              </Field>

              <Field label="Why do you want to join? *">
                <Textarea value={form.why_join} onChange={(e) => update("why_join", e.target.value)} rows={4} required minLength={20} maxLength={2000} placeholder="Tell us how you'll drive growth (min 20 chars)" />
              </Field>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate("/")}>Cancel</Button>
                <Button type="submit" disabled={submitting || !user || application?.status === "pending"}>
                  {submitting ? "Submitting…" : "Submit Application"}
                </Button>
              </div>

              {!user && (
                <p className="text-sm text-muted-foreground text-center">
                  Please <Link to="/auth" className="text-primary hover:underline">sign in</Link> to submit an application.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
