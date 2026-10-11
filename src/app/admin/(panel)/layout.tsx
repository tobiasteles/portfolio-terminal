import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/_actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { getUnreadCount } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  const unread = await getUnreadCount();

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 p-4 md:flex-row md:p-8">
      <aside className="md:w-56 md:shrink-0">
        <p className="glow text-term-neon">admin@portfolio</p>
        <p className="mb-4 truncate text-xs text-term-dim">{session.email}</p>
        <AdminNav unread={unread} />
        <div className="mt-4 grid gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn">
            ver o site
          </a>
          <form action={logoutAction} className="grid">
            <button type="submit" className="btn">
              sair
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
