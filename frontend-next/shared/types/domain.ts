export type Role = "adminSistema" | "adminEvento" | "ofertante" | "demandante";

export interface DatosContacto {
  correo?: string;
  telefono?: string;
  direccion?: string;
  redes?: string[];
}

export interface Representante {
  nombre?: string;
  documento?: string;
  cargo?: string;
}

export interface DocumentosFormalizados {
  rut?: string;
  certificadoExistencia?: string;
  cedulaRepresentante?: string;
}

export interface DocumentosNoFormalizados {
  comprobanteMatricula?: string;
  cedulaSolicitante?: string;
}

export interface User {
  _id: string;
  email: string;
  role: Role;
  nombreEmpresa?: string;
  logoEmpresa?: string;
  sector?: string;
  formalizada?: boolean;
  nit?: string;
  rutProvisional?: string;
  documentosFormalizados?: DocumentosFormalizados;
  documentosNoFormalizados?: DocumentosNoFormalizados;
  catalogoPDF?: string;
  necesidadesPDF?: string;
  datosContacto?: DatosContacto;
  representante?: Representante;
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

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
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
  inscritos?: number;
  valorInscripcion: number;
  enfoque: string;
  categoria?: string;
  fechaLimiteInscripcion?: string;
  horaInicio?: string;
  horaFin?: string;
  duracionReunionMin?: number;
  mesas?: number;
  esGratis?: boolean;
  descuentoEarlyBird?: number;
  emailContacto?: string;
  telefonoContacto?: string;
  organizador?: string;
  ciudad?: string;
  pais?: string;
  linkVirtual?: string;
  estadoEvento: "borrador" | "pendiente" | "aprobado" | "rechazado";
  createdAt?: string;
}

export interface AdminEventoDashboard {
  stats: {
    eventosActivos: number;
    totalInscritos: number;
    reunionesGeneradas: number;
    proximoEvento: Evento | null;
  };
  recientes: Evento[];
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
