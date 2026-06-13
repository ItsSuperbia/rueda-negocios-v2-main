"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import {
  getBuyerMeetingMarketplace,
  getMeetingEventos,
  getSupplierMeetingWorkspace,
  reserveBuyerSession,
  reserveSupplierTable
} from "@/features/reuniones/api";
import {
  BuyerSupplierCard,
  Evento,
  MeetingEntity,
  SupplierMeetingWorkspace,
  TableReservationEntity
} from "@/shared/types/domain";
import { useAuthStore } from "@/store/auth-store";

const formatShortDate = (value?: string) => {
  if (!value) return "Fecha por definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha por definir";
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

const formatTime = (value?: string) => {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const formatModalidad = (modalidad?: Evento["modalidad"]) => {
  if (!modalidad) return "Por definir";
  if (modalidad === "mixto") return "Híbrido";
  return modalidad.charAt(0).toUpperCase() + modalidad.slice(1);
};

const useDebouncedValue = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
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

const getDayLabel = (dayKey: string) => {
  const date = new Date(`${dayKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dayKey;
  return date.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });
};

const getFeedbackClass = (type: "success" | "error") =>
  type === "success" ? "bg-success/10 text-success ring-success/30" : "bg-danger/10 text-danger ring-danger/30";

function EventSelector({
  eventos,
  selectedEventoId,
  onSelect
}: {
  eventos: Evento[];
  selectedEventoId: string | null;
  onSelect: (eventoId: string) => void;
}) {
  const selectedEvento = eventos.find((evento) => evento._id === selectedEventoId);

  return (
    <Card>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold">Agenda de reuniones</h1>
          <p className="mt-1 text-sm text-muted">
            Gestiona mesas, disponibilidad y reservas comerciales de los eventos donde estás inscrito.
          </p>
          {selectedEvento ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted">
              <span className="rounded-full bg-slate-100 px-3 py-1">{formatShortDate(selectedEvento.startDate)}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{formatModalidad(selectedEvento.modalidad)}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{selectedEvento.mesas ?? 0} mesas</span>
            </div>
          ) : null}
        </div>
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Evento inscrito
          <select
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-ink"
            value={selectedEventoId ?? ""}
            onChange={(event) => onSelect(event.target.value)}
          >
            {eventos.map((evento) => (
              <option key={evento._id} value={evento._id}>
                {evento.title}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Card>
  );
}

function SupplierReservationSummary({ reservations }: { reservations: TableReservationEntity[] }) {
  if (!reservations.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-muted">
        Aún no tienes mesas reservadas para este evento.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {reservations.map((reservation) => (
        <div key={reservation._id} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-muted">Mesa {reservation.tableNumber}</p>
          <p className="mt-2 text-sm font-semibold text-ink">{getDayLabel(reservation.dayKey)}</p>
          <span className="mt-3 inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success ring-1 ring-success/30">
            Reservada
          </span>
        </div>
      ))}
    </div>
  );
}

function SupplierReservePanel({
  workspace,
  selectedTable,
  selectedDays,
  onTableChange,
  onToggleDay,
  onSubmit,
  loading
}: {
  workspace: SupplierMeetingWorkspace;
  selectedTable: number | null;
  selectedDays: string[];
  onTableChange: (tableNumber: number) => void;
  onToggleDay: (dayKey: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const selectedDaySet = new Set(selectedDays);
  const reservationsByDayTable = new Map(
    workspace.reservations.map((reservation) => [`${reservation.dayKey}:${reservation.tableNumber}`, reservation])
  );

  const isTableBlocked = (tableNumber: number) => {
    if (!selectedDays.length) return false;
    return selectedDays.some((dayKey) => {
      const reservation = reservationsByDayTable.get(`${dayKey}:${tableNumber}`);
      return Boolean(reservation);
    });
  };
  const selectedTableBlocked = selectedTable ? isTableBlocked(selectedTable) : false;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Reservar mesa</h2>
          <p className="mt-1 text-sm text-muted">Selecciona una mesa y uno o varios días del evento.</p>
        </div>
        <Button disabled={!selectedTable || !selectedDays.length || selectedTableBlocked} loading={loading} onClick={onSubmit}>
          Confirmar reserva
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Días disponibles</p>
          <div className="mt-2 grid gap-2">
            {workspace.days.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => onToggleDay(day.key)}
                className={cn(
                  "rounded-xl px-3 py-2 text-left text-sm font-semibold ring-1 transition",
                  selectedDaySet.has(day.key)
                    ? "bg-accent text-white ring-accent/50"
                    : "bg-white text-ink ring-slate-200 hover:ring-accent/40"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Mesas</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {workspace.tables.map((tableNumber) => {
              const blocked = isTableBlocked(tableNumber);
              const selected = selectedTable === tableNumber;

              return (
                <button
                  key={tableNumber}
                  type="button"
                  disabled={blocked}
                  onClick={() => onTableChange(tableNumber)}
                  className={cn(
                    "min-h-20 rounded-xl px-3 py-3 text-sm font-semibold ring-1 transition disabled:cursor-not-allowed disabled:opacity-60",
                    selected
                      ? "bg-accent text-white ring-accent/50"
                      : blocked
                        ? "bg-danger/10 text-danger ring-danger/30"
                        : "bg-white text-ink ring-slate-200 hover:ring-accent/40"
                  )}
                >
                  <span className="block">Mesa {tableNumber}</span>
                  <span className="mt-1 block text-xs opacity-80">{blocked ? "Reservada" : "Disponible"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupplierMatrix({ workspace }: { workspace: SupplierMeetingWorkspace }) {
  const [activeDayKey, setActiveDayKey] = useState(workspace.days[0]?.key ?? "");

  useEffect(() => {
    setActiveDayKey(workspace.days[0]?.key ?? "");
  }, [workspace.evento._id, workspace.days]);

  const activeDay = workspace.matrix.find((day) => day.key === activeDayKey) ?? workspace.matrix[0];

  return (
    <Card>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Agenda por mesas</h2>
          <p className="mt-1 text-sm text-muted">Matriz de horarios y estado de ocupación por mesa.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {workspace.days.map((day) => (
            <button
              key={day.key}
              type="button"
              onClick={() => setActiveDayKey(day.key)}
              className={cn(
                "rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition",
                activeDay?.key === day.key ? "bg-accent text-white ring-accent/50" : "bg-white text-ink ring-slate-200"
              )}
            >
              {getDayLabel(day.key)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[760px]">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `120px repeat(${workspace.tables.length}, minmax(108px, 1fr))` }}
          >
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-muted">Hora</div>
            {workspace.tables.map((tableNumber) => (
              <div key={tableNumber} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-muted">
                Mesa {tableNumber}
              </div>
            ))}

            {activeDay?.rows.map((row) => (
              <div key={`${activeDay.key}-${row.startTime}`} className="contents">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-ink">
                  {row.label}
                </div>
                {row.tables.map((cell) => (
                  <div
                    key={`${row.startTime}-${cell.tableNumber}`}
                    className={cn(
                      "min-h-16 rounded-xl border px-3 py-2 text-xs",
                      cell.reservedByMe
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : cell.status === "reserved"
                          ? "border-warning/30 bg-warning/10 text-warning"
                          : "border-slate-200 bg-white text-muted"
                    )}
                  >
                    <p className="font-semibold">
                      {cell.reservedByMe ? "Tu mesa" : cell.status === "reserved" ? "Reservada" : "Disponible"}
                    </p>
                    {cell.meeting?.buyer ? (
                      <p className="mt-1 truncate text-[11px] text-ink">{cell.meeting.buyer.nombreEmpresa}</p>
                    ) : cell.supplier?.nombreEmpresa ? (
                      <p className="mt-1 truncate text-[11px]">{cell.supplier.nombreEmpresa}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function SupplierWorkspaceView({ eventoId, token }: { eventoId: string; token: string }) {
  const queryClient = useQueryClient();
  const [showReservePanel, setShowReservePanel] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const workspaceQuery = useQuery({
    queryKey: ["meetings", "ofertante", eventoId],
    queryFn: () => getSupplierMeetingWorkspace({ token, eventoId }),
    enabled: Boolean(token && eventoId)
  });

  useEffect(() => {
    setSelectedTable(null);
    setSelectedDays([]);
    setShowReservePanel(false);
    setFeedback(null);
  }, [eventoId]);

  const reserveMutation = useMutation({
    mutationFn: reserveSupplierTable,
    onSuccess: () => {
      setFeedback({ type: "success", message: "Mesa reservada correctamente." });
      setShowReservePanel(false);
      setSelectedTable(null);
      setSelectedDays([]);
      queryClient.invalidateQueries({ queryKey: ["meetings", "ofertante", eventoId] });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo reservar la mesa."
      });
    }
  });

  const toggleDay = (dayKey: string) => {
    setSelectedDays((current) =>
      current.includes(dayKey) ? current.filter((item) => item !== dayKey) : [...current, dayKey].sort()
    );
  };

  const workspace = workspaceQuery.data;

  return (
    <section className="space-y-5">
      {feedback ? <div className={cn("rounded-xl px-4 py-3 text-sm font-semibold ring-1", getFeedbackClass(feedback.type))}>{feedback.message}</div> : null}

      {workspaceQuery.isPending ? <Card><p className="text-sm text-muted">Cargando agenda del evento...</p></Card> : null}
      {workspaceQuery.isError ? <EmptyState title="Error al cargar la agenda" description="No se pudo recuperar la disponibilidad de mesas." /> : null}

      {workspace ? (
        <>
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Reservas de tu empresa</h2>
                <p className="mt-1 text-sm text-muted">Cada reserva bloquea todas las sesiones de esa mesa durante el día seleccionado.</p>
              </div>
              <Button onClick={() => setShowReservePanel((value) => !value)}>
                {showReservePanel ? "Ocultar reserva" : "Reservar mesa"}
              </Button>
            </div>

            <div className="mt-4">
              {showReservePanel ? (
                <SupplierReservePanel
                  workspace={workspace}
                  selectedTable={selectedTable}
                  selectedDays={selectedDays}
                  onTableChange={setSelectedTable}
                  onToggleDay={toggleDay}
                  loading={reserveMutation.isPending}
                  onSubmit={() => {
                    if (!selectedTable || !selectedDays.length) return;
                    setFeedback(null);
                    reserveMutation.mutate({ token, eventoId, tableNumber: selectedTable, dayKeys: selectedDays });
                  }}
                />
              ) : null}

              <div className={cn(showReservePanel ? "mt-4" : "")}>
                <SupplierReservationSummary reservations={workspace.myReservations} />
              </div>
            </div>
          </Card>

          <SupplierMatrix workspace={workspace} />
        </>
      ) : null}
    </section>
  );
}

function SupplierLogo({ card }: { card: BuyerSupplierCard }) {
  const logo = card.supplier.logoEmpresa;
  const canRenderLogo = Boolean(logo && (logo.startsWith("http") || logo.startsWith("/")));

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/10 text-sm font-bold text-accent ring-1 ring-accent/20">
      {canRenderLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="h-full w-full object-cover" src={logo ?? ""} alt={card.supplier.nombreEmpresa ?? "Logo empresa"} />
      ) : (
        getInitials(card.supplier.nombreEmpresa)
      )}
    </div>
  );
}

function SessionButton({
  session,
  onReserve,
  loading
}: {
  session: MeetingEntity;
  onReserve: (meetingId: string) => void;
  loading: boolean;
}) {
  const available = session.status === "available";
  const reserved = session.status === "reserved";

  return (
    <button
      type="button"
      disabled={!available || loading}
      onClick={() => onReserve(session._id)}
      className={cn(
        "rounded-xl border px-3 py-2 text-left text-xs transition disabled:cursor-not-allowed",
        available
          ? "border-success/30 bg-success/10 text-success hover:border-success/60"
          : reserved
            ? "border-slate-200 bg-slate-100 text-muted"
            : "border-slate-200 bg-slate-100 text-muted"
      )}
    >
      <span className="block font-semibold">{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
      <span className="mt-1 block">{available ? "Reservar sesión" : session.status === "completed" ? "Finalizada" : "Reservada"}</span>
    </button>
  );
}

function BuyerMarketplaceView({ eventoId, token }: { eventoId: string; token: string }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("todos");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  useEffect(() => {
    setSearch("");
    setSector("todos");
    setFeedback(null);
  }, [eventoId]);

  const marketplaceQuery = useQuery({
    queryKey: ["meetings", "demandante", eventoId, debouncedSearch, sector],
    queryFn: () => getBuyerMeetingMarketplace({ token, eventoId, search: debouncedSearch, sector }),
    enabled: Boolean(token && eventoId)
  });

  const reserveMutation = useMutation({
    mutationFn: reserveBuyerSession,
    onSuccess: () => {
      setFeedback({ type: "success", message: "Sesión reservada correctamente." });
      queryClient.invalidateQueries({ queryKey: ["meetings", "demandante", eventoId] });
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo reservar la sesión."
      });
    }
  });

  const marketplace = marketplaceQuery.data;
  const cards = marketplace?.supplierCards ?? [];

  return (
    <section className="space-y-5">
      {feedback ? <div className={cn("rounded-xl px-4 py-3 text-sm font-semibold ring-1", getFeedbackClass(feedback.type))}>{feedback.message}</div> : null}

      <Card>
        <div className="grid gap-3 lg:grid-cols-[1fr_220px] lg:items-end">
          <label className="grid gap-1 text-xs font-semibold text-muted">
            Buscar empresa
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-ink"
              placeholder="Nombre o sector"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-muted">
            Sector
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-ink"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
            >
              <option value="todos">Todos</option>
              {marketplace?.sectors.map((sectorOption) => (
                <option key={sectorOption} value={sectorOption}>
                  {sectorOption}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {marketplaceQuery.isPending ? <Card><p className="text-sm text-muted">Cargando empresas con mesas reservadas...</p></Card> : null}
      {marketplaceQuery.isError ? <EmptyState title="Error al cargar empresas" description="No se pudo recuperar la agenda disponible." /> : null}
      {!marketplaceQuery.isPending && !marketplaceQuery.isError && !cards.length ? (
        <EmptyState title="Sin sesiones disponibles" description="Aún no hay ofertantes con mesas reservadas para este evento o los filtros no tienen resultados." />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.reservationId} className="bg-white/90">
            <div className="flex gap-4">
              <SupplierLogo card={card} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="truncate text-base font-semibold text-ink">{card.supplier.nombreEmpresa}</h2>
                    <p className="mt-1 text-sm text-muted">{card.supplier.sector || "Sector no registrado"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-muted">Mesa {card.tableNumber}</span>
                    <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent ring-1 ring-accent/20">
                      {getDayLabel(card.dayKey)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {card.sessions.map((session) => (
                    <SessionButton
                      key={session._id}
                      session={session}
                      loading={reserveMutation.isPending}
                      onReserve={(meetingId) => {
                        setFeedback(null);
                        reserveMutation.mutate({ token, meetingId });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function ReunionesWorkspace() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);

  const eventosQuery = useQuery({
    queryKey: ["meetings", "eventos", role],
    queryFn: () => getMeetingEventos(token as string),
    enabled: Boolean(token) && (role === "ofertante" || role === "demandante")
  });

  const eventos = eventosQuery.data?.data ?? [];

  useEffect(() => {
    if (!selectedEventoId && eventos.length) {
      setSelectedEventoId(eventos[0]._id);
    }
  }, [eventos, selectedEventoId]);

  const selectedEventoExists = useMemo(
    () => eventos.some((evento) => evento._id === selectedEventoId),
    [eventos, selectedEventoId]
  );

  useEffect(() => {
    if (selectedEventoId && eventos.length && !selectedEventoExists) {
      setSelectedEventoId(eventos[0]._id);
    }
  }, [eventos, selectedEventoExists, selectedEventoId]);

  if (!role) {
    return <p className="text-sm text-muted">Sin rol activo.</p>;
  }

  if (role !== "ofertante" && role !== "demandante") {
    return (
      <section className="space-y-4">
        <Card>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold">Agenda de reuniones</h1>
          <p className="mt-1 text-sm text-muted">Este módulo está disponible para empresas ofertantes y demandantes.</p>
        </Card>
        <EmptyState title="Sin vista de reuniones para este rol" description="Accede con una empresa inscrita para gestionar la agenda comercial." />
      </section>
    );
  }

  if (eventosQuery.isPending) {
    return (
      <section className="space-y-4">
        <Card>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold">Agenda de reuniones</h1>
          <p className="mt-1 text-sm text-muted">Cargando eventos inscritos...</p>
        </Card>
      </section>
    );
  }

  if (eventosQuery.isError) {
    return <EmptyState title="Error al cargar eventos" description="No se pudo recuperar tus eventos inscritos para reuniones." />;
  }

  if (!eventos.length) {
    return (
      <section className="space-y-4">
        <Card>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold">Agenda de reuniones</h1>
          <p className="mt-1 text-sm text-muted">Primero debes inscribirte a un evento aprobado.</p>
        </Card>
        <EmptyState title="No tienes eventos inscritos" description="Cuando tu empresa se inscriba a un evento aprobado, aparecerá en esta agenda." />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <EventSelector eventos={eventos} selectedEventoId={selectedEventoId} onSelect={setSelectedEventoId} />

      {selectedEventoId && token && role === "ofertante" ? (
        <SupplierWorkspaceView eventoId={selectedEventoId} token={token} />
      ) : null}

      {selectedEventoId && token && role === "demandante" ? (
        <BuyerMarketplaceView eventoId={selectedEventoId} token={token} />
      ) : null}
    </section>
  );
}
