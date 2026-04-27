import Link from "next/link";

export default function RegisterPage() {
  return (
    <section className="flex min-h-screen items-center px-4 py-8">
      <div className="mx-auto w-full max-w-xl rounded-xl2 bg-white/90 p-8 shadow-card ring-1 ring-slate-100">
        <p className="text-xs uppercase tracking-wide text-muted">Registro empresarial</p>
        <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-bold">Crea tu cuenta</h1>
        <p className="mt-3 text-sm text-muted">
          Este espacio queda listo para conectar el formulario de registro multi-rol (ofertante, demandante, adminEvento).
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white" href="/login">
            Ir a iniciar sesion
          </Link>
          <Link className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold" href="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
