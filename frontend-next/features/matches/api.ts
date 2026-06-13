import { apiRequest } from "@/shared/api/client";
import { Match } from "./schema";

export function getMyMatches(token: string) {
  return apiRequest<Match[]>("/api/matches", {
    method: "GET",
    token
  });
}

export function generateMatches(token: string) {
  return apiRequest<{
    message: string;
    matchesCreated: number;
    totalMatches: number;
  }>("/api/matches/generate", {
    method: "POST",
    token
  });
}

export function updateMatchStatus(payload: {
  token: string;
  matchId: string;
  status: "accepted" | "rejected";
}) {
  return apiRequest<{
    message: string;
    match: Match;
  }>("/api/matches/status", {
    method: "PUT",
    token: payload.token,
    body: {
      matchId: payload.matchId,
      status: payload.status
    }
  });
}