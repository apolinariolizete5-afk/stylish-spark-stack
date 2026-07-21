import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CONTACTOS } from "@/lib/constants";

export const Route = createFileRoute("/dmca")({
  head: () => ({
    meta: [
      { title: "DMCA — Portal de Vagas" },
      { name: "description", content: "Aviso de direitos de autor e procedimento para reclamações." },
      { property: "og:title", content: "DMCA — Portal de Vagas" },
      { property: "og:description", content: "Aviso de direitos de autor e procedimento para reclamações." },
    ],
  }),
  component: DmcaPage,
});

function DmcaPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Aviso DMCA</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-PT")}</p>

        <div className="prose prose-sm mt-8 max-w-none text-foreground/90">
          <p>
            Respeitamos os direitos de propriedade intelectual de terceiros e esperamos
            que os nossos utilizadores façam o mesmo.
          </p>

          <h2>Reportar conteúdo em violação</h2>
          <p>
            Se acredita que algum conteúdo publicado neste portal viola os seus direitos
            de autor, envie-nos uma notificação com as seguintes informações:
          </p>
          <ul>
            <li>Descrição do trabalho protegido que alegadamente foi infringido.</li>
            <li>Link (URL) exato para a vaga em causa neste portal.</li>
            <li>O seu nome completo, endereço, telefone e email.</li>
            <li>
              Declaração de boa-fé de que o uso do material não foi autorizado pelo
              titular dos direitos.
            </li>
            <li>
              Declaração de que as informações prestadas são exatas e de que é o titular
              dos direitos ou está autorizado a agir em seu nome.
            </li>
          </ul>

          <h2>Como enviar</h2>
          <p>
            Envie a notificação por email para{" "}
            <a href={`mailto:${CONTACTOS.email}`}>{CONTACTOS.email}</a> ou por WhatsApp
            para {CONTACTOS.whatsapp}. Analisaremos e responderemos o mais rápido possível.
          </p>

          <h2>Remoção</h2>
          <p>
            Após verificação, o conteúdo em causa será removido do portal.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
