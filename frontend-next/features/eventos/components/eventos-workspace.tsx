"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip } from "@/components/ui/status-chip";
import { createEvento, getPendingEventos, updateEventoStatus } from "@/features/eventos/api";
import { EventFormValues, eventSchema } from "@/features/eventos/schema";
import { useAuthStore } from "@/store/auth-store";

export function EventosWorkspace() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();

  const pendingEventosQuery = useQuery({
    queryKey: ["eventos", "pendientes"],
    queryFn: () => getPendingEventos(token as string),
    enabled: Boolean(token) && role === "adminSistema"
  });

  const statusMutation = useMutation({
    mutationFn: updateEventoStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eventos", "pendientes"] })
  });

  const createMutation = useMutation({
    mutationFn: createEvento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos", "pendientes"] });
      reset();
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      durationDays: 1,
      location: "",
      modalidad: "presencial",
      cupos: 20,
      valorInscripcion: 0,
      enfoque: ""
    }
  });

  const onSubmit = (values: EventFormValues) => {
    createMutation.mutate({ token: token as string, data: values });
  };

  if (!role) {
    return <p className="text-sm text-muted">Sin rol activo.</p>;
  }

  return (
    <section className="space-y-5">
      <Card>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold">Gestión de eventos</h1>
        <p className="mt-1 text-sm text-muted">Flujo segmentado por rol para crear o moderar eventos.</p>
      </Card>

      {role === "adminEvento" ? (
        <Card className="fade-up">
          <h2 className="mb-4 text-lg font-semibold">Crear nuevo evento</h2>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Título</label>
              <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("title")} />
              {errors.title ? <p className="mt-1 text-xs text-danger">{errors.title.message}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Descripción</label>
              <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2" rows={4} {...register("description")} />
              {errors.description ? <p className="mt-1 text-xs text-danger">{errors.description.message}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm">Fecha inicio</label>
              <input className="w-full rounded-xl border border-slate-300 px-3 py-2" type="date" {...register("startDate")} />
            </div>

            <div>
              <label className="mb-1 block text-sm">Fecha fin</label>
              <input className="w-full rounded-xl border border-slate-300 px-3 py-2" type="date" {...register("endDate")} />
            </div>

            <div>
              <label className="mb-1 block text-sm">Duración (días)</label>
              <input className="w-full rounded-xl border border-slate-300 px-3 py-2" type="number" {...register("durationDays")} />
            </div>

            <div>
              <label className="mb-1 block text-sm">Cupos</label>
              <input className="w-full rounded-xl border border-slate-300 px-3 py-2" type="number" {...register("cupos")} />
            </div>

            <div>
              <label className="mb-1 block text-sm">Modalidad</label>
              <select className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("modalidad")}>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm">Valor inscripción</label>
              <input className="w-full rounded-xl border border-slate-300 px-3 py-2" type="number" {...register("valorInscripcion")} />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Ubicación</label>
              <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("location")} />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Enfoque</label>
              <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("enfoque")} />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => reset()}>
                Limpiar
              </Button>
              <Button loading={createMutation.isPending} type="submit">
                Crear evento
              </Button>
            </div>
          </form>

          {createMutation.isSuccess ? (
            <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">Evento enviado para aprobación.</p>
          ) : null}

          {createMutation.isError ? (
            <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">No fue posible crear el evento.</p>
          ) : null}
        </Card>
      ) : null}

      {role === "adminSistema" ? (
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
