import Link from "next/link";
import type { ReactNode } from "react";
import { ds } from "@/components/universo/ds";

/** Moldura das páginas de texto (privacidade, termos): mesmo universo do site. O prop `command` é ignorado (sobrou do tema antigo). */
export function LegalShell({ children }: { command?: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bh-void font-display text-bh-text">
      <main className="mx-auto w-full max-w-3xl px-5 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <Link href="/" className={`${ds.eyebrow} no-underline hover:text-bh-flare`}>
          ← voltar ao universo
        </Link>
        <article className="mt-5 max-w-[68ch] space-y-4 leading-relaxed text-bh-text/90 [&_a]:text-bh-amber [&_a]:decoration-bh-amber/40 [&_h1]:text-bh-flare [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </article>
      </main>
    </div>
  );
}

export const H = ({ children }: { children: ReactNode }) => (
  <h2 className="pt-3 text-lg font-semibold text-bh-amber">{children}</h2>
);
