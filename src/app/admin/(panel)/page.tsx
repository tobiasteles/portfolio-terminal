import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { faqs, messages, projects, skills } from "@/db/schema";
import { PageHeader } from "@/components/admin/fields";
import { requireAdmin } from "@/lib/auth";
import { TIMEZONE } from "@/lib/constants";

export default async function DashboardPage() {
  await requireAdmin();

  const [[p], [s], [f], [unread], recent] = await Promise.all([
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(skills),
    db.select({ value: count() }).from(faqs),
    db.select({ value: count() }).from(messages).where(eq(messages.isRead, false)),
    db.select().from(messages).orderBy(desc(messages.createdAt)).limit(5),
  ]);

  const stats = [
    { label: "mensagens não lidas", value: unread.value, href: "/admin/messages" },
    { label: "projetos", value: p.value, href: "/admin/projects" },
    { label: "tecnologias", value: s.value, href: "/admin/skills" },
    { label: "perguntas no faq", value: f.value, href: "/admin/faq" },
  ];

  return (
    <>
      <PageHeader title="painel" description="Resumo do conteúdo do portfólio." />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="card block no-underline transition-colors hover:border-term-neon">
              <span className="block text-3xl font-bold text-term-neon">{item.value}</span>
              <span className="text-sm text-term-dim">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-8">
        <h2 className="mb-3 text-term-amber">últimas mensagens</h2>
        {recent.length === 0 ? (
          <p className="text-term-dim">Nenhuma mensagem recebida ainda.</p>
        ) : (
          <ul className="divide-y divide-term-line border border-term-line">
            {recent.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-3 py-2">
                <span aria-label={m.isRead ? "lida" : "não lida"} className={m.isRead ? "text-term-dim" : "text-term-amber"}>
                  ●
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span className={m.isRead ? "" : "font-bold"}>{m.name}</span>
                  <span className="text-term-dim"> — {m.subject}</span>
                </span>
                <time className="hidden text-xs text-term-dim sm:block" dateTime={m.createdAt.toISOString()}>
                  {m.createdAt.toLocaleDateString("pt-BR", { timeZone: TIMEZONE })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
