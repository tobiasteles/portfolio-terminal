import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <header>
        <h1 className="glow text-2xl font-bold text-term-neon">admin login</h1>
        <p className="mt-1 text-sm text-term-dim">Área restrita ao dono do portfólio.</p>
      </header>
      <LoginForm />
    </main>
  );
}
