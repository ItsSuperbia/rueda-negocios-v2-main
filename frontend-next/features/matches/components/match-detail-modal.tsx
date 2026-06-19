"use client";

import { Button } from "@/components/ui/button";
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
    <img src={resolvedLogo} alt={nombre} className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
  ) : (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xl ring-1 ring-accent/20">{fallbackIcon}</span>
  );
}

interface MatchDetailModalProps {
  match: Match | null;
  open: boolean;

  onClose: () => void;

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

export function MatchDetailModal({
  match,
  open,
  onClose,
  onAccept,
  onReject
}: MatchDetailModalProps) {
  if (!open || !match) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            🤝 Detalle del Match
          </h2>

          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold ring-1",
              statusStyles[match.status]
            )}
          >
            {statusLabels[match.status]}
          </span>
        </div>

        {/* Compatibilidad */}

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold">
            Compatibilidad
          </p>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-success"
              style={{
                width: `${match.score}%`
              }}
            />
          </div>

          <p className="mt-2 text-sm text-muted">
            🎯 {match.score}% de afinidad
          </p>
        </div>

        {/* Empresas */}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {/* Ofertante */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-muted">
              OFERTANTE
            </p>

            <div className="mt-2 flex items-center gap-3">
              <CompanyLogo logo={match.supplierId.logoEmpresa} nombre={match.supplierId.nombreEmpresa} fallbackIcon="🏭" />
              <div>
                <h3 className="text-lg font-semibold">
                  {match.supplierId.nombreEmpresa}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Sector:
                </p>
                <p className="font-medium">
                  {match.supplierId.sector}
                </p>
              </div>
            </div>
          </div>

          {/* Demandante */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-muted">
              DEMANDANTE
            </p>

            <div className="mt-2 flex items-center gap-3">
              <CompanyLogo logo={match.buyerId.logoEmpresa} nombre={match.buyerId.nombreEmpresa} fallbackIcon="🛒" />
              <div>
                <h3 className="text-lg font-semibold">
                  {match.buyerId.nombreEmpresa}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Sector:
                </p>
                <p className="font-medium">
                  {match.buyerId.sector}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-muted">
            Fecha de creación
          </p>

          <p className="mt-2">
            {new Date(
              match.createdAt
            ).toLocaleString("es-CO")}
          </p>
        </div>

        {/* Acciones */}

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cerrar
          </Button>

          {match.status === "pending" && (
            <>
              <Button
                onClick={() =>
                  onAccept(match._id)
                }
              >
                ✅ Aceptar
              </Button>

              <Button
                variant="danger"
                onClick={() =>
                  onReject(match._id)
                }
              >
                ❌ Rechazar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}