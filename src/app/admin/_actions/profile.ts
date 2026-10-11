"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isValidAsciiArt } from "@/lib/ascii";
import { emptyToNull, optionalHttpUrl, optionalResumeLink } from "@/lib/validators";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  headline: z.string().trim().min(1).max(200),
  bio: z.string().trim().min(1).max(3000),
  location: emptyToNull(z.string().trim().max(120)),
  email: emptyToNull(z.string().trim().email().max(200)),
  resumeUrl: optionalResumeLink,
  githubUrl: optionalHttpUrl,
  linkedinUrl: optionalHttpUrl,
  photoUrl: optionalHttpUrl,
  // Formulários normalizam quebras de linha para CRLF: voltamos para LF antes de validar.
  photoAscii: z.preprocess(
    (v) => {
      if (typeof v !== "string") return null;
      const normalized = v.replace(/\r\n?/g, "\n").replace(/\n+$/, "");
      return normalized.trim() === "" ? null : normalized;
    },
    z.string().max(20000).refine(isValidAsciiArt, "Arte ASCII inválida.").nullable(),
  ),
});

export async function saveProfile(formData: FormData) {
  await requireAdmin();
  const data = schema.parse(Object.fromEntries(formData));

  await db
    .insert(profile)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: profile.id, set: { ...data, updatedAt: new Date() } });

  revalidatePath("/");
  revalidatePath("/admin/profile");
}
