import type { Metadata } from "next";
import Link from "next/link";
import { WindowChrome } from "@/components/terminal/window-chrome";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <WindowChrome />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <p>{"C:\\Users\\visitante>"} cd pagina-que-voce-procurou</p>
        <p className="mt-1">O sistema não pode encontrar o caminho especificado.</p>
        <p className="mt-1 text-term-dim">Erro 404</p>
        <p className="mt-6">
          <Link href="/" className="btn btn-primary no-underline">
            cd \ (voltar ao início)
          </Link>
        </p>
      </main>
    </div>
  );
}
