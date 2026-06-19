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
  descripcion?: string;
  sector?: string;
  ciudad?: string;
  pais?: string;
  formalizada?: boolean;
  nit?: string;
  rutProvisional?: string;
  documentosFormalizados?: DocumentosFormalizados;
  documentosNoFormalizados?: DocumentosNoFormalizados;
  catalogoPDF?: string | CatalogoPDF | null;
  necesidadesPDF?: string;
  datosContacto?: DatosContacto;
  representante?: Representante;
  estadoRegistro?: "pendiente" | "aprobado" | "rechazado";
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogoPDF {
  nombreArchivo: string;
  url: string;
  fechaCarga?: string | null;
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
  estaInscrito?: boolean;
  inscripcionEstado?: "activa" | "cancelada" | null;
  inscripcionesResumen?: InscripcionesResumen;
  createdAt?: string;
}

export interface InscripcionesResumen {
  total: number;
  ofertantes: number;
  demandantes: number;
}

export interface EventoInscripcionParticipante {
  _id: string;
  role: "ofertante" | "demandante";
  estado: "activa" | "cancelada";
  fechaCancelacion?: string;
  createdAt: string;
  user: Pick<User, "_id" | "email" | "nombreEmpresa" | "sector" | "logoEmpresa" | "datosContacto" | "representante" | "estadoRegistro">;
}

export interface EventoInscripcionesResponse {
  stats: InscripcionesResumen;
  data: EventoInscripcionParticipante[];
  meta: PaginationMeta;
}

export interface EmpresaEventosResumen {
  eventosInscritos: number;
  totalParticipantes: number;
  proximoEvento: (Pick<Evento, "_id" | "title" | "startDate" | "endDate" | "cupos" | "inscritos"> & {
    inscripcionesResumen?: InscripcionesResumen;
  }) | null;
}

export interface AdminEventoDashboard {
  stats: {
    eventosActivos: number;
    totalInscritos: number;
    totalOfertantes: number;
    totalDemandantes: number;
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
  matchId?: string;
  evento?: string;
  eventoInfo?: Pick<Evento, "_id" | "title" | "startDate" | "endDate"> | null;
  tableReservation?: string | null;
  supplierId?: string;
  buyerId?: string | null;
  tableNumber?: number;
  dayKey?: string;
  startTime: string;
  endTime: string;
  location: string;
  status: "available" | "reserved" | "completed" | "cancelled" | "scheduled" | "no_show";
  supplier?: Pick<User, "_id" | "nombreEmpresa" | "sector" | "logoEmpresa"> | null;
  buyer?: Pick<User, "_id" | "nombreEmpresa" | "sector" | "logoEmpresa"> | null;
}

export interface MeetingDay {
  key: string;
  label: string;
}

export interface MeetingSlot {
  startTime: string;
  endTime: string;
  label: string;
}

export interface TableReservationEntity {
  _id: string;
  evento: string;
  tableNumber: number;
  dayKey: string;
  status: "reserved" | "cancelled";
  supplier: Pick<User, "_id" | "nombreEmpresa" | "sector" | "logoEmpresa"> | null;
}

export interface SupplierMatrixCell {
  tableNumber: number;
  status: "available" | "reserved";
  reservedByMe: boolean;
  supplier: Pick<User, "_id" | "nombreEmpresa" | "sector" | "logoEmpresa"> | null;
  meeting: MeetingEntity | null;
}

export interface SupplierMatrixRow {
  label: string;
  startTime: string;
  endTime: string;
  tables: SupplierMatrixCell[];
}

export interface SupplierMatrixDay extends MeetingDay {
  rows: SupplierMatrixRow[];
}

export interface SupplierMeetingWorkspace {
  evento: Evento;
  days: MeetingDay[];
  tables: number[];
  slotsPerDay: Record<string, MeetingSlot[]>;
  reservations: TableReservationEntity[];
  myReservations: TableReservationEntity[];
  matrix: SupplierMatrixDay[];
}

export interface BuyerSupplierCard {
  reservationId: string;
  dayKey: string;
  tableNumber: number;
  supplier: Pick<User, "_id" | "nombreEmpresa" | "sector" | "logoEmpresa">;
  sessions: MeetingEntity[];
  availableSessions: number;
}

export interface BuyerMeetingMarketplace {
  evento: Evento;
  days: MeetingDay[];
  sectors: string[];
  supplierCards: BuyerSupplierCard[];
}

export type NotificationType =
  | "meeting_created"
  | "meeting_reminder"
  | "meeting_cancelled"
  | "meeting_rescheduled"
  | "match_created";

export type NotificationRelatedEntityType = "Meeting" | "Match" | "Evento";

export interface NotificationEntity {
  _id: string;
  recipientUser: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: NotificationRelatedEntityType;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: NotificationEntity[];
  meta: PaginationMeta;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  meeting_created: "Reuniones",
  meeting_reminder: "Recordatorios",
  meeting_cancelled: "Cancelaciones",
  meeting_rescheduled: "Reprogramaciones",
  match_created: "Matches",
};

export const NOTIFICATION_TYPE_GROUP_FILTERS = [
  { key: "all", label: "Todas" },
  { key: "unread", label: "No leídas" },
  { key: "meeting", label: "Reuniones" },
  { key: "match", label: "Matches" },
] as const;
