"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
}

const linksByRole: Record<string, NavLink[]> = {
  adminSistema: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/usuarios", label: "Usuarios" },
    { href: "/eventos", label: "Eventos" },
    { href: "/mensajes", label: "Mensajería" },
    { href: "/reuniones", label: "Reuniones" }
  ],
  adminEvento: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/eventos", label: "Eventos" },
    { href: "/reuniones", label: "Reuniones" }
  ],
  ofertante: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/eventos", label: "Eventos" },
    { href: "/mensajes", label: "Mensajería" },
    { href: "/reuniones", label: "Reuniones" }
  ],
  demandante: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/eventos", label: "Eventos" },
    { href: "/mensajes", label: "Mensajería" },
    { href: "/reuniones", label: "Reuniones" }
  ]
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const navLinks = useMemo(() => linksByRole[role ?? ""] ?? [], [role]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 lg:flex-row lg:gap-6 lg:px-6">
      <aside className="rounded-xl2 bg-white/90 p-4 shadow-card ring-1 ring-slate-100 lg:sticky lg:top-6 lg:h-fit lg:w-72">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Rueda de Negocios</p>
          <h2 className="mt-1 font-[var(--font-heading)] text-xl font-bold">Panel {role}</h2>
          <p className="mt-2 text-sm text-muted">{user?.nombreEmpresa ?? user?.email ?? "Usuario"}</p>
        </div>

        <nav className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition",
                  isActive ? "bg-accent text-white" : "bg-slate-100/70 text-ink hover:bg-slate-200"
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Button
          className="mt-6 w-full"
          variant="ghost"
          onClick={() => {
            clearSession();
            router.replace("/login");
          }}
        >
          Cerrar sesión
        </Button>
      </aside>

      <main className="mt-4 w-full lg:mt-0">{children}</main>
    </div>
  );
}
