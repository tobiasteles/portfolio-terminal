import { asc, count, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "./index";
import { faqs, messages, profile, projects, skills, type Profile } from "./schema";

const DEFAULT_PROFILE: Profile = {
  id: 1,
  name: "Seu Nome",
  headline: "Desenvolvedor Full Stack",
  bio: "Edite esta bio em /admin/profile.",
  location: "Brasília, DF",
  email: null,
  resumeUrl: null,
  githubUrl: null,
  linkedinUrl: null,
  photoUrl: null,
  photoAscii: null,
  updatedAt: new Date(0),
};

// `cache` deduplica chamadas repetidas dentro da mesma requisição.
export const getProfile = cache(async (): Promise<Profile> => {
  const [row] = await db.select().from(profile).where(eq(profile.id, 1)).limit(1);
  return row ?? DEFAULT_PROFILE;
});

export const getSkills = cache(() =>
  db.select().from(skills).orderBy(asc(skills.category), desc(skills.level), asc(skills.name)),
);

export const getProjects = cache(() =>
  db.select().from(projects).orderBy(asc(projects.order), asc(projects.id)),
);

export const getFaqs = cache(() =>
  db.select().from(faqs).orderBy(asc(faqs.order), asc(faqs.id)),
);

export async function getUnreadCount() {
  const [row] = await db
    .select({ value: count() })
    .from(messages)
    .where(eq(messages.isRead, false));
  return row?.value ?? 0;
}
