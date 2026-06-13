import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function MensajesPage() {
  return (
    <section className="space-y-4">
      <Card>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold">Mensajería empresarial</h1>
        <p className="mt-1 text-sm text-muted">Feature preparada para conectar con hilo por match y notificaciones en tiempo real.</p>
      </Card>
      <EmptyState
        title="Aún no hay conversaciones"
        description="Cuando se habilite el canal de chat, verás aquí tus conversaciones activas por evento y por match."
      />
    </section>
  );
}
