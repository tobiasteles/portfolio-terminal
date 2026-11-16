/** Funções compartilhadas pelos scripts que olham o seu GitHub. Só lê repositórios PÚBLICOS. */

export type Repo = {
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  fork: boolean;
  archived: boolean;
  size: number; // KB
  created_at: string;
  pushed_at: string;
};

const token = process.env.GITHUB_TOKEN; // opcional: só aumenta o limite de requisições, não dá acesso a privados
const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "portfolio-github-scripts",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

export class RateLimitError extends Error {}

export async function gh<T>(path: string): Promise<T | null> {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (res.status === 404) return null;
  if (res.status === 403 || res.status === 429) {
    throw new RateLimitError("Limite de requisições do GitHub atingido. Tente mais tarde ou use GITHUB_TOKEN.");
  }
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status} em ${path}`);
  return (await res.json()) as T;
}

/** Repositórios públicos próprios (sem forks). */
export async function listPublicRepos(user: string): Promise<Repo[]> {
  const repos = (await gh<Repo[]>(`/users/${user}/repos?per_page=100&type=owner&sort=created`)) ?? [];
  return repos.filter((r) => !r.fork);
}

// dependência do package.json -> nome da tecnologia
export const DEPS: Record<string, string> = {
  next: "Next.js",
  react: "React",
  tailwindcss: "Tailwind CSS",
  vite: "Vite",
  "@tanstack/react-query": "TanStack Query",
  "@clerk/nextjs": "Clerk",
  "@clerk/clerk-react": "Clerk",
  "drizzle-orm": "Drizzle ORM",
  "@neondatabase/serverless": "Neon",
  three: "Three.js",
  "@react-three/fiber": "React Three Fiber",
  zod: "Zod",
  "react-hook-form": "React Hook Form",
  express: "Express",
  prisma: "Prisma",
  "@prisma/client": "Prisma",
  "@google/genai": "Google GenAI SDK",
  "@google/generative-ai": "Google GenAI SDK",
  typescript: "TypeScript",
  vue: "Vue",
  svelte: "Svelte",
  angular: "Angular",
  "@angular/core": "Angular",
  "styled-components": "styled-components",
  "framer-motion": "Framer Motion",
  mongoose: "MongoDB (Mongoose)",
  "socket.io": "Socket.IO",
  jest: "Jest",
  vitest: "Vitest",
  "@supabase/supabase-js": "Supabase",
  firebase: "Firebase",
  "@trpc/server": "tRPC",
};

export const LANGS: Record<string, string> = {
  TypeScript: "TypeScript",
  JavaScript: "JavaScript",
  Python: "Python",
  PLpgSQL: "PostgreSQL",
  Java: "Java",
  PHP: "PHP",
  "C#": "C#",
  Go: "Go",
  Rust: "Rust",
  Dockerfile: "Docker",
};

/** Tecnologias que aparecem num repositório (linguagens + dependências do package.json). */
export async function techsOfRepo(user: string, repo: string): Promise<Set<string>> {
  const techs = new Set<string>();

  const langs = await gh<Record<string, number>>(`/repos/${user}/${repo}/languages`);
  for (const l of Object.keys(langs ?? {})) if (LANGS[l]) techs.add(LANGS[l]);

  const file = await gh<{ content: string }>(`/repos/${user}/${repo}/contents/package.json`);
  if (file?.content) {
    try {
      const pkg = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;
      for (const dep of Object.keys(deps)) if (DEPS[dep]) techs.add(DEPS[dep]);
    } catch {
      /* package.json inválido: ignora */
    }
  }
  return techs;
}

/** Tamanho do README em caracteres (0 se não existir). */
export async function readmeLength(user: string, repo: string): Promise<number> {
  const r = await gh<{ content: string }>(`/repos/${user}/${repo}/readme`);
  return r?.content ? Buffer.from(r.content, "base64").toString("utf8").trim().length : 0;
}
