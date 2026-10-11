"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { skills } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { SKILL_CATEGORIES } from "@/lib/constants";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(SKILL_CATEGORIES),
  level: z.coerce.number().int().min(0).max(100),
});

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/skills");
}

export async function createSkill(formData: FormData) {
  await requireAdmin();
  await db.insert(skills).values(schema.parse(Object.fromEntries(formData)));
  refresh();
}

export async function updateSkill(id: number, formData: FormData) {
  await requireAdmin();
  await db.update(skills).set(schema.parse(Object.fromEntries(formData))).where(eq(skills.id, id));
  refresh();
}

export async function deleteSkill(id: number) {
  await requireAdmin();
  await db.delete(skills).where(eq(skills.id, id));
  refresh();
}
