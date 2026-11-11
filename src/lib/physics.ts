/** 1 unidade da cena = 1 / RS_SCENE raios de Schwarzschild (rs). A sombra do buraco negro mede ~2,6 rs. */
export const RS_PER_SCENE_UNIT = 1 / 0.385;

/** Dilatação gravitacional do tempo para um observador parado a r (em rs): 1 hora aqui = f horas lá longe. */
export function dilationFactor(rInRs: number) {
  const x = 1 - 1 / Math.max(rInRs, 1 + 1e-12);
  return 1 / Math.sqrt(Math.max(x, 1e-24));
}

const nf = (digits: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits, minimumFractionDigits: digits });

/** "1,03 h", "5 dias", "7 anos"... */
export function formatLongerTime(hours: number) {
  if (hours < 48) return `${nf(hours < 10 ? 2 : 1).format(hours)} h`;
  const days = hours / 24;
  if (days < 730) return `${nf(0).format(days)} dias`;
  const years = hours / 8766;
  return `${nf(years < 100 ? 1 : 0).format(years)} anos`;
}
