/**
 * Design system do "Universo": as cores (bh-*) e as fontes (font-display, font-code)
 * ficam no tailwind.config.ts; aqui ficam as receitas de componente reaproveitadas.
 * Para mudar o visual do site inteiro, mexa só nesses dois lugares.
 */
export const ds = {
  /** Vidro escuro: painéis e barras sobre o espaço. */
  glass: "border border-bh-line bg-bh-surface/70 backdrop-blur-md",

  /** Rótulo pequeno em fonte de código, estilo comentário: // assim */
  eyebrow: "font-code text-[11px] uppercase tracking-[0.18em] text-bh-mute",

  /** Chip de tecnologia (não clicável). */
  tag: "rounded-full border border-bh-line px-2.5 py-0.5 font-code text-xs text-bh-amber",

  /** Chip clicável (dock dos projetos). */
  chip:
    "shrink-0 rounded-full border border-bh-line bg-bh-surface/60 px-3.5 py-1.5 font-code text-xs text-bh-text " +
    "transition hover:border-bh-ember hover:text-bh-flare aria-pressed:border-bh-ember aria-pressed:bg-bh-ember/15 aria-pressed:text-bh-flare",

  /** Botão principal: brilho de disco de acreção. */
  btnPrimary:
    "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-bh-amber to-bh-ember px-4 py-2 font-display text-sm font-semibold " +
    "text-bh-void no-underline transition hover:brightness-110",

  /** Botão secundário. */
  btnGhost:
    "inline-flex items-center gap-2 rounded-full border border-bh-line px-4 py-2 font-display text-sm text-bh-text no-underline " +
    "transition hover:border-bh-ember hover:text-bh-flare",

  /** Campo de formulário. */
  field:
    "w-full rounded-lg border border-bh-line bg-bh-void/60 px-3 py-2 text-sm text-bh-text placeholder:text-bh-mute/60 " +
    "focus:border-bh-ember focus:outline-none",

  /** Link de texto dentro de painéis. */
  link: "text-bh-amber underline decoration-bh-amber/40 underline-offset-4 hover:decoration-bh-amber",

  /** Painel de conteúdo (Sobre, Tecnologias, Perguntas, Contato, Projeto). */
  panel:
    "pointer-events-auto max-h-[62dvh] overflow-y-auto rounded-2xl p-5 sm:p-6 " +
    "sm:absolute sm:right-8 sm:top-1/2 sm:max-h-[78dvh] sm:w-[28rem] sm:-translate-y-1/2",
} as const;
