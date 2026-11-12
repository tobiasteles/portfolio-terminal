/**
 * Órbitas dos projetos em destaque, seguindo as leis de Kepler:
 *  1ª lei: cada órbita é uma elipse e o buraco negro fica num dos focos;
 *  2ª lei: a linha buraco negro -> planeta varre áreas iguais em tempos iguais (mais rápido perto);
 *  3ª lei: T² é proporcional a a³ (órbitas maiores demoram mais, na proporção certa).
 */
export type KeplerOrbit = {
  /** semieixo maior (unidades da cena) */
  a: number;
  /** excentricidade (0 = círculo) */
  e: number;
  /** rotação da elipse no plano da órbita */
  omega: number;
  /** ponto da órbita onde o planeta começa (anomalia média inicial, em rad) */
  phase: number;
};

export const KEPLER_ORBITS: KeplerOrbit[] = [
  { a: 8.6, e: 0.12, omega: 0.6, phase: 0.2 },
  { a: 10.4, e: 0.26, omega: 2.5, phase: 2.3 },
  { a: 12.2, e: 0.34, omega: 4.4, phase: 4.4 },
];

/** Período da órbita menor, em segundos. Os outros saem da 3ª lei: T = T0 · (a / a0)^1,5. */
const T0 = 36;
const A0 = KEPLER_ORBITS[0].a;
export const keplerPeriod = (o: KeplerOrbit) => T0 * Math.pow(o.a / A0, 1.5);

/** Resolve M = E - e·sen(E) (equação de Kepler) por Newton. */
export function eccentricAnomaly(M: number, e: number) {
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 6; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

/** Posição no plano da órbita (x, z) com o foco (buraco negro) na origem, no tempo t (s). */
export function keplerPosition(o: KeplerOrbit, t: number, out: { x: number; z: number }) {
  const M = o.phase + (2 * Math.PI * t) / keplerPeriod(o);
  const E = eccentricAnomaly(M, o.e);
  const b = o.a * Math.sqrt(1 - o.e * o.e);
  const px = o.a * (Math.cos(E) - o.e);
  const pz = b * Math.sin(E);
  const c = Math.cos(o.omega);
  const s = Math.sin(o.omega);
  out.x = px * c - pz * s;
  out.z = px * s + pz * c;
  return out;
}

/** Distância ao buraco negro no tempo t. */
export function keplerRadius(o: KeplerOrbit, t: number) {
  const p = keplerPosition(o, t, { x: 0, z: 0 });
  return Math.hypot(p.x, p.z);
}
