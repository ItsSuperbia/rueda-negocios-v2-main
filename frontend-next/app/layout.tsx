import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-body" });
const headingFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Rueda de Negocios | Plataforma SaaS",
  description: "Gestión de eventos, matchmaking y reuniones empresariales multi-rol.",
  icons: {
    icon: "/images/icons/icon_favicon_EventConnect.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${bodyFont.variable} ${headingFont.variable} font-[var(--font-body)] text-ink antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
