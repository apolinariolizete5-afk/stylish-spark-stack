import { Link } from "@tanstack/react-router";
import { Facebook, Mail, MessageCircle } from "lucide-react";
import { CONTACTOS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-display text-base font-bold">{CONTACTOS.siteName}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Vagas de emprego atualizadas todos os dias em Moçambique.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Ligações</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Início</Link></li>
              <li><Link to="/enviar-vaga" className="hover:text-foreground">Enviar Vaga</Link></li>
              <li><Link to="/contacto" className="hover:text-foreground">Contacto</Link></li>
              <li><Link to="/privacidade" className="hover:text-foreground">Política de Privacidade</Link></li>
              <li><Link to="/dmca" className="hover:text-foreground">DMCA</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Contactos</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href={CONTACTOS.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4" /> {CONTACTOS.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACTOS.email}`}
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <Mail className="h-4 w-4" /> {CONTACTOS.email}
                </a>
              </li>
              <li>
                <a
                  href={CONTACTOS.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {CONTACTOS.siteName}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
