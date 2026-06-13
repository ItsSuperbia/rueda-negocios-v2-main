import { apiRequest } from "@/shared/api/client";
import { User } from "@/shared/types/domain";

export function getProfile(token: string) {
  return apiRequest<User>("/api/users/profile", {
    method: "GET",
    token
  });
}

export function updateProfile(payload: { token: string; data: FormData }) {
  return apiRequest<{ message: string; user: User }>("/api/users/update", {
    method: "PUT",
    token: payload.token,
    body: payload.data
  });
}
