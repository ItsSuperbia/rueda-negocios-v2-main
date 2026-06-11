"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { getAdminEventos } from "@/features/eventos/api";
import { Evento } from "@/shared/types/domain";
import { useAuthStore } from "@/store/auth-store";

const estadoOptions = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "🟢 Activos" },
  { value: "pendiente", label: "🟡 Pendientes" },
  { value: "finalizado", label: "🔵 Finalizados" },
  { value: "cancelado", label: "🔴 Cancelados" },
  { value: "borrador", label: "⚪ Borradores" }
];

const categoryLabels: Record<string, string> = {
  agricultura: "🌾 Agricultura",
  tecnologia: "🚀 Tecnología",
  comercio: "💼 Comercio",
  manufactura: "🏭 Manufactura",
  servicios: "🛎️ Servicios",
  gastronomia: "🍽️ Gastronomía",
  textil: "👔 Textil",
  construccion: "🏗️ Construcción",
  salud: "🏥 Salud",
  sostenibilidad: "🌱 Sostenibilidad",
  finanzas: "💰 Finanzas",
  multisectorial: "🌐 Multisectorial"
};

const formatShortDate = (value?: string) => {
  if (!value) return "Fecha por definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha por definir";
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

const formatLongDate = (value?: string) => {
  if (!value) return "Fecha por definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha por definir";
  return date.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

const formatModalidad = (modalidad?: Evento["modalidad"]) => {
  if (!modalidad) return "Por definir";
  if (modalidad === "mixto") return "Híbrido";
  return modalidad.charAt(0).toUpperCase() + modalidad.slice(1);
};

const formatCurrency = (value?: number) => {
  if (!value) return "Gratuito";
  return `$${value.toLocaleString("es-CO")} COP`;
};

const getEstadoMeta = (evento: Evento) => {
  const now = new Date();
  const endDate = new Date(evento.endDate);

  if (evento.estadoEvento === "rechazado") {
    return { key: "cancelado", label: "🔴 Cancelado", className: "bg-danger/10 text-danger ring-danger/30" };
  }

  if (evento.estadoEvento === "borrador") {
    return { key: "borrador", label: "⚪ Borrador", className: "bg-slate-100 text-slate-700 ring-slate-300" };
  }

  if (evento.estadoEvento === "pendiente") {
    return { key: "pendiente", label: "🟡 Pendiente", className: "bg-warning/10 text-warning ring-warning/30" };
  }

  if (!Number.isNaN(endDate.getTime()) && endDate < now) {
    return { key: "finalizado", label: "🔵 Finalizado", className: "bg-accent/10 text-accent ring-accent/30" };
  }

  return { key: "activo", label: "🟢 Activo", className: "bg-success/10 text-success ring-success/30" };
};

const getCategoriaLabel = (evento: Evento) => {
  if (evento.categoria && categoryLabels[evento.categoria]) {
    return categoryLabels[evento.categoria];
  }
  return evento.enfoque || "📌 Sin categoría";
};

const useDebouncedValue = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};

interface AdminEventoEventosProps {
  onCreate: () => void;
}

export function AdminEventoEventos({ onCreate }: AdminEventoEventosProps) {
  const token = useAuthStore((state) => state.token);
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput.trim(), 350);
  const pageSize = 6;

  useEffect(() => {
    setPage(1);
  }, [estadoFiltro, debouncedSearch]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedEvento(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const eventosQuery = useQuery({
    queryKey: ["eventos", "adminEvento", { page, pageSize, estadoFiltro, debouncedSearch }],
    queryFn: () =>
      getAdminEventos(token as string, {
        page,
        limit: pageSize,
        estado: estadoFiltro,
        search: debouncedSearch,
        sort: "recent"
      }),
    enabled: Boolean(token)
  });

  const eventos = eventosQuery.data?.data ?? [];
  const meta = eventosQuery.data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;

  const pages = useMemo(() => {
    if (!totalPages || totalPages <= 1) return [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  const rangeText = useMemo(() => {
    if (!total) return "";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, total);
    return `Mostrando ${start}-${end} de ${total} eventos`;
  }, [page, pageSize, total]);

  const emptyTitle = debouncedSearch || estadoFiltro !== "todos" ? "No se encontraron eventos" : "Aún no has creado eventos";
  const emptyDescription =
    debouncedSearch || estadoFiltro !== "todos"
      ? "Prueba con otra búsqueda o cambia el filtro de estado."
      : "Cuando crees tu primer evento aparecerá aquí para su seguimiento.";

  return (
    <Card className="fade-up">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">📋 Mis Eventos</h2>
          <p className="mt-1 text-sm text-muted">Gestiona todos los eventos que has creado.</p>
        </div>
        <Button onClick={onCreate}>➕ Crear evento</Button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              placeholder="🔍 Buscar eventos por nombre..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted">Filtrar por estado:</span>
            <div className="flex flex-wrap gap-2">
              {estadoOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEstadoFiltro(option.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                    estadoFiltro === option.value
                      ? "bg-accent text-white ring-accent/60"
                      : "bg-white/80 text-ink ring-slate-200 hover:bg-white"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        {eventosQuery.isPending ? <p className="text-sm text-muted">Cargando eventos...</p> : null}
        {eventosQuery.isError ? (
          <EmptyState title="Error al cargar eventos" description="No se pudo recuperar tus eventos creados." />
        ) : null}
        {!eventosQuery.isPending && !eventosQuery.isError && eventos.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {eventos.map((evento) => {
            const status = getEstadoMeta(evento);
            const inscritos = evento.inscritos ?? 0;

            return (
              <Card className="bg-white/80" key={evento._id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted">{getCategoriaLabel(evento)}</span>
                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1", status.className)}>
                    {status.label}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-semibold text-ink">{evento.title}</h3>
                <p className="mt-2 text-sm text-muted">{evento.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>📅 {formatShortDate(evento.startDate)}</span>
                  <span>📍 {evento.ciudad || "Por definir"}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>👥 {inscritos}/{evento.cupos}</span>
                  <span>🪑 {evento.mesas ?? 0} mesas</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setSelectedEvento(evento)}>
                    👁 Ver detalle
                  </Button>
                  {(status.key === "activo" || status.key === "borrador") && (
                    <Button variant="ghost" disabled title="Edición próximamente">
                      ✏️ Editar
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {totalPages > 1 ? (
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

      {selectedEvento ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setSelectedEvento(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted">{getCategoriaLabel(selectedEvento)}</span>
              <h3 className="text-xl font-semibold text-ink">{selectedEvento.title}</h3>
              <span
                className={cn(
                  "inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                  getEstadoMeta(selectedEvento).className
                )}
              >
                {getEstadoMeta(selectedEvento).label}
              </span>
            </div>

            <p className="mt-4 text-sm text-muted">{selectedEvento.description}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-muted">📅 Fecha</p>
                <p className="mt-2 text-sm font-semibold text-ink">{formatLongDate(selectedEvento.startDate)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-muted">🕐 Horario</p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {selectedEvento.horaInicio || "--:--"} - {selectedEvento.horaFin || "--:--"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-muted">📍 Ubicación</p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {selectedEvento.location || "Por definir"}{selectedEvento.ciudad ? `, ${selectedEvento.ciudad}` : ""}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-muted">💻 Modalidad</p>
                <p className="mt-2 text-sm font-semibold text-ink">{formatModalidad(selectedEvento.modalidad)}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-muted">Cupos</p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {(selectedEvento.inscritos ?? 0)} / {selectedEvento.cupos} inscritos
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-muted">Mesas/Salas</p>
                <p className="mt-2 text-sm font-semibold text-ink">{selectedEvento.mesas ?? 0} disponibles</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-muted">Duración Reuniones</p>
                <p className="mt-2 text-sm font-semibold text-ink">{selectedEvento.duracionReunionMin ?? 0} minutos</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-muted">Valor Inscripción</p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {selectedEvento.esGratis ? "Gratuito" : formatCurrency(selectedEvento.valorInscripcion)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-muted">Fecha límite</p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {selectedEvento.fechaLimiteInscripcion ? formatShortDate(selectedEvento.fechaLimiteInscripcion) : "Por definir"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-muted">Organizador</p>
                <p className="mt-2 text-sm font-semibold text-ink">{selectedEvento.organizador || "Por definir"}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-muted">Contacto</p>
              <p className="mt-2 text-sm text-ink">
                {selectedEvento.emailContacto || "Sin email"} {selectedEvento.telefonoContacto ? `• ${selectedEvento.telefonoContacto}` : ""}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedEvento(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
