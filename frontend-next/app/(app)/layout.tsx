import Link from "next/link"
import Image from "next/image";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedLayout } from "@/components/layout/protected-layout";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink ">

      <div>
        <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-canvas/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[120rem] items-center justify-between px-4 py-5 lg:px-8">
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
          </div>
        </nav>
      </div>

      <ProtectedLayout>
        <AppShell>{children}</AppShell>
      </ProtectedLayout>
    </div>
  );
}
