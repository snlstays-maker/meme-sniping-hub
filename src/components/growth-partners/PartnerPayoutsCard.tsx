import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Payout {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  wallet_address: string | null;
  tx_hash: string | null;
  requested_at: string;
  processed_at: string | null;
}

const statusStyle: Record<Payout["status"], string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-primary/15 text-primary border-primary/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  paid: "bg-success/15 text-success border-success/30",
};

export function PartnerPayoutsCard({
  partnerId,
  pending,
  defaultWallet,
  onChange,
}: {
  partnerId: string;
  pending: number;
  defaultWallet: string | null;
  onChange: () => void;
}) {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(defaultWallet ?? "");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("partner_payouts")
      .select("id,amount,status,wallet_address,tx_hash,requested_at,processed_at")
      .eq("partner_id", partnerId)
      .order("requested_at", { ascending: false })
      .limit(15);
    setPayouts((data as Payout[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [partnerId]);

  const submit = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return toast.error("Enter a positive amount");
    if (n > pending) return toast.error("Amount exceeds pending balance");
    setSubmitting(true);
    const { error } = await supabase.rpc("request_partner_payout", { _amount: n, _wallet: wallet || null });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Payout requested");
    setOpen(false);
    setAmount("");
    onChange();
    load();
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="w-4 h-4 text-warning" /> Payouts
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={pending <= 0}>Request Payout</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Max ${pending.toFixed(2)}`} />
                <p className="text-xs text-muted-foreground">Pending balance: ${pending.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <Input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Destination wallet" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : payouts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No payout requests yet.</p>
        ) : (
          <ul className="space-y-2">
            {payouts.map((p) => (
              <li key={p.id} className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                <div>
                  <p className="text-sm font-mono">${p.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.requested_at).toLocaleString()}</p>
                  {p.tx_hash && <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">tx: {p.tx_hash}</p>}
                </div>
                <Badge variant="outline" className={statusStyle[p.status]}>{p.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
