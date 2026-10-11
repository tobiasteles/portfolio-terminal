/**
 * Popula o banco: cria/atualiza o usuário admin e insere conteúdo de exemplo
 * (apenas nas tabelas que estiverem vazias).
 *
 * Uso: npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

async function main() {
  const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!DATABASE_URL) throw new Error("DATABASE_URL não definida.");
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD.");
  if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD precisa ter 8+ caracteres.");

  const db = drizzle(neon(DATABASE_URL), { schema });

  // 1) Admin (cria ou atualiza a senha)
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  await db
    .insert(schema.users)
    .values({ email, passwordHash })
    .onConflictDoUpdate({ target: schema.users.email, set: { passwordHash } });
  console.log(`✔ admin: ${email}`);

  // 2) Perfil (não sobrescreve se já existir)
  await db
    .insert(schema.profile)
    .values({
      id: 1,
      name: "Seu Nome",
      headline: "Desenvolvedor Full Stack",
      bio: "Desenvolvo aplicações web do banco de dados à interface.\nGosto de código limpo, interfaces rápidas e de resolver problemas reais.",
      location: "Brasília, DF",
      email,
      resumeUrl: "/curriculo.pdf",
      githubUrl: "https://github.com/seu-usuario",
      linkedinUrl: "https://www.linkedin.com/in/seu-usuario",
    })
    .onConflictDoNothing();
  console.log("✔ perfil");

  // 3) Skills
  const [{ value: skillCount }] = await db.select({ value: count() }).from(schema.skills);
  if (skillCount === 0) {
    await db.insert(schema.skills).values([
      { category: "frontend", name: "React", level: 90 },
      { category: "frontend", name: "Next.js", level: 90 },
      { category: "frontend", name: "TypeScript", level: 85 },
      { category: "frontend", name: "Tailwind CSS", level: 90 },
      { category: "backend", name: "Node.js", level: 85 },
      { category: "backend", name: "Server Actions / APIs REST", level: 80 },
      { category: "backend", name: "Autenticação (JWT)", level: 70 },
      { category: "database", name: "PostgreSQL", level: 80 },
      { category: "database", name: "Drizzle ORM", level: 75 },
      { category: "database", name: "Neon (serverless)", level: 70 },
      { category: "tools", name: "Git e GitHub", level: 90 },
      { category: "tools", name: "Docker", level: 60 },
      { category: "tools", name: "Vercel", level: 80 },
    ]);
    console.log("✔ skills de exemplo");
  }

  // 4) Projetos
  const [{ value: projectCount }] = await db.select({ value: count() }).from(schema.projects);
  if (projectCount === 0) {
    await db.insert(schema.projects).values([
      {
        title: "Portfólio em Terminal",
        description: "Este site: um terminal interativo com painel admin e banco serverless.",
        technologies: ["Next.js", "TypeScript", "Drizzle", "Neon"],
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/seu-usuario/portfolio-terminal",
        order: 0,
      },
      {
        title: "Projeto de exemplo",
        description: "Substitua por um projeto seu em /admin/projects.",
        technologies: ["React", "Node.js", "PostgreSQL"],
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/seu-usuario/projeto",
        order: 1,
      },
    ]);
    console.log("✔ projetos de exemplo");
  }

  // 5) FAQ
  const [{ value: faqCount }] = await db.select({ value: count() }).from(schema.faqs);
  if (faqCount === 0) {
    await db.insert(schema.faqs).values([
      {
        question: "Você está disponível para novos projetos?",
        answer: "Sim. Use o comando contact e me conte o que você precisa.",
        order: 0,
      },
      {
        question: "Quais tecnologias você mais usa?",
        answer: "React, Next.js, TypeScript, Node.js e PostgreSQL. Veja tudo em skills.",
        order: 1,
      },
      {
        question: "Trabalha remotamente?",
        answer: "Sim, remoto ou híbrido em Brasília.",
        order: 2,
      },
    ]);
    console.log("✔ FAQ de exemplo");
  }

  console.log("\nPronto. Acesse /admin/login com o e-mail e a senha definidos no .env.local.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
