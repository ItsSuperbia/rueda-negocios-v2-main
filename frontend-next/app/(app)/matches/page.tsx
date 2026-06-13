// app/(app)/matches/page.tsx

import dynamic from "next/dynamic";

const MatchesWorkspace = dynamic(
  () =>
    import("@/features/matches/components/matches-workspace")
      .then((mod) => mod.MatchesWorkspace),
  {
    loading: () => (
      <p className="text-sm text-muted">
        Cargando matches...
      </p>
    )
  }
);

export default function MatchesPage() {
    return <MatchesWorkspace />;
  console.log("MATCHES PAGE");

  return (
    <div>
      <h1>MATCHES PAGE</h1>
    </div>
  );
}