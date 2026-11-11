"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Faq, Profile, Skill } from "@/db/schema";
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@/lib/constants";
import type { OrbitProject } from "@/lib/orbit";
import { dilationFactor, formatLongerTime, RS_PER_SCENE_UNIT } from "@/lib/physics";
import type { TimelineItem } from "@/lib/timeline";
import { useAmbientSound } from "./ambient-sound";
import { Approach } from "./approach";
import type { OrbitItem } from "./black-hole-scene";
import { ContactForm } from "./contact-form";
import { ds } from "./ds";
import { GithubIcon, LinkedinIcon, MailIcon } from "./icons";
import { Rebirth } from "./rebirth";

// three.js só roda no navegador, então a cena é carregada sem SSR.
const Scene = dynamic(() => import("./black-hole-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <Approach label="aproximando do horizonte de eventos…" />
    </div>
  ),
});

/* ------------------------------------------------------------------ */
/* Navegação                                                            */
/* ------------------------------------------------------------------ */
const VIEWS = ["inicio", "sobre", "tecnologias", "projetos", "trajetoria", "perguntas", "contato"] as const;
type View = (typeof VIEWS)[number];

const NAV: { id: View; label: string }[] = [
  { id: "inicio", label: "Início" },
  { id: "sobre", label: "Sobre" },
  { id: "tecnologias", label: "Tecnologias" },
  { id: "projetos", label: "Projetos" },
  { id: "trajetoria", label: "Trajetória" },
  { id: "perguntas", label: "Perguntas" },
  { id: "contato", label: "Contato" },
];

function viewFromHash(): View {
  const h = window.location.hash.replace("#", "");
  return (VIEWS as readonly string[]).includes(h) ? (h as View) : "inicio";
}

type Env = { webgl: boolean; reduced: boolean; lite: boolean };

function detectEnv(): Env {
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return {
    webgl,
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    lite: window.innerWidth < 700,
  };
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                 */
/* ------------------------------------------------------------------ */
type Props = {
  profile: Profile;
  skills: Skill[];
  faqs: Faq[];
  projects: OrbitProject[];
  timeline: TimelineItem[];
  year: number;
};

export function UniversoHome({ profile, skills, faqs, projects, timeline, year }: Props) {
  const [env, setEnv] = useState<Env | null>(null);
  const [view, setViewState] = useState<View>("inicio");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [dist, setDist] = useState<number | null>(null);
  const sound = useAmbientSound();

  // Sequência do "Sobre": queda -> escuro -> recomeço (luz + foto + texto).
  const [phase, setPhase] = useState<"idle" | "diving" | "inside">("idle");
  const [dark, setDark] = useState(false);
  const [instant, setInstant] = useState(false);
  const [shown, setShown] = useState(false);
  const [phraseShown, setPhraseShown] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setEnv(detectEnv());
    setViewState(viewFromHash());
    const onHash = () => setViewState(viewFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((next: View) => {
    setViewState(next);
    setSelectedKey(null);
    window.history.replaceState(null, "", next === "inicio" ? window.location.pathname : `#${next}`);
  }, []);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    clearTimers();
    setDark(false);
    if (view !== "sobre") {
      setPhase("idle");
      setInstant(false);
      return;
    }
    if (!env) return;
    if (env.reduced || !env.webgl) {
      setInstant(true);
      setPhase("inside");
      return;
    }
    setInstant(false);
    setPhase("diving");
    timers.current = [
      window.setTimeout(() => setDark(true), 2000), // a tela escurece
      window.setTimeout(() => {
        setPhase("inside"); // o recomeço começa em preto total
        setDark(false);
      }, 3050),
    ];
    return clearTimers;
  }, [view, env]);

  // Depois da queda: a luz cresce, a frase entra devagar e só então o cartão aparece.
  useEffect(() => {
    if (phase !== "inside") {
      setShown(false);
      setPhraseShown(false);
      return;
    }
    if (instant) {
      setShown(true);
      setPhraseShown(true);
      return;
    }
    const a = window.setTimeout(() => setPhraseShown(true), 700);
    const b = window.setTimeout(() => setShown(true), 1500);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [phase, instant]);

  const skipDive = () => {
    clearTimers();
    setDark(false);
    setInstant(true);
    setPhase("inside");
  };

  // Esc fecha o item aberto; se não houver, volta ao início.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedKey !== null) setSelectedKey(null);
      else if (view !== "inicio") go("inicio");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedKey, view, go]);

  const projectItems: OrbitItem[] = projects.map((p) => ({
    key: `p-${p.id}`,
    label: p.title,
    imageUrl: p.imageUrl,
  }));
  const timelineItems: OrbitItem[] = timeline.map((t) => ({ key: `t-${t.id}`, label: t.label, imageUrl: null }));

  const projectIndex = projects.findIndex((p) => `p-${p.id}` === selectedKey);
  const selectedProject = view === "projetos" && projectIndex >= 0 ? projects[projectIndex] : null;
  const timelineIndex = timeline.findIndex((t) => `t-${t.id}` === selectedKey);
  const selectedStep = view === "trajetoria" && timelineIndex >= 0 ? timeline[timelineIndex] : null;

  const sidePanel = view === "tecnologias" || view === "perguntas" || view === "contato";
  const bottomCard = selectedProject !== null || selectedStep !== null;

  // Empurra o buraco negro para o lado/para cima quando há painel, para ele continuar visível ao fundo.
  const lite = env?.lite ?? false;
  const shift = bottomCard
    ? { x: 0, y: lite ? 190 : 150 }
    : sidePanel
      ? lite
        ? { x: 0, y: 130 }
        : { x: 210, y: 0 }
      : { x: 0, y: 0 };

  const showHud = phase !== "inside" && dist !== null && (dist < 11 || phase === "diving");

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bh-void font-display text-bh-text">
      {/* Cena 3D */}
      <div className="absolute inset-0">
        {env?.webgl && (
          <Scene
            items={view === "trajetoria" ? timelineItems : projectItems}
            itemStyle={view === "trajetoria" ? "timeline" : "projects"}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
            reduced={env.reduced}
            lite={env.lite}
            showOrbits={view === "projetos" || view === "trajetoria"}
            shift={shift}
            dive={view === "sobre" && !env.reduced}
            onDistance={setDist}
          />
        )}
        {env && !env.webgl && (
          <p className="absolute inset-0 grid place-items-center px-8 text-center font-code text-sm text-bh-mute">
            Seu navegador não conseguiu abrir o 3D, mas todo o conteúdo continua no menu.
          </p>
        )}
      </div>

      {/* Dentro do buraco negro: o recomeço (luz), a foto, o texto e a frase final */}
      {view === "sobre" && phase === "inside" && (
        <div className="absolute inset-0">
          <Rebirth instant={instant} reduced={env?.reduced ?? false} />
          <div
            className={`absolute inset-0 overflow-y-auto px-4 pb-28 pt-20 transition-opacity duration-[1400ms] sm:pb-16 ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          >
            <InsideAbout profile={profile} onBack={() => go("inicio")} />
          </div>
          <p
            className={`pointer-events-none absolute inset-x-0 bottom-[4.4rem] text-center font-code text-[11px] uppercase tracking-[0.18em] text-bh-amber transition-opacity duration-[2400ms] sm:bottom-7 ${
              phraseShown ? "opacity-100" : "opacity-0"
            }`}
          >
            {"// ninguém sabe o que vem depois"}
          </p>
        </div>
      )}

      {/* Escuro total: entre a queda e o recomeço */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-20 bg-black transition-opacity duration-700 ${
          dark ? "opacity-100" : "opacity-0"
        }`}
      />

      {phase === "diving" && (
        <button
          type="button"
          onClick={skipDive}
          className="absolute bottom-[max(5rem,env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 rounded-full border border-bh-line bg-bh-surface/60 px-4 py-1.5 font-code text-xs text-bh-mute backdrop-blur-md hover:text-bh-flare sm:bottom-8"
        >
          pular
        </button>
      )}

      {/* Rótulo de física: dilatação do tempo ao chegar perto */}
      {showHud && <TimeDilation dist={dist} racing={dark} />}

      {/* Interface: só os filhos recebem clique, o resto deixa passar para o 3D. */}
      <div
        className={`pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-700 ${
          phase === "diving" ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Topo */}
        <header className="flex items-start justify-between gap-4 px-5 pt-[max(1.1rem,env(safe-area-inset-top))] sm:px-8">
          <button
            type="button"
            onClick={() => go("inicio")}
            className="pointer-events-auto text-left"
            aria-label="Ir para o início"
          >
            <span className="block text-base font-semibold tracking-tight text-bh-flare">{profile.name}</span>
            <span className={`block ${ds.eyebrow}`}>{profile.headline}</span>
          </button>

          <div className="pointer-events-auto flex items-center gap-1">
            <nav aria-label="Seções" className="hidden items-center gap-1 sm:flex">
              {NAV.filter((n) => n.id !== "inicio").map((n) => (
                <NavButton key={n.id} active={view === n.id} onClick={() => go(n.id)}>
                  {n.label}
                </NavButton>
              ))}
            </nav>
            <button
              type="button"
              onClick={sound.toggle}
              aria-pressed={sound.on}
              aria-label={sound.on ? "Desligar o som ambiente" : "Ligar o som ambiente"}
              className={`ml-1 rounded-full border px-3 py-1.5 font-code text-xs transition ${
                sound.on
                  ? "border-bh-ember bg-bh-ember/15 text-bh-flare"
                  : "border-bh-line text-bh-mute hover:text-bh-flare"
              }`}
            >
              {sound.on ? "♪ som: on" : "♪ som: off"}
            </button>
          </div>
        </header>

        {/* Base */}
        <div className="flex flex-col">
          {view === "inicio" && <Hero profile={profile} year={year} onGo={go} />}

          {view === "tecnologias" && (
            <Panel title="Tecnologias" kicker="// o que eu uso" onClose={() => go("inicio")}>
              <SkillsPanel skills={skills} />
            </Panel>
          )}

          {view === "perguntas" && (
            <Panel title="Perguntas frequentes" kicker="// dúvidas comuns" onClose={() => go("inicio")}>
              <FaqPanel faqs={faqs} />
            </Panel>
          )}

          {view === "contato" && (
            <Panel title="Contato" kicker="// vamos conversar" onClose={() => go("inicio")}>
              <ContactPanel profile={profile} />
            </Panel>
          )}

          {view === "projetos" && (
            <>
              {selectedProject && (
                <ProjectCard
                  key={selectedProject.id}
                  project={selectedProject}
                  index={projectIndex}
                  total={projects.length}
                  onClose={() => setSelectedKey(null)}
                />
              )}
              <Dock
                items={projectItems}
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
                hint={
                  projects.length === 0
                    ? "nenhum projeto em órbita ainda"
                    : selectedProject
                      ? null
                      : "arraste para girar · role para aproximar · toque num planeta"
                }
              />
            </>
          )}

          {view === "trajetoria" && (
            <>
              {selectedStep && (
                <StepCard
                  key={selectedStep.id}
                  step={selectedStep}
                  index={timelineIndex}
                  total={timeline.length}
                  onClose={() => setSelectedKey(null)}
                />
              )}
              <Dock
                items={timelineItems}
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
                hint={selectedStep ? null : "cada planeta é uma etapa da minha trajetória · toque num deles"}
              />
            </>
          )}

          {/* Menu do celular */}
          <nav
            aria-label="Seções"
            className="pointer-events-auto flex gap-1 overflow-x-auto border-t border-bh-line/60 bg-bh-void/80 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md sm:hidden"
          >
            {NAV.map((n) => (
              <NavButton key={n.id} active={view === n.id} onClick={() => go(n.id)}>
                {n.label}
              </NavButton>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

/** Dica + chips dos planetas (também serve de menu no celular e de alternativa ao clique no 3D). */
function Dock({
  items,
  selectedKey,
  onSelect,
  hint,
}: {
  items: OrbitItem[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  hint: string | null;
}) {
  return (
    <>
      {hint && <p className="px-5 pb-2 text-center font-code text-[11px] text-bh-mute sm:text-xs">{hint}</p>}
      {items.length > 0 && (
        <nav aria-label="Itens" className="pointer-events-auto flex gap-2 overflow-x-auto px-4 pb-2 pt-1 sm:justify-center">
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              aria-pressed={it.key === selectedKey}
              onClick={() => onSelect(it.key === selectedKey ? null : it.key)}
              className={ds.chip}
            >
              {it.label}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}

/** 2,7e-10 -> "2,7×10⁻¹⁰" */
function superscriptExp(x: number) {
  const [mant, exp] = x.toExponential(1).split("e");
  const sup: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  return `${mant.replace(".", ",")}×10${exp.replace("+", "").split("").map((c) => sup[c] ?? c).join("")}`;
}

/**
 * "1 hora aqui = X lá fora": dilatação gravitacional do tempo (relatividade geral) para quem fica parado
 * a uma distância r do buraco negro. Na queda, o número continua disparando enquanto a tela está escura.
 */
function TimeDilation({ dist, racing }: { dist: number | null; racing: boolean }) {
  const [virtualR, setVirtualR] = useState<number | null>(null);
  const distRef = useRef(dist);
  distRef.current = dist;

  useEffect(() => {
    if (!racing) {
      setVirtualR(null);
      return;
    }
    const r0 = Math.max((distRef.current ?? 3) * RS_PER_SCENE_UNIT, 1.5);
    const k = Math.log((r0 - 1) / 2.7e-10); // termina em ~7 anos lá fora para cada hora aqui
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 1100);
      setVirtualR(1 + (r0 - 1) * Math.exp(-k * t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [racing]);

  const r = virtualR ?? (dist ?? 0) * RS_PER_SCENE_UNIT;
  if (r <= 1) return null;
  const rLabel =
    r < 1.001
      ? `1 + ${superscriptExp(r - 1)} rs`
      : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: r < 10 ? 1 : 0 }).format(r)} rs`;

  return (
    <div
      role="status"
      aria-live="off"
      className="pointer-events-none absolute left-5 top-[4.7rem] z-30 border-l border-bh-ember/60 pl-3 font-code text-[11px] leading-relaxed text-bh-amber sm:left-8"
    >
      <p className="uppercase tracking-[0.18em] text-bh-mute">{"// dilatação do tempo"}</p>
      <p>
        1 h aqui = <span className="text-bh-flare">{formatLongerTime(dilationFactor(r))}</span> lá fora
      </p>
      <p className="text-bh-mute">a {rLabel} do horizonte de eventos</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Peças de interface                                                   */
/* ------------------------------------------------------------------ */
function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={
        "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition " +
        (active ? "bg-bh-ember/15 text-bh-flare" : "text-bh-mute hover:text-bh-flare")
      }
    >
      {children}
    </button>
  );
}

function Panel({
  title,
  kicker,
  onClose,
  children,
}: {
  title: string;
  kicker: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <section role="region" aria-label={title} className={`${ds.panel} ${ds.glass} mx-3 mb-2`}>
      <div className="flex items-start justify-between gap-3">
        <p className={ds.eyebrow}>{kicker}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="-mr-1 -mt-1 rounded-full px-2 font-code text-lg leading-none text-bh-mute hover:text-bh-flare"
        >
          ×
        </button>
      </div>
      <h2 className="mt-1 text-xl font-semibold text-bh-flare">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-bh-text/90">{children}</div>
    </section>
  );
}

function Hero({ profile, year, onGo }: { profile: Profile; year: number; onGo: (v: View) => void }) {
  return (
    <div className="bg-gradient-to-t from-bh-void/90 via-bh-void/50 to-transparent px-5 pb-4 pt-16 sm:px-8 sm:pb-6">
      <p className={ds.eyebrow}>{"// portfólio · rumo ao horizonte de eventos"}</p>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight text-bh-flare sm:text-6xl">{profile.name}</h1>
      <p className="mt-1 max-w-xl font-code text-sm text-bh-amber sm:text-base">
        {profile.headline}
        {profile.location ? ` · ${profile.location}` : ""}
      </p>

      <div className="pointer-events-auto mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => onGo("projetos")} className={ds.btnPrimary}>
          Explorar projetos
        </button>
        <button type="button" onClick={() => onGo("contato")} className={ds.btnGhost}>
          Falar comigo
        </button>
      </div>

      <div className="pointer-events-auto mt-5 hidden items-center justify-between text-xs text-bh-mute sm:flex">
        <span>
          © {year} {profile.name} ·{" "}
          <Link href="/privacidade" className="no-underline hover:text-bh-flare">
            privacidade
          </Link>{" "}
          ·{" "}
          <Link href="/termos" className="no-underline hover:text-bh-flare">
            termos
          </Link>
        </span>
        <SocialLinks profile={profile} />
      </div>
    </div>
  );
}

function SocialLinks({ profile }: { profile: Profile }) {
  const cls = "flex h-9 w-9 items-center justify-center text-bh-mute no-underline transition hover:text-bh-flare";
  return (
    <span className="flex items-center">
      {profile.githubUrl && (
        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={cls}>
          <GithubIcon />
        </a>
      )}
      {profile.linkedinUrl && (
        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={cls}>
          <LinkedinIcon />
        </a>
      )}
      {profile.email && (
        <a href={`mailto:${profile.email}`} aria-label="Enviar e-mail" className={cls}>
          <MailIcon />
        </a>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Conteúdo dos painéis                                                 */
/* ------------------------------------------------------------------ */
function Portrait({ profile }: { profile: Profile }) {
  const [failed, setFailed] = useState(false);
  // A foto vem do link salvo no admin; se não houver, procura public/foto.jpg.
  const src = profile.photoUrl || "/foto.jpg";
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div className="mx-auto rounded-full bg-gradient-to-br from-bh-flare via-bh-amber to-bh-plasma p-[3px] shadow-[0_0_90px_-12px_rgba(255,122,26,0.75)]">
      <div className="grid h-56 w-56 place-items-center overflow-hidden rounded-full bg-bh-surface sm:h-72 sm:w-72">
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Foto de ${profile.name}`}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : profile.photoAscii ? (
          <pre
            aria-label={`Retrato de ${profile.name} em ASCII`}
            className="overflow-hidden whitespace-pre font-code text-[3px] leading-[3px] text-bh-amber"
          >
            {profile.photoAscii}
          </pre>
        ) : (
          <span className="text-5xl font-semibold text-bh-amber">{initials}</span>
        )}
      </div>
    </div>
  );
}

function InsideAbout({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  return (
    <section
      role="region"
      aria-label="Sobre"
      className={`mx-auto grid max-w-4xl items-center gap-8 rounded-3xl p-6 sm:p-10 md:grid-cols-[auto_1fr] md:gap-12 ${ds.glass}`}
    >
      <Portrait profile={profile} />

      <div className="space-y-4">
        <p className={ds.eyebrow}>{"// cruzei o horizonte de eventos"}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-bh-flare sm:text-4xl">{profile.name}</h2>
        <p className="font-code text-sm text-bh-amber">
          {profile.headline}
          {profile.location ? ` · ${profile.location}` : ""}
        </p>
        <p className="whitespace-pre-line leading-relaxed text-bh-text/90">{profile.bio}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className={ds.btnPrimary}>
              Baixar currículo
            </a>
          )}
          <button type="button" onClick={onBack} className={ds.btnGhost}>
            ← voltar à órbita
          </button>
          <SocialLinks profile={profile} />
        </div>
      </div>
    </section>
  );
}

function SkillsPanel({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return <p className="text-bh-mute">Nenhuma tecnologia cadastrada ainda.</p>;
  return (
    <div className="space-y-5">
      {SKILL_CATEGORIES.map((category) => {
        const items = skills.filter((s) => s.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category}>
            <h3 className={ds.eyebrow}>{SKILL_CATEGORY_LABELS[category]}</h3>
            <ul className="mt-2 space-y-2.5">
              {items.map((skill) => (
                <li key={skill.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span>{skill.name}</span>
                    <span className="font-code text-xs tabular-nums text-bh-mute">{skill.level}%</span>
                  </div>
                  <div
                    role="img"
                    aria-label={`${skill.name}: ${skill.level}%`}
                    className="mt-1 h-1.5 w-full rounded-full bg-bh-line/60"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-bh-amber to-bh-ember"
                      style={{ width: `${Math.max(0, Math.min(100, skill.level))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function FaqPanel({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return <p className="text-bh-mute">Nenhuma pergunta cadastrada ainda.</p>;
  return (
    <div className="divide-y divide-bh-line/60">
      {faqs.map((f) => (
        <details key={f.id} className="group py-3">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-bh-flare marker:hidden">
            <span>{f.question}</span>
            <span aria-hidden className="font-code text-bh-ember transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-2 whitespace-pre-line text-bh-text/85">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

function ContactPanel({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-5">
      <ContactForm />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-bh-line/60 pt-3">
        <SocialLinks profile={profile} />
        <span className="text-xs text-bh-mute">
          <Link href="/privacidade" className="no-underline hover:text-bh-flare">
            privacidade
          </Link>{" "}
          ·{" "}
          <Link href="/termos" className="no-underline hover:text-bh-flare">
            termos
          </Link>
        </span>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  total,
  onClose,
}: {
  project: OrbitProject;
  index: number;
  total: number;
  onClose: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!project.imageUrl && !imgFailed;

  return (
    <section
      role="region"
      aria-label={project.title}
      className={`pointer-events-auto mx-3 mb-2 max-h-[62dvh] overflow-y-auto rounded-2xl p-4 sm:mx-auto sm:mb-3 sm:flex sm:w-[min(58rem,calc(100%-4rem))] sm:items-start sm:gap-5 sm:p-5 ${ds.glass}`}
    >
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.imageUrl!}
          alt={`Imagem do projeto ${project.title}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="mb-3 h-32 w-full rounded-xl border border-bh-line object-cover sm:mb-0 sm:aspect-video sm:h-auto sm:w-[20rem] sm:shrink-0"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className={ds.eyebrow}>
            {`// projeto ${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-1 -mt-1 rounded-full px-2 font-code text-lg leading-none text-bh-mute hover:text-bh-flare"
          >
            ×
          </button>
        </div>

        <h2 className="mt-1 text-xl font-semibold text-bh-flare">{project.title}</h2>
        <p className="mt-2 max-h-36 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-bh-text/90 sm:max-h-44">
          {project.description}
        </p>

        {project.technologies.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {project.technologies.map((t) => (
              <li key={t} className={ds.tag}>
                {t}
              </li>
            ))}
          </ul>
        )}

        {(project.liveUrl || project.githubUrl) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={ds.btnPrimary}>
                Ver online
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={ds.btnGhost}>
                Código no GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  total,
  onClose,
}: {
  step: TimelineItem;
  index: number;
  total: number;
  onClose: () => void;
}) {
  return (
    <section
      role="region"
      aria-label={step.title}
      className={`pointer-events-auto mx-3 mb-2 max-h-[62dvh] overflow-y-auto rounded-2xl p-4 sm:mx-auto sm:mb-3 sm:w-[min(40rem,calc(100%-4rem))] sm:p-5 ${ds.glass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={ds.eyebrow}>
          {`// ${step.kind} ${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="-mr-1 -mt-1 rounded-full px-2 font-code text-lg leading-none text-bh-mute hover:text-bh-flare"
        >
          ×
        </button>
      </div>
      <h2 className="mt-1 text-xl font-semibold text-bh-flare">{step.title}</h2>
      <p className="mt-0.5 text-sm text-bh-text/90">{step.place}</p>
      <p className="mt-1 font-code text-xs text-bh-amber">{step.period}</p>
      <p className="mt-3 text-sm leading-relaxed text-bh-text/90">{step.description}</p>
    </section>
  );
}
