import { createFileRoute, redirect } from "@tanstack/react-router";
import { VagaDetalhe } from "@/components/vaga-detalhe";
import { sugeridasQuery, vagaQuery } from "@/lib/vagas-queries";

export const Route = createFileRoute("/vagas/$id")({
  loader: async ({ context, params }) => {
    const vaga = await context.queryClient.ensureQueryData(vagaQuery(params.id));
    // Link antigo (com id): reencaminha para o link personalizado /titulo-da-vaga.html
    if (vaga?.slug) {
      throw redirect({
        to: "/$slug",
        params: { slug: `${vaga.slug}.html` },
        statusCode: 301,
        replace: true,
      });
    }
    if (vaga) void context.queryClient.prefetchQuery(sugeridasQuery(vaga));
    return null;
  },
  head: () => ({
    meta: [
      { title: "Detalhes da vaga — Moza Empregos" },
      { name: "description", content: "Veja os detalhes desta oportunidade de emprego em Moçambique e candidate-se." },
      { property: "og:title", content: "Detalhes da vaga — Moza Empregos" },
      { property: "og:description", content: "Veja os detalhes desta oportunidade de emprego em Moçambique e candidate-se." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <VagaDetalhe chave={Route.useParams().id} />,
});
