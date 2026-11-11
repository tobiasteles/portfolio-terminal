import type { Metadata } from "next";
import Link from "next/link";
import { ds } from "@/components/universo/ds";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bh-void px-6 font-display text-bh-text">
      <div className="text-center">
        <p className={ds.eyebrow}>{"// erro 404"}</p>
        <h1 className="mt-2 text-4xl font-semibold text-bh-flare sm:text-5xl">Além do horizonte de eventos</h1>
        <p className="mx-auto mt-3 max-w-md text-bh-mute">
          Essa página não existe, ou foi engolida por um buraco negro. Daqui não volta nem a luz, mas o botão abaixo
          leva você de volta.
        </p>
        <Link href="/" className={`mt-6 ${ds.btnPrimary}`}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
