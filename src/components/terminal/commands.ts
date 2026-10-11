export const COMMANDS = [
  { name: "help", description: "lista os comandos disponíveis" },
  { name: "about", description: "quem sou eu" },
  { name: "skills", description: "tecnologias que domino, por categoria" },
  { name: "projects", description: "projetos que criei" },
  { name: "resume", description: "baixa o currículo em PDF" },
  { name: "faq", description: "perguntas frequentes" },
  { name: "contact", description: "envia uma mensagem para mim" },
  { name: "links", description: "GitHub, LinkedIn e e-mail" },
  { name: "clear", description: "limpa a tela (atalho: Ctrl+L)" },
] as const;

export type CommandName = (typeof COMMANDS)[number]["name"];

/** Atalhos clicáveis exibidos acima do prompt. */
export const QUICK_COMMANDS: CommandName[] = [
  "help",
  "skills",
  "projects",
  "resume",
  "faq",
  "contact",
  "clear",
];

const ALIASES = new Map<string, CommandName>([
  ["ajuda", "help"],
  ["?", "help"],
  ["whoami", "about"],
  ["sobre", "about"],
  ["tecnologias", "skills"],
  ["projetos", "projects"],
  ["ls", "projects"],
  ["cv", "resume"],
  ["curriculo", "resume"],
  ["contato", "contact"],
  ["social", "links"],
  ["cls", "clear"],
]);

/** minúsculas e sem acentos, para "currículo" == "curriculo". */
export function normalize(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function resolveCommand(raw: string): CommandName | null {
  const key = normalize(raw);
  const direct = COMMANDS.find((c) => c.name === key);
  return direct ? direct.name : (ALIASES.get(key) ?? null);
}
