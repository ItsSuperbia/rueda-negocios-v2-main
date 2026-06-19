import { apiRequest } from "@/shared/api/client";
import { User } from "@/shared/types/domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://gisistinfo.unicartagena.edu.co:3003";

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

export function uploadCatalogo(payload: { token: string; data: FormData }) {
  return apiRequest<{ message: string; user: User }>("/api/users/profile/catalogo", {
    method: "PUT",
    token: payload.token,
    body: payload.data
  });
}

export function deleteCatalogo(token: string) {
  return apiRequest<{ message: string; user: User }>("/api/users/profile/catalogo", {
    method: "DELETE",
    token
  });
}

export async function downloadCatalogo(payload: { token: string; userId: string; filename?: string }) {
  const response = await fetch(`${API_BASE_URL}/api/users/${payload.userId}/catalogo/descargar`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${payload.token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const errorPayload = contentType.includes("application/json") ? await response.json() : null;
    throw new Error(errorPayload?.message ?? "No se pudo descargar el catálogo");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = payload.filename || "catalogo.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
