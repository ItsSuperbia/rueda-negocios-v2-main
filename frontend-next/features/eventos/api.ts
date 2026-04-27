import { apiRequest } from "@/shared/api/client";
import { Evento } from "@/shared/types/domain";
import { EventFormValues } from "@/features/eventos/schema";

export function getPendingEventos(token: string) {
  return apiRequest<Evento[]>("/api/eventos/pendientes", {
    method: "GET",
    token
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

export function createEvento(payload: { token: string; data: EventFormValues }) {
  return apiRequest<{ message: string; evento: Evento }>("/api/eventos", {
    method: "POST",
    token: payload.token,
    body: payload.data
  });
}
