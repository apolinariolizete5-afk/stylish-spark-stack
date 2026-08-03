import { createFileRoute } from "@tanstack/react-router";
import { VagaDetalhe } from "@/components/vaga-detalhe";
import { sugeridasQuery, vagaQuery } from "@/lib/vagas-queries";
import { OG_IMAGE_FALLBACK, SITE_URL } from "@/lib/constants";

function resumo(texto: string | null | undefined, max = 155) {
  const t = (texto ?? "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export const Route = createFileRoute("/$slug")({
  loader: async ({ context, params }) => {
    const vaga = await context.queryClient.ensureQueryData(vagaQuery(params.slug));
    if (vaga) void context.queryClient.prefetchQuery(sugeridasQuery(vaga));
    if (!vaga) return null;
    // apenas dados serializáveis para o head()
    return {
      slug: vaga.slug ?? params.slug.replace(/\.html?$/i, ""),
      titulo: vaga.titulo,
      empresa: vaga.empresa,
      provincia: vaga.provincia,
      descricao: resumo(vaga.descricao),
      imagem_url: vaga.imagem_url,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Vaga não encontrada — Moza Empregos" },
          { name: "description", content: "Esta vaga pode ter sido removida ou já não está disponível." },
        ],
      };
    }
    const title = `${loaderData.titulo} — ${loaderData.empresa} | Moza Empregos`;
    const description =
      loaderData.descricao ||
      `Vaga de ${loaderData.titulo} na ${loaderData.empresa}, ${loaderData.provincia}. Veja os requisitos e candidate-se.`;
    const url = `${SITE_URL}/${loaderData.slug}.html`;
    const imagem =
      loaderData.imagem_url && /^https:\/\//i.test(loaderData.imagem_url)
        ? loaderData.imagem_url
        : OG_IMAGE_FALLBACK;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "Moza Empregos" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(imagem
          ? [
              { property: "og:image", content: imagem },
              { property: "og:image:secure_url", content: imagem },
              { property: "og:image:type", content: "image/jpeg" },
              { property: "og:image:width", content: "1200" },
              { property: "og:image:height", content: "630" },
              { property: "og:image:alt", content: loaderData.titulo },
              { name: "twitter:image", content: imagem },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: loaderData.titulo,
            description,
            hiringOrganization: { "@type": "Organization", name: loaderData.empresa },
            jobLocation: {
              "@type": "Place",
              address: { "@type": "PostalAddress", addressRegion: loaderData.provincia, addressCountry: "MZ" },
            },
            ...(imagem ? { image: imagem } : {}),
          }),
        },
      ],
    };
  },
  component: () => <VagaDetalhe chave={Route.useParams().slug} />,
});
