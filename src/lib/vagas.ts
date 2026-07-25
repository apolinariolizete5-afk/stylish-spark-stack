import { supabase } from "@/integrations/supabase/client";

export type Vaga = {
  id: string;
  slug: string | null;
  titulo: string;
  empresa: string;
  provincia: string;
  descricao: string;
  requisitos: string | null;
  tipo_contrato: string | null;
  salario: string | null;
  prazo: string | null;
  como_candidatar: string | null;
  imagem_url: string | null;
  email_candidatura: string | null;
  visualizacoes: number;
  publicada: boolean;
  created_at: string;
  updated_at: string;
};

const SELECT_COLS =
  "id, slug, titulo, empresa, provincia, descricao, requisitos, tipo_contrato, salario, prazo, como_candidatar, imagem_url, email_candidatura, visualizacoes, publicada, created_at, updated_at";

/** Colunas mínimas necessárias para os cartões de vaga (listagem/sugeridas). */
const CARD_COLS =
  "id, slug, titulo, empresa, provincia, tipo_contrato, imagem_url, visualizacoes, created_at";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Link público da vaga: /titulo-da-vaga.html (com fallback para /vagas/<id>). */
export function vagaHref(vaga: Pick<Vaga, "id" | "slug">) {
  return vaga.slug ? `/${vaga.slug}.html` : `/vagas/${vaga.id}`;
}

export async function listVagas(params: {
  search?: string;
  provincia?: string;
  offset: number;
  limit: number;
}): Promise<{ rows: Vaga[]; count: number }> {
  let q = supabase
    .from("vagas")
    .select(SELECT_COLS, { count: "exact" })
    .eq("publicada", true)
    .order("created_at", { ascending: false })
    .range(params.offset, params.offset + params.limit - 1);

  if (params.search && params.search.trim()) {
    const s = params.search.trim().replace(/,/g, " ");
    q = q.or(`titulo.ilike.%${s}%,empresa.ilike.%${s}%`);
  }
  if (params.provincia && params.provincia !== "todas") {
    q = q.eq("provincia", params.provincia);
  }
  const { data, error, count } = await q;
  if (error) throw error;
  return { rows: (data ?? []) as Vaga[], count: count ?? 0 };
}

export async function getVaga(id: string): Promise<Vaga | null> {
  const { data, error } = await supabase
    .from("vagas")
    .select(SELECT_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Vaga) ?? null;
}

export async function getVagaBySlug(slug: string): Promise<Vaga | null> {
  const clean = slug.replace(/\.html?$/i, "");
  const { data, error } = await supabase
    .from("vagas")
    .select(SELECT_COLS)
    .eq("slug", clean)
    .maybeSingle();
  if (error) throw error;
  return (data as Vaga) ?? null;
}

/** Aceita o slug (ex: "carpinteiro.html") ou o id da vaga. */
export async function getVagaBySlugOrId(key: string): Promise<Vaga | null> {
  const clean = key.replace(/\.html?$/i, "");
  if (UUID_RE.test(clean)) return getVaga(clean);
  return getVagaBySlug(clean);
}

export async function getSugeridas(
  vaga: Pick<Vaga, "id" | "provincia" | "empresa">,
  limit = 6,
): Promise<Vaga[]> {
  const { data } = await supabase
    .from("vagas")
    .select(CARD_COLS)
    .eq("publicada", true)
    .neq("id", vaga.id)
    .or(`provincia.eq.${vaga.provincia},empresa.eq.${vaga.empresa}`)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Vaga[];
}

export async function registarVisualizacao(id: string) {
  await supabase.rpc("registar_visualizacao", { _vaga_id: id });
}
