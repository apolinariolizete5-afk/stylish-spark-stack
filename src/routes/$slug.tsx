import { createFileRoute } from "@tanstack/react-router";
import { VagaDetalhe } from "@/components/vaga-detalhe";

export const Route = createFileRoute("/$slug")({
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
