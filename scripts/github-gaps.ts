/**
 * Compara o seu GitHub (só repositórios PÚBLICOS) com o que já está no site e mostra o que falta:
 *   1. projetos públicos que ainda não estão cadastrados, com um palpite de "parece completo" ou "parece incompleto";
 *   2. tecnologias que aparecem nos seus repositórios, mas não estão na lista de Tecnologias.
 *
 * Uso (na pasta do projeto, com o .env.local preenchido):
 *   npx tsx scripts/github-gaps.ts SEU-USUARIO
 *   npx tsx scripts/github-gaps.ts SEU-USUARIO --incompletos     # mostra só os que parecem incompletos ou pela metade
 *   npx tsx scripts/github-gaps.ts SEU-USUARIO --site site.json  # sem banco: compara com um arquivo
 *
 * O arquivo do --site tem o formato: { "projects": [{ "title": "", "githubUrl": "", "technologies": [] }],
 * "skills": [{ "name": "" }] }.
 *
 * "Completo" é só um palpite feito com sinais públicos (descrição, README, link de deploy, atividade recente,
 * se não está arquivado e tamanho). Quem decide é você.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { techCoveredBySkills } from "../src/lib/skill-match";
import { listPublicRepos, readmeLength, RateLimitError, techsOfRepo, type Repo } from "./lib/github";

const args = process.argv.slice(2);
const user = args.find((a) => !a.startsWith("--"));
const onlyIncomplete = args.includes("--incompletos");
const siteIdx = args.indexOf("--site");
const siteFile = siteIdx >= 0 ? args[siteIdx + 1] : null;

if (!user) {
  console.error("Uso: npx tsx scripts/github-gaps.ts SEU-USUARIO [--incompletos] [--site arquivo.json]");
  process.exit(1);
}

type Site = {
  projects: { title: string; githubUrl: string | null; technologies: string[] }[];
  skills: { name: string }[];
};

async function loadSite(): Promise<Site> {
  if (siteFile) return JSON.parse(readFileSync(siteFile, "utf8")) as Site;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida (.env.local). Ou use --site arquivo.json.");
  const db = drizzle(neon(url), { schema });
  const [projects, skills] = await Promise.all([db.select().from(schema.projects), db.select().from(schema.skills)]);
  return { projects, skills };
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
const urlKey = (u: string | null) => (u ? u.toLowerCase().replace(/^https?:\/\//, "").replace(/\.git$/, "").replace(/\/+$/, "") : "");

function isOnSite(repo: Repo, site: Site) {
  const rk = urlKey(repo.html_url);
  return site.projects.some((p) => urlKey(p.githubUrl) === rk || norm(p.title) === norm(repo.name));
}

type Verdict = { label: "parece completo" | "pela metade" | "parece incompleto"; score: number; reasons: string[] };

function judge(repo: Repo, readme: number): Verdict {
  const reasons: string[] = [];
  let score = 0;
  const monthsSincePush = (Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (repo.description?.trim()) score++;
  else reasons.push("sem descrição");
  if (readme >= 400) score++;
  else reasons.push(readme === 0 ? "sem README" : "README curto");
  if (repo.homepage?.trim()) score++;
  else reasons.push("sem link do projeto no ar");
  if (monthsSincePush <= 12) score++;
  else reasons.push(`parado há ${Math.round(monthsSincePush)} meses`);
  if (!repo.archived) score++;
  else reasons.push("arquivado");
  if (repo.size >= 50) score++;
  else reasons.push("repositório muito pequeno");

  const label = score >= 5 ? "parece completo" : score >= 3 ? "pela metade" : "parece incompleto";
  return { label, score, reasons };
}

async function main() {
  const site = await loadSite();
  const repos = await listPublicRepos(user!);
  console.log(
    `Site: ${site.projects.length} projetos e ${site.skills.length} tecnologias cadastrados. GitHub: ${repos.length} repositórios públicos próprios.\n`,
  );

  const missingRepos: { repo: Repo; verdict: Verdict }[] = [];
  const techYears = new Map<string, { since: number; repos: string[] }>();
  let partial = false;

  try {
    for (const repo of repos) {
      const year = new Date(repo.created_at).getFullYear();
      for (const tech of await techsOfRepo(user!, repo.name)) {
        const cur = techYears.get(tech) ?? { since: year, repos: [] };
        cur.since = Math.min(cur.since, year);
        cur.repos.push(repo.name);
        techYears.set(tech, cur);
      }
      if (!isOnSite(repo, site)) missingRepos.push({ repo, verdict: judge(repo, await readmeLength(user!, repo.name)) });
    }
  } catch (e) {
    if (e instanceof RateLimitError) {
      partial = true;
      console.log(`⚠ ${e.message} O resultado abaixo é parcial.\n`);
    } else throw e;
  }

  // 1) projetos que faltam
  const order = { "parece completo": 0, "pela metade": 1, "parece incompleto": 2 } as const;
  const shown = missingRepos
    .filter((m) => !onlyIncomplete || m.verdict.label !== "parece completo")
    .sort((a, b) => order[a.verdict.label] - order[b.verdict.label] || b.verdict.score - a.verdict.score);

  console.log(`== Projetos públicos que NÃO estão no site (${shown.length}${onlyIncomplete ? ", só incompletos/pela metade" : ""}) ==`);
  if (shown.length === 0) console.log("Nenhum. Tudo que é público já está no site.");
  for (const { repo, verdict } of shown) {
    console.log(`\n• ${repo.name}  [${verdict.label}, ${verdict.score}/6]`);
    console.log(`  ${repo.html_url}`);
    if (repo.description) console.log(`  ${repo.description}`);
    console.log(`  criado em ${new Date(repo.created_at).getFullYear()}${verdict.reasons.length ? ` · ${verdict.reasons.join(", ")}` : ""}`);
  }

  // 2) tecnologias que faltam
  const skillNames = site.skills.map((s) => s.name);
  const missingTechs = [...techYears.entries()]
    .filter(([tech]) => !techCoveredBySkills(tech, skillNames))
    .sort((a, b) => b[1].repos.length - a[1].repos.length || a[1].since - b[1].since);

  console.log(`\n\n== Tecnologias dos seus repositórios que NÃO estão na lista do site (${missingTechs.length}) ==`);
  if (missingTechs.length === 0) console.log("Nenhuma. A lista do site já cobre tudo que o script detecta.");
  for (const [tech, info] of missingTechs) {
    console.log(`• ${tech.padEnd(22)} desde ${info.since}  (${info.repos.length} repo${info.repos.length > 1 ? "s" : ""}: ${info.repos.slice(0, 3).join(", ")})`);
  }

  console.log("\nComo usar: cadastre os projetos em /admin/projects e as tecnologias em /admin/skills (com o ano em 'desde').");
  console.log("O veredicto 'completo/incompleto' é um palpite por sinais públicos; confira cada repositório.");
  if (partial) console.log("Lembrete: o resultado é parcial por causa do limite do GitHub.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
