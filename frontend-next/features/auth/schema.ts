import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email("Ingresa un correo válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    role: z.enum(["ofertante", "demandante", "adminEvento"], {
      required_error: "Selecciona un tipo de participacion"
    }),
    nombreEmpresa: z.string().min(1, "Ingresa el nombre de la empresa"),
    sector: z.string().min(1, "Selecciona un sector"),
    sectorOtro: z.string().optional(),
    formalizada: z.enum(["true", "false"], {
      required_error: "Selecciona el estado de formalizacion"
    }),
    nit: z.string().optional(),
    rutFile: z.any().optional(),
    rutProvisional: z.string().optional(),
    aceptaTerminos: z.boolean().refine((value) => value, {
      message: "Debes aceptar los terminos"
    })
  })
  .superRefine((values, ctx) => {
    if (values.sector === "Otro" && !values.sectorOtro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sectorOtro"],
        message: "Especifica el sector"
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
