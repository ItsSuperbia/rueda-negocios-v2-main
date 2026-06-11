import dynamic from "next/dynamic";

const ProfileWorkspace = dynamic(
  () => import("@/features/perfil/components/profile-workspace").then((mod) => mod.ProfileWorkspace),
  {
    loading: () => <p className="text-sm text-muted">Cargando módulo de perfil...</p>
  }
);

export default function ProfilePage() {
  return <ProfileWorkspace />;
}