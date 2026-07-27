import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SocialLinks } from "@/components/social-links";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { VagaCard } from "@/components/vaga-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVINCIAS, SITE_URL } from "@/lib/constants";
import { vagasListQuery } from "@/lib/vagas-queries";

const TITLE = "Moza Empregos — Vagas de emprego em Moçambique";
const DESCRIPTION =
  "Vagas de emprego actualizadas todos os dias em Moçambique. Procure por cargo, empresa ou província e candidate-se em minutos.";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    // dados da primeira página já no servidor: a home aparece preenchida de imediato
    const data = await context.queryClient.ensureInfiniteQueryData(
      vagasListQuery({ search: "", provincia: "todas" }),
    );
    const capa = data.pages[0]?.rows.find((v) => v.imagem_url && /^https:\/\//i.test(v.imagem_url));
    return { imagem: capa?.imagem_url ?? null };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:site_name", content: "Moza Empregos" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      ...(loaderData?.imagem
        ? [
            { property: "og:image", content: loaderData.imagem },
            { property: "og:image:secure_url", content: loaderData.imagem },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { property: "og:image:alt", content: "Moza Empregos" },
            { name: "twitter:image", content: loaderData.imagem },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: HomePage,
});

function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [provincia, setProvincia] = useState<string>("todas");

  const query = useInfiniteQuery(vagasListQuery({ search, provincia }));


  const vagas = useMemo(() => query.data?.pages.flatMap((p) => p.rows) ?? [], [query.data]);
  const total = query.data?.pages[0]?.count ?? 0;

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
            Portal de emprego
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight md:text-5xl">
            Encontre a sua próxima oportunidade em Moçambique
          </h1>
          <p className="mt-4 max-w-2xl text-base text-primary-foreground/80 md:text-lg">
            Vagas atualizadas todos os dias, com todos os detalhes que precisa para se candidatar.
          </p>

          <form
            onSubmit={onSearch}
            className="mt-8 grid gap-3 rounded-2xl bg-background/95 p-3 shadow-lg backdrop-blur md:grid-cols-[1fr_220px_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cargo ou empresa"
                className="h-11 pl-9 text-foreground"
              />
            </div>
            <Select value={provincia} onValueChange={setProvincia}>
              <SelectTrigger className="!h-11 text-foreground">
                <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Província" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as províncias</SelectItem>
                {PROVINCIAS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="lg" className="h-11">
              Procurar
            </Button>
          </form>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Vagas disponíveis</h2>
            <p className="text-sm text-muted-foreground">
              {query.isLoading
                ? "A carregar..."
                : total === 0
                  ? "Sem resultados para os filtros escolhidos."
                  : `${total} vaga${total === 1 ? "" : "s"} encontrada${total === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {query.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl border border-border bg-muted/50" />
            ))}
          </div>
        ) : vagas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-lg font-medium">Nenhuma vaga encontrada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Experimente ajustar a pesquisa ou o filtro de província.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vagas.map((v) => (
              <VagaCard key={v.id} vaga={v} />
            ))}
          </div>
        )}

        {query.hasNextPage && (
          <div className="mt-10 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
            >
              {query.isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Carregar mais
            </Button>
          </div>
        )}
      </main>

      <SocialLinks />
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
