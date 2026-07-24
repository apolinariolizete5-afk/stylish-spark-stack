import { Facebook, Mail, MessageCircle, Radio } from "lucide-react";
import { CONTACTOS } from "@/lib/constants";

export function SocialLinks() {
  const items = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: CONTACTOS.whatsapp,
      href: CONTACTOS.whatsappLink,
      color: "bg-[#25D366]",
    },
    {
      icon: Radio,
      label: "Canal WhatsApp",
      value: "Siga o nosso canal",
      href: CONTACTOS.whatsappCanal,
      color: "bg-[#128C7E]",
    },
    {
      icon: Facebook,
      label: "Facebook",
      value: "Siga a nossa página",
      href: CONTACTOS.facebook,
      color: "bg-[#1877F2]",
    },
    {
      icon: Mail,
      label: "Email",
      value: CONTACTOS.email,
      href: `mailto:${CONTACTOS.email}`,
      color: "bg-primary",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold">Siga-nos nas redes sociais</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fique a par das novas vagas e entre em contacto connosco.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-white ${it.color}`}>
                <it.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold group-hover:text-primary">{it.label}</p>
                <p className="truncate text-xs text-muted-foreground">{it.value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
