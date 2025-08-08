import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bot, Activity, Clock, AlertCircle, Play } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    document.title = "AI Agent Dashboard";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = "AI Agent Dashboard – Monitor agents, runs, and system activity";
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/`;
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (!sess) {
        navigate("/auth", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ variant: "destructive", description: error.message });
    } else {
      toast({ description: "Signed out" });
      navigate("/auth", { replace: true });
    }
  };

  const stats = [
    { title: "Active Agents", value: "5", icon: Bot },
    { title: "Total Runs Today", value: "128", icon: Activity },
    { title: "Pending Tasks", value: "12", icon: Clock },
  ];

  const runs = [
    { id: "1", agent: "Researcher-01", status: "Success", duration: "2m 14s", startedAt: "2025-08-08 10:21" },
    { id: "2", agent: "Planner-Alpha", status: "Running", duration: "—", startedAt: "2025-08-08 10:25" },
    { id: "3", agent: "Crawler-Beta", status: "Failed", duration: "38s", startedAt: "2025-08-08 10:02" },
    { id: "4", agent: "Analyst-Gamma", status: "Queued", duration: "—", startedAt: "2025-08-08 10:27" },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return <Badge variant="secondary">Success</Badge>;
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "Queued":
        return <Badge variant="outline">Queued</Badge>;
      default:
        return <Badge>Running</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Agent Dashboard</h1>
            <p className="text-muted-foreground">Monitor agents, runs, and system activity</p>
          </div>
          <div className="flex items-center gap-2">
            <Button aria-label="Start new run">
              <Play className="mr-2" /> New Run
            </Button>
            {session ? (
              <Button variant="outline" onClick={handleLogout}>Log out</Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/auth">Log in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        <section aria-label="Key metrics" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section aria-label="Recent runs" className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Recent Runs</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" /> Live updates
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.agent}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell>{r.duration}</TableCell>
                      <TableCell className="text-muted-foreground">{r.startedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" /> Sample data for preview
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
