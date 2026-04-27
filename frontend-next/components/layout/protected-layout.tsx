"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const restrictedByRole: Record<string, string[]> = {
  adminSistema: ["/usuarios", "/eventos", "/dashboard", "/mensajes", "/reuniones"],
  adminEvento: ["/eventos", "/dashboard", "/mensajes", "/reuniones"],
  ofertante: ["/dashboard", "/eventos", "/mensajes", "/reuniones"],
  demandante: ["/dashboard", "/eventos", "/mensajes", "/reuniones"]
};

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) return;

    if (!token || !role) {
      router.replace("/login");
      return;
    }

    const allowedRoutes = restrictedByRole[role] ?? ["/dashboard"];
    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      router.replace("/dashboard");
    }
  }, [hydrated, pathname, role, router, token]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Cargando sesión...</p>
      </div>
    );
  }

  if (!token || !role) {
    return null;
  }

  return <>{children}</>;
}
