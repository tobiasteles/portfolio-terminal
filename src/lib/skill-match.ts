/**
 * Liga cada tecnologia (skill) aos projetos que a usam, comparando com as tags de tecnologia de cada projeto.
 * Assim o site mostra "usada em N projetos" (algo que dá para conferir) em vez de uma porcentagem.
 */

const strip = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+#]/g, "");

// Nomes diferentes da mesma tecnologia (já sem acento, espaço e pontuação).
const ALIAS: Record<string, string> = {
  nextjs: "next",
  nodejs: "node",
  reactjs: "react",
  reactquery: "tanstackquery",
  postgres: "postgresql",
  tailwind: "tailwindcss",
  js: "javascript",
  ts: "typescript",
  neondb: "neon",
  drizzleorm: "drizzle",
  vitejs: "vite",
};
const canon = (s: string) => {
  const k = strip(s);
  return ALIAS[k] ?? k;
};

/** "Clerk (Autenticação / Auth)" -> ["clerk", "autenticacao", "auth"] */
function skillTokens(name: string) {
  return name
    .split(/[\/&()+,]| e /i)
    .map((t) => canon(t))
    .filter((t) => t.length >= 2);
}

export function projectsUsing<T extends { technologies: string[] }>(skillName: string, projects: T[]): T[] {
  const tokens = skillTokens(skillName);
  return projects.filter((p) => {
    const techs = p.technologies.map(canon);
    return tokens.some((t) => techs.includes(t));
  });
}

/** A tecnologia já está coberta por alguma das tecnologias cadastradas no site? */
export function techCoveredBySkills(tech: string, skillNames: string[]) {
  return skillNames.some((name) => projectsUsing(name, [{ technologies: [tech] }]).length > 0);
}
