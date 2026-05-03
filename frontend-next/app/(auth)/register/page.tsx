import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/features/auth/components/register-form";

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
            <Link
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
              href="/login"
            >
              Iniciar Sesion
            </Link>
          </div>
        </div>
      </nav>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        {/* Card del Formulario */}
        <div className="mx-auto w-full max-w-[88rem] rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200 sm:p-8 lg:p-12">
          <RegisterForm />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-canvas px-4 py-10 text-center text-sm text-muted lg:px-8">
        <p>&copy; 2025 EventConnect. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
