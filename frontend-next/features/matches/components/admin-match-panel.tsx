
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { generateMatches } from "../api";
import { Match } from "../schema";

import { MatchCard } from "./match-card";
import { MatchStats } from "./match-stats";

import { useAuthStore } from "@/store/auth-store";



interface Props {
  matches: Match[];
  loading?: boolean;
  onViewMatch: (match: Match) => void;
  onAcceptMatch: (matchId: string) => void;
  onRejectMatch: (matchId: string) => void;
}

export function AdminMatchPanel({
    
  matches,
  loading,
  onViewMatch,
  onAcceptMatch,
  onRejectMatch,
}: Props) {

     const token = useAuthStore(
    (state) => state.token
  );
  
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");

  const generateMutation = useMutation({
  mutationFn: () => generateMatches(token as string),

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["matches"],
    });
  },
});

  const filteredMatches = useMemo(() => {
    if (filter === "all") return matches;

    return matches.filter(
      (match) => match.status === filter
    );
  }, [matches, filter]);

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Gestión de Matches
            </h2>

            <p className="text-sm text-muted">
              Administra los emparejamientos
              generados automáticamente.
            </p>
          </div>

          <Button
            loading={generateMutation.isPending}
            onClick={() =>
              generateMutation.mutate()
            }
          >
            🔄 Generar Matches
          </Button>
        </div>
      </Card>

      <MatchStats matches={matches} />

      <Card>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Todos
          </FilterButton>

          <FilterButton
            active={filter === "pending"}
            onClick={() => setFilter("pending")}
          >
            Pendientes
          </FilterButton>

          <FilterButton
            active={filter === "accepted"}
            onClick={() => setFilter("accepted")}
          >
            Aceptados
          </FilterButton>

          <FilterButton
            active={filter === "rejected"}
            onClick={() => setFilter("rejected")}
          >
            Rechazados
          </FilterButton>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-muted">
          Cargando matches...
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredMatches.map((match) => (
            <MatchCard
                key={match._id}
                match={match}
                onView={onViewMatch}
                onAccept={onAcceptMatch}
                onReject={onRejectMatch}
                />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function FilterButton({
  children,
  active,
  onClick,
}: FilterProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition
      ${
        active
          ? "bg-accent text-white"
          : "bg-slate-100 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}