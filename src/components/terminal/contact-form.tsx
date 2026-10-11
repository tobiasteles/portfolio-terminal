"use client";

import { useActionState, type ReactNode } from "react";
import { sendMessage, type ContactState } from "@/app/actions/contact";

const initialState: ContactState = { status: "idle" };

function Row({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-3">
      <span className="text-term-dim sm:pt-1">{label}:</span>
      <span className="block">
        {children}
        {error && (
          <span role="alert" className="mt-1 block text-sm text-term-danger">
            {error}
          </span>
        )}
      </span>
    </label>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initialState);

  if (state.status === "success") {
    return (
      <p role="status" className="text-term-neon">
        [ ok ] mensagem enviada. Respondo assim que possível.
      </p>
    );
  }

  const v = state.values ?? {};
  const e = state.errors ?? {};

  return (
    <form action={action} className="max-w-2xl space-y-3">
      <p className="text-term-dim">Preencha os campos e envie. Todos são obrigatórios.</p>

      <Row label="nome" error={e.name}>
        <input name="name" required maxLength={120} autoComplete="name" autoFocus defaultValue={v.name} className="t-input" />
      </Row>
      <Row label="e-mail" error={e.email}>
        <input name="email" type="email" required maxLength={200} autoComplete="email" defaultValue={v.email} className="t-input" />
      </Row>
      <Row label="assunto" error={e.subject}>
        <input name="subject" required maxLength={160} defaultValue={v.subject} className="t-input" />
      </Row>
      <Row label="mensagem" error={e.message}>
        <textarea name="message" required minLength={10} maxLength={5000} rows={5} defaultValue={v.message} className="t-input resize-y" />
      </Row>

      {/* Honeypot: invisível para pessoas, bots tendem a preencher. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Não preencha
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-term-danger">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "enviando..." : "enviar mensagem"}
      </button>
    </form>
  );
}
