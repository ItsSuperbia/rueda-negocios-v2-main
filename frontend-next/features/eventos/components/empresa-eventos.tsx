"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  cancelarInscripcionEvento,
  getEmpresaEventosCatalogo,
  getEmpresaEventosInscritos,
  getEventoById,
  inscribirseEvento
} from "@/features/eventos/api";
import { EventoInscripcionesPanel } from "@/features/eventos/components/evento-inscripciones-panel";
import { cn } from "@/lib/cn";
import { Evento, Role } from "@/shared/types/domain";
import { useAuthStore } from "@/store/auth-store";

const categoryOptions = [
  { value: "todos", label: "Todas" },
  { value: "agricultura", label: "Agricultura" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "comercio", label: "Comercio" },
  { value: "manufactura", label: "Manufactura" },
  { value: "servicios", label: "Servicios" },
  { value: "gastronomia", label: "Gastronomía" },
  { value: "textil", label: "Textil" },
  { value: "construccion", label: "Construcción" },
  { value: "salud", label: "Salud" },
  { value: "sostenibilidad", label: "Sostenibilidad" },
  { value: "finanzas", label: "Finanzas" },
  { value: "multisectorial", label: "Multisectorial" }
];

const modalidadOptions = [
  { value: "todos", label: "Todas" },
  { value: "presencial", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
  { value: "mixto", label: "Híbrido" }
];

const estadoOptions = [
  { value: "proximos", label: "Próximos" },
  { value: "finalizados", label: "Finalizados" },
  { value: "todos", label: "Todos" }
];

type EmpresaEventosTab = "explorar" | "misEventos";

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

const getRoleCopy = (role: Role | null) => {
  if (role === "ofertante") {
    return {
      title: "Eventos para empresas ofertantes",
      subtitle: "Explora ruedas de negocio donde puedes presentar productos y servicios.",
      joinLabel: "Unirme como ofertante",
      joinedMessage: "Tu empresa ofertante quedó inscrita en el evento.",
      cancelMessage: "Cancelaste la inscripción de tu empresa ofertante."
    };
  }

  return {
    title: "Eventos para empresas demandantes",
    subtitle: "Explora eventos donde puedes conectar con proveedores y aliados.",
    joinLabel: "Unirme como demandante",
    joinedMessage: "Tu empresa demandante quedó inscrita en el evento.",
    cancelMessage: "Cancelaste la inscripción de tu empresa demandante."
  };
};

const getCategoriaLabel = (evento: Evento) => {
  const option = categoryOptions.find((item) => item.value === evento.categoria);
  return option?.label ?? evento.enfoque ?? "Sin categoría";
};

const isEventoFull = (evento: Evento) => (evento.inscritos ?? 0) >= evento.cupos;

const getEventoAvailability = (evento: Evento) => {
  const now = new Date();
  const endDate = new Date(evento.endDate);

  if (!Number.isNaN(endDate.getTime()) && endDate < now) {
    return { label: "Finalizado", className: "bg-slate-100 text-slate-700 ring-slate-300" };
  }

  if (isEventoFull(evento)) {
    return { label: "Sin cupos", className: "bg-danger/10 text-danger ring-danger/30" };
  }

  return { label: "Disponible", className: "bg-success/10 text-success ring-success/30" };
};

const useDebouncedValue = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};

export function EmpresaEventos() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<EmpresaEventosTab>("explorar");
  const [searchInput, setSearchInput] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [modalidad, setModalidad] = useState("todos");
  const [estado, setEstado] = useState("proximos");
  const [page, setPage] = useState(1);
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput.trim(), 350);
  const pageSize = 6;
  const copy = getRoleCopy(role);

  useEffect(() => {
    setPage(1);
  }, [activeTab, categoria, modalidad, estado, debouncedSearch]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedEventoId(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const queryParams = {
    page,
    limit: pageSize,
    search: debouncedSearch,
    categoria,
    modalidad,
    estado,
    sort: "startDate"
  };

  const eventosQuery = useQuery({
    queryKey: ["eventos", "empresa", activeTab, queryParams],
    queryFn: () =>
      activeTab === "explorar"
        ? getEmpresaEventosCatalogo(token as string, queryParams)
        : getEmpresaEventosInscritos(token as string, queryParams),
    enabled: Boolean(token) && (role === "ofertante" || role === "demandante")
  });

  const selectedEventoQuery = useQuery({
    queryKey: ["eventos", "detail", selectedEventoId],
    queryFn: () => getEventoById({ token: token as string, eventoId: selectedEventoId as string }),
    enabled: Boolean(token) && Boolean(selectedEventoId) && (role === "ofertante" || role === "demandante")
  });

  const invalidateEmpresaEventos = () => {
    queryClient.invalidateQueries({ queryKey: ["eventos", "empresa"] });
    if (selectedEventoId) {
      queryClient.invalidateQueries({ queryKey: ["eventos", "detail", selectedEventoId] });
    }
  };

  const joinMutation = useMutation({
    mutationFn: inscribirseEvento,
    onSuccess: () => {
      setFeedback({ type: "success", message: copy.joinedMessage });
      invalidateEmpresaEventos();
    },
    onError: (error) => {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "No se pudo realizar la inscripción." });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: cancelarInscripcionEvento,
    onSuccess: () => {
      setFeedback({ type: "success", message: copy.cancelMessage });
      invalidateEmpresaEventos();
    },
    onError: (error) => {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "No se pudo cancelar la inscripción." });
    }
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

  const emptyTitle = activeTab === "misEventos" ? "No tienes eventos inscritos" : "No se encontraron eventos";
  const emptyDescription =
    activeTab === "misEventos"
      ? "Cuando te unas a un evento aparecerá en este listado."
      : "Prueba cambiando la búsqueda, categoría, modalidad o estado.";

  const handleJoin = (eventoId: string) => {
    setFeedback(null);
    joinMutation.mutate({ token: token as string, eventoId });
  };

  const handleCancel = (eventoId: string) => {
    setFeedback(null);
    cancelMutation.mutate({ token: token as string, eventoId });
  };

  const renderEventoAction = (evento: Evento) => {
    if (evento.estaInscrito) {
      return (
        <Button
          variant="danger"
          loading={cancelMutation.isPending}
          onClick={() => handleCancel(evento._id)}
        >
          Cancelar inscripción
        </Button>
      );
    }

    return (
      <Button
        loading={joinMutation.isPending}
        disabled={isEventoFull(evento)}
        onClick={() => handleJoin(evento._id)}
      >
        {copy.joinLabel}
      </Button>
    );
  };

  const selectedEvento = selectedEventoQuery.data;

  return (
    <section className="space-y-5">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold">{copy.title}</h1>
            <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
          </div>
          <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 md:w-auto">
            {[
              { value: "explorar", label: "Explorar eventos" },
              { value: "misEventos", label: "Mis eventos" }
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value as EmpresaEventosTab)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition md:flex-none",
                  activeTab === tab.value ? "bg-white text-accent shadow-sm" : "text-muted hover:text-ink"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {feedback ? (
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-semibold ring-1",
            feedback.type === "success"
              ? "bg-success/10 text-success ring-success/30"
              : "bg-danger/10 text-danger ring-danger/30"
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <Card className="fade-up">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
          <label className="grid gap-1 text-xs font-semibold text-muted">
            Buscar
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-ink"
              placeholder="Nombre, descripción o ciudad"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-muted">
            Categoría
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-ink"
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold text-muted">
            Modalidad
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-ink"
              value={modalidad}
              onChange={(event) => setModalidad(event.target.value)}
            >
              {modalidadOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold text-muted">
            Estado
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-ink"
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
            >
              {estadoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card>
        {eventosQuery.isPending ? <p className="text-sm text-muted">Cargando eventos...</p> : null}
        {eventosQuery.isError ? (
          <EmptyState title="Error al cargar eventos" description="No se pudo recuperar el listado de eventos." />
        ) : null}
        {!eventosQuery.isPending && !eventosQuery.isError && eventos.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {eventos.map((evento) => {
            const availability = getEventoAvailability(evento);

            return (
              <Card className="bg-white/80" key={evento._id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted">{getCategoriaLabel(evento)}</span>
                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1", availability.className)}>
                    {evento.estaInscrito ? "Inscrito" : availability.label}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-semibold text-ink">{evento.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{evento.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>📅 {formatShortDate(evento.startDate)}</span>
                  <span>📍 {evento.ciudad || evento.location || "Por definir"}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>👥 {(evento.inscritos ?? 0)}/{evento.cupos}</span>
                  <span>💻 {formatModalidad(evento.modalidad)}</span>
                  {evento.inscripcionesResumen ? (
                    <span>
                      {evento.inscripcionesResumen.ofertantes} ofertantes · {evento.inscripcionesResumen.demandantes} demandantes
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setSelectedEventoId(evento._id)}>
                    Ver detalle
                  </Button>
                  {renderEventoAction(evento)}
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
      </Card>

      {selectedEventoId ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setSelectedEventoId(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {selectedEventoQuery.isPending ? <p className="text-sm text-muted">Cargando detalle del evento...</p> : null}
            {selectedEventoQuery.isError ? (
              <EmptyState title="Error al cargar el evento" description="No se pudo recuperar el detalle del evento." />
            ) : null}

            {selectedEvento ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted">{getCategoriaLabel(selectedEvento)}</span>
                  <h3 className="text-xl font-semibold text-ink">{selectedEvento.title}</h3>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                      selectedEvento.estaInscrito
                        ? "bg-accent/10 text-accent ring-accent/30"
                        : getEventoAvailability(selectedEvento).className
                    )}
                  >
                    {selectedEvento.estaInscrito ? "Inscrito" : getEventoAvailability(selectedEvento).label}
                  </span>
                </div>

                <p className="text-sm text-muted">{selectedEvento.description}</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Fecha</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{formatLongDate(selectedEvento.startDate)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Horario</p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      {selectedEvento.horaInicio || "--:--"} - {selectedEvento.horaFin || "--:--"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Ubicación</p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      {selectedEvento.location || "Por definir"}{selectedEvento.ciudad ? `, ${selectedEvento.ciudad}` : ""}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Modalidad</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{formatModalidad(selectedEvento.modalidad)}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold text-muted">Cupos</p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      {(selectedEvento.inscritos ?? 0)} / {selectedEvento.cupos} inscritos
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold text-muted">Valor</p>
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
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-muted">Contacto</p>
                  <p className="mt-2 text-sm text-ink">
                    {selectedEvento.emailContacto || "Sin email"} {selectedEvento.telefonoContacto ? `• ${selectedEvento.telefonoContacto}` : ""}
                  </p>
                </div>

                {selectedEvento.inscripcionesResumen ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold text-muted">Participantes</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{selectedEvento.inscripcionesResumen.total}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold text-muted">Ofertantes</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{selectedEvento.inscripcionesResumen.ofertantes}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold text-muted">Demandantes</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{selectedEvento.inscripcionesResumen.demandantes}</p>
                    </div>
                  </div>
                ) : null}

                {selectedEvento.estaInscrito ? (
                  <div className="border-t border-slate-200 pt-5">
                    <EventoInscripcionesPanel eventoId={selectedEvento._id} />
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 md:flex-row md:justify-end">
                  <Button variant="secondary" onClick={() => setSelectedEventoId(null)}>
                    Cerrar
                  </Button>
                  {renderEventoAction(selectedEvento)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
