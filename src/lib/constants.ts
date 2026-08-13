export const PROVINCIAS = [
  "Cabo Delgado",
  "Gaza",
  "Inhambane",
  "Manica",
  "Maputo Cidade",
  "Maputo Província",
  "Nampula",
  "Niassa",
  "Sofala",
  "Tete",
  "Zambézia",
] as const;

export type Provincia = (typeof PROVINCIAS)[number];

export const TIPOS_CONTRATO = [
  "Tempo inteiro",
  "Meio-tempo",
  "Contrato a prazo",
  "Freelance",
  "Estágio",
  "Voluntariado",
] as const;

export const CONTACTOS = {
  email: "apolinariolizete5@gmail.com",
  whatsapp: "+258 83 410 2205",
  whatsappLink: "https://whatsapp.com/channel/0029VbDLGxu4SpkOM6UG7S3p",
  whatsappCanal: "https://whatsapp.com/channel/0029VbDLGxu4SpkOM6UG7S3p",
  facebook: "https://www.facebook.com/profile.php?id=61591198577276",
  siteName: "Moza Empregos",
};

/** URL pública do site (usada nos links canónicos e pré-visualizações). */
export const SITE_URL = "https://mozaempregos.onrender.com";

/** Imagem de reserva para pré-visualizações (WhatsApp, Facebook, etc.). */
export const OG_IMAGE_FALLBACK = `${SITE_URL}/og-moza-empregos.jpg`;

