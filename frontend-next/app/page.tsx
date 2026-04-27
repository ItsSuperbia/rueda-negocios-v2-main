import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-4 py-5 lg:px-8">
          <Link className="font-[var(--font-heading)] text-xl font-bold" href="/">
            EventConnect
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <a className="rounded-xl px-3 py-2 text-sm font-semibold text-accent" href="#inicio">
              Inicio
            </a>
            <a className="rounded-xl px-3 py-2 text-sm font-semibold text-ink/80 transition hover:bg-white" href="#servicios">
              Servicios
            </a>
            <Link
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
              href="/login"
            >
              Iniciar Sesion
            </Link>
            <Link className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-95" href="/register">
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <header id="inicio" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(244,162,97,0.22),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(15,139,141,0.2),transparent_30%),linear-gradient(120deg,#fefcf7_0%,#ecf5f4_100%)]" />
        <div className="mx-auto grid w-full max-w-[88rem] gap-12 px-4 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          <div className="fade-up">
            <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              Conectando Empresas con
              <br />
              Oportunidades Reales
            </h1>
            <p className="mt-8 max-w-2xl text-base text-muted sm:text-lg">
              Facilitamos la conexion entre empresas y emprendedores con recintos de primer nivel. Gestiona tus citas, encuentra
              proveedores y expande tu red profesional.
            </p>

            <div className="mt-12 grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-rows-2">
              <div className="flex w-full justify-center">
                <Link
                  className="inline-flex min-h-[64px] w-full items-center justify-center rounded-xl bg-accent px-5 py-4 text-lg font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-lg animate-[fadeUp_420ms_ease-out_both]"
                  href="/register"
                >
                  Empezar Ahora
                </Link>
              </div>

              <div className="flex w-full justify-center">
                <a
                  className="inline-flex min-h-[64px] w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-4 text-lg font-semibold text-ink transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg animate-[fadeUp_420ms_ease-out_both]"
                  href="#como-funciona"
                >
                  Saber Mas
                </a>
              </div>
            </div>

          </div>

          <div className="fade-up grid gap-7 sm:grid-cols-2">
            <div className="group relative min-h-[22rem] overflow-hidden rounded-xl2 shadow-card ring-1 ring-slate-200 sm:col-span-2 lg:min-h-[26rem]">
              <Image
                src="/images/hero/hero_main_img.jpg"
                alt="Networking empresarial en rueda de negocios"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
            </div>

            <div className="group relative min-h-[16rem] overflow-hidden rounded-xl2 shadow-card ring-1 ring-slate-200 lg:min-h-[18rem]">
              <Image
                src="/images/hero/hero_sec_img_left.jpg"
                alt="Cierre de acuerdos entre participantes"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
            </div>

            <div className="group relative min-h-[16rem] overflow-hidden rounded-xl2 shadow-card ring-1 ring-slate-200 lg:min-h-[18rem]">
              <Image
                src="/images/hero/hero_sec_img_right.jpg"
                alt="Centro de convenciones durante evento empresarial"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
            </div>
          </div>
        </div>
      </header>

      <section className="px-4 pb-14 lg:px-8" id="como-funciona">
        <div className="mx-auto max-w-[88rem] rounded-xl2 border border-slate-200 bg-white/80 p-8 shadow-card lg:p-10">
          <h2 className="font-[var(--font-heading)] text-2xl font-bold">Como Funciona</h2>
          <p className="mt-4 max-w-4xl text-sm text-muted">
            Centraliza registro, matchmaking, agenda y seguimiento en una experiencia comercial unificada para organizadores,
            ofertantes y demandantes.
          </p>
        </div>
      </section>

      <section className="px-4 py-20 lg:px-8" id="servicios">
        <div className="mx-auto w-full max-w-[88rem]">
          <h2 className="text-center font-[var(--font-heading)] text-3xl font-bold">Potenciando a Empresas y MiPymes</h2>
          <p className="mx-auto mt-5 max-w-3xl text-center text-sm text-muted">Una plataforma integral para organizar eventos de impacto.</p>

          <div className="mt-12 space-y-8 lg:space-y-10">
            <section className="relative min-h-[18rem] overflow-hidden rounded-xl2 shadow-card ring-1 ring-slate-200 lg:min-h-[20rem]">
              <Image
                src="/images/hero/hero_serv_room_img.jpg"
                alt="Reserva de espacios en centro de convenciones"
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/10" />
              <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end p-8 text-white lg:p-10">
                <p className="text-3xl">📅</p>
                <h3 className="mt-3 text-2xl font-semibold">Reserva Facil</h3>
                <p className="mt-2 text-sm text-white/85">
                  Reserva tu espacio ideal en el Centro de Convenciones con nuestro proceso simplificado.
                </p>
              </div>
            </section>

            <section className="relative min-h-[18rem] overflow-hidden rounded-xl2 shadow-card ring-1 ring-slate-200 lg:min-h-[20rem]">
              <Image
                src="/images/hero/hero_serv_reunions_img.jpg"
                alt="Matchmaking empresarial entre empresas"
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/10" />
              <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end p-8 text-white lg:p-10">
                <p className="text-3xl">🤝</p>
                <h3 className="mt-3 text-2xl font-semibold">Matchmaking Inteligente</h3>
                <p className="mt-2 text-sm text-white/85">Conecta automaticamente con empresas que buscan lo que tu ofreces.</p>
              </div>
            </section>

            <section className="relative min-h-[18rem] overflow-hidden rounded-xl2 shadow-card ring-1 ring-slate-200 lg:min-h-[20rem]">
              <Image
                src="/images/hero/hero_serv_deals_img.jpg"
                alt="Agenda y reuniones empresariales con seguimiento"
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/10" />
              <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end p-8 text-white lg:p-10">
                <p className="text-3xl">📊</p>
                <h3 className="mt-3 text-2xl font-semibold">Agenda Digital</h3>
                <p className="mt-2 text-sm text-white/85">
                  Gestiona todas tus reuniones en un solo lugar con notificaciones en tiempo real.
                </p>
              </div>
            </section>

          </div>
        </div>
      </section>

      <section className="bg-surface/60 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-[var(--font-heading)] text-3xl font-bold">Listo para expandir tu negocio?</h2>
          <p className="mt-5 text-sm text-muted">Unete a cientos de empresas que ya estan cerrando negocios.</p>
          <Link className="mt-8 inline-flex rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95" href="/register">
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-canvas px-4 py-10 text-center text-sm text-muted lg:px-8">
        <p>&copy; 2025 EventConnect. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
