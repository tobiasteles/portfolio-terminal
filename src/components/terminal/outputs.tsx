"use client";

import { useState, type ReactNode } from "react";
import type { Faq, Profile, Project, Skill } from "@/db/schema";
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@/lib/constants";
import { AsciiPortrait } from "@/components/ascii-portrait";
import { COMMANDS, type CommandName } from "./commands";
import { ContactForm } from "./contact-form";

type RunProps = { onRun: (cmd: string) => void };

const Muted = ({ children }: { children: ReactNode }) => <p className="text-term-dim">{children}</p>;

function CmdButton({ name, onRun }: { name: CommandName | string; onRun: (cmd: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onRun(name)}
      className="text-term-neon underline decoration-term-neon/40 underline-offset-4 hover:decoration-term-neon"
    >
      {name}
    </button>
  );
}

export function HelpOutput({ onRun }: RunProps) {
  return (
    <div>
      <ul className="space-y-1">
        {COMMANDS.map((c) => (
          <li key={c.name} className="grid grid-cols-[6.5rem_1fr] gap-x-3">
            <CmdButton name={c.name} onRun={onRun} />
            <span className="text-term-dim">{c.description}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-term-dim">
        Dicas: Tab completa o comando, as setas ↑ ↓ percorrem o histórico.
      </p>
    </div>
  );
}

export function AboutOutput({ profile }: { profile: Profile }) {
  const link = (href: string, label = href) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="break-all">
      {label}
    </a>
  );

  const rows: [string, ReactNode][] = [
    ["nome", profile.name],
    ["cargo", profile.headline],
  ];
  if (profile.location) rows.push(["local", profile.location]);
  if (profile.email) rows.push(["e-mail", link(`mailto:${profile.email}`, profile.email)]);
  if (profile.githubUrl) rows.push(["github", link(profile.githubUrl)]);
  if (profile.linkedinUrl) rows.push(["linkedin", link(profile.linkedinUrl)]);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
      {profile.photoAscii && (
        <AsciiPortrait
          art={profile.photoAscii}
          label={`Retrato de ${profile.name} em arte ASCII`}
          animate
          className="shrink-0 overflow-hidden"
        />
      )}

      <div className="min-w-0 max-w-[64ch]">
        <p>
          <span className="text-term-neon">visitante</span>
          <span className="text-term-dim">@</span>
          <span className="text-term-neon">{profile.name}</span>
        </p>
        <dl className="mt-2 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-0.5">
          {rows.map(([key, value]) => (
            <div key={key} className="contents">
              <dt className="text-term-amber">{key}</dt>
              <dd className="break-words">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 whitespace-pre-line">{profile.bio}</p>
      </div>
    </div>
  );
}

export function SkillsOutput({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return <Muted>Nenhuma tecnologia cadastrada ainda.</Muted>;

  return (
    <div className="space-y-5">
      {SKILL_CATEGORIES.map((category) => {
        const items = skills.filter((s) => s.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category}>
            <h2 className="text-term-amber">{SKILL_CATEGORY_LABELS[category]}</h2>
            <ul className="mt-1 space-y-1">
              {items.map((skill) => {
                const filled = Math.max(0, Math.min(10, Math.round(skill.level / 10)));
                return (
                  <li key={skill.id} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1">{skill.name}</span>
                    <span aria-hidden="true" className="tracking-tighter text-term-neon">
                      {"█".repeat(filled)}
                      <span className="text-term-line">{"░".repeat(10 - filled)}</span>
                    </span>
                    <span className="w-11 text-right tabular-nums text-term-dim">{skill.level}%</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function ProjectsOutput({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return <Muted>Nenhum projeto cadastrado ainda.</Muted>;

  return (
    <ul className="space-y-4">
      {projects.map((p) => (
        <li key={p.id} className="flex flex-col gap-4 border border-term-line bg-term-panel p-3 sm:flex-row">
          {p.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.imageUrl}
              alt={`Captura de tela do projeto ${p.title}`}
              loading="lazy"
              className="aspect-video w-full border border-term-line object-cover sm:w-56 sm:shrink-0"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex aspect-video w-full items-center justify-center border border-dashed border-term-line text-sm text-term-dim sm:w-56 sm:shrink-0"
            >
              sem imagem
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-term-neon">{p.title}</h2>
            <p className="mt-1 max-w-[64ch]">{p.description}</p>

            {p.technologies.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tecnologias usadas">
                {p.technologies.map((t) => (
                  <li key={t} className="badge">
                    {t}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {p.liveUrl && (
                <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                  ver online
                </a>
              )}
              {p.githubUrl && (
                <a href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                  código no GitHub
                </a>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FaqOutput({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (faqs.length === 0) return <Muted>Nenhuma pergunta cadastrada ainda.</Muted>;

  return (
    <ul className="max-w-[72ch] space-y-1">
      {faqs.map((f) => {
        const isOpen = open === f.id;
        return (
          <li key={f.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : f.id)}
              className="flex w-full gap-3 text-left hover:text-term-neon"
            >
              <span aria-hidden="true" className="text-term-neon">
                {isOpen ? "[-]" : "[+]"}
              </span>
              <span>{f.question}</span>
            </button>
            {isOpen && <p className="mt-1 whitespace-pre-line pl-9 text-term-dim">{f.answer}</p>}
          </li>
        );
      })}
    </ul>
  );
}

export function ResumeOutput({ profile }: { profile: Profile }) {
  if (!profile.resumeUrl) return <p className="text-term-amber">O currículo ainda não foi configurado.</p>;
  return (
    <p>
      Baixando o currículo...{" "}
      <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
        abrir em nova aba
      </a>
    </p>
  );
}

export function LinksOutput({ profile }: { profile: Profile }) {
  const rows: [string, string | null, string | null][] = [
    ["github", profile.githubUrl, profile.githubUrl],
    ["linkedin", profile.linkedinUrl, profile.linkedinUrl],
    ["e-mail", profile.email, profile.email ? `mailto:${profile.email}` : null],
  ];
  const filled = rows.filter(([, label, href]) => label && href);
  if (filled.length === 0) return <Muted>Nenhum link cadastrado ainda.</Muted>;

  return (
    <ul className="space-y-1">
      {filled.map(([name, label, href]) => (
        <li key={name} className="grid grid-cols-[5.5rem_1fr] gap-x-3">
          <span className="text-term-dim">{name}</span>
          <a href={href!} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all">
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ContactOutput() {
  return <ContactForm />;
}

export function UnknownOutput({ command, onRun }: { command: string } & RunProps) {
  return (
    <p className="text-term-danger">
      comando não encontrado: <span className="text-term-fg">{command}</span>. Digite{" "}
      <CmdButton name="help" onRun={onRun} /> para ver a lista.
    </p>
  );
}
