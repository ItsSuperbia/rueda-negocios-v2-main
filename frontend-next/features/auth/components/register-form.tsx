"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useRegisterMutation } from "@/features/auth/hooks";
import { RegisterFormValues, registerSchema } from "@/features/auth/schema";

export function RegisterForm() {
  const router = useRouter();
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      sectorOtro: "",
      nit: "",
      rutProvisional: "",
      aceptaTerminos: false
    }
  });

  const { mutate, isPending, error } = useRegisterMutation();

  const sector = watch("sector") ?? "";
  const formalizada = watch("formalizada") ?? "";

  const showFormalizadaDocs = formalizada === "true";
  const showNoFormalizadaDocs = formalizada === "false";
  const showSectorOtro = sector === "Otro";

  const onSubmit: SubmitHandler<RegisterFormValues> = (values) => {
    setSubmitSuccess(null);

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("role", values.role);
    formData.append("nombreEmpresa", values.nombreEmpresa);
    formData.append("sector", values.sector);
    formData.append("formalizada", values.formalizada);
    formData.append("aceptaTerminos", values.aceptaTerminos ? "true" : "false");

    if (values.sectorOtro) {
      formData.append("sectorOtro", values.sectorOtro);
    }

    if (values.nit) {
      formData.append("nit", values.nit);
    }

    if (values.rutProvisional) {
      formData.append("rutProvisional", values.rutProvisional);
    }

    const rutFile = values.rutFile instanceof FileList ? values.rutFile.item(0) : null;
    if (rutFile) {
      formData.append("rutFile", rutFile);
    }

    mutate(formData, {
      onSuccess: () => {
        setSubmitSuccess("Registro exitoso. Por favor inicia sesion.");
        reset();
        router.push("/login");
      }
    });
  };

  return (
    <form className="mt-10 space-y-10 fade-up" onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
      <section>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-semibold text-accent">1. Datos de Cuenta</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="email">
              Correo Electronico
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
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="password">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
              {...register("password")}
            />
            {errors.password ? <p className="mt-1 text-xs text-danger">{errors.password.message}</p> : null}
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="role">
            Tipo de Participacion
          </label>
          <select
            id="role"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
            {...register("role")}
          >
            <option value="">Seleccione...</option>
            <option value="ofertante">Ofertante (Ofrezco productos/servicios)</option>
            <option value="demandante">Demandante (Busco proveedores)</option>
            <option value="adminEvento">Administrador de eventos</option>
          </select>
          {errors.role ? <p className="mt-1 text-xs text-danger">{errors.role.message}</p> : null}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-semibold text-accent">2. Informacion de la Empresa</h2>
        </div>
        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="nombreEmpresa">
            Nombre de la Empresa
          </label>
          <input
            id="nombreEmpresa"
            type="text"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
            {...register("nombreEmpresa")}
          />
          {errors.nombreEmpresa ? <p className="mt-1 text-xs text-danger">{errors.nombreEmpresa.message}</p> : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="sector">
              Sector Economico
            </label>
            <select
              id="sector"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
              {...register("sector")}
            >
              <option value="">Seleccione...</option>
              <option value="Turismo">Turismo y Hospitalidad</option>
              <option value="Agroalimentos">Agroalimentos</option>
              <option value="TIC">Tecnologia (TIC)</option>
              <option value="Servicios">Servicios Empresariales</option>
              <option value="Manufactura">Manufactura</option>
              <option value="Logistica">Logistica</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.sector ? <p className="mt-1 text-xs text-danger">{errors.sector.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="formalizada">
              Estado de Formalizacion
            </label>
            <select
              id="formalizada"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
              {...register("formalizada")}
            >
              <option value="">Seleccione...</option>
              <option value="true">Empresa Formalizada</option>
              <option value="false">En proceso / No formalizada</option>
            </select>
            {errors.formalizada ? <p className="mt-1 text-xs text-danger">{errors.formalizada.message}</p> : null}
          </div>
        </div>

        {showSectorOtro ? (
          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="sectorOtro">
              Especifique el sector
            </label>
            <input
              id="sectorOtro"
              type="text"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
              {...register("sectorOtro")}
            />
            {errors.sectorOtro ? <p className="mt-1 text-xs text-danger">{errors.sectorOtro.message}</p> : null}
          </div>
        ) : null}
      </section>

      <section>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-semibold text-accent">3. Documentacion</h2>
        </div>

        <div className={`mt-6 space-y-4 ${showFormalizadaDocs ? "block" : "hidden"}`} aria-hidden={!showFormalizadaDocs}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="nit">
              NIT
            </label>
            <input
              id="nit"
              type="text"
              disabled={!showFormalizadaDocs}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
              {...register("nit")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="rutFile">
              RUT (PDF)
            </label>
            <input
              id="rutFile"
              type="file"
              accept=".pdf"
              disabled={!showFormalizadaDocs}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink"
              {...register("rutFile")}
            />
          </div>
        </div>

        <div className={`mt-6 ${showNoFormalizadaDocs ? "block" : "hidden"}`} aria-hidden={!showNoFormalizadaDocs}>
          <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="rutProvisional">
            RUT Provisional (Opcional)
          </label>
          <input
            id="rutProvisional"
            type="text"
            disabled={!showNoFormalizadaDocs}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent"
            {...register("rutProvisional")}
          />
        </div>
      </section>

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <label className="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            {...register("aceptaTerminos")}
          />
          <span>Acepto los terminos y condiciones</span>
        </label>
        {errors.aceptaTerminos ? <p className="mt-2 text-xs text-danger">{errors.aceptaTerminos.message}</p> : null}
      </div>

      {error ? <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error.message}</p> : null}
      {submitSuccess ? <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{submitSuccess}</p> : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button className="min-w-[200px] text-base" type="submit" loading={isPending}>
          Registrarse
        </Button>
        <Link className="text-sm font-semibold text-accent hover:underline" href="/login">
          Ya tienes cuenta? Inicia sesion
        </Link>
      </div>
    </form>
  );
}
