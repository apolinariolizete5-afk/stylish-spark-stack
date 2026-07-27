import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Eye, PlusCircle, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatRelative } from "@/lib/format";
import type { Vaga } from "@/lib/vagas";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

async function fetchStats() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();

  const [totalVagas, totalViews, hojeViews, semanaViews] = await Promise.all([
    supabase.from("vagas").select("id", { count: "exact", head: true }),
    supabase.from("vaga_visualizacoes").select("id", { count: "exact", head: true }),
    supabase.from("vaga_visualizacoes").select("id", { count: "exact", head: true }).gte("viewed_at", startOfDay),
    supabase.from("vaga_visualizacoes").select("id", { count: "exact", head: true }).gte("viewed_at", startOfWeek),
  ]);

  return {
    vagas: totalVagas.count ?? 0,
    views: totalViews.count ?? 0,
    hoje: hojeViews.count ?? 0,
    semana: semanaViews.count ?? 0,
  };
}

async function fetchAllVagas(): Promise<Vaga[]> {
  const { data } = await supabase
    .from("vagas")
    .select("id, slug, titulo, empresa, provincia, descricao, requisitos, tipo_contrato, salario, prazo, como_candidatar, imagem_url, email_candidatura, visualizacoes, publicada, created_at, updated_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as Vaga[];
}

function AdminDashboard() {
  const qc = useQueryClient();
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });
  const vagas = useQuery({ queryKey: ["admin-vagas"], queryFn: fetchAllVagas });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vagas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vaga eliminada");
      qc.invalidateQueries({ queryKey: ["admin-vagas"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["vagas"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral do portal.</p>
        </div>
        <Button asChild>
          <Link to="/admin/nova">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova vaga
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de vagas" value={stats.data?.vagas} icon={<BarChart3 className="h-4 w-4" />} />
        <StatCard label="Visualizações hoje" value={stats.data?.hoje} icon={<Eye className="h-4 w-4" />} />
        <StatCard label="Visualizações últimos 7 dias" value={stats.data?.semana} icon={<Eye className="h-4 w-4" />} />
        <StatCard label="Total de visualizações" value={stats.data?.views} icon={<Eye className="h-4 w-4" />} />
      </section>

      <section>
        <h2 className="font-display text-lg font-bold">Vagas publicadas</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Gira as vagas atuais. A eliminação é permanente, mas as visualizações registadas continuam a contar nas estatísticas.
        </p>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Empresa</th>
                <th className="p-3">Província</th>
                <th className="p-3 text-right">Visualizações</th>
                <th className="p-3">Publicada</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {vagas.isLoading ? (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">A carregar...</td></tr>
              ) : (vagas.data ?? []).length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Ainda não há vagas.</td></tr>
              ) : (
                (vagas.data ?? []).map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="p-3">
                      <a
                        href={vagaHref(v)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:text-primary"
                      >
                        {v.titulo}
                      </a>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="text-xs text-muted-foreground">{`${SITE_URL}${vagaHref(v)}`}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            navigator.clipboard
                              .writeText(`${SITE_URL}${vagaHref(v)}`)
                              .then(() => toast.success("Link copiado"))
                              .catch(() => toast.error("Não foi possível copiar"));
                          }}
                        >
                          <Copy className="mr-1 h-3 w-3" /> Copiar link
                        </Button>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{v.empresa}</td>
                    <td className="p-3 text-muted-foreground">{v.provincia}</td>
                    <td className="p-3 text-right font-mono">{v.visualizacoes}</td>
                    <td className="p-3 text-muted-foreground">{formatRelative(v.created_at)}</td>
                    <td className="p-3 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar esta vaga?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A vaga "{v.titulo}" será removida permanentemente. As visualizações já registadas mantêm-se nas estatísticas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMut.mutate(v.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminsSection />
    </div>
  );
}

function AdminsSection() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");

  const admins = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_admins");
      if (error) throw error;
      return (data ?? []) as { user_id: string; email: string; created_at: string }[];
    },
  });

  const grant = useMutation({
    mutationFn: async (targetEmail: string) => {
      const { error } = await supabase.rpc("grant_admin_by_email", { _email: targetEmail });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Admin concedido");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("revoke_admin", { _user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Admin removido");
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section>
      <h2 className="font-display text-lg font-bold">Administradores</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Só administradores podem conceder acesso. A pessoa precisa de já ter conta criada em /admin.
      </p>

      <Card className="mb-4">
        <CardContent className="p-5">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) grant.mutate(email.trim());
            }}
          >
            <div className="flex-1">
              <Label htmlFor="admin-email">Conceder admin por email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="pessoa@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={grant.isPending}>
              <UserPlus className="mr-2 h-4 w-4" /> Conceder
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Desde</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {admins.isLoading ? (
              <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">A carregar...</td></tr>
            ) : (admins.data ?? []).length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Sem administradores.</td></tr>
            ) : (
              (admins.data ?? []).map((a) => (
                <tr key={a.user_id} className="border-t border-border">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {a.email}
                  </td>
                  <td className="p-3 text-muted-foreground">{formatRelative(a.created_at)}</td>
                  <td className="p-3 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={(admins.data ?? []).length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover este admin?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {a.email} deixará de ter acesso ao painel.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => revoke.mutate(a.user_id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | undefined; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
        </div>
        <p className="mt-3 font-display text-3xl font-bold">
          {value === undefined ? "—" : value.toLocaleString("pt-PT")}
        </p>
      </CardContent>
    </Card>
  );
}
