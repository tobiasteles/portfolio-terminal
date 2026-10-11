"use server";

import { asc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { optionalHttpUrl, parseTags } from "@/lib/validators";

const schema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(600),
  imageUrl: optionalHttpUrl,
  liveUrl: optionalHttpUrl,
  githubUrl: optionalHttpUrl,
  technologies: z.string().default("").transform(parseTags),
});

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export async function createProject(formData: FormData) {
  await requireAdmin();
  const data = schema.parse(Object.fromEntries(formData));
  const [row] = await db.select({ value: max(projects.order) }).from(projects);
  await db.insert(projects).values({ ...data, order: (row?.value ?? -1) + 1 });
  refresh();
}

export async function updateProject(id: number, formData: FormData) {
  await requireAdmin();
  const data = schema.parse(Object.fromEntries(formData));
  await db.update(projects).set(data).where(eq(projects.id, id));
  refresh();
}

export async function deleteProject(id: number) {
  await requireAdmin();
  await db.delete(projects).where(eq(projects.id, id));
  refresh();
}

/** Reordena trocando o item com o vizinho e renumerando a lista (0..n-1). */
export async function moveProject(id: number, direction: "up" | "down") {
  await requireAdmin();
  const rows = await db
    .select({ id: projects.id, order: projects.order })
    .from(projects)
    .orderBy(asc(projects.order), asc(projects.id));

  const from = rows.findIndex((r) => r.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= rows.length) return;

  const next = [...rows];
  [next[from], next[to]] = [next[to], next[from]];

  for (const [index, row] of next.entries()) {
    if (row.order !== index) {
      await db.update(projects).set({ order: index }).where(eq(projects.id, row.id));
    }
  }
  refresh();
}
