import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Sparkles, Loader2, Wallet, Coins } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  user_id: string | null;
  name: string;
  role_applying: string;
  status: "pending" | "approved" | "rejected";
  country: string | null;
  telegram: string | null;
  x_profile: string | null;
  why_join: string | null;
  experience: string | null;
  wallet_address: string | null;
  created_at: string;
}

interface Payout {
  id: string;
  partner_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  wallet_address: string | null;
  tx_hash: string | null;
  requested_at: string;
  processed_at: string | null;
}

interface PartnerLite {
  id: string;
  user_id: string;
  referral_code: string;
  partner_role: string;
  pending_payout: number;
  revenue_score: number;
  total_earnings: number;
}

export default function GrowthPartnerAdmin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Growth Partner Admin</h1>
            <p className="text-muted-foreground">Review applications, process payouts, attribute revenue.</p>
          </div>
        </div>

        <Tabs defaultValue="applications">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="revenue">Record Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-6"><ApplicationsTab /></TabsContent>
          <TabsContent value="payouts" className="mt-6"><PayoutsTab /></TabsContent>
          <TabsContent value="revenue" className="mt-6"><RevenueTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ===================== APPLICATIONS ===================== */
function ApplicationsTab() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("partner_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setApps((data as Application[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    setActingId(id);
    const { error } = await supabase.rpc("approve_partner_application", { _app_id: id });
    setActingId(null);
    if (error) return toast.error(error.message);
    toast.success("Partner approved");
    load();
  };
  const reject = async (id: string) => {
    setActingId(id);
    const { error } = await supabase.rpc("reject_partner_application", { _app_id: id });
    setActingId(null);
    if (error) return toast.error(error.message);
    toast.success("Application rejected");
    load();
  };

  const filtered = apps.filter((a) => a.status === tab);
  const counts = {
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Queue</CardTitle>
        <CardDescription>Approving auto-creates the partner profile, generates a referral code, and grants the role.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="pending"><Clock className="w-3.5 h-3.5 mr-1.5" />Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="approved"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Approved ({counts.approved})</TabsTrigger>
            <TabsTrigger value="rejected"><XCircle className="w-3.5 h-3.5 mr-1.5" />Rejected ({counts.rejected})</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-4">
            {loading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No applications.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div className="font-medium">{a.name}</div>
                          {a.country && <div className="text-xs text-muted-foreground">{a.country}</div>}
                          {a.why_join && <div className="text-xs text-muted-foreground mt-1 max-w-md line-clamp-2">{a.why_join}</div>}
                        </TableCell>
                        <TableCell><Badge variant="outline">{a.role_applying.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="text-xs">
                          {a.telegram && <div>TG: {a.telegram}</div>}
                          {a.x_profile && <div>X: {a.x_profile}</div>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {a.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => reject(a.id)} disabled={actingId === a.id}>Reject</Button>
                              <Button size="sm" onClick={() => approve(a.id)} disabled={actingId === a.id}>
                                {actingId === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline" className={a.status === "approved" ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"}>{a.status}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/* ===================== PAYOUTS ===================== */
function PayoutsTab() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Payout | null>(null);
  const [txHash, setTxHash] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("partner_payouts")
      .select("*")
      .order("requested_at", { ascending: false });
    if (error) toast.error(error.message);
    setPayouts((data as Payout[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const act = async (id: string, action: "approve" | "paid" | "reject") => {
    setBusy(true);
    const { error } = await supabase.rpc("process_partner_payout", {
      _payout_id: id,
      _action: action,
      _tx_hash: action === "paid" ? (txHash || null) : null,
      _notes: notes || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Payout ${action}`);
    setActive(null); setTxHash(""); setNotes("");
    load();
  };

  const styles: Record<Payout["status"], string> = {
    pending: "bg-warning/15 text-warning border-warning/30",
    approved: "bg-primary/15 text-primary border-primary/30",
    rejected: "bg-destructive/15 text-destructive border-destructive/30",
    paid: "bg-success/15 text-success border-success/30",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-warning" /> Payout Requests</CardTitle>
        <CardDescription>Approve, mark paid (with on-chain tx), or reject to return funds to pending.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : payouts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No payout requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono">${p.amount.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[180px]">{p.wallet_address ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(p.requested_at).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className={styles[p.status]}>{p.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      {p.status === "pending" || p.status === "approved" ? (
                        <div className="flex justify-end gap-2">
                          {p.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => act(p.id, "approve")} disabled={busy}>Approve</Button>
                          )}
                          <Button size="sm" onClick={() => setActive(p)} disabled={busy}>Mark Paid</Button>
                          <Button size="sm" variant="outline" onClick={() => act(p.id, "reject")} disabled={busy}>Reject</Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">{p.tx_hash ?? ""}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Payout Paid</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm">Amount: <span className="font-mono">${active?.amount.toFixed(2)}</span></div>
              <div className="space-y-2">
                <Label>Transaction Hash</Label>
                <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x..." />
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
              <Button onClick={() => active && act(active.id, "paid")} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Paid"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/* ===================== RECORD REVENUE ===================== */
const EVENT_TYPES = [
  { value: "launch_fee", label: "Launch Fee" },
  { value: "promotion", label: "Promotion" },
  { value: "campaign", label: "Campaign" },
  { value: "premium", label: "Premium" },
  { value: "trading_fee", label: "Trading Fee" },
  { value: "growth_pool", label: "Growth Pool" },
];

function RevenueTab() {
  const [partners, setPartners] = useState<PartnerLite[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [eventType, setEventType] = useState("launch_fee");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("partner_profiles")
        .select("id,user_id,referral_code,partner_role,pending_payout,revenue_score,total_earnings")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setPartners((data as PartnerLite[]) ?? []);
    })();
  }, []);

  const submit = async () => {
    const n = parseFloat(amount);
    if (!partnerId) return toast.error("Select a partner");
    if (!n || n <= 0) return toast.error("Enter a positive amount");
    const partner = partners.find((p) => p.id === partnerId);
    if (!partner) return;
    setBusy(true);
    const { error } = await supabase.rpc("record_partner_revenue", {
      _partner_user_id: partner.user_id,
      _event_type: eventType,
      _amount: n,
      _metadata: {},
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Revenue recorded — commission credited to partner");
    setAmount("");
    // Refresh partner stats
    const { data } = await supabase
      .from("partner_profiles")
      .select("id,user_id,referral_code,partner_role,pending_payout,revenue_score,total_earnings")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setPartners((data as PartnerLite[]) ?? []);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Coins className="w-5 h-5 text-primary" /> Record Revenue Event</CardTitle>
          <CardDescription>Attributes revenue to a partner. Commission is computed from global rates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Partner</Label>
            <Select value={partnerId} onValueChange={setPartnerId}>
              <SelectTrigger><SelectValue placeholder="Select a partner" /></SelectTrigger>
              <SelectContent>
                {partners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.referral_code} • {p.partner_role.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gross Amount (USD)</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <Button onClick={submit} disabled={busy} className="w-full">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Record & Credit Commission"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Partners</CardTitle>
          <CardDescription>Live balances and lifetime earnings.</CardDescription>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No active partners.</p>
          ) : (
            <ul className="space-y-2">
              {partners.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                  <div>
                    <p className="text-sm font-mono">{p.referral_code}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.partner_role.replace("_", " ")}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p>Pending: <span className="font-mono text-warning">${p.pending_payout.toFixed(2)}</span></p>
                    <p>Paid: <span className="font-mono text-success">${p.total_earnings.toFixed(2)}</span></p>
                    <p>Revenue: <span className="font-mono">${p.revenue_score.toFixed(2)}</span></p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
