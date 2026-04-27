import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "Describe el evento con mayor detalle"),
  startDate: z.string().min(1, "La fecha inicial es obligatoria"),
  endDate: z.string().min(1, "La fecha final es obligatoria"),
  durationDays: z.coerce.number().int().positive("Debe ser mayor a 0"),
  location: z.string().min(3, "Indica ubicación o enlace"),
  modalidad: z.enum(["presencial", "virtual", "mixto"]),
  cupos: z.coerce.number().int().positive("Debe ser mayor a 0"),
  valorInscripcion: z.coerce.number().min(0, "No puede ser negativo"),
  enfoque: z.string().min(10, "Indica el enfoque del evento")
});

export type EventFormValues = z.infer<typeof eventSchema>;
