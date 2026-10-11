"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "salvando...",
  className = "btn btn-primary",
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

/** Botão de exclusão com confirmação do navegador. Use dentro de um <form action={...}>. */
export function DeleteButton({ label = "excluir", confirmText }: { label?: string; confirmText: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="btn btn-danger"
    >
      {pending ? "excluindo..." : label}
    </button>
  );
}
