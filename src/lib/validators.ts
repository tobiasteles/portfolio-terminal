import { z } from "zod";

export function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** Converte "" / undefined em null antes de validar. */
export const emptyToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (v) => (v == null || (typeof v === "string" && v.trim() === "") ? null : v),
    schema.nullable(),
  );

// Só aceita http(s): bloqueia `javascript:` e similares em href/src.
const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine(isHttpUrl, "URL inválida (use http:// ou https://)");

export const optionalHttpUrl = emptyToNull(httpUrl);

/** Currículo: URL http(s) ou caminho local (ex.: /curriculo.pdf em public/). */
export const optionalResumeLink = emptyToNull(
  z
    .string()
    .trim()
    .max(500)
    .refine(
      (v) => (v.startsWith("/") && !v.startsWith("//")) || isHttpUrl(v),
      "Use uma URL http(s) ou um caminho começando com /",
    ),
);

export function parseTags(input: string) {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ).slice(0, 20);
}
