"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { ds } from "@/components/universo/ds";

// Defina NEXT_PUBLIC_GA_ID (ex.: G-ABC123XYZ). Sem ele, nada é carregado e nenhum aviso aparece.
const RAW_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
const GA_ID = /^G-[A-Z0-9]{4,20}$/.test(RAW_ID) ? RAW_ID : "";
const KEY = "consent-analytics";

type Choice = "granted" | "denied" | null;

export function AnalyticsConsent() {
  const [choice, setChoice] = useState<Choice | undefined>(undefined);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      setChoice(v === "granted" || v === "denied" ? v : null);
    } catch {
      setChoice(null);
    }
  }, []);

  if (!GA_ID || choice === undefined) return null;

  const save = (value: "granted" | "denied") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* navegação privada: a escolha vale só nesta visita */
    }
    setChoice(value);
  };

  return (
    <>
      {choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      {choice === null && (
        <div
          role="dialog"
          aria-label="Aviso de cookies"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-bh-line bg-bh-surface/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm text-bh-text backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center">
            <p className="flex-1">
              Este site usa cookies do Google Analytics para entender quantas pessoas o visitam. Só ativo
              se você aceitar. Detalhes na{" "}
              <a href="/privacidade" className="text-bh-amber">política de privacidade</a>.
            </p>
            <div className="flex gap-2">
              <button type="button" className={`${ds.btnPrimary} flex-1 justify-center sm:flex-none`} onClick={() => save("granted")}>
                aceitar
              </button>
              <button type="button" className={`${ds.btnGhost} flex-1 justify-center sm:flex-none`} onClick={() => save("denied")}>
                recusar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Botão da página de privacidade para a pessoa rever a escolha. */
export function ResetConsentButton() {
  return (
    <button
      type="button"
      className={ds.btnGhost}
      onClick={() => {
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignora */
        }
        window.location.reload();
      }}
    >
      rever minha escolha de cookies
    </button>
  );
}
