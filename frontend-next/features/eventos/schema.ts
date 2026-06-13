import { z } from "zod";

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || typeof value === "undefined") {
        return undefined;
      }
      return Number(value);
    },
    schema.optional()
  );

export const eventSchema = z
  .object({
    nombreEvento: z.string().min(5, "El nombre debe tener al menos 5 caracteres"),
    descripcion: z.string().min(20, "Describe el evento con mayor detalle"),
    categoria: z.string().min(1, "Selecciona una categoría"),
    modalidad: z.enum(["presencial", "virtual", "hibrido"], {
      required_error: "Selecciona la modalidad"
    }),
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fechaFin: z.string().min(1, "La fecha de finalización es obligatoria"),
    horaInicio: z.string().min(1, "La hora de inicio es obligatoria"),
    horaFin: z.string().min(1, "La hora de finalización es obligatoria"),
    duracionReunion: z.coerce.number().int().min(15).max(60),
    fechaLimite: z.string().min(1, "La fecha límite es obligatoria"),
    lugar: z.string().min(3, "Indica el lugar o dirección"),
    ciudad: z.string().min(2, "Indica la ciudad"),
    pais: z.string().optional(),
    linkVirtual: z.preprocess(
      (value) => {
        if (value === "") {
          return undefined;
        }
        return value;
      },
      z.string().url("Ingresa un link válido").optional()
    ),
    cupos: z.coerce.number().int().min(10, "Mínimo 10 cupos").max(10000, "Máximo 10000 cupos"),
    mesas: optionalNumber(z.number().int().min(1, "Mínimo 1 mesa").max(100, "Máximo 100 mesas")),
    esGratis: z.boolean(),
    valorInscripcion: optionalNumber(z.number().min(0, "No puede ser negativo")),
    descuento: optionalNumber(z.number().min(0, "Mínimo 0%").max(100, "Máximo 100%")),
    emailContacto: z.string().email("Ingresa un email válido"),
    telefonoContacto: z.string().optional(),
    organizador: z.string().optional(),
    esBorrador: z.boolean().optional().default(false)
  })
  .superRefine((values, ctx) => {
    const inicio = new Date(`${values.fechaInicio}T${values.horaInicio}`);
    const fin = new Date(`${values.fechaFin}T${values.horaFin}`);
    const limite = new Date(`${values.fechaLimite}T00:00:00`);
    const inicioDia = new Date(`${values.fechaInicio}T00:00:00`);

    if (!Number.isNaN(inicio.getTime()) && !Number.isNaN(fin.getTime()) && fin < inicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fechaFin"],
        message: "La fecha de finalización debe ser posterior a la fecha de inicio"
      });
    }

    if (!Number.isNaN(limite.getTime()) && !Number.isNaN(inicioDia.getTime()) && limite > inicioDia) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fechaLimite"],
        message: "La fecha límite debe ser anterior o igual a la fecha de inicio"
      });
    }

    if ((values.modalidad === "virtual" || values.modalidad === "hibrido") && !values.linkVirtual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["linkVirtual"],
        message: "Ingresa el link virtual del evento"
      });
    }

    if (!values.esGratis && (!values.valorInscripcion || values.valorInscripcion <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["valorInscripcion"],
        message: "Ingresa el valor de inscripción"
      });
    }
  });

export type EventFormValues = z.infer<typeof eventSchema>;

export type EventPayload = {
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
  categoria: string;
  fechaLimiteInscripcion: string;
  horaInicio: string;
  horaFin: string;
  duracionReunionMin: number;
  mesas?: number;
  esGratis: boolean;
  descuentoEarlyBird?: number;
  emailContacto: string;
  telefonoContacto?: string;
  organizador?: string;
  ciudad: string;
  pais?: string;
  linkVirtual?: string;
  esBorrador?: boolean;
};
