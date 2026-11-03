"use client";

import { useEffect } from "react";

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
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <p>{"C:\\Users\\visitante>"} carregar-portfolio</p>
      <p className="mt-1 text-term-danger">Ocorreu um erro inesperado e não foi possível concluir a operação.</p>
      {error.digest && <p className="mt-1 text-sm text-term-dim">código: {error.digest}</p>}
      <button type="button" onClick={reset} className="btn btn-primary mt-6">
        tentar de novo
      </button>
    </main>
  );
}
