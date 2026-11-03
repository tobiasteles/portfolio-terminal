import type { CSSProperties } from "react";
import type { Profile } from "@/db/schema";
import { AsciiPortrait } from "@/components/ascii-portrait";

type Props = {
  profile: Profile;
};

const step = (i: number) => ({ "--i": i }) as CSSProperties;

export function Boot({ profile }: Props) {
  const year = new Date().getFullYear();

  return (
    <header>
      <div className="text-term-fg">
        <p className="boot-line" style={step(0)}>
          Portfólio de {profile.name} [versão 1.0.0]
        </p>
        <p className="boot-line" style={step(1)}>
          (c) {year} {profile.name}. Todos os direitos reservados.
        </p>
      </div>

      <div
        className="boot-line mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8"
        style={step(3)}
      >
        {profile.photoAscii && (
          <AsciiPortrait
            art={profile.photoAscii}
            label={`Retrato de ${profile.name} em arte ASCII`}
            className="shrink-0 overflow-hidden"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-3xl font-bold leading-tight text-term-fg sm:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-2 text-lg text-term-neon">{profile.headline}</p>
          <p className="mt-4 text-term-dim">
            Digite <span className="text-term-fg">help</span> ou toque nos atalhos
            acima.
          </p>
        </div>
      </div>
    </header>
  );
}
