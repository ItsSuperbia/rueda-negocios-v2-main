"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/features/auth/hooks";
import { LoginFormValues, loginSchema } from "@/features/auth/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const { mutate, isPending, error } = useLoginMutation();

  const onSubmit = (values: LoginFormValues) => {
    mutate(values, {
      onSuccess: (data) => {
        setSession(data.token, data.user);
        router.replace("/dashboard");
      }
    });
  };

  return (
    <Card className="mx-auto w-full max-w-md fade-up">
      <div className="mb-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-ink">Accede a tu panel</h1>
        <p className="mt-1 text-sm text-muted">Gestiona usuarios, eventos y reuniones desde una sola interfaz.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
            {...register("email")}
          />
          {errors.email ? <p className="mt-1 text-xs text-danger">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
            {...register("password")}
          />
          {errors.password ? <p className="mt-1 text-xs text-danger">{errors.password.message}</p> : null}
        </div>

        {error ? <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error.message}</p> : null}

        <Button className="w-full" loading={isPending} type="submit">
          Iniciar sesión
        </Button>
      </form>
    </Card>
  );
}
