"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getMatches, getMeetings } from "@/features/dashboard/api";
import { useAuthStore } from "@/store/auth-store";

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
      { href: "/reuniones", label: "Ver agenda" },
      { href: "/mensajes", label: "Abrir mensajería" }
    ]
  },
  demandante: {
    headline: "Encuentra proveedores adecuados",
    summary: "Gestiona tus reuniones y prioriza contactos con mayor afinidad.",
    actions: [
      { href: "/reuniones", label: "Ver agenda" },
      { href: "/mensajes", label: "Abrir mensajería" }
    ]
  }
};

export function RoleDashboard() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const {
    data: matches,
    isPending: matchesLoading,
    isError: matchesError
  } = useQuery({
    queryKey: ["dashboard", "matches"],
    queryFn: () => getMatches(token as string),
    enabled: Boolean(token)
  });

  const { data: meetings, isPending: meetingsLoading } = useQuery({
    queryKey: ["dashboard", "meetings"],
    queryFn: () => getMeetings(token as string),
    enabled: Boolean(token)
  });

  const copy = roleCopy[role ?? ""];

  if (!copy) {
    return <EmptyState title="Sin rol activo" description="No se pudo cargar una configuración de panel para tu rol." />;
  }

  const acceptedMatches = matches?.filter((item) => item.status === "accepted").length ?? 0;
  const upcomingMeetings = meetings?.filter((item) => item.status === "scheduled").length ?? 0;

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
          <p className="text-xs uppercase tracking-wide text-muted">Matches totales</p>
          <p className="mt-2 text-3xl font-bold">{matchesLoading ? "..." : matches?.length ?? 0}</p>
        </Card>
        <Card className="fade-up">
          <p className="text-xs uppercase tracking-wide text-muted">Matches aceptados</p>
          <p className="mt-2 text-3xl font-bold">{matchesLoading ? "..." : acceptedMatches}</p>
        </Card>
        <Card className="fade-up">
          <p className="text-xs uppercase tracking-wide text-muted">Reuniones programadas</p>
          <p className="mt-2 text-3xl font-bold">{meetingsLoading ? "..." : upcomingMeetings}</p>
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
