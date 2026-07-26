import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getSugeridas, getVagaBySlugOrId, listVagas, type Vaga } from "@/lib/vagas";

export const PAGE_SIZE = 15;

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

export const vagasListQuery = (filtros: { search: string; provincia: string }) =>
  infiniteQueryOptions({
    queryKey: ["vagas", filtros],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listVagas({ ...filtros, offset: pageParam as number, limit: PAGE_SIZE }),
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((acc, p) => acc + p.rows.length, 0);
      return loaded < last.count ? loaded : undefined;
    },
    staleTime: 60 * 1000,
  });
