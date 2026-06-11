"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip } from "@/components/ui/status-chip";
import { getProfile, updateProfile } from "@/features/perfil/api";
import { profileSchema, ProfileFormValues } from "@/features/perfil/schema";
import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://gisistinfo.unicartagena.edu.co:3003";

const sectorOptions = [
  "Turismo",
  "Agroalimentos",
  "TIC",
  "Servicios",
  "Manufactura",
  "Logistica",
  "Otro"
];

const resolveFileUrl = (path?: string) => {
  if (!path) return "";
  const normalized = path.replace(/\\/g, "/");

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  const uploadsIndex = normalized.lastIndexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return `${API_BASE_URL}${normalized.slice(uploadsIndex)}`;
  }

  if (normalized.startsWith("/uploads/")) {
    return `${API_BASE_URL}${normalized}`;
  }

  if (normalized.startsWith("uploads/")) {
    return `${API_BASE_URL}/${normalized}`;
  }

  return normalized;
};

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

export function ProfileWorkspace() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(token as string),
    enabled: Boolean(token)
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (payload) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      if (token) {
        setSession(token, payload.user);
      }
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      sector: "",
      formalizada: "false",
      datosContacto: {
        correo: "",
        telefono: "",
        direccion: "",
        redes: ""
      },
      representante: {
        nombre: "",
        documento: "",
        cargo: ""
      }
    }
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    reset({
      sector: profileQuery.data.sector ?? "",
      formalizada: profileQuery.data.formalizada ? "true" : "false",
      datosContacto: {
        correo: profileQuery.data.datosContacto?.correo ?? profileQuery.data.email ?? "",
        telefono: profileQuery.data.datosContacto?.telefono ?? "",
        direccion: profileQuery.data.datosContacto?.direccion ?? "",
        redes: profileQuery.data.datosContacto?.redes?.join(", ") ?? ""
      },
      representante: {
        nombre: profileQuery.data.representante?.nombre ?? "",
        documento: profileQuery.data.representante?.documento ?? "",
        cargo: profileQuery.data.representante?.cargo ?? ""
      }
    });
  }, [profileQuery.data, reset]);

  const formalizadaValue = watch("formalizada") ?? (profileQuery.data?.formalizada ? "true" : "false");
  const isFormalizadaLocked = profileQuery.data?.formalizada === true;
  const isFormalizadaSelected = formalizadaValue === "true";
  const rutEnabled = isFormalizadaSelected || isFormalizadaLocked;

  if (profileQuery.isPending) {
    return <p className="text-sm text-muted">Cargando perfil...</p>;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <EmptyState
        title="No fue posible cargar el perfil"
        description="Verifica la conexion con el backend o vuelve a iniciar sesion."
      />
    );
  }

  const profile = profileQuery.data;
  const rutUrl = resolveFileUrl(profile.documentosFormalizados?.rut);
  const catalogoUrl = resolveFileUrl(profile.catalogoPDF);
  const logoUrl = resolveFileUrl(profile.logoEmpresa);

  const onSubmit = (values: ProfileFormValues) => {
    if (!token) return;

    const rutFile = values.rutFile instanceof FileList ? values.rutFile.item(0) : null;
    if (!profile.formalizada && values.formalizada === "true" && !rutFile) {
      setError("rutFile", { type: "manual", message: "Debes adjuntar el RUT para formalizar la empresa." });
      return;
    }

    if (!profile.formalizada && values.formalizada !== "true" && rutFile) {
      setError("rutFile", { type: "manual", message: "El RUT solo se puede adjuntar si la empresa esta formalizada." });
      return;
    }

    const redes = values.datosContacto?.redes
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const formData = new FormData();
    if (values.sector) {
      formData.append("sector", values.sector);
    }
    if (values.formalizada) {
      formData.append("formalizada", values.formalizada);
    }

    formData.append(
      "datosContacto",
      JSON.stringify({
        correo: values.datosContacto?.correo ?? "",
        telefono: values.datosContacto?.telefono ?? "",
        direccion: values.datosContacto?.direccion ?? "",
        redes: redes ?? []
      })
    );

    formData.append(
      "representante",
      JSON.stringify({
        nombre: values.representante?.nombre ?? "",
        documento: values.representante?.documento ?? "",
        cargo: values.representante?.cargo ?? ""
      })
    );

    const logoFile = values.logoEmpresa instanceof FileList ? values.logoEmpresa.item(0) : null;
    if (logoFile) {
      formData.append("logoEmpresa", logoFile);
    }

    if (rutFile) {
      formData.append("rutFile", rutFile);
    }

    if (role === "ofertante") {
      const catalogoFile = values.catalogoFile instanceof FileList ? values.catalogoFile.item(0) : null;
      if (catalogoFile) {
        formData.append("catalogoFile", catalogoFile);
      }
    }

    updateMutation.mutate({ token, data: formData });
  };

  return (
    <section className="space-y-5">
      <Card className="fade-up relative overflow-hidden bg-gradient-to-br from-white/95 via-white to-emerald-50/70">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-6 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute right-6 top-8 h-52 w-52 rounded-full bg-sky-200/40 blur-3xl" />
        </div>
        <div className="-mx-5 -mt-5 mb-5 flex flex-col gap-3 border-b border-white/70 bg-gradient-to-r from-accent/10 via-white/30 to-transparent px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Mi perfil</p>
            <h1 className="mt-1 font-[var(--font-heading)] text-2xl font-bold text-ink">
              {profile.nombreEmpresa ?? profile.email}
            </h1>
            <p className="mt-1 text-sm text-muted">Actualiza tu informacion operativa y documentos clave.</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip status={profile.estadoRegistro ?? "pendiente"} />
            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-ink">
              {profile.role}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Sector" value={profile.sector ?? "Sin definir"} />
          <InfoItem label="Formalizada" value={profile.formalizada ? "Si" : "No"} />
          <InfoItem label="NIT" value={profile.nit ?? "No registrado"} />
          <InfoItem label="Correo de registro" value={profile.email} />
          <InfoItem label="Estado" value={profile.estadoRegistro ?? "pendiente"} />
          <InfoItem label="Rol" value={profile.role} />
        </div>
      </Card>

      <Card className="fade-up bg-white/95">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <h2 className="text-lg font-semibold">Documentos principales</h2>
        </div>
        <div className="mt-4 grid gap-6 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 md:grid-cols-[160px_1fr]">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Imagen de perfil</p>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Imagen de perfil"
                className="mt-3 h-32 w-32 rounded-2xl object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="mt-3 flex h-32 w-32 items-center justify-center rounded-2xl bg-white text-sm text-muted ring-1 ring-slate-200">
                Sin imagen
              </div>
            )}
          </div>
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-slate-200/70 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted">RUT (PDF)</p>
              {profile.formalizada ? (
                rutUrl ? (
                  <a className="mt-1 inline-flex items-center text-sm font-semibold text-accent underline" href={rutUrl} target="_blank" rel="noreferrer">
                    Ver RUT
                  </a>
                ) : (
                  <p className="mt-1 text-muted">No hay archivo cargado</p>
                )
              ) : (
                <p className="mt-1 text-muted">Disponible solo para empresas formalizadas</p>
              )}
            </div>

            {role === "ofertante" ? (
              <div className="rounded-xl border border-slate-200/70 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted">Catalogo comercial (PDF)</p>
                {catalogoUrl ? (
                  <a className="mt-1 inline-flex items-center text-sm font-semibold text-accent underline" href={catalogoUrl} target="_blank" rel="noreferrer">
                    Ver catalogo
                  </a>
                ) : (
                  <p className="mt-1 text-muted">No hay catalogo cargado</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="fade-up bg-white/95">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <div>
            <h2 className="text-lg font-semibold">Actualizar perfil</h2>
            <p className="mt-1 text-sm text-muted">Solo se pueden modificar los campos permitidos para tu rol.</p>
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="sector">
                Sector economico
              </label>
              <select
                id="sector"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                {...register("sector")}
              >
                <option value="">Seleccione...</option>
                {sectorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.sector ? <p className="mt-1 text-xs text-danger">{errors.sector.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="formalizada">
                Empresa formalizada
              </label>
              <select
                id="formalizada"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                disabled={isFormalizadaLocked}
                {...register("formalizada")}
              >
                <option value="true">Si</option>
                <option value="false">No</option>
              </select>
              {isFormalizadaLocked ? (
                <p className="mt-1 text-xs text-muted">No puedes cambiar una empresa formalizada a no formalizada.</p>
              ) : (
                <p className="mt-1 text-xs text-muted">Para formalizar, adjunta el PDF del RUT.</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="logoEmpresa">
                Imagen de perfil
              </label>
              <input
                id="logoEmpresa"
                type="file"
                accept=".png,.jpg,.jpeg"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold focus:border-accent focus:ring-2 focus:ring-accent/20"
                {...register("logoEmpresa")}
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
                disabled={!rutEnabled}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold focus:border-accent focus:ring-2 focus:ring-accent/20"
                {...register("rutFile")}
              />
              {errors.rutFile ? <p className="mt-1 text-xs text-danger">{errors.rutFile.message as string}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="datosContacto.correo">
                Correo de contacto
              </label>
              <input
                id="datosContacto.correo"
                type="email"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                {...register("datosContacto.correo")}
              />
              {errors.datosContacto?.correo ? (
                <p className="mt-1 text-xs text-danger">{errors.datosContacto.correo.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="datosContacto.telefono">
                Telefono
              </label>
              <input
                id="datosContacto.telefono"
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                {...register("datosContacto.telefono")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="datosContacto.direccion">
                Direccion
              </label>
              <input
                id="datosContacto.direccion"
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                {...register("datosContacto.direccion")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="datosContacto.redes">
                Redes sociales (links separados por coma)
              </label>
              <input
                id="datosContacto.redes"
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="https://linkedin.com/tuempresa, https://instagram.com/tuempresa"
                {...register("datosContacto.redes")}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="representante.nombre">
                Representante legal
              </label>
              <input
                id="representante.nombre"
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                {...register("representante.nombre")}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="representante.documento">
                Documento
              </label>
              <input
                id="representante.documento"
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                {...register("representante.documento")}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="representante.cargo">
                Cargo
              </label>
              <input
                id="representante.cargo"
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
                {...register("representante.cargo")}
              />
            </div>
          </div>

          {role === "ofertante" ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="catalogoFile">
                Catalogo comercial (PDF)
              </label>
              <input
                id="catalogoFile"
                type="file"
                accept=".pdf"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold focus:border-accent focus:ring-2 focus:ring-accent/20"
                {...register("catalogoFile")}
              />
            </div>
          ) : null}

          {updateMutation.isError ? (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">No se pudo actualizar el perfil.</p>
          ) : null}
          {updateMutation.isSuccess ? (
            <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">Perfil actualizado correctamente.</p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" loading={updateMutation.isPending}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
