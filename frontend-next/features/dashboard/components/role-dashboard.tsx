"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { generateMatches, getAdminEventoDashboard, getEmpresaEventosResumen, getMatches, getMeetings } from "@/features/dashboard/api";
import { getPendingEventos } from "@/features/eventos/api";
import { getPendingUsers } from "@/features/usuarios/api";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/cn";

const roleCopy: Record<string, { headline: string; summary: string; actions: { href: string; label: string }[] }> = {
  adminSistema: {
    headline: "Control total del ecosistema",
    summary: "Aprueba participantes y eventos, manteniendo trazabilidad y tiempos de respuesta.",
    actions: [
      { href: "/usuarios", label: "Revisar usuarios pendientes" },
      { href: "/eventos", label: "Moderar eventos" }
    ]
  },
  adminEvento: {
    headline: "Diseña experiencias de alto impacto",
    summary: "Crea eventos con reglas claras y coordina la agenda operativa.",
    actions: [{ href: "/eventos", label: "Crear evento" }]
  },
  ofertante: {
    headline: "Convierte matches en oportunidades",
    summary: "Monitorea reuniones y haz seguimiento comercial con foco en cierre.",
    actions: [
      { href: "/eventos", label: "Ver eventos" },
      { href: "/reuniones", label: "Ver agenda" },
      { href: "/mensajes", label: "Abrir mensajería" }
    ]
  },
  demandante: {
    headline: "Encuentra proveedores adecuados",
    summary: "Gestiona tus reuniones y prioriza contactos con mayor afinidad.",
    actions: [
      { href: "/eventos", label: "Ver eventos" },
      { href: "/reuniones", label: "Ver agenda" },
      { href: "/mensajes", label: "Abrir mensajería" }
    ]
  }
};

export function RoleDashboard() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [matchRunSummary, setMatchRunSummary] = useState<string | null>(null);

  const isAdminSistema = role === "adminSistema";
  const isAdminEvento = role === "adminEvento";
  const isEmpresa = role === "ofertante" || role === "demandante";

  const pendingUsersQuery = useQuery({
    queryKey: ["dashboard", "adminSistema", "pendingUsers"],
    queryFn: () => getPendingUsers(token as string),
    enabled: Boolean(token) && isAdminSistema
  });

  const pendingEventosQuery = useQuery({
    queryKey: ["dashboard", "adminSistema", "pendingEventos"],
    queryFn: () => getPendingEventos(token as string),
    enabled: Boolean(token) && isAdminSistema
  });

  const adminEventoQuery = useQuery({
    queryKey: ["dashboard", "adminEvento"],
    queryFn: () => getAdminEventoDashboard(token as string),
    enabled: Boolean(token) && isAdminEvento
  });

  const empresaEventosResumenQuery = useQuery({
    queryKey: ["dashboard", "empresa", "eventosResumen"],
    queryFn: () => getEmpresaEventosResumen(token as string),
    enabled: Boolean(token) && isEmpresa
  });

  const {
    data: matches,
    isPending: matchesLoading,
    isError: matchesError
  } = useQuery({
    queryKey: ["dashboard", "matches"],
    queryFn: () => getMatches(token as string),
    enabled: Boolean(token) && isEmpresa
  });

  const { data: meetings, isPending: meetingsLoading } = useQuery({
    queryKey: ["dashboard", "meetings"],
    queryFn: () => getMeetings(token as string),
    enabled: Boolean(token) && isEmpresa
  });

  const generateMatchesMutation = useMutation({
    mutationFn: () => generateMatches(token as string),
    onSuccess: (data) => {
      setMatchRunSummary(data.message);
      queryClient.invalidateQueries({ queryKey: ["dashboard", "matches"] });
    }
  });

  const copy = roleCopy[role ?? ""];

  if (isAdminSistema) {
    const pendingUsersCount = pendingUsersQuery.data?.length ?? 0;
    const pendingEventosCount = pendingEventosQuery.data?.length ?? 0;
    const hasError = pendingUsersQuery.isError || pendingEventosQuery.isError;

    return (
      <section className="space-y-6">
        <Card className="fade-up bg-gradient-to-br from-[#0f8b8d] to-[#115f67] text-white ring-transparent">
          <p className="text-sm text-white/80">Hola, {user?.nombreEmpresa ?? user?.email}</p>
          <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-bold">Panel de Administrador del Sistema</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Centraliza la aprobación de usuarios, la moderación de eventos y la generación de matches entre ofertantes y demandantes.
          </p>
        </Card>

        {hasError ? (
          <EmptyState
            title="No fue posible cargar algunos indicadores"
            description="Verifica la conexión con el backend o vuelve a iniciar sesión para recuperar los conteos del panel."
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="fade-up bg-white/95">
            <p className="text-xs uppercase tracking-wide text-muted">Usuarios pendientes</p>
            <p className="mt-2 text-3xl font-bold text-ink">{pendingUsersQuery.isPending ? "..." : pendingUsersCount}</p>
            <p className="mt-2 text-sm text-muted">Solicitudes que esperan validación operativa.</p>
            <Link className="mt-4 inline-flex rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-95" href="/usuarios">
              Revisar usuarios
            </Link>
          </Card>

          <Card className="fade-up bg-white/95">
            <p className="text-xs uppercase tracking-wide text-muted">Eventos por moderar</p>
            <p className="mt-2 text-3xl font-bold text-ink">{pendingEventosQuery.isPending ? "..." : pendingEventosCount}</p>
            <p className="mt-2 text-sm text-muted">Eventos en espera de aprobación o rechazo.</p>
            <Link className="mt-4 inline-flex rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink ring-1 ring-slate-200 transition hover:bg-slate-50" href="/eventos">
              Moderar eventos
            </Link>
          </Card>

          <Card className="fade-up bg-white/95">
            <p className="text-xs uppercase tracking-wide text-muted">Generar matches</p>
            <p className="mt-2 text-3xl font-bold text-ink">{generateMatchesMutation.isPending ? "..." : matchRunSummary ? "OK" : "Listo"}</p>
            <p className="mt-2 text-sm text-muted">Ejecuta el algoritmo para emparejar ofertantes y demandantes por sector.</p>
            <Button className="mt-4 w-full" loading={generateMatchesMutation.isPending} onClick={() => generateMatchesMutation.mutate()}>
              Generar matches
            </Button>
            {matchRunSummary ? <p className="mt-3 text-sm font-medium text-success">{matchRunSummary}</p> : null}
            {generateMatchesMutation.isError ? <p className="mt-3 text-sm font-medium text-danger">No se pudieron generar los matches.</p> : null}
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="fade-up">
            <h2 className="text-lg font-semibold text-ink">Ruta operativa</h2>
            <p className="mt-2 text-sm text-muted">
              Desde aquí puedes priorizar la revisión de usuarios y eventos antes de disparar el motor de matches.
            </p>
          </Card>

          <Card className="fade-up">
            <h2 className="text-lg font-semibold text-ink">Resultado de la última ejecución</h2>
            <p className="mt-2 text-sm text-muted">
              {matchRunSummary ?? "Aún no has ejecutado la generación de matches en esta sesión."}
            </p>
          </Card>
        </div>
      </section>
    );
  }

  if (isAdminEvento) {
    if (adminEventoQuery.isPending) {
      return <p className="text-sm text-muted">Cargando panel de organizador...</p>;
    }

    if (adminEventoQuery.isError || !adminEventoQuery.data) {
      return (
        <EmptyState
          title="No fue posible cargar el panel"
          description="Verifica la conexion con el backend o vuelve a iniciar sesion."
        />
      );
    }

    const { stats, recientes } = adminEventoQuery.data;
    const proximoEventoLabel = stats.proximoEvento?.startDate
      ? new Date(stats.proximoEvento.startDate).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : "Sin eventos";

    const formatDate = (value?: string) => {
      if (!value) return "Sin fecha";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "Sin fecha";
      return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
    };

    const getEstadoBadge = (estado: string) => {
      const config: Record<string, { label: string; classes: string }> = {
        aprobado: { label: "Activo", classes: "bg-success/10 text-success ring-success/30" },
        pendiente: { label: "Pendiente", classes: "bg-warning/10 text-warning ring-warning/30" },
        rechazado: { label: "Rechazado", classes: "bg-danger/10 text-danger ring-danger/30" }
      };

      return config[estado] ?? { label: estado, classes: "bg-slate-100 text-slate-700 ring-slate-200" };
    };

    return (
      <section className="space-y-6">
        <Card className="fade-up bg-gradient-to-br from-[#0f8b8d] to-[#115f67] text-white ring-transparent">
          <p className="text-sm text-white/80">Hola, {user?.nombreEmpresa ?? user?.email}</p>
          <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-bold">Panel de Organizador</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Bienvenido al sistema de gestion de eventos. Crea y administra tus ruedas de negocios.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/30 bg-white/10 p-4">
              <h3 className="text-base font-semibold text-white">➕ Crear Evento</h3>
              <p className="mt-1 text-sm text-white/80">Configura un nuevo evento o rueda de negocios.</p>
              <Link
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#0f8b8d] transition hover:bg-white/90"
                href="/eventos"
              >
                Crear Nuevo Evento
              </Link>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/10 p-4">
              <h3 className="text-base font-semibold text-white">📋 Mis Eventos</h3>
              <p className="mt-1 text-sm text-white/80">Gestiona y monitorea tus eventos creados.</p>
              <Link
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#0f8b8d] transition hover:bg-white/90"
                href="/eventos"
              >
                Ver Mis Eventos
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="fade-up bg-gradient-to-br from-accent/15 via-white to-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">📊</span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Eventos activos</p>
                <p className="mt-1 text-2xl font-bold text-ink">{stats.eventosActivos}</p>
              </div>
            </div>
          </Card>
          <Card className="fade-up bg-gradient-to-br from-success/15 via-white to-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success text-white">🏢</span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Ofertantes inscritos</p>
                <p className="mt-1 text-2xl font-bold text-ink">{stats.totalOfertantes}</p>
              </div>
            </div>
          </Card>
          <Card className="fade-up bg-gradient-to-br from-warning/15 via-white to-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning text-white">🛒</span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Demandantes inscritos</p>
                <p className="mt-1 text-2xl font-bold text-ink">{stats.totalDemandantes}</p>
              </div>
            </div>
          </Card>
          <Card className="fade-up bg-white/95">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/10 text-ink">🤝</span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Reuniones generadas</p>
                <p className="mt-1 text-2xl font-bold text-ink">{stats.reunionesGeneradas}</p>
              </div>
            </div>
          </Card>
          <Card className="fade-up bg-white/95">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/10 text-ink">📅</span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Proximo evento</p>
                <p className="mt-1 text-base font-semibold text-ink">{proximoEventoLabel}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-white/95">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <h2 className="text-lg font-semibold">Eventos recientes</h2>
          </div>

          {recientes.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Sin eventos recientes"
                description="Cuando crees eventos apareceran aqui para su seguimiento rapido."
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {recientes.map((evento) => {
                const inscritos = evento.inscritos ?? 0;
                const cupos = evento.cupos ?? 0;
                const estadoBadge = getEstadoBadge(evento.estadoEvento);
                const categoriaLabel = evento.enfoque ?? evento.categoria;

                return (
                  <div
                    key={evento._id}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                        {categoriaLabel ? `🏢 ${categoriaLabel}` : "📌 Evento"}
                      </span>
                      <span className={cn("rounded-full px-2.5 py-1 font-semibold ring-1", estadoBadge.classes)}>
                        {estadoBadge.label}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-ink">{evento.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span>📅 {formatDate(evento.startDate)}</span>
                      <span>👥 {`${inscritos}/${cupos}`}</span>
                      {evento.inscripcionesResumen ? (
                        <span>
                          {evento.inscripcionesResumen.ofertantes} ofertantes · {evento.inscripcionesResumen.demandantes} demandantes
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4">
                      <Link
                        className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
                        href="/eventos"
                      >
                        Gestionar
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>
    );
  }

  if (!copy) {
    return <EmptyState title="Sin rol activo" description="No se pudo cargar una configuración de panel para tu rol." />;
  }

  const acceptedMatches = matches?.filter((item) => item.status === "accepted").length ?? 0;
  const upcomingMeetings = meetings?.filter((item) => item.status === "scheduled").length ?? 0;
  const eventosResumen = empresaEventosResumenQuery.data;

  return (
    <section className="space-y-5">
      <Card className="fade-up bg-gradient-to-br from-[#0f8b8d] to-[#115f67] text-white ring-transparent">
        <p className="text-sm text-white/80">Hola, {user?.nombreEmpresa ?? user?.email}</p>
        <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-bold">{copy.headline}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">{copy.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {copy.actions.map((action) => (
            <Link
              className="rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold transition hover:bg-white/30"
              href={action.href}
              key={action.href}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="fade-up">
          <p className="text-xs uppercase tracking-wide text-muted">Eventos inscritos</p>
          <p className="mt-2 text-3xl font-bold">
            {empresaEventosResumenQuery.isPending ? "..." : eventosResumen?.eventosInscritos ?? 0}
          </p>
        </Card>
        <Card className="fade-up">
          <p className="text-xs uppercase tracking-wide text-muted">Participantes en mis eventos</p>
          <p className="mt-2 text-3xl font-bold">
            {empresaEventosResumenQuery.isPending ? "..." : eventosResumen?.totalParticipantes ?? 0}
          </p>
        </Card>
        <Card className="fade-up">
          <p className="text-xs uppercase tracking-wide text-muted">Matches totales</p>
          <p className="mt-2 text-3xl font-bold">{matchesLoading ? "..." : matches?.length ?? 0}</p>
        </Card>
        <Card className="fade-up">
          <p className="text-xs uppercase tracking-wide text-muted">Reuniones programadas</p>
          <p className="mt-2 text-3xl font-bold">{meetingsLoading ? "..." : upcomingMeetings}</p>
        </Card>
      </div>

      {eventosResumen?.proximoEvento?.inscripcionesResumen ? (
        <Card className="fade-up bg-white/95">
          <h2 className="text-lg font-semibold text-ink">Próximo evento inscrito</h2>
          <p className="mt-2 text-sm font-medium text-ink">{eventosResumen.proximoEvento.title}</p>
          <p className="mt-2 text-sm text-muted">
            {eventosResumen.proximoEvento.inscripcionesResumen.ofertantes} ofertantes ·{" "}
            {eventosResumen.proximoEvento.inscripcionesResumen.demandantes} demandantes ·{" "}
            {eventosResumen.proximoEvento.inscripcionesResumen.total} participantes
          </p>
          <Link className="mt-4 inline-flex rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-95" href="/eventos">
            Ver eventos
          </Link>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="fade-up">
          <p className="text-xs uppercase tracking-wide text-muted">Matches aceptados</p>
          <p className="mt-2 text-3xl font-bold">{matchesLoading ? "..." : acceptedMatches}</p>
        </Card>
        <Card className="fade-up">
          <p className="text-xs uppercase tracking-wide text-muted">Total reuniones</p>
          <p className="mt-2 text-3xl font-bold">{meetingsLoading ? "..." : meetings?.length ?? 0}</p>
        </Card>
      </div>

      {matchesError ? (
        <EmptyState
          title="No se pudieron cargar los indicadores"
          description="Verifica que el backend esté activo y que tu sesión siga vigente."
        />
      ) : null}
    </section>
  );
}
