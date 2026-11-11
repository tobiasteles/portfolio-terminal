"use client";

import { useEffect } from "react";
import { ds } from "@/components/universo/ds";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-bh-void px-6 font-display text-bh-text">
      <div className="text-center">
        <p className={ds.eyebrow}>{"// erro inesperado"}</p>
        <h1 className="mt-2 text-3xl font-semibold text-bh-flare">Algo saiu da órbita</h1>
        <p className="mt-3 text-bh-mute">Não foi possível concluir a operação.</p>
        {error.digest && <p className="mt-1 font-code text-xs text-bh-mute">código: {error.digest}</p>}
        <button type="button" onClick={reset} className={`mt-6 ${ds.btnPrimary}`}>
          Tentar de novo
        </button>
      </div>
    </main>
  );
}
