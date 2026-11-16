/**
 * Descobre desde quando você usa cada tecnologia, olhando os seus repositórios no GitHub.
 *
 * Uso:
 *   npx tsx scripts/github-since.ts SEU-USUARIO
 *   GITHUB_TOKEN=ghp_xxx npx tsx scripts/github-since.ts SEU-USUARIO   # só aumenta o limite de requisições
 *
 * Só olha repositórios PÚBLICOS. Para cada um (que não seja fork), lê as linguagens e as dependências do
 * package.json, e anota o ano em que o repositório foi criado. O ano mais antigo de cada tecnologia é um
 * bom ponto de partida para o campo "desde" do admin. Confira antes de usar: o repositório pode ter sido
 * criado depois de você já usar a tecnologia em outro lugar.
 */

import { listPublicRepos, techsOfRepo } from "./lib/github";

const user = process.argv[2];
if (!user) {
  console.error("Uso: npx tsx scripts/github-since.ts SEU-USUARIO");
  process.exit(1);
}

async function main() {
  const repos = await listPublicRepos(user);
  console.log(`${repos.length} repositórios públicos próprios encontrados.\n`);

  const found = new Map<string, { since: number; repos: string[] }>();
  for (const repo of repos) {
    const year = new Date(repo.created_at).getFullYear();
    for (const tech of await techsOfRepo(user, repo.name)) {
      const cur = found.get(tech) ?? { since: year, repos: [] };
      cur.since = Math.min(cur.since, year);
      cur.repos.push(repo.name);
      found.set(tech, cur);
    }
  }

  const rows = [...found.entries()].sort((a, b) => a[1].since - b[1].since || b[1].repos.length - a[1].repos.length);
  console.log("tecnologia".padEnd(22), "desde".padEnd(7), "repositórios");
  console.log("-".repeat(60));
  for (const [tech, info] of rows) {
    console.log(tech.padEnd(22), String(info.since).padEnd(7), `${info.repos.length}: ${info.repos.slice(0, 4).join(", ")}`);
  }
  console.log("\nObs.: o ano é o da criação do repositório mais antigo que usa a tecnologia.");
  console.log("Node.js, Git e Docker não aparecem aqui; preencha à mão se quiser.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
