"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "painel" },
  { href: "/admin/profile", label: "perfil" },
  { href: "/admin/skills", label: "tecnologias" },
  { href: "/admin/projects", label: "projetos" },
  { href: "/admin/faq", label: "faq" },
  { href: "/admin/messages", label: "mensagens" },
];

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Administração" className="flex gap-1 overflow-x-auto md:flex-col">
      {LINKS.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center justify-between gap-3 border px-3 py-1.5 text-sm no-underline transition-colors ${
              active
                ? "border-term-neon bg-term-neon/10 text-term-neon"
                : "border-transparent text-term-fg hover:border-term-line hover:text-term-neon"
            }`}
          >
            <span>{label}</span>
            {href === "/admin/messages" && unread > 0 && (
              <span className="bg-term-amber px-1.5 text-xs font-bold text-term-ink">{unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
