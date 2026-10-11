import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { deleteMessage, toggleRead } from "@/app/admin/_actions/messages";
import { PageHeader } from "@/components/admin/fields";
import { DeleteButton } from "@/components/admin/submit-button";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { TIMEZONE } from "@/lib/constants";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdmin();
  const { filter } = await searchParams;
  const onlyUnread = filter === "unread";

  const rows = await db
    .select()
    .from(messages)
    .where(onlyUnread ? eq(messages.isRead, false) : undefined)
    .orderBy(desc(messages.createdAt));

  const tab = (active: boolean) =>
    `btn ${active ? "border-term-neon text-term-neon" : ""}`;

  return (
    <>
      <PageHeader title="mensagens" description="Enviadas pelo formulário do comando contact.">
        <div className="flex gap-2">
          <Link href="/admin/messages" className={tab(!onlyUnread)}>
            todas
          </Link>
          <Link href="/admin/messages?filter=unread" className={tab(onlyUnread)}>
            não lidas
          </Link>
        </div>
      </PageHeader>

      {rows.length === 0 ? (
        <p className="text-term-dim">{onlyUnread ? "Nenhuma mensagem não lida." : "Nenhuma mensagem recebida ainda."}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((m) => (
            <li key={m.id} className="card">
              <details>
                <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                  <span aria-label={m.isRead ? "lida" : "não lida"} className={m.isRead ? "text-term-dim" : "text-term-amber"}>
                    ●
                  </span>
                  <span className={`min-w-0 flex-1 truncate ${m.isRead ? "text-term-dim" : "font-bold"}`}>
                    {m.name} — {m.subject}
                  </span>
                  <time className="text-xs text-term-dim" dateTime={m.createdAt.toISOString()}>
                    {m.createdAt.toLocaleString("pt-BR", { timeZone: TIMEZONE })}
                  </time>
                </summary>

                <div className="mt-4 space-y-4 border-t border-term-line pt-4">
                  <p className="text-sm text-term-dim">
                    de {m.name} &lt;{m.email}&gt;
                  </p>
                  <p className="max-w-[72ch] whitespace-pre-wrap break-words">{m.message}</p>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                      className="btn btn-primary"
                    >
                      responder
                    </a>
                    <form action={toggleRead.bind(null, m.id)}>
                      <button type="submit" className="btn">
                        {m.isRead ? "marcar como não lida" : "marcar como lida"}
                      </button>
                    </form>
                    <form action={deleteMessage.bind(null, m.id)}>
                      <DeleteButton confirmText="Excluir esta mensagem?" />
                    </form>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
