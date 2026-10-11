"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import type { Faq, Profile, Project, Skill } from "@/db/schema";
import { Boot } from "./boot";
import { COMMANDS, QUICK_COMMANDS, resolveCommand, type CommandName } from "./commands";
import {
  AboutOutput,
  ContactOutput,
  FaqOutput,
  HelpOutput,
  LinksOutput,
  ProjectsOutput,
  ResumeOutput,
  SkillsOutput,
  UnknownOutput,
} from "./outputs";

type Props = { profile: Profile; skills: Skill[]; projects: Project[]; faqs: Faq[] };

type Entry = {
  id: number;
  input: string;
  kind: CommandName | "unknown" | "text";
  text?: string;
};

const MAX_ENTRIES = 50;

function PromptLabel() {
  return (
    <span className="whitespace-nowrap">
      <span className="text-term-amber">visitante</span>
      <span className="text-term-dim">@</span>
      <span className="text-term-neon">portfolio</span>
      <span className="text-term-dim">:~$</span>
    </span>
  );
}

function triggerDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.download = "curriculo.pdf"; // só tem efeito em URLs do mesmo domínio
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function Terminal({ profile, skills, projects, faqs }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showBoot, setShowBoot] = useState(true);
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState(0);
  const [focused, setFocused] = useState(false);
  const [past, setPast] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const focusInput = useCallback(() => {
    // Em telas touch não abrimos o teclado virtual sem o usuário pedir.
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Rola até o início da nova saída; se ela couber na tela, desce até o prompt.
  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    const last = entries[entries.length - 1];
    if (!last) {
      box.scrollTop = 0;
      return;
    }
    const el = document.getElementById(`entry-${last.id}`);
    const max = box.scrollHeight - box.clientHeight;
    box.scrollTop = el ? Math.min(el.offsetTop, max) : max;
  }, [entries]);

  const push = useCallback((entry: Omit<Entry, "id">) => {
    const id = ++idRef.current;
    setEntries((prev) => [...prev, { ...entry, id }].slice(-MAX_ENTRIES));
  }, []);

  const clearScreen = useCallback(() => {
    setEntries([]);
    setShowBoot(false);
  }, []);

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      if (!input) return;

      setPast((prev) => [input, ...prev].slice(0, 100));
      setHistIdx(-1);

      const head = input.split(/\s+/)[0];

      if (head.toLowerCase() === "sudo") {
        push({ input, kind: "text", text: "visitante não está no arquivo sudoers. Este incidente será ignorado (por enquanto)." });
        focusInput();
        return;
      }

      const command = resolveCommand(head);

      if (command === "clear") {
        clearScreen();
      } else if (command === null) {
        push({ input, kind: "unknown", text: head });
      } else {
        push({ input, kind: command });
        if (command === "resume" && profile.resumeUrl) triggerDownload(profile.resumeUrl);
      }

      if (command !== "contact") focusInput();
    },
    [clearScreen, focusInput, profile.resumeUrl, push],
  );

  const complete = () => {
    const q = value.trim().toLowerCase();
    if (!q) return;
    const matches = COMMANDS.map((c) => c.name as string).filter((n) => n.startsWith(q));
    if (matches.length === 1) {
      setValue(matches[0]);
      setCursor(matches[0].length);
    } else if (matches.length > 1) {
      push({ input: value, kind: "text", text: matches.join("   ") });
    }
  };

  const recall = (index: number) => {
    const next = index < 0 ? "" : (past[index] ?? "");
    setHistIdx(index);
    setValue(next);
    setCursor(next.length);
  };

  const onKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
    if (ev.nativeEvent.isComposing) return;

    if (ev.key === "Enter") {
      ev.preventDefault();
      run(value);
      setValue("");
      setCursor(0);
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      if (past.length) recall(Math.min(histIdx + 1, past.length - 1));
    } else if (ev.key === "ArrowDown") {
      ev.preventDefault();
      if (histIdx >= 0) recall(histIdx - 1);
    } else if (ev.key === "Tab") {
      ev.preventDefault();
      complete();
    } else if (ev.ctrlKey && ev.key.toLowerCase() === "l") {
      ev.preventDefault();
      clearScreen();
    }
  };

  // Clicar numa área "vazia" do terminal leva o foco para o prompt.
  const onAreaClick = (ev: MouseEvent<HTMLDivElement>) => {
    if (window.getSelection()?.toString()) return;
    const target = ev.target as HTMLElement;
    if (target.closest("a, button, input, textarea, select, label")) return;
    inputRef.current?.focus();
  };

  const renderOutput = (e: Entry) => {
    switch (e.kind) {
      case "help":
        return <HelpOutput onRun={run} />;
      case "about":
        return <AboutOutput profile={profile} />;
      case "skills":
        return <SkillsOutput skills={skills} />;
      case "projects":
        return <ProjectsOutput projects={projects} />;
      case "resume":
        return <ResumeOutput profile={profile} />;
      case "faq":
        return <FaqOutput faqs={faqs} />;
      case "contact":
        return <ContactOutput />;
      case "links":
        return <LinksOutput profile={profile} />;
      case "unknown":
        return <UnknownOutput command={e.text ?? e.input} onRun={run} />;
      case "text":
        return <p className="whitespace-pre-wrap text-term-dim">{e.text}</p>;
      default:
        return null;
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Terminal interativo">
      <div className="flex shrink-0 items-center justify-between border-b border-term-line bg-term-panel px-4 py-2 text-xs text-term-dim">
        <span>visitante@portfolio: ~</span>
        <span className="hidden sm:inline">Tab completa · ↑↓ histórico · Ctrl+L limpa</span>
      </div>

      <nav
        aria-label="Atalhos de comandos"
        className="flex shrink-0 gap-2 overflow-x-auto border-b border-term-line px-4 py-2"
      >
        {QUICK_COMMANDS.map((name) => (
          <button key={name} type="button" onClick={() => run(name)} className="btn shrink-0">
            {name}
          </button>
        ))}
      </nav>

      <div ref={scrollRef} onClick={onAreaClick} className="relative min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
          {showBoot && (
            <Boot
              profile={profile}
              counts={{ projects: projects.length, skills: skills.length, faqs: faqs.length }}
            />
          )}

          <div aria-live="polite">
            {entries.map((e) => (
              <section key={e.id} id={`entry-${e.id}`} className="mt-6">
                <p className="break-words">
                  <PromptLabel /> <span>{e.input}</span>
                </p>
                <div className="mt-2">{renderOutput(e)}</div>
              </section>
            ))}
          </div>

          {/* Prompt ativo: o <input> real fica invisível por cima; desenhamos texto e cursor de bloco. */}
          <div className="relative mt-6 break-words">
            <PromptLabel />{" "}
            <span className="whitespace-pre-wrap break-all">{value.slice(0, cursor)}</span>
            <span className="term-cursor" data-focused={focused} aria-hidden="true" />
            <span className="whitespace-pre-wrap break-all">{value.slice(cursor)}</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(ev) => {
                setValue(ev.target.value);
                setCursor(ev.target.selectionStart ?? ev.target.value.length);
                setHistIdx(-1);
              }}
              onSelect={(ev) => setCursor(ev.currentTarget.selectionStart ?? 0)}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label="Digite um comando e pressione Enter. Experimente: help"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              className="absolute inset-0 h-full w-full cursor-text bg-transparent text-base opacity-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
