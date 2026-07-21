import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Facebook, Mail, MessageCircle, Send } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { CONTACTOS } from "@/lib/constants";

export const Route = createFileRoute("/enviar-vaga")({
  head: () => ({
    meta: [
      { title: "Enviar Vaga (Recrutamento) — Portal de Vagas" },
      { name: "description", content: "Publique a sua vaga no nosso portal e alcance milhares de candidatos em Moçambique." },
      { property: "og:title", content: "Enviar Vaga (Recrutamento) — Portal de Vagas" },
      { property: "og:description", content: "Publique a sua vaga e alcance milhares de candidatos." },
    ],
  }),
  component: EnviarVagaPage,
});

function EnviarVagaPage() {
  const beneficios = [
    "Alcance candidatos em todas as províncias de Moçambique",
    "A sua vaga é publicada e partilhada nas nossas redes",
    "Processo simples e rápido, sem burocracia",
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Recrutamento</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight md:text-5xl">
              Envie a sua vaga
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Tem uma posição em aberto? Envie-nos os detalhes e publicamos a vaga
              gratuitamente no nosso portal.
            </p>

            <ul className="mt-8 space-y-3">
              {beneficios.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
              <h3 className="font-display text-base font-bold">Informações necessárias</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ao enviar a vaga, inclua: título do cargo, empresa, província, descrição,
                requisitos, prazo de candidatura e forma de candidatura.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Send className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">Como enviar</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha o canal que preferir. Respondemos rapidamente.
            </p>

            <div className="mt-5 space-y-3">
              <Button asChild className="w-full justify-start" size="lg">
                <a href={CONTACTOS.whatsappLink} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp — {CONTACTOS.whatsapp}
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <a href={`mailto:${CONTACTOS.email}`}>
                  <Mail className="mr-2 h-5 w-5" />
                  {CONTACTOS.email}
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <a href={CONTACTOS.facebook} target="_blank" rel="noreferrer">
                  <Facebook className="mr-2 h-5 w-5" />
                  Mensagem no Facebook
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
