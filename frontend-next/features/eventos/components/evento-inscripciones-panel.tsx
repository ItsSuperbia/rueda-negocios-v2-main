"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getEventoInscripciones } from "@/features/eventos/api";
import { cn } from "@/lib/cn";
import { InscripcionesResumen } from "@/shared/types/domain";
import { useAuthStore } from "@/store/auth-store";

type RoleFilter = "todos" | "ofertante" | "demandante";

const roleTabs: { value: RoleFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ofertante", label: "Ofertantes" },
  { value: "demandante", label: "Demandantes" }
];

const roleBadge: Record<"ofertante" | "demandante", { label: string; className: string }> = {
  ofertante: { label: "Ofertante", className: "bg-accent/10 text-accent ring-accent/30" },
  demandante: { label: "Demandante", className: "bg-success/10 text-success ring-success/30" }
};

interface EventoInscripcionesPanelProps {
  eventoId: string;
  enabled?: boolean;
}

function StatsRow({ stats }: { stats: InscripcionesResumen }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-muted">Total</p>
        <p className="mt-1 text-2xl font-bold text-ink">{stats.total}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-muted">Ofertantes</p>
        <p className="mt-1 text-2xl font-bold text-ink">{stats.ofertantes}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-muted">Demandantes</p>
        <p className="mt-1 text-2xl font-bold text-ink">{stats.demandantes}</p>
      </div>
    </div>
  );
}

export function EventoInscripcionesPanel({ eventoId, enabled = true }: EventoInscripcionesPanelProps) {
  const token = useAuthStore((state) => state.token);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("todos");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [roleFilter, eventoId]);

  const inscripcionesQuery = useQuery({
    queryKey: ["eventos", "inscripciones", eventoId, { role: roleFilter, page, pageSize }],
    queryFn: () =>
      getEventoInscripciones(token as string, eventoId, {
        role: roleFilter,
        page,
        limit: pageSize
      }),
    enabled: Boolean(token) && enabled
  });

  const stats = inscripcionesQuery.data?.stats;
  const participantes = inscripcionesQuery.data?.data ?? [];
  const meta = inscripcionesQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 0;

  const pages = useMemo(() => {
    if (totalPages <= 1) return [];
    const maxVisible = 5;
    const start = Math.max(1, Math.min(page - 2, totalPages - maxVisible + 1));
    const end = Math.min(totalPages, start + maxVisible - 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  const rangeText = meta
    ? `Mostrando ${meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1}-${Math.min(meta.page * meta.pageSize, meta.total)} de ${meta.total}`
    : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        <h4 className="text-base font-semibold text-ink">Participantes inscritos</h4>
      </div>

      {inscripcionesQuery.isPending ? <p className="text-sm text-muted">Cargando participantes...</p> : null}

      {inscripcionesQuery.isError ? (
        <EmptyState
          title="No se pudieron cargar los participantes"
          description="Verifica tu conexión o intenta de nuevo más tarde."
        />
      ) : null}

      {stats ? <StatsRow stats={stats} /> : null}

      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        {roleTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setRoleFilter(tab.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
              roleFilter === tab.value ? "bg-white text-accent shadow-sm" : "text-muted hover:text-ink"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!inscripcionesQuery.isPending && !inscripcionesQuery.isError && participantes.length === 0 ? (
        <EmptyState
          title="Sin participantes"
          description={
            roleFilter === "todos"
              ? "Aún no hay empresas inscritas en este evento."
              : `No hay empresas ${roleFilter === "ofertante" ? "ofertantes" : "demandantes"} inscritas.`
          }
        />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {participantes.map((participante) => {
          const badge = roleBadge[participante.role];

          return (
            <div
              key={participante._id}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {participante.user.nombreEmpresa ?? "Empresa sin nombre"}
                  </p>
                  <p className="mt-1 text-xs text-muted">{participante.user.sector ?? "Sector no definido"}</p>
                </div>
                <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1", badge.className)}>
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted">{rangeText}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Anterior
            </Button>
            {pages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={cn(
                  "h-9 w-9 rounded-xl text-sm font-semibold ring-1",
                  pageNumber === page ? "bg-accent text-white ring-accent/60" : "bg-white/80 text-ink ring-slate-200"
                )}
              >
                {pageNumber}
              </button>
            ))}
            <Button
              variant="secondary"
              disabled={!totalPages || page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
