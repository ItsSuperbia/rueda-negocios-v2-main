"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip } from "@/components/ui/status-chip";
import { getEventoById, getPendingEventos, updateEventoStatus } from "@/features/eventos/api";
import { AdminEventoEventos } from "@/features/eventos/components/admin-evento-eventos";
import { EventoCreateForm } from "@/features/eventos/components/evento-create-form";
import { useAuthStore } from "@/store/auth-store";

export function EventosWorkspace() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedEventoId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const pendingEventosQuery = useQuery({
    queryKey: ["eventos", "pendientes"],
    queryFn: () => getPendingEventos(token as string),
    enabled: Boolean(token) && role === "adminSistema"
  });

  const statusMutation = useMutation({
    mutationFn: updateEventoStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eventos", "pendientes"] })
  });

  const selectedEventoQuery = useQuery({
    queryKey: ["eventos", "detail", selectedEventoId],
    queryFn: () => getEventoById({ token: token as string, eventoId: selectedEventoId as string }),
    enabled: Boolean(token) && role === "adminSistema" && Boolean(selectedEventoId)
  });

  if (!role) {
    return <p className="text-sm text-muted">Sin rol activo.</p>;
  }

  return (
    <section className="space-y-5">
      {role === "adminEvento" ? (
        <>
          {showCreateForm ? (
            <EventoCreateForm onCancel={() => setShowCreateForm(false)} onCreated={() => setShowCreateForm(false)} />
          ) : null}
          <AdminEventoEventos onCreate={() => setShowCreateForm(true)} />
        </>
      ) : null}

      {role === "adminSistema" ? (
        <>
          <Card>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-[var(--font-heading)] text-2xl font-bold">Gestión de eventos</h1>
                <p className="mt-1 text-sm text-muted">Flujo segmentado por rol para crear o moderar eventos.</p>
              </div>
            </div>
          </Card>
        <Card className="fade-up">
          <h2 className="mb-4 text-lg font-semibold">Eventos pendientes por moderar</h2>

          {pendingEventosQuery.isPending ? <p className="text-sm text-muted">Cargando eventos...</p> : null}

          {pendingEventosQuery.isError ? (
            <EmptyState title="Error al cargar eventos" description="No se pudo recuperar el listado de eventos pendientes." />
          ) : null}

          {!pendingEventosQuery.isPending && !pendingEventosQuery.isError && (pendingEventosQuery.data?.length ?? 0) === 0 ? (
            <EmptyState title="Sin eventos pendientes" description="No hay solicitudes de aprobación en este momento." />
          ) : null}

          <div className="grid gap-3">
            {pendingEventosQuery.data?.map((evento) => (
              <Card className="bg-canvas" key={evento._id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold">{evento.title}</h3>
                    <p className="text-sm text-muted">{evento.description}</p>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(evento.startDate).toLocaleDateString()} - {new Date(evento.endDate).toLocaleDateString()} • {evento.modalidad}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <StatusChip status={evento.estadoEvento} />
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setSelectedEventoId(evento._id)}>
                        Ver detalle
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          statusMutation.mutate({
                            token: token as string,
                            eventoId: evento._id,
                            estado: "aprobado"
                          })
                        }
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          statusMutation.mutate({
                            token: token as string,
                            eventoId: evento._id,
                            estado: "rechazado"
                          })
                        }
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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

              {selectedEventoQuery.data ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold text-ink">Detalle del evento</h3>
                    <StatusChip status={selectedEventoQuery.data.estadoEvento} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-muted">Título</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{selectedEventoQuery.data.title}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-muted">Categoría</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{selectedEventoQuery.data.categoria ?? selectedEventoQuery.data.enfoque}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-muted">Modalidad</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{selectedEventoQuery.data.modalidad}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-muted">Ubicación</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{selectedEventoQuery.data.location}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-muted">Inicio</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{new Date(selectedEventoQuery.data.startDate).toLocaleString("es-CO")}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-muted">Finalización</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{new Date(selectedEventoQuery.data.endDate).toLocaleString("es-CO")}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-muted">Cupos</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{selectedEventoQuery.data.cupos}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-muted">Inscritos</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{selectedEventoQuery.data.inscritos ?? 0}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-muted">Descripción</p>
                    <p className="mt-2 text-sm text-ink">{selectedEventoQuery.data.description}</p>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => setSelectedEventoId(null)}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        </>
      ) : null}

      {role !== "adminSistema" && role !== "adminEvento" ? (
        <EmptyState
          title="Catálogo de eventos en evolución"
          description="Próximamente verás aquí filtros avanzados, inscripción y seguimiento de estado por evento."
        />
      ) : null}
    </section>
  );
}
