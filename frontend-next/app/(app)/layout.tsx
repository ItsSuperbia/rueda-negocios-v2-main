import { AppShell } from "@/components/layout/app-shell";
import { ProtectedLayout } from "@/components/layout/protected-layout";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <AppShell>{children}</AppShell>
    </ProtectedLayout>
  );
}
