"use client";

import { Card } from "@/components/ui/card";
import { Match } from "../schema";

interface MatchStatsProps {
  matches: Match[];
}

export function MatchStats({
  matches,
}: MatchStatsProps) {
  const total = matches.length;

  const stats = matches.reduce(
    (acc, match) => {
      acc.totalScore += match.score;

      if (match.status === "pending") {
        acc.pending++;
      }

      if (match.status === "accepted") {
        acc.accepted++;
      }

      if (match.status === "rejected") {
        acc.rejected++;
      }

      if (match.score > acc.highestScore) {
        acc.highestScore = match.score;
      }

      if (match.score < acc.lowestScore) {
        acc.lowestScore = match.score;
      }

      return acc;
    },
    {
      pending: 0,
      accepted: 0,
      rejected: 0,
      totalScore: 0,
      highestScore: 0,
      lowestScore: 100,
    }
  );

  const averageScore =
    total > 0
      ? Math.round(stats.totalScore / total)
      : 0;

  const acceptanceRate =
    total > 0
      ? Math.round(
          (stats.accepted / total) * 100
        )
      : 0;

  const rejectionRate =
    total > 0
      ? Math.round(
          (stats.rejected / total) * 100
        )
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* Total */}

      <Card className="bg-white/80">
        <p className="text-sm text-muted">
          Total Matches
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          {total}
        </h2>
      </Card>

      {/* Pendientes */}

      <Card className="bg-yellow-50">
        <p className="text-sm text-muted">
          Pendientes
        </p>

        <h2 className="mt-2 text-3xl font-bold text-yellow-600">
          {stats.pending}
        </h2>
      </Card>

      {/* Aceptados */}

      <Card className="bg-green-50">
        <p className="text-sm text-muted">
          Aceptados
        </p>

        <h2 className="mt-2 text-3xl font-bold text-green-600">
          {stats.accepted}
        </h2>

        <p className="mt-1 text-xs text-muted">
          {acceptanceRate}% del total
        </p>
      </Card>

      {/* Rechazados */}

      <Card className="bg-red-50">
        <p className="text-sm text-muted">
          Rechazados
        </p>

        <h2 className="mt-2 text-3xl font-bold text-red-600">
          {stats.rejected}
        </h2>

        <p className="mt-1 text-xs text-muted">
          {rejectionRate}% del total
        </p>
      </Card>

      {/* Compatibilidad promedio */}

      <Card className="md:col-span-2 xl:col-span-2">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted">
              Compatibilidad Promedio
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              🎯 {averageScore}%
            </h2>
          </div>

          <div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${averageScore}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-muted">
              Afinidad promedio entre empresas
            </p>
          </div>
        </div>
      </Card>

      {/* Mejor Match */}

      <Card>
        <p className="text-sm text-muted">
          Mejor Match
        </p>

        <h2 className="mt-2 text-2xl font-bold text-green-600">
          🏆 {total > 0 ? stats.highestScore : 0}%
        </h2>
      </Card>

      {/* Menor Match */}

      <Card>
        <p className="text-sm text-muted">
          Menor Match
        </p>

        <h2 className="mt-2 text-2xl font-bold text-red-600">
          📉 {total > 0 ? stats.lowestScore : 0}%
        </h2>
      </Card>
    </div>
  );
}