import Link from "next/link";
import type { ReactNode } from "react";
import { WindowChrome } from "@/components/terminal/window-chrome";

/** Moldura das páginas de texto (privacidade, termos): mesma janela de Prompt de Comando do site. */
export function LegalShell({ command, children }: { command: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <WindowChrome />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <p className="break-words">
          {"C:\\Users\\visitante>"} {command}
        </p>
        <article className="mt-5 max-w-[68ch] space-y-4 leading-relaxed">{children}</article>
        <p className="mt-10">
          <Link href="/">← voltar ao terminal</Link>
        </p>
      </main>
    </div>
  );
}

export const H = ({ children }: { children: ReactNode }) => (
  <h2 className="pt-3 text-lg font-bold text-term-neon">{children}</h2>
);
