"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface DataPolicyModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function DataPolicyModal({ open, onClose, onAccept }: DataPolicyModalProps) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!open) {
      setAccepted(false);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Protección de datos</p>
            <h2 className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-ink">
              Política de Tratamiento y Protección de Datos Personales
            </h2>
            <p className="mt-2 text-sm text-muted">Autorización previa, expresa e informada conforme a la Ley 1581 de 2012 y el Decreto 1074 de 2015.</p>
          </div>
          <button
            aria-label="Cerrar modal"
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-slate-200"
            onClick={onClose}
            type="button"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-6 text-ink">
          <p>
            Antes de continuar con el registro, confirma que has leído la política de tratamiento de datos y autorizas el uso de tu información para las finalidades descritas.
          </p>

          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="font-semibold text-ink">Consulta la política completa</p>
            <Link className="mt-2 inline-flex text-sm font-semibold text-accent hover:underline" href="/proteccion-datos">
              Ver información de la política de protección de datos
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-ink">Uso de datos</p>
              <p className="mt-2 text-muted">
                La plataforma podrá usar tus datos para registro, autenticación, validación, eventos, reuniones, reportes y notificaciones.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-ink">Derechos del titular</p>
              <p className="mt-2 text-muted">
                Podrás conocer, actualizar, rectificar, solicitar supresión y revocar la autorización cuando proceda.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-muted">
            <input
              checked={accepted}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
              onChange={(event) => setAccepted(event.target.checked)}
              type="checkbox"
            />
            <span>
              Acepto la Política de Tratamiento y Protección de Datos Personales y autorizo el tratamiento de mis datos para las finalidades indicadas.
            </span>
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button disabled={!accepted} onClick={onAccept} type="button">
              Aceptar y continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}