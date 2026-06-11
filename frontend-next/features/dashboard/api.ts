import { apiRequest } from "@/shared/api/client";
import { AdminEventoDashboard, MatchEntity, MeetingEntity } from "@/shared/types/domain";

export interface GenerateMatchesResult {
  message: string;
  matchesCreated: number;
  totalMatches: number;
}

export function getMatches(token: string) {
  return apiRequest<MatchEntity[]>("/api/matches", {
    method: "GET",
    token
  });
}

export function generateMatches(token: string) {
  return apiRequest<GenerateMatchesResult>("/api/matches/generate", {
    method: "POST",
    token
  });
}

export function getMeetings(token: string) {
  return apiRequest<MeetingEntity[]>("/api/meetings", {
    method: "GET",
    token
  });
}

export function getAdminEventoDashboard(token: string) {
  return apiRequest<AdminEventoDashboard>("/api/eventos/admin/dashboard", {
    method: "GET",
    token
  });
}
