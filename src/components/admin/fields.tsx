import type { ReactNode } from "react";

type BaseProps = {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  hint?: string;
};

export function Field({
  label,
  name,
  defaultValue,
  hint,
  type = "text",
  ...rest
}: BaseProps & { type?: string; min?: number; max?: number }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-term-dim">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} className="admin-input" {...rest} />
      {hint && <span className="text-xs text-term-dim">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  hint,
  rows = 4,
  ...rest
}: BaseProps & { rows?: number }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-term-dim">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="admin-input resize-y"
        {...rest}
      />
      {hint && <span className="text-xs text-term-dim">{hint}</span>}
    </label>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="glow text-2xl font-bold text-term-neon">{title}</h1>
        {description && <p className="mt-1 text-sm text-term-dim">{description}</p>}
      </div>
      {children}
    </header>
  );
}
