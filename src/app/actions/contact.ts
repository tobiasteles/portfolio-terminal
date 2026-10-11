"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { notifyNewMessage } from "@/lib/notify";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "subject" | "message", string>>;
  values?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120, "Máximo de 120 caracteres."),
  email: z.string().trim().email("E-mail inválido.").max(200),
  subject: z.string().trim().min(3, "Informe o assunto.").max(160, "Máximo de 160 caracteres."),
  message: z
    .string()
    .trim()
    .min(10, "Escreva pelo menos 10 caracteres.")
    .max(5000, "Máximo de 5000 caracteres."),
});

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: humanos não veem este campo; bots costumam preenchê-lo.
  if (String(formData.get("website") ?? "").length > 0) {
    return { status: "success" };
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Corrija os campos destacados.",
      errors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        subject: fieldErrors.subject?.[0],
        message: fieldErrors.message?.[0],
      },
      values,
    };
  }

  try {
    await db.insert(messages).values(parsed.data);
  } catch (error) {
    console.error("Falha ao salvar mensagem:", error);
    return {
      status: "error",
      message: "Não foi possível enviar agora. Tente novamente em instantes.",
      values,
    };
  }

  revalidatePath("/admin", "layout");

  // Roda depois da resposta: o visitante não espera o e-mail/WhatsApp sair.
  after(() => notifyNewMessage(parsed.data));

  return { status: "success" };
}
