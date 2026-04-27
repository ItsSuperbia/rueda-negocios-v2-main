import dynamic from "next/dynamic";

const RoleDashboard = dynamic(
  () => import("@/features/dashboard/components/role-dashboard").then((mod) => mod.RoleDashboard),
  {
    loading: () => <p className="text-sm text-muted">Cargando dashboard...</p>
  }
);

export default function DashboardPage() {
  return <RoleDashboard />;
}
