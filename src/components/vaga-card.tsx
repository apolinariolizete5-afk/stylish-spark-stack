import { Link } from "@tanstack/react-router";
import { Building2, Eye, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Vaga } from "@/lib/vagas";
import { formatRelative } from "@/lib/format";

export function VagaCard({ vaga }: { vaga: Vaga }) {
  return (
    <Link
      to="/vagas/$id"
      params={{ id: vaga.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {vaga.imagem_url ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={vaga.imagem_url}
            alt={vaga.titulo}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-primary/10 to-primary/30">
          <Building2 className="h-10 w-10 text-primary/60" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {vaga.tipo_contrato && (
            <Badge variant="secondary" className="rounded-full">
              {vaga.tipo_contrato}
            </Badge>
          )}
          <span className="text-muted-foreground">
            {formatRelative(vaga.created_at)}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold leading-snug group-hover:text-primary">
          {vaga.titulo}
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate">{vaga.empresa}</span>
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {vaga.provincia}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {vaga.visualizacoes}
          </span>
        </div>
      </div>
    </Link>
  );
}
