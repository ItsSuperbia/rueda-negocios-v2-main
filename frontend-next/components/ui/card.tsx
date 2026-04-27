import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article className={cn("rounded-xl2 bg-white/90 p-5 shadow-card ring-1 ring-slate-100", className)}>
      {children}
    </article>
  );
}
