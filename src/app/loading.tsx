export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10" aria-busy="true" role="status">
      <p>
        {"C:\\Users\\visitante>"} carregando<span className="term-cursor ml-1" aria-hidden="true" />
      </p>
      <p className="mt-1 text-term-dim">Aguarde um instante...</p>
    </main>
  );
}
