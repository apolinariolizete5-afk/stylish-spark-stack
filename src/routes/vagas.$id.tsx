import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  ChevronLeft,
  Eye,
  MapPin,
  Send,
  Share2,
  Wallet,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialLinks } from "@/components/social-links";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { VagaCard } from "@/components/vaga-card";
import { CandidaturaDialog } from "@/components/candidatura-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSugeridas, getVaga, registarVisualizacao } from "@/lib/vagas";
import { formatDate, formatRelative } from "@/lib/format";

export const Route = createFileRoute("/vagas/$id")({
  component: VagaPage,
});

function VagaPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [candOpen, setCandOpen] = useState(false);

  const { data: vaga, isLoading, error } = useQuery({
    queryKey: ["vaga", id],
    queryFn: () => getVaga(id),
  });

  const { data: sugeridas } = useQuery({
    queryKey: ["vaga-sugeridas", id, vaga?.provincia, vaga?.empresa],
    queryFn: () => (vaga ? getSugeridas(vaga) : Promise.resolve([])),
    enabled: !!vaga,
  });

  useEffect(() => {
    if (vaga?.id) {
      registarVisualizacao(vaga.id).catch(() => {});
      document.title = `${vaga.titulo} — ${vaga.empresa}`;
    }
  }, [vaga?.id, vaga?.titulo, vaga?.empresa]);

  async function partilhar() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = vaga ? `${vaga.titulo} — ${vaga.empresa}` : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch { /* cancelado */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ligação copiada para a área de transferência");
    } catch {
      toast.error("Não foi possível partilhar");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-64 animate-pulse rounded-xl bg-muted" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !vaga) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-bold">Vaga não encontrada</h1>
          <p className="mt-2 text-muted-foreground">
            Esta vaga pode ter sido removida ou já não está disponível.
          </p>
          <Button className="mt-6" onClick={() => navigate({ to: "/" })}>
            Ver todas as vagas
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar às vagas
        </Link>

        <article className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {vaga.imagem_url && (
            <div className="aspect-[21/9] w-full overflow-hidden bg-muted">
              <img
                src={vaga.imagem_url}
                alt={vaga.titulo}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {vaga.tipo_contrato && (
                <Badge className="rounded-full">{vaga.tipo_contrato}</Badge>
              )}
              <span className="text-muted-foreground">
                Publicada {formatRelative(vaga.created_at)}
              </span>
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
              {vaga.titulo}
            </h1>

            <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4" /> <span>{vaga.empresa}</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" /> <span>{vaga.provincia}</span>
              </div>
              {vaga.salario && (
                <div className="inline-flex items-center gap-2">
                  <Wallet className="h-4 w-4" /> <span>{vaga.salario}</span>
                </div>
              )}
              {vaga.prazo && (
                <div className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> <span>Prazo: {formatDate(vaga.prazo)}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-2">
                <Eye className="h-4 w-4" /> <span>{vaga.visualizacoes} visualizações</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={partilhar} variant="outline">
                <Share2 className="mr-2 h-4 w-4" /> Partilhar
              </Button>
            </div>

            <Separator className="my-8" />

            <Section title="Descrição da vaga">
              <p className="whitespace-pre-wrap leading-relaxed">{vaga.descricao}</p>
            </Section>

            {vaga.requisitos && (
              <Section title="Requisitos">
                <p className="whitespace-pre-wrap leading-relaxed">{vaga.requisitos}</p>
              </Section>
            )}

            {vaga.como_candidatar && (
              <Section title="Como candidatar-se">
                <p className="whitespace-pre-wrap leading-relaxed">{vaga.como_candidatar}</p>
              </Section>
            )}

            {vaga.email_candidatura && (
              <div className="mt-10 flex justify-center">
                <Button
                  onClick={() => setCandOpen(true)}
                  size="lg"
                  className="h-auto w-full max-w-xl px-10 py-6 text-lg font-bold uppercase tracking-wide sm:text-xl"
                >
                  <Send className="mr-3 h-6 w-6" /> Enviar candidatura
                </Button>
              </div>
            )}
          </div>
        </article>

        {sugeridas && sugeridas.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold">
              <Briefcase className="h-5 w-5" /> Vagas sugeridas
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sugeridas.map((v) => (
                <VagaCard key={v.id} vaga={v} />
              ))}
            </div>
          </section>
        )}
      </main>

      {vaga.email_candidatura && (
        <CandidaturaDialog vaga={vaga} open={candOpen} onOpenChange={setCandOpen} />
      )}

      <SocialLinks />
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="prose prose-sm mt-3 max-w-none text-foreground/90">{children}</div>
    </section>
  );
}
