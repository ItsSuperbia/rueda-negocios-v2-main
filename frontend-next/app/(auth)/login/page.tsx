import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="bg-background">
      
      <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-4 py-5 lg:px-8">
          <Link className="flex items-center" href="/" aria-label="EventConnect">
            <Image
              src="/images/icons/icon_navbar_logo_EventConnect.png"
              alt="EventConnect"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-95" href="/register">
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <section className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="mx-auto grid w-full max-w-[85%] items-stretch gap-0 overflow-hidden rounded-2xl shadow-2xl lg:grid-cols-2">
          {/* Card de Información */}
          <div className="flex flex-col justify-center border-r border-white/10 bg-gray-900/80 p-12 text-white backdrop-blur-lg">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Inicio de Sesión</p>

            <h1 className="mt-6 font-[var(--font-heading)] text-4xl font-bold leading-tight xl:text-5xl">
              Orquesta tu rueda de negocios con <span className="text-accent">claridad operativa</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Desde aprobación de usuarios hasta agendamiento inteligente, en un flujo diseñado para equipos de alto rendimiento.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3 border-l-2 border-white/10 py-1 pl-4 transition hover:border-accent">
                <span className="text-sm font-medium text-white/90">Gestión de Eventos como Administrador</span>
              </div>
              <div className="flex items-center gap-3 border-l-2 border-white/10 py-1 pl-4 transition hover:border-accent">
                <span className="text-sm font-medium text-white/90">Gestión de Asistencias como Demandante</span>
              </div>
              <div className="flex items-center gap-3 border-l-2 border-white/10 py-1 pl-4 transition hover:border-accent">
                <span className="text-sm font-medium text-white/90">Aprobación del perfil en {"<"}1 hora</span>
              </div>
            </div>
          </div>

          {/* Card del Formulario */}
          <div className="flex items-center justify-center bg-white p-12">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-canvas px-4 py-10 text-center text-sm text-muted lg:px-8">
        <p>&copy; 2025 EventConnect. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
