import { createFileRoute } from "@tanstack/react-router";
import { VagaDetalhe } from "@/components/vaga-detalhe";

export const Route = createFileRoute("/vagas/$id")({
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
