import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Mail, MessageCircle } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CONTACTOS } from "@/lib/constants";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Portal de Vagas" },
      { name: "description", content: "Fale connosco por WhatsApp, email ou Facebook." },
      { property: "og:title", content: "Contacto — Portal de Vagas" },
      { property: "og:description", content: "Fale connosco por WhatsApp, email ou Facebook." },
    ],
  }),
  component: ContactoPage,
});

function ContactoPage() {
  const canais = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: CONTACTOS.whatsapp,
      href: CONTACTOS.whatsappLink,
      desc: "Envie-nos uma mensagem para uma resposta rápida.",
    },
    {
      icon: Mail,
      title: "Email",
      value: CONTACTOS.email,
      href: `mailto:${CONTACTOS.email}`,
      desc: "Escreva-nos e responderemos o mais rápido possível.",
    },
    {
      icon: Facebook,
      title: "Facebook",
      value: "Siga a nossa página",
      href: CONTACTOS.facebook,
      desc: "Acompanhe as novidades e novas vagas.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Contacto</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Estamos aqui para ajudar</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Tem uma dúvida, uma vaga para publicar ou uma sugestão? Escolha o canal que preferir.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {canais.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold group-hover:text-primary">{c.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              <p className="mt-3 text-sm font-medium">{c.value}</p>
            </a>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
