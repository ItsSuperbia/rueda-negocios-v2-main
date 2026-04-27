import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function ReunionesPage() {
  return (
    <section className="space-y-4">
      <Card>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold">Agenda de reuniones</h1>
        <p className="mt-1 text-sm text-muted">Vista lista para integrar calendario, disponibilidad y confirmaciones de asistencia.</p>
      </Card>
      <EmptyState
        title="Sin reuniones próximas"
        description="A medida que aceptes matches y coordines horarios, esta agenda se actualizará automáticamente."
      />
    </section>
  );
}
