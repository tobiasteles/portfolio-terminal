"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../_actions/auth";
import { SubmitButton } from "@/components/admin/submit-button";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initial);

  return (
    <form action={action} className="card grid gap-4">
      <label className="grid gap-1">
        <span className="text-sm text-term-dim">e-mail</span>
        <input name="email" type="email" required autoComplete="username" autoFocus className="admin-input" />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-term-dim">senha</span>
        <input name="password" type="password" required autoComplete="current-password" className="admin-input" />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-term-danger">
          {state.error}
        </p>
      )}
      <SubmitButton pendingText="entrando...">entrar</SubmitButton>
    </form>
  );
}
