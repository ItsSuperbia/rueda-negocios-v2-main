import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantMap: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:opacity-95",
  secondary: "bg-white/70 text-ink ring-1 ring-slate-200 hover:bg-white",
  danger: "bg-danger text-white hover:opacity-95",
  ghost: "bg-transparent text-ink hover:bg-slate-100"
};

export function Button({ className, variant = "primary", loading, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60",
        variantMap[variant],
        className
      )}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? "Procesando..." : children}
    </button>
  );
}
