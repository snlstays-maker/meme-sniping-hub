import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Sparkles, Loader2 } from "lucide-react";
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

export default function GrowthPartnerAdmin() {
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
    toast.success("Partner approved and onboarded");
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
            <h1 className="text-2xl md:text-3xl font-bold">Growth Partner Applications</h1>
            <p className="text-muted-foreground">Review and onboard new partners.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Pending" value={counts.pending} icon={Clock} color="text-warning" />
          <StatCard label="Approved" value={counts.approved} icon={CheckCircle2} color="text-success" />
          <StatCard label="Rejected" value={counts.rejected} icon={XCircle} color="text-destructive" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Queue</CardTitle>
            <CardDescription>Approving creates the partner profile, generates a referral code, and grants the role.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
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
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(a.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {a.status === "pending" ? (
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => reject(a.id)} disabled={actingId === a.id}>
                                    Reject
                                  </Button>
                                  <Button size="sm" onClick={() => approve(a.id)} disabled={actingId === a.id}>
                                    {actingId === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                                  </Button>
                                </div>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className={a.status === "approved" ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"}
                                >
                                  {a.status}
                                </Badge>
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
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Clock; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-muted ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
