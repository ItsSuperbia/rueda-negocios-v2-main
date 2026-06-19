"use client";

import { Match } from "../schema";
import { MatchCard } from "./match-card";

interface Props {
  matches: Match[];
  loading?: boolean;

  onViewMatch: (match: Match) => void;

  onAcceptMatch: (matchId: string) => void;
  onRejectMatch: (matchId: string) => void;
}

export function EmpresaMatchPanel({
  matches,
  loading,
  onViewMatch,
  onAcceptMatch,
  onRejectMatch
}: Props) {
  if (loading) {
    return (
      <p className="text-sm text-muted">
        Cargando matches...
      </p>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 p-8 text-center">
        <h2 className="text-lg font-semibold">
          No tienes matches aún
        </h2>

        <p className="mt-2 text-sm text-muted">
          Cuando el sistema genere coincidencias
          aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          🤝 Mis Matches
        </h1>

        <p className="text-sm text-muted">
          Empresas compatibles con tu perfil.
        </p>
      </div>

      <div className="grid gap-4">
        {matches.map((match) => (
          <MatchCard
            key={match._id}
            match={match}
            onView={() => onViewMatch(match)}
            onAccept={onAcceptMatch}
            onReject={onRejectMatch}
          />
        ))}
      </div>
    </div>
  );
}