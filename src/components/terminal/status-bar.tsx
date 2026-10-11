"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/db/schema";
import { TIMEZONE } from "@/lib/constants";
import { GithubIcon, LinkedinIcon, MailIcon } from "./icons";

type DbStatus = "checking" | "online" | "offline";

const STATUS_STYLE: Record<DbStatus, string> = {
  checking: "text-term-amber",
  online: "text-term-neon",
  offline: "text-term-danger",
};
const STATUS_LABEL: Record<DbStatus, string> = {
  checking: "verificando",
  online: "online",
  offline: "offline",
};

function Segment({ label, status }: { label: string; status: DbStatus | "online" }) {
  return (
    <span className="flex items-center gap-1.5 px-3">
      <span className="text-term-dim">{label}</span>
      <span className={STATUS_STYLE[status]}>
        <span aria-hidden="true">●</span> {STATUS_LABEL[status]}
      </span>
    </span>
  );
}

export function StatusBar({ profile, year }: { profile: Profile; year: number }) {
  const [now, setNow] = useState<Date | null>(null);
  const [db, setDb] = useState<DbStatus>("checking");

  // Relógio (só após montar, para evitar divergência de hidratação).
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ping de saúde do banco a cada 60s.
  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (alive) setDb(res.ok ? "online" : "offline");
      } catch {
        if (alive) setDb("offline");
      }
    };
    ping();
    const timer = setInterval(ping, 60_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const time = now
    ? now.toLocaleTimeString("pt-BR", { timeZone: TIMEZONE, hour12: false })
    : "--:--:--";
  const date = now
    ? now.toLocaleDateString("pt-BR", { timeZone: TIMEZONE, weekday: "short", day: "2-digit", month: "2-digit" })
    : "";

  const iconLink = "p-1 text-term-dim no-underline transition-colors hover:text-term-neon";

  return (
    <footer className="shrink-0 border-t border-term-line bg-term-panel text-xs">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-y-1 py-1 sm:px-2">
        <div className="flex flex-wrap items-center divide-x divide-term-line">
          <span className="bg-term-neon px-3 py-0.5 font-bold text-term-ink">visitante</span>
          <Segment label="web" status="online" />
          <Segment label="db" status={db} />
        </div>

        <div className="flex items-center gap-3 px-3 text-term-dim">
          <span>{profile.location ?? "Brasília, DF"}</span>
          <time dateTime={now?.toISOString()} className="tabular-nums text-term-fg">
            {date} {time} BRT
          </time>
        </div>

        <div className="flex items-center gap-1 px-3">
          {profile.githubUrl && (
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={iconLink}>
              <GithubIcon />
            </a>
          )}
          {profile.linkedinUrl && (
            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={iconLink}>
              <LinkedinIcon />
            </a>
          )}
          {profile.email && (
            <a href={`mailto:${profile.email}`} aria-label="Enviar e-mail" className={iconLink}>
              <MailIcon />
            </a>
          )}
          <span className="ml-2 text-term-dim">
            © {year} {profile.name}
          </span>
        </div>
      </div>
    </footer>
  );
}
