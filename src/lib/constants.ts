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
  whatsapp: "+258 87 963 0469",
  whatsappLink: "https://wa.me/258879630469",
  whatsappCanal: "https://whatsapp.com/channel/0029VbDLGxu4SpkOM6UG7S3p",
  facebook: "https://www.facebook.com/profile.php?id=61591198577276",
  siteName: "Portal de Vagas",
};
