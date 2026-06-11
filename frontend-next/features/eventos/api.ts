import { apiRequest } from "@/shared/api/client";
import { Evento, PaginatedResponse } from "@/shared/types/domain";
import { EventPayload } from "@/features/eventos/schema";

export function getPendingEventos(token: string) {
  return apiRequest<Evento[]>("/api/eventos/pendientes", {
    method: "GET",
    token
  });
}

export function getEventoById(payload: { token: string; eventoId: string }) {
  return apiRequest<Evento>(`/api/eventos/${payload.eventoId}`, {
    method: "GET",
    token: payload.token
  });
}

export function updateEventoStatus(payload: {
  token: string;
  eventoId: string;
  estado: "aprobado" | "rechazado";
}) {
  return apiRequest<{ message: string }>(`/api/eventos/${payload.eventoId}/estado`, {
    method: "PUT",
    token: payload.token,
    body: { estado: payload.estado }
  });
}

export function createEvento(payload: { token: string; data: EventPayload }) {
  return apiRequest<{ message: string; evento: Evento }>("/api/eventos", {
    method: "POST",
    token: payload.token,
    body: payload.data
  });
}

export function createEventoDraft(payload: { token: string; data: EventPayload }) {
  return apiRequest<{ message: string; evento: Evento }>("/api/eventos", {
    method: "POST",
    token: payload.token,
    body: { ...payload.data, esBorrador: true }
  });
}

export interface AdminEventosParams {
  page: number;
  limit: number;
  estado?: string;
  search?: string;
  sort?: string;
}

export function getAdminEventos(token: string, params: AdminEventosParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));

  if (params.estado && params.estado !== "todos") {
    searchParams.set("estado", params.estado);
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  const query = searchParams.toString();
  const path = query ? `/api/eventos/admin?${query}` : "/api/eventos/admin";

  return apiRequest<PaginatedResponse<Evento>>(path, {
    method: "GET",
    token
  });
}
