import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CONTACTOS } from "@/lib/constants";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Portal de Vagas" },
      { name: "description", content: "Como recolhemos, usamos e protegemos os seus dados." },
      { property: "og:title", content: "Política de Privacidade — Portal de Vagas" },
      { property: "og:description", content: "Como recolhemos, usamos e protegemos os seus dados." },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-PT")}</p>

        <div className="prose prose-sm mt-8 max-w-none text-foreground/90">
          <p>
            A sua privacidade é importante para nós. Esta política explica que informações
            recolhemos, como as usamos e as opções que tem em relação aos seus dados.
          </p>

          <h2>Informações que recolhemos</h2>
          <p>
            O portal recolhe dados anónimos de utilização, como o número de visualizações
            de cada vaga, para melhorar a experiência do utilizador. Não recolhemos dados
            pessoais dos visitantes sem consentimento explícito.
          </p>

          <h2>Cookies</h2>
          <p>
            Podemos utilizar cookies para lembrar preferências e recolher estatísticas
            agregadas de utilização.
          </p>

          <h2>Partilha de dados</h2>
          <p>
            Não vendemos nem partilhamos os seus dados pessoais com terceiros. Podemos
            partilhar dados agregados e anónimos com parceiros para efeitos estatísticos.
          </p>

          <h2>Anúncios de emprego</h2>
          <p>
            As vagas publicadas neste portal são recolhidas junto de fontes públicas ou
            enviadas por empresas. Se acredita que uma vaga não deve estar aqui, contacte-nos.
          </p>

          <h2>Contacto</h2>
          <p>
            Para qualquer questão sobre esta política, envie um email para{" "}
            <a href={`mailto:${CONTACTOS.email}`}>{CONTACTOS.email}</a> ou uma mensagem
            via WhatsApp para {CONTACTOS.whatsapp}.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
