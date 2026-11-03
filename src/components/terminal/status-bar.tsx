import Link from "next/link";
import type { Profile } from "@/db/schema";
import { GithubIcon, LinkedinIcon, MailIcon } from "./icons";
import { Clock } from "./clock";

const iconLink =
  "flex h-9 w-9 items-center justify-center text-term-dim no-underline transition-colors hover:text-term-fg";
const textLink = "text-term-dim no-underline hover:text-term-fg hover:underline";

/** Rodapé enxuto: no celular ocupa uma linha só (ícones + links legais). */
export function StatusBar({ profile, year }: { profile: Profile; year: number }) {
  return (
    <footer className="shrink-0 border-t border-term-line bg-term-panel pb-[env(safe-area-inset-bottom)] text-xs">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-x-3 text-term-dim">
          <span className="hidden truncate sm:inline">
            © {year} {profile.name}
          </span>
          <Link href="/privacidade" className={textLink}>
            privacidade
          </Link>
          <Link href="/termos" className={textLink}>
            termos
          </Link>
        </div>

        <div className="flex items-center">
          <span className="mr-2 hidden text-term-dim md:inline">
            {profile.location ?? "Brasília, DF"} · <Clock />
          </span>
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
        </div>
      </div>
    </footer>
  );
}
