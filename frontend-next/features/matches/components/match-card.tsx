"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Match } from "../schema";
import { cn } from "@/lib/cn";

interface MatchCardProps {
  match: Match;
  onView: (match: Match) => void;
  onAccept: (matchId: string) => void;
  onReject: (matchId: string) => void;
}

const statusStyles = {
  pending:
    "bg-warning/10 text-warning ring-warning/30",

  accepted:
    "bg-success/10 text-success ring-success/30",

  rejected:
    "bg-danger/10 text-danger ring-danger/30"
};

const statusLabels = {
  pending: "🟡 Pendiente",
  accepted: "🟢 Aceptado",
  rejected: "🔴 Rechazado"
};

export function MatchCard({
  match,
  onView,
  onAccept,
  onReject
}: MatchCardProps) {
  return (
    <Card className="bg-white/80">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">
          🎯 {match.score}% Compatibilidad
        </span>

        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold ring-1",
            statusStyles[match.status]
          )}
        >
          {statusLabels[match.status]}
        </span>
      </div>

      {/* Barra score */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-success"
          style={{
            width: `${match.score}%`
          }}
        />
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-ink">
          🏭 {match.supplierId.nombreEmpresa}
        </h3>

        <p className="text-sm text-muted">
          {match.supplierId.sector}
        </p>
      </div>

      <div className="my-4 text-center text-muted">
        ↕
      </div>

      <div>
        <h3 className="font-semibold text-ink">
          🛒 {match.buyerId.nombreEmpresa}
        </h3>

        <p className="text-sm text-muted">
          {match.buyerId.sector}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => onView(match)}
        >
          👁 Ver detalle
        </Button>

        {match.status === "pending" && (
          <>
            <Button
              onClick={() => onAccept(match._id)}
            >
              ✅ Aceptar
            </Button>

            <Button
              variant="danger"
              onClick={() => onReject(match._id)}
            >
              ❌ Rechazar
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}