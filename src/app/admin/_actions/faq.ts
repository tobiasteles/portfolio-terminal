"use server";

import { asc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(3000),
});

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/faq");
}

export async function createFaq(formData: FormData) {
  await requireAdmin();
  const data = schema.parse(Object.fromEntries(formData));
  const [row] = await db.select({ value: max(faqs.order) }).from(faqs);
  await db.insert(faqs).values({ ...data, order: (row?.value ?? -1) + 1 });
  refresh();
}

export async function updateFaq(id: number, formData: FormData) {
  await requireAdmin();
  await db.update(faqs).set(schema.parse(Object.fromEntries(formData))).where(eq(faqs.id, id));
  refresh();
}

export async function deleteFaq(id: number) {
  await requireAdmin();
  await db.delete(faqs).where(eq(faqs.id, id));
  refresh();
}

export async function moveFaq(id: number, direction: "up" | "down") {
  await requireAdmin();
  const rows = await db
    .select({ id: faqs.id, order: faqs.order })
    .from(faqs)
    .orderBy(asc(faqs.order), asc(faqs.id));

  const from = rows.findIndex((r) => r.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= rows.length) return;

  const next = [...rows];
  [next[from], next[to]] = [next[to], next[from]];

  for (const [index, row] of next.entries()) {
    if (row.order !== index) {
      await db.update(faqs).set({ order: index }).where(eq(faqs.id, row.id));
    }
  }
  refresh();
}
