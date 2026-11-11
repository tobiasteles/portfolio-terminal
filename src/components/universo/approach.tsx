/** Tela de carregando: um buraco negro que cresce, como quem se aproxima dele. Funciona sem JavaScript. */
export function Approach({ label = "aproximando…" }: { label?: string }) {
  return (
    <div className="grid place-items-center" role="status" aria-live="polite">
      <div aria-hidden="true" className="relative h-40 w-40">
        <div className="absolute inset-0 animate-approach motion-reduce:animate-none">
          <div className="absolute left-1/2 top-1/2 h-[26%] w-full -translate-x-1/2 -translate-y-1/2 -rotate-[20deg] rounded-[50%] bg-[radial-gradient(ellipse_closest-side,#fff1c2_0%,#ffb454_28%,#ff5a1a_58%,transparent_100%)]" />
          <div className="absolute left-1/2 top-1/2 h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_0_2px_#ffe9b8,0_0_40px_8px_rgba(255,122,26,0.55)]" />
        </div>
      </div>
      <p className="mt-8 font-code text-[11px] uppercase tracking-[0.18em] text-bh-mute">{label}</p>
    </div>
  );
}
