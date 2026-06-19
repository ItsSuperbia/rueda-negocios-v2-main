"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cancelarParticipanteEvento, getEventoInscripciones } from "@/features/eventos/api";
import { cn } from "@/lib/cn";
import { EventoInscripcionParticipante, InscripcionesResumen } from "@/shared/types/domain";
import { useAuthStore } from "@/store/auth-store";

type RoleFilter = "todos" | "ofertante" | "demandante";
type EstadoFilter = "todos" | "activa" | "cancelada";

const roleTabs: { value: RoleFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ofertante", label: "Ofertantes" },
  { value: "demandante", label: "Demandantes" }
];

const roleBadge: Record<"ofertante" | "demandante", { label: string; className: string }> = {
  ofertante: { label: "Ofertante", className: "bg-accent/10 text-accent ring-accent/30" },
  demandante: { label: "Demandante", className: "bg-success/10 text-success ring-success/30" }
};

const estadoTabs: { value: EstadoFilter; label: string }[] = [
  { value: "activa", label: "Activas" },
  { value: "cancelada", label: "Canceladas" },
  { value: "todos", label: "Todas" }
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://gisistinfo.unicartagena.edu.co:3003";

const resolveFileUrl = (path?: string) => {
  if (!path) return "";
  const normalized = path.replace(/\\/g, "/");
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
  const uploadsIndex = normalized.lastIndexOf("/uploads/");
  if (uploadsIndex >= 0) return `${API_BASE_URL}${normalized.slice(uploadsIndex)}`;
  if (normalized.startsWith("/uploads/")) return `${API_BASE_URL}${normalized}`;
  if (normalized.startsWith("uploads/")) return `${API_BASE_URL}/${normalized}`;
  return normalized;
};

const getInitials = (value?: string) => {
  if (!value) return "RN";
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const formatDate = (value?: string) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
};

function ParticipantAvatar({ participante }: { participante: EventoInscripcionParticipante }) {
  const logoUrl = resolveFileUrl(participante.user.logoEmpresa);

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/10 text-xs font-bold text-accent ring-1 ring-accent/20">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="h-full w-full object-cover" src={logoUrl} alt={participante.user.nombreEmpresa ?? "Participante"} />
      ) : (
        getInitials(participante.user.nombreEmpresa)
      )}
    </div>
  );
}

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
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("todos");
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("activa");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedParticipant, setSelectedParticipant] = useState<EventoInscripcionParticipante | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<EventoInscripcionParticipante | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const pageSize = 10;
  const canManageParticipants = role === "adminEvento" || role === "adminSistema";

  useEffect(() => {
    setPage(1);
  }, [roleFilter, estadoFilter, search, eventoId]);

  const inscripcionesQuery = useQuery({
    queryKey: ["eventos", "inscripciones", eventoId, { role: roleFilter, estado: estadoFilter, search, page, pageSize }],
    queryFn: () =>
      getEventoInscripciones(token as string, eventoId, {
        role: roleFilter,
        estado: estadoFilter,
        search: search.trim(),
        page,
        limit: pageSize
      }),
    enabled: Boolean(token) && enabled
  });

  const cancelParticipantMutation = useMutation({
    mutationFn: cancelarParticipanteEvento,
    onSuccess: () => {
      setParticipantToDelete(null);
      setFeedback({ type: "success", message: "Participación cancelada correctamente." });
      queryClient.invalidateQueries({ queryKey: ["eventos", "inscripciones", eventoId] });
      queryClient.invalidateQueries({ queryKey: ["eventos", "detail", eventoId] });
      queryClient.invalidateQueries({ queryKey: ["eventos"] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo eliminar la participación."
      });
    }
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

      {feedback ? (
        <p className={cn("rounded-xl px-4 py-3 text-sm font-semibold", feedback.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
          {feedback.message}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Buscar participante
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-ink"
            placeholder="Nombre, empresa, correo o sector"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

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

        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {estadoTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setEstadoFilter(tab.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                estadoFilter === tab.value ? "bg-white text-accent shadow-sm" : "text-muted hover:text-ink"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
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

      <div className="grid gap-3">
        {participantes.map((participante) => {
          const badge = roleBadge[participante.role];
          const estadoClass =
            participante.estado === "activa"
              ? "bg-success/10 text-success ring-success/30"
              : "bg-slate-100 text-slate-700 ring-slate-300";

          return (
            <div
              key={participante._id}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <ParticipantAvatar participante={participante} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {participante.user.representante?.nombre || participante.user.nombreEmpresa || "Participante sin nombre"}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {participante.user.nombreEmpresa ?? "Empresa sin nombre"} · {participante.user.email ?? participante.user.datosContacto?.correo ?? "Sin correo"}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Inscripción: {formatDate(participante.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1", badge.className)}>
                    {badge.label}
                  </span>
                  <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1", estadoClass)}>
                    {participante.estado}
                  </span>
                  <Button variant="secondary" onClick={() => setSelectedParticipant(participante)}>
                    Ver perfil
                  </Button>
                  {canManageParticipants && participante.estado === "activa" ? (
                    <Button
                      variant="danger"
                      onClick={() => {
                        setFeedback(null);
                        setParticipantToDelete(participante);
                      }}
                    >
                      Eliminar participación
                    </Button>
                  ) : null}
                </div>
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

      {selectedParticipant ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" onClick={() => setSelectedParticipant(null)}>
          <aside
            className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl transition-transform"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <ParticipantAvatar participante={selectedParticipant} />
                <div>
                  <h3 className="text-lg font-semibold text-ink">
                    {selectedParticipant.user.nombreEmpresa ?? "Empresa sin nombre"}
                  </h3>
                  <p className="text-sm text-muted">{selectedParticipant.user.sector ?? "Sector no definido"}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setSelectedParticipant(null)}>
                Cerrar
              </Button>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                ["Nombre", selectedParticipant.user.representante?.nombre || selectedParticipant.user.nombreEmpresa || "No registrado"],
                ["Empresa", selectedParticipant.user.nombreEmpresa || "No registrado"],
                ["Correo", selectedParticipant.user.email || selectedParticipant.user.datosContacto?.correo || "No registrado"],
                ["Rol", roleBadge[selectedParticipant.role].label],
                ["Estado inscripción", selectedParticipant.estado],
                ["Fecha inscripción", formatDate(selectedParticipant.createdAt)],
                ["Teléfono", selectedParticipant.user.datosContacto?.telefono || "No registrado"],
                ["Representante", selectedParticipant.user.representante?.nombre || "No registrado"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {participantToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setParticipantToDelete(null)}>
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-ink">Eliminar participante</h2>
            <p className="mt-3 text-sm text-muted">¿Desea cancelar la participación de este usuario en el evento?</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setParticipantToDelete(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                loading={cancelParticipantMutation.isPending}
                onClick={() => {
                  if (!token) return;
                  cancelParticipantMutation.mutate({
                    token,
                    eventoId,
                    inscripcionId: participantToDelete._id
                  });
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
