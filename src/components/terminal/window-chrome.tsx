/** Barra de título no estilo do Windows Terminal: aba "Prompt de Comando" e botões da janela. */

function CmdIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <rect x="0.5" y="2.5" width="15" height="11" rx="1.5" fill="#0c0c0c" stroke="#cccccc" />
      <path d="M3.5 6l2.2 1.7L3.5 9.4M7.3 10h3" fill="none" stroke="#cccccc" strokeWidth="1" />
    </svg>
  );
}

const ctl = "flex h-full w-10 items-center justify-center sm:w-12";

export function WindowChrome() {
  return (
    <div
      aria-hidden="true"
      className="flex h-10 shrink-0 select-none items-end bg-term-panel pl-2 text-[13px] text-term-fg"
    >
      <div className="flex h-9 min-w-0 items-center gap-2 rounded-t-lg bg-term-bg pl-3 pr-2">
        <CmdIcon />
        <span className="truncate">Prompt de Comando</span>
        <span className="ml-3 text-xs text-term-dim">✕</span>
      </div>
      <span className="hidden h-9 w-9 items-center justify-center text-lg text-term-dim sm:flex">+</span>
      <span className="hidden h-9 w-7 items-center justify-center text-xs text-term-dim sm:flex">⌵</span>

      <div className="ml-auto flex h-full">
        <span className={ctl}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5h10" stroke="#cccccc" /></svg>
        </span>
        <span className={ctl}>
          <svg width="10" height="10" viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="#cccccc" /></svg>
        </span>
        <span className={ctl}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 0l10 10M10 0L0 10" stroke="#cccccc" /></svg>
        </span>
      </div>
    </div>
  );
}
