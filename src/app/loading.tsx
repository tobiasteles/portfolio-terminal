import { Approach } from "@/components/universo/approach";

export default function Loading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bh-void font-display" aria-busy="true">
      <Approach label="aproximando do horizonte de eventos…" />
    </main>
  );
}
