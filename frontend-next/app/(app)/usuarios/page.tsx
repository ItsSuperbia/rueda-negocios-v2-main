import dynamic from "next/dynamic";

const UserManagementBoard = dynamic(
  () => import("@/features/usuarios/components/user-management-board").then((mod) => mod.UserManagementBoard),
  {
    loading: () => <p className="text-sm text-muted">Cargando módulo de usuarios...</p>
  }
);

export default function UsuariosPage() {
  return <UserManagementBoard />;
}
