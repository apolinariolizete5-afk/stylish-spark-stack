import { MessageCircle } from "lucide-react";
import { CONTACTOS } from "@/lib/constants";

export function WhatsAppFloat() {
  return (
    <a
      href={CONTACTOS.whatsappLink}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#20bd5a]"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="pointer-events-none absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" />
    </a>
  );
}
