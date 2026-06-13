import dynamic from "next/dynamic";

const EventosWorkspace = dynamic(
  () => import("@/features/eventos/components/eventos-workspace").then((mod) => mod.EventosWorkspace),
  {
    loading: () => <p className="text-sm text-muted">Cargando módulo de eventos...</p>
  }
);

export default function EventosPage() {
  return <EventosWorkspace />;
}
