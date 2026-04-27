import { apiRequest } from "@/shared/api/client";
import { LoginResponse } from "@/shared/types/domain";

interface LoginPayload {
  email: string;
  password: string;
}

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/api/users/login", {
    method: "POST",
    body: payload
  });
}

export function getProfile(token: string) {
  return apiRequest<LoginResponse["user"]>("/api/users/profile", {
    method: "GET",
    token
  });
}
