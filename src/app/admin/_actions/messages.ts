"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

function refresh() {
  revalidatePath("/admin", "layout"); // atualiza inbox, dashboard e o contador no menu
}

export async function toggleRead(id: number) {
  await requireAdmin();
  await db
    .update(messages)
    .set({ isRead: sql`not ${messages.isRead}` })
    .where(eq(messages.id, id));
  refresh();
}

export async function deleteMessage(id: number) {
  await requireAdmin();
  await db.delete(messages).where(eq(messages.id, id));
  refresh();
}
