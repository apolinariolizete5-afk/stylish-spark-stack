import { queryOptions } from "@tanstack/react-query";
import { getSugeridas, getVagaBySlugOrId, type Vaga } from "@/lib/vagas";

export const vagaQuery = (chave: string) =>
  queryOptions({
    queryKey: ["vaga", chave],
    queryFn: () => getVagaBySlugOrId(chave),
    staleTime: 5 * 60 * 1000,
  });

export const sugeridasQuery = (vaga: Pick<Vaga, "id" | "provincia" | "empresa"> | null | undefined) =>
  queryOptions({
    queryKey: ["vaga-sugeridas", vaga?.id],
    queryFn: () => (vaga ? getSugeridas(vaga) : Promise.resolve([])),
    enabled: !!vaga,
    staleTime: 5 * 60 * 1000,
  });
