"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createEvento, createEventoDraft } from "@/features/eventos/api";
import { EventFormValues, EventPayload, eventSchema } from "@/features/eventos/schema";
import { useAuthStore } from "@/store/auth-store";

const categoryOptions = [
  { value: "agricultura", label: "🌾 Agricultura y Agroindustria", preview: "🌾 Agricultura" },
  { value: "tecnologia", label: "🚀 Tecnología e Innovación", preview: "🚀 Tecnología" },
  { value: "comercio", label: "💼 Comercio e Importación", preview: "💼 Comercio" },
  { value: "manufactura", label: "🏭 Manufactura e Industria", preview: "🏭 Manufactura" },
  { value: "servicios", label: "🛎️ Servicios Profesionales", preview: "🛎️ Servicios" },
  { value: "gastronomia", label: "🍽️ Gastronomía y Alimentos", preview: "🍽️ Gastronomía" },
  { value: "textil", label: "👔 Textil y Moda", preview: "👔 Textil" },
  { value: "construccion", label: "🏗️ Construcción e Inmobiliario", preview: "🏗️ Construcción" },
  { value: "salud", label: "🏥 Salud y Bienestar", preview: "🏥 Salud" },
  { value: "sostenibilidad", label: "🌱 Sostenibilidad y Medio Ambiente", preview: "🌱 Sostenibilidad" },
  { value: "finanzas", label: "💰 Finanzas e Inversiones", preview: "💰 Finanzas" },
  { value: "multisectorial", label: "🌐 Multisectorial", preview: "🌐 Multisectorial" }
];

const durationOptions = [15, 20, 30, 45, 60];

const formatPreviewDate = (value?: string) => {
  if (!value) return "Fecha por definir";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Fecha por definir";
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
};

const toIsoDateTime = (date: string, time: string) => {
  if (!date) return "";
  const safeTime = time || "00:00";
  const parsed = new Date(`${date}T${safeTime}`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
};

const getDurationDays = (start: string, end: string) => {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 1;
  }
  const diff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
};

interface EventoCreateFormProps {
  onCancel?: () => void;
  onCreated?: () => void;
}

export function EventoCreateForm({ onCancel, onCreated }: EventoCreateFormProps) {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [draftMessage, setDraftMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createEvento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos", "pendientes"] });
      queryClient.invalidateQueries({ queryKey: ["eventos", "adminEvento"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "adminEvento"] });
      setDraftMessage(null);
      reset();
      onCreated?.();
    }
  });

  const draftMutation = useMutation({
    mutationFn: createEventoDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos", "pendientes"] });
      queryClient.invalidateQueries({ queryKey: ["eventos", "adminEvento"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "adminEvento"] });
      setDraftMessage("Borrador guardado correctamente.");
      reset();
      onCreated?.();
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    shouldUnregister: true,
    defaultValues: {
      nombreEvento: "",
      descripcion: "",
      categoria: "",
      modalidad: undefined,
      fechaInicio: "",
      fechaFin: "",
      horaInicio: "",
      horaFin: "",
      duracionReunion: 30,
      fechaLimite: "",
      lugar: "",
      ciudad: "",
      pais: "Colombia",
      linkVirtual: "",
      cupos: 200,
      mesas: undefined,
      esGratis: true,
      valorInscripcion: undefined,
      descuento: undefined,
      emailContacto: "",
      telefonoContacto: "",
      organizador: ""
    }
  });

  const modalidad = watch("modalidad");
  const esGratis = watch("esGratis");
  const categoria = watch("categoria");
  const nombreEvento = watch("nombreEvento");
  const descripcion = watch("descripcion");
  const fechaInicio = watch("fechaInicio");
  const lugar = watch("lugar");
  const cupos = watch("cupos");
  const valorInscripcion = watch("valorInscripcion");

  const showLinkVirtual = modalidad === "virtual" || modalidad === "hibrido";
  const showCostoGroup = !esGratis;

  const categoriaPreview = useMemo(() => {
    return categoryOptions.find((option) => option.value === categoria)?.preview ?? "📌 Sin categoría";
  }, [categoria]);

  const previewPrice = esGratis
    ? "Gratis"
    : valorInscripcion
      ? `$${Number(valorInscripcion).toLocaleString("es-CO")}`
      : "Precio por definir";

  const submitEvento = (values: EventFormValues, isDraft = false) => {
    if (!token) return;

    const categoriaOption = categoryOptions.find((option) => option.value === values.categoria);
    const normalizedModalidad = values.modalidad === "hibrido" ? "mixto" : values.modalidad;
    const startDateIso = toIsoDateTime(values.fechaInicio, values.horaInicio);
    const endDateIso = toIsoDateTime(values.fechaFin, values.horaFin);
    const payload: EventPayload = {
      title: values.nombreEvento,
      description: values.descripcion,
      startDate: startDateIso,
      endDate: endDateIso,
      durationDays: getDurationDays(values.fechaInicio, values.fechaFin),
      location: values.lugar,
      modalidad: normalizedModalidad,
      cupos: values.cupos,
      valorInscripcion: values.esGratis ? 0 : values.valorInscripcion ?? 0,
      enfoque: categoriaOption?.label ?? values.categoria,
      categoria: values.categoria,
      fechaLimiteInscripcion: values.fechaLimite,
      horaInicio: values.horaInicio,
      horaFin: values.horaFin,
      duracionReunionMin: values.duracionReunion,
      mesas: values.mesas,
      esGratis: values.esGratis,
      descuentoEarlyBird: values.descuento,
      emailContacto: values.emailContacto,
      telefonoContacto: values.telefonoContacto,
      organizador: values.organizador,
      ciudad: values.ciudad,
      pais: values.pais,
      linkVirtual: showLinkVirtual ? values.linkVirtual : ""
    };

    if (isDraft) {
      draftMutation.mutate({ token, data: payload });
      return;
    }

    createMutation.mutate({ token, data: payload });
  };

  const onSubmit: SubmitHandler<EventFormValues> = (values) => submitEvento(values, false);

  const onSaveDraft: SubmitHandler<EventFormValues> = (values) => submitEvento(values, true);

  return (
    <Card className="fade-up">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">➕ Crear Nuevo Evento</h2>
          <p className="mt-1 text-sm text-muted">Completa la información para crear un nuevo evento o rueda de negocios.</p>
        </div>
        <Button type="button" variant="secondary" onClick={onCancel}>
          ⬅ Volver
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
          <h4 className="mb-4 border-b border-slate-200 pb-2 text-sm font-semibold text-accent">📝 Información Básica</h4>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Nombre del Evento *</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                placeholder="Ej: Rueda de Negocios Agroindustrial 2025"
                {...register("nombreEvento")}
              />
              {errors.nombreEvento ? <p className="mt-1 text-xs text-danger">{errors.nombreEvento.message}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Descripción *</label>
              <textarea
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                rows={4}
                placeholder="Describe el objetivo y beneficios del evento..."
                {...register("descripcion")}
              />
              {errors.descripcion ? <p className="mt-1 text-xs text-danger">{errors.descripcion.message}</p> : null}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Categoría / Sector *</label>
              <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" {...register("categoria")}>
                <option value="">Seleccionar categoría</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.categoria ? <p className="mt-1 text-xs text-danger">{errors.categoria.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Modalidad *</label>
              <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" {...register("modalidad")}>
                <option value="">Seleccionar modalidad</option>
                <option value="presencial">📍 Presencial</option>
                <option value="virtual">💻 Virtual</option>
                <option value="hibrido">🔄 Híbrido</option>
              </select>
              {errors.modalidad ? <p className="mt-1 text-xs text-danger">{errors.modalidad.message}</p> : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
          <h4 className="mb-4 border-b border-slate-200 pb-2 text-sm font-semibold text-accent">📅 Fecha y Horario</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Fecha de Inicio *</label>
              <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" type="date" {...register("fechaInicio")} />
              {errors.fechaInicio ? <p className="mt-1 text-xs text-danger">{errors.fechaInicio.message}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Fecha de Finalización *</label>
              <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" type="date" {...register("fechaFin")} />
              {errors.fechaFin ? <p className="mt-1 text-xs text-danger">{errors.fechaFin.message}</p> : null}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Hora de Inicio *</label>
              <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" type="time" {...register("horaInicio")} />
              {errors.horaInicio ? <p className="mt-1 text-xs text-danger">{errors.horaInicio.message}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Hora de Finalización *</label>
              <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" type="time" {...register("horaFin")} />
              {errors.horaFin ? <p className="mt-1 text-xs text-danger">{errors.horaFin.message}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Duración por Reunión (min)</label>
              <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" {...register("duracionReunion")}>
                {durationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} minutos
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-ink">Fecha Límite de Inscripción *</label>
            <input
              className="w-full max-w-[260px] rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              type="date"
              {...register("fechaLimite")}
            />
            {errors.fechaLimite ? <p className="mt-1 text-xs text-danger">{errors.fechaLimite.message}</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
          <h4 className="mb-4 border-b border-slate-200 pb-2 text-sm font-semibold text-accent">📍 Ubicación</h4>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Lugar / Dirección *</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                placeholder="Ej: Centro de Convenciones, Calle 50 #10-20"
                {...register("lugar")}
              />
              {errors.lugar ? <p className="mt-1 text-xs text-danger">{errors.lugar.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Ciudad *</label>
                <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" {...register("ciudad")} />
                {errors.ciudad ? <p className="mt-1 text-xs text-danger">{errors.ciudad.message}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">País</label>
                <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" {...register("pais")} />
              </div>
            </div>
            {showLinkVirtual ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Link de Acceso Virtual</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  {...register("linkVirtual")}
                />
                {errors.linkVirtual ? <p className="mt-1 text-xs text-danger">{errors.linkVirtual.message}</p> : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
          <h4 className="mb-4 border-b border-slate-200 pb-2 text-sm font-semibold text-accent">👥 Capacidad y Costos</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Cupos Disponibles *</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                type="number"
                min={10}
                max={10000}
                {...register("cupos")}
              />
              {errors.cupos ? <p className="mt-1 text-xs text-danger">{errors.cupos.message}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Número de Mesas/Salas</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                type="number"
                min={1}
                max={100}
                {...register("mesas")}
              />
              {errors.mesas ? <p className="mt-1 text-xs text-danger">{errors.mesas.message}</p> : null}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input className="h-5 w-5 accent-accent" type="checkbox" {...register("esGratis")} />
            <span className="text-sm text-ink">Evento Gratuito</span>
          </div>

          {showCostoGroup ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Valor de Inscripción (COP) *</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  type="number"
                  min={0}
                  {...register("valorInscripcion")}
                />
                {errors.valorInscripcion ? <p className="mt-1 text-xs text-danger">{errors.valorInscripcion.message}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Descuento Early Bird (%)</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  type="number"
                  min={0}
                  max={100}
                  {...register("descuento")}
                />
                {errors.descuento ? <p className="mt-1 text-xs text-danger">{errors.descuento.message}</p> : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
          <h4 className="mb-4 border-b border-slate-200 pb-2 text-sm font-semibold text-accent">📞 Información de Contacto</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Email de Contacto *</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                type="email"
                placeholder="eventos@empresa.com"
                {...register("emailContacto")}
              />
              {errors.emailContacto ? <p className="mt-1 text-xs text-danger">{errors.emailContacto.message}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Teléfono de Contacto</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                type="tel"
                placeholder="+57 300 123 4567"
                {...register("telefonoContacto")}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-ink">Organizador / Empresa</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              placeholder="Nombre de la empresa organizadora"
              {...register("organizador")}
            />
          </div>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-accent/60 bg-gradient-to-br from-accent/10 via-white to-white p-6">
          <h4 className="mb-4 text-sm font-semibold text-accent">👁️ Vista Previa</h4>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{categoriaPreview}</span>
              <span className="rounded-full bg-warning/10 px-2.5 py-1 text-warning ring-1 ring-warning/30">Borrador</span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-ink">{nombreEvento || "Nombre del Evento"}</h3>
            <p className="mt-1 text-xs text-muted line-clamp-2">{descripcion || "Describe el objetivo del evento."}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
              <span>📅 {formatPreviewDate(fechaInicio)}</span>
              <span>📍 {lugar || "Ubicación por definir"}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
              <span>👥 0/{cupos || "---"} inscritos</span>
              <span>💰 {previewPrice}</span>
            </div>
          </div>
        </div>

        {draftMessage ? <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{draftMessage}</p> : null}
        {createMutation.isError ? (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">No fue posible crear el evento.</p>
        ) : null}
        {createMutation.isSuccess ? (
          <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">Evento enviado para aprobación.</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            loading={draftMutation.isPending}
            onClick={handleSubmit(onSaveDraft)}
          >
            💾 Guardar Borrador
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            ✅ Crear Evento
          </Button>
        </div>
      </form>
    </Card>
  );
}
