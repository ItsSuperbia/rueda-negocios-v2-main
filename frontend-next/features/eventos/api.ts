import { apiRequest } from "@/shared/api/client";
import { Evento, EventoInscripcionesResponse, PaginatedResponse } from "@/shared/types/domain";
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

export interface EmpresaEventosParams {
  page: number;
  limit: number;
  search?: string;
  categoria?: string;
  modalidad?: string;
  estado?: string;
  sort?: string;
}

function buildEmpresaEventosQuery(params: EmpresaEventosParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.categoria && params.categoria !== "todos") {
    searchParams.set("categoria", params.categoria);
  }

  if (params.modalidad && params.modalidad !== "todos") {
    searchParams.set("modalidad", params.modalidad);
  }

  if (params.estado) {
    searchParams.set("estado", params.estado);
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  return searchParams.toString();
}

export function getEmpresaEventosCatalogo(token: string, params: EmpresaEventosParams) {
  const query = buildEmpresaEventosQuery(params);
  const path = query ? `/api/eventos/catalogo?${query}` : "/api/eventos/catalogo";

  return apiRequest<PaginatedResponse<Evento>>(path, {
    method: "GET",
    token
  });
}

export function getEmpresaEventosInscritos(token: string, params: EmpresaEventosParams) {
  const query = buildEmpresaEventosQuery(params);
  const path = query ? `/api/eventos/mis-inscripciones?${query}` : "/api/eventos/mis-inscripciones";

  return apiRequest<PaginatedResponse<Evento>>(path, {
    method: "GET",
    token
  });
}

export function inscribirseEvento(payload: { token: string; eventoId: string }) {
  return apiRequest<{ message: string; evento: Evento }>(`/api/eventos/${payload.eventoId}/inscripcion`, {
    method: "POST",
    token: payload.token
  });
}

export function cancelarInscripcionEvento(payload: { token: string; eventoId: string }) {
  return apiRequest<{ message: string; evento: Evento | null }>(`/api/eventos/${payload.eventoId}/inscripcion`, {
    method: "DELETE",
    token: payload.token
  });
}

export interface EventoInscripcionesParams {
  role?: "todos" | "ofertante" | "demandante";
  page?: number;
  limit?: number;
}

export function getEventoInscripciones(token: string, eventoId: string, params: EventoInscripcionesParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.role && params.role !== "todos") {
    searchParams.set("role", params.role);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  const path = query ? `/api/eventos/${eventoId}/inscripciones?${query}` : `/api/eventos/${eventoId}/inscripciones`;

  return apiRequest<EventoInscripcionesResponse>(path, {
    method: "GET",
    token
  });
}
