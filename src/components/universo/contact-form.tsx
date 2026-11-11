"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { track } from "@vercel/analytics";
import { sendMessage, type ContactState } from "@/app/actions/contact";
import { ds } from "./ds";

const initialState: ContactState = { status: "idle" };

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={ds.eyebrow}>{label}</span>
      <span className="mt-1 block">{children}</span>
      {error && (
        <span role="alert" className="mt-1 block text-xs text-bh-plasma">
          {error}
        </span>
      )}
    </label>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initialState);

  useEffect(() => {
    if (state.status === "success") track("contato_enviado");
  }, [state.status]);

  if (state.status === "success") {
    return (
      <p role="status" className="text-bh-flare">
        Mensagem enviada. Obrigado pelo contato! Respondo assim que possível.
      </p>
    );
  }

  const v = state.values ?? {};
  const e = state.errors ?? {};

  return (
    <form action={action} className="space-y-3">
      <Field label="// nome" error={e.name}>
        <input name="name" required maxLength={120} autoComplete="name" defaultValue={v.name} className={ds.field} />
      </Field>
      <Field label="// e-mail" error={e.email}>
        <input name="email" type="email" required maxLength={200} autoComplete="email" defaultValue={v.email} className={ds.field} />
      </Field>
      <Field label="// assunto" error={e.subject}>
        <input name="subject" required maxLength={160} defaultValue={v.subject} className={ds.field} />
      </Field>
      <Field label="// mensagem" error={e.message}>
        <textarea name="message" required minLength={10} maxLength={5000} rows={4} defaultValue={v.message} className={`${ds.field} resize-y`} />
      </Field>

      {/* Honeypot: invisível para pessoas, bots tendem a preencher. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Não preencha
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-bh-plasma">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} aria-busy={pending} className={`${ds.btnPrimary} disabled:opacity-50`}>
        {pending ? "enviando…" : "enviar mensagem"}
      </button>
    </form>
  );
}
