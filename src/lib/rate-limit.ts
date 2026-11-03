import { and, count, eq, gte, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";

/** IP do visitante. Na Vercel, x-forwarded-for é definido pela própria plataforma. */
export async function clientIp() {
  const h = await headers();
  const raw = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0] ?? "desconhecido";
  return raw.trim().slice(0, 64);
}

/** true se a chave já passou do limite dentro da janela. */
export async function isLimited(key: string, limit: number, windowSeconds: number) {
  const since = new Date(Date.now() - windowSeconds * 1000);
  const [row] = await db
    .select({ value: count() })
    .from(rateLimits)
    .where(and(eq(rateLimits.key, key), gte(rateLimits.createdAt, since)));
  return (row?.value ?? 0) >= limit;
}

/** Registra uma tentativa e, de vez em quando, apaga as antigas. */
export async function recordHit(key: string) {
  await db.insert(rateLimits).values({ key });
  if (Math.random() < 0.02) {
    await db.delete(rateLimits).where(lt(rateLimits.createdAt, new Date(Date.now() - 24 * 3600 * 1000)));
  }
}
