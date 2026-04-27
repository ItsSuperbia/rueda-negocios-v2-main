export type Role = "adminSistema" | "adminEvento" | "ofertante" | "demandante";

export interface User {
  _id: string;
  email: string;
  role: Role;
  nombreEmpresa?: string;
  sector?: string;
  formalizada?: boolean;
  estadoRegistro?: "pendiente" | "aprobado" | "rechazado";
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
}

export interface Evento {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  location: string;
  modalidad: "presencial" | "virtual" | "mixto";
  cupos: number;
  valorInscripcion: number;
  enfoque: string;
  estadoEvento: "pendiente" | "aprobado" | "rechazado";
  createdAt?: string;
}

export interface MatchEntity {
  _id: string;
  status: "pending" | "accepted" | "rejected";
  score: number;
  notes?: string;
}

export interface MeetingEntity {
  _id: string;
  matchId: string;
  startTime: string;
  endTime: string;
  location: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
}
