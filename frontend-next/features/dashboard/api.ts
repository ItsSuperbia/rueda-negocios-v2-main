import { apiRequest } from "@/shared/api/client";
import { MatchEntity, MeetingEntity } from "@/shared/types/domain";

export function getMatches(token: string) {
  return apiRequest<MatchEntity[]>("/api/matches", {
    method: "GET",
    token
  });
}

export function getMeetings(token: string) {
  return apiRequest<MeetingEntity[]>("/api/meetings", {
    method: "GET",
    token
  });
}
