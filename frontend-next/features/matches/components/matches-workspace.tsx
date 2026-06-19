"use client";

import { useState } from "react";

import { EmpresaMatchPanel } from "./empresa-match-panel";

import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import {
  getMyMatches,
  updateMatchStatus
} from "../api";

import { Match } from "../schema";

import { AdminMatchPanel } from "./admin-match-panel";
import { MatchDetailModal } from "./match-detail-modal";

import { useAuthStore } from "@/store/auth-store";

export function MatchesWorkspace() {
  const token = useAuthStore(
    (state) => state.token
  );

  const role = useAuthStore(
  (state) => state.role
  );

  const isAdmin =
  role === "adminSistema";


  const queryClient = useQueryClient();

  const [selectedMatch, setSelectedMatch] =
    useState<Match | null>(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const {
    data: matches = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ["matches"],
    queryFn: () =>
      getMyMatches(token as string),

    enabled: !!token
  });

  if (isError) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-8 text-center">
        <h2 className="text-lg font-semibold text-danger">Error al cargar matches</h2>
        <p className="mt-2 text-sm text-muted">Verifica que el backend esté activo y que tu sesión siga vigente.</p>
      </div>
    );
  }

  const updateMutation = useMutation({
    mutationFn: updateMatchStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["matches"]
      });

      setModalOpen(false);
    }
  });

  const handleViewMatch = (
    match: Match
  ) => {
    setSelectedMatch(match);
    setModalOpen(true);
  };

  const handleAccept = (
    matchId: string
  ) => {
    updateMutation.mutate({
      token: token as string,
      matchId,
      status: "accepted"
    });
  };

  const handleReject = (
    matchId: string
  ) => {
    updateMutation.mutate({
      token: token as string,
      matchId,
      status: "rejected"
    });
  };

  return (
    <>
      {isAdmin ? (
        <AdminMatchPanel
          matches={matches}
          loading={isLoading}
          onViewMatch={handleViewMatch}
          onAcceptMatch={handleAccept}
          onRejectMatch={handleReject}
        />
      ) : (
        <EmpresaMatchPanel
          matches={matches}
          loading={isLoading}
          onViewMatch={handleViewMatch}
          onAcceptMatch={handleAccept}
          onRejectMatch={handleReject}
        />
      )}

      <MatchDetailModal
        open={modalOpen}
        match={selectedMatch}
        onClose={() =>
          setModalOpen(false)
        }
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  );
}