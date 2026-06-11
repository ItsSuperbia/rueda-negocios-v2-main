import { apiRequest } from "@/shared/api/client";
import { User } from "@/shared/types/domain";

export function getPendingUsers(token: string) {
  return apiRequest<User[]>("/api/users", {
    method: "GET",
    token
  });
}

export function getUserById(payload: { token: string; userId: string }) {
  return apiRequest<User>(`/api/users/${payload.userId}`, {
    method: "GET",
    token: payload.token
  });
}

export function updateUserStatus(payload: { token: string; userId: string; estado: "aprobado" | "rechazado" }) {
  return apiRequest<{ message: string }>(`/api/users/${payload.userId}/estado`, {
    method: "PUT",
    token: payload.token,
    body: { estado: payload.estado }
  });
}
