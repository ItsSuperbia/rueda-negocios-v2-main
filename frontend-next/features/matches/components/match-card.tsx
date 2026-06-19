"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Match } from "../schema";
import { cn } from "@/lib/cn";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://gisistinfo.unicartagena.edu.co:3003";

const resolveFileUrl = (path?: string) => {
  if (!path) return "";
  const normalized = path.replace(/\\/g, "/");
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
  const uploadsIndex = normalized.lastIndexOf("/uploads/");
  if (uploadsIndex >= 0) return `${API_BASE_URL}${normalized.slice(uploadsIndex)}`;
  if (normalized.startsWith("/uploads/")) return `${API_BASE_URL}${normalized}`;
  if (normalized.startsWith("uploads/")) return `${API_BASE_URL}/${normalized}`;
  return normalized;
};

function CompanyLogo({ logo, nombre, fallbackIcon }: { logo?: string; nombre: string; fallbackIcon: string }) {
  const resolvedLogo = resolveFileUrl(logo);
  return resolvedLogo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolvedLogo} alt={nombre} className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-lg ring-1 ring-accent/20">{fallbackIcon}</span>
  );
}

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
        <div className="flex items-center gap-3">
          <CompanyLogo logo={match.supplierId.logoEmpresa} nombre={match.supplierId.nombreEmpresa} fallbackIcon="🏭" />
          <div>
            <h3 className="font-semibold text-ink">
              {match.supplierId.nombreEmpresa}
            </h3>
            <p className="text-sm text-muted">
              {match.supplierId.sector}
            </p>
          </div>
        </div>
      </div>

      <div className="my-4 text-center text-muted">
        ↕
      </div>

      <div>
        <div className="flex items-center gap-3">
          <CompanyLogo logo={match.buyerId.logoEmpresa} nombre={match.buyerId.nombreEmpresa} fallbackIcon="🛒" />
          <div>
            <h3 className="font-semibold text-ink">
              {match.buyerId.nombreEmpresa}
            </h3>
            <p className="text-sm text-muted">
              {match.buyerId.sector}
            </p>
          </div>
        </div>
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