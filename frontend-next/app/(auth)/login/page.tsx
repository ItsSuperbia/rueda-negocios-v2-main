import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      
      <div className="mx-auto grid w-full max-w-[85%] gap-0 overflow-hidden rounded-2xl shadow-2xl lg:grid-cols-2 items-stretch">
        
        {/* Card de Información con transparencia (backdrop-blur) */}
        <div className="flex flex-col justify-center bg-gray-900/80 backdrop-blur-lg p-12 text-white border-r border-white/10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Plataforma Web
          </p>
          
          <h1 className="mt-6 font-[var(--font-heading)] text-4xl font-bold leading-tight xl:text-5xl">
            Orquesta tu rueda de negocios con <span className="text-accent">claridad operativa</span>
          </h1>
          
          <p className="mt-6 text-lg leading-relaxed text-white/70">
            Desde aprobación de usuarios hasta agendamiento inteligente, en un flujo diseñado para equipos de alto rendimiento.
          </p>
          
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 border-l-2 border-white/10 pl-4 py-1 transition hover:border-accent">
              <span className="text-sm font-medium text-white/90">Gestión de Eventos como Administrador</span>
            </div>
            <div className="flex items-center gap-3 border-l-2 border-white/10 pl-4 py-1 transition hover:border-accent">
              <span className="text-sm font-medium text-white/90">Gestión de Asistencias como Demandante</span>
            </div>
            <div className="flex items-center gap-3 border-l-2 border-white/10 pl-4 py-1 transition hover:border-accent">
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
  );
}
