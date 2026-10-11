export const SKILL_CATEGORIES = ["frontend", "backend", "database", "tools"] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Banco de Dados",
  tools: "Ferramentas",
};

export const TIMEZONE = "America/Sao_Paulo"; // horário de Brasília (DF)
