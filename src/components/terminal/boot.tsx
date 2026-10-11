import type { CSSProperties } from "react";
import type { Profile } from "@/db/schema";

type Props = { profile: Profile; counts: { projects: number; skills: number; faqs: number } };

const step = (i: number) => ({ "--i": i }) as CSSProperties;

export function Boot({ profile, counts }: Props) {
  const lines = [
    `iniciando portfolio v1.0`,
    `perfil carregado: ${profile.name}`,
    `conectado ao banco (neon postgres)`,
    `projetos: ${counts.projects}, tecnologias: ${counts.skills}, faq: ${counts.faqs}`,
  ];

  return (
    <header>
      <ul className="space-y-0.5 text-sm text-term-dim">
        {lines.map((line, i) => (
          <li key={line} className="boot-line" style={step(i)}>
            <span className="text-term-dim">[ </span>
            <span className="text-term-neon">ok</span>
            <span className="text-term-dim"> ]</span> {line}
          </li>
        ))}
      </ul>

      <div className="boot-line mt-6" style={step(lines.length + 1)}>
        <h1 className="glow text-3xl font-bold leading-tight text-term-neon sm:text-5xl">
          {profile.name}
        </h1>
        <p className="mt-2 text-lg text-term-fg">{profile.headline}</p>
        <p className="mt-4 text-term-dim">
          Digite <span className="text-term-neon">help</span> ou use os atalhos acima.
        </p>
      </div>
    </header>
  );
}
