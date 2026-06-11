import { z } from "zod";

const optionalEmail = z.string().email("Ingresa un correo valido").optional().or(z.literal(""));

export const profileSchema = z.object({
  sector: z.string().optional(),
  formalizada: z.enum(["true", "false"]).optional(),
  datosContacto: z
    .object({
      correo: optionalEmail,
      telefono: z.string().optional(),
      direccion: z.string().optional(),
      redes: z.string().optional()
    })
    .optional(),
  representante: z
    .object({
      nombre: z.string().optional(),
      documento: z.string().optional(),
      cargo: z.string().optional()
    })
    .optional(),
  logoEmpresa: z.any().optional(),
  rutFile: z.any().optional(),
  catalogoFile: z.any().optional()
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
