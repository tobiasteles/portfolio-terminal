"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth";
import { clientIp, isLimited, recordHit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

// Hash descartável: mantém o tempo de resposta parecido quando o e-mail não existe.
const DUMMY_HASH = bcrypt.hashSync("senha-descartavel", 10);

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Informe um e-mail e uma senha válidos." };

  // Bloqueio: 8 falhas em 15 minutos, por IP ou por e-mail.
  const ipKey = `login-ip:${await clientIp()}`;
  const mailKey = `login-mail:${parsed.data.email}`;
  if ((await isLimited(ipKey, 8, 900)) || (await isLimited(mailKey, 8, 900))) {
    return { error: "Muitas tentativas. Aguarde 15 minutos e tente de novo." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    await Promise.all([recordHit(ipKey), recordHit(mailKey)]);
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession({ userId: user.id, email: user.email });
  redirect("/admin"); // redirect lança uma exceção: precisa ficar fora de try/catch
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
