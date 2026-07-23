import { supabase } from "@/integrations/supabase/client";

export type Vaga = {
  id: string;
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
  "id, titulo, empresa, provincia, descricao, requisitos, tipo_contrato, salario, prazo, como_candidatar, imagem_url, email_candidatura, visualizacoes, publicada, created_at, updated_at";

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

export async function getSugeridas(vaga: Vaga, limit = 6): Promise<Vaga[]> {
  const { data } = await supabase
    .from("vagas")
    .select(SELECT_COLS)
    .eq("publicada", true)
    .neq("id", vaga.id)
    .or(`provincia.eq.${vaga.provincia},empresa.eq.${vaga.empresa}`)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Vaga[];
}

export async function registarVisualizacao(id: string) {
  await supabase.rpc("registar_visualizacao", { _vaga_id: id });
}
