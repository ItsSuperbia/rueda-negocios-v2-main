import { apiRequest } from "@/shared/api/client";
import {
  BuyerMeetingMarketplace,
  Evento,
  MeetingEntity,
  User,
  SupplierMeetingWorkspace,
  TableReservationEntity
} from "@/shared/types/domain";

export function getMeetingEventos(token: string) {
  return apiRequest<{ data: Evento[] }>("/api/meetings/eventos", {
    method: "GET",
    token
  });
}

export function getSupplierMeetingWorkspace(payload: { token: string; eventoId: string }) {
  return apiRequest<SupplierMeetingWorkspace>(`/api/meetings/eventos/${payload.eventoId}/ofertante`, {
    method: "GET",
    token: payload.token
  });
}

export function reserveSupplierTable(payload: {
  token: string;
  eventoId: string;
  tableNumber: number;
  dayKeys: string[];
}) {
  return apiRequest<{ message: string; reservations: TableReservationEntity[] }>(
    `/api/meetings/eventos/${payload.eventoId}/mesas`,
    {
      method: "POST",
      token: payload.token,
      body: {
        tableNumber: payload.tableNumber,
        dayKeys: payload.dayKeys
      }
    }
  );
}

export function getBuyerMeetingMarketplace(payload: {
  token: string;
  eventoId: string;
  search?: string;
  sector?: string;
}) {
  const searchParams = new URLSearchParams();

  if (payload.search) {
    searchParams.set("search", payload.search);
  }

  if (payload.sector && payload.sector !== "todos") {
    searchParams.set("sector", payload.sector);
  }

  const query = searchParams.toString();
  const path = query
    ? `/api/meetings/eventos/${payload.eventoId}/demandante?${query}`
    : `/api/meetings/eventos/${payload.eventoId}/demandante`;

  return apiRequest<BuyerMeetingMarketplace>(path, {
    method: "GET",
    token: payload.token
  });
}

export function reserveBuyerSession(payload: { token: string; meetingId: string }) {
  return apiRequest<{ message: string; meeting: MeetingEntity }>(`/api/meetings/sesiones/${payload.meetingId}/reservar`, {
    method: "POST",
    token: payload.token
  });
}

export function cancelBuyerSession(payload: { token: string; meetingId: string }) {
  return apiRequest<{ message: string; meeting: MeetingEntity; availableMeeting: MeetingEntity }>(
    `/api/meetings/sesiones/${payload.meetingId}`,
    {
      method: "DELETE",
      token: payload.token
    }
  );
}

export function getSupplierPublicProfile(payload: { token: string; supplierId: string; eventoId: string }) {
  return apiRequest<User>(`/api/users/${payload.supplierId}/eventos/${payload.eventoId}/perfil-ofertante`, {
    method: "GET",
    token: payload.token
  });
}
