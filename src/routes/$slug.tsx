import { createFileRoute } from "@tanstack/react-router";
import { VagaDetalhe } from "@/components/vaga-detalhe";
import { sugeridasQuery, vagaQuery } from "@/lib/vagas-queries";

export const Route = createFileRoute("/$slug")({
  loader: async ({ context, params }) => {
    const vaga = await context.queryClient.ensureQueryData(vagaQuery(params.slug));
    if (vaga) void context.queryClient.prefetchQuery(sugeridasQuery(vaga));
    return null;
  },
  head: () => ({
    meta: [
      { title: "Vaga de emprego — Moza Empregos" },
      { name: "description", content: "Detalhes completos da vaga: requisitos, prazo e como se candidatar." },
      { property: "og:title", content: "Vaga de emprego — Moza Empregos" },
      { property: "og:description", content: "Detalhes completos da vaga: requisitos, prazo e como se candidatar." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <VagaDetalhe chave={Route.useParams().slug} />,
});
