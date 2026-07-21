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
  email: "contacto@vagas.co.mz",
  whatsapp: "+258 84 000 0000",
  whatsappLink: "https://wa.me/258840000000",
  facebook: "https://facebook.com/",
  siteName: "Portal de Vagas",
};
