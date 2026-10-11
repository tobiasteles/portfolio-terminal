import { createFaq, deleteFaq, moveFaq, updateFaq } from "@/app/admin/_actions/faq";
import { Field, PageHeader, TextArea } from "@/components/admin/fields";
import { DeleteButton, SubmitButton } from "@/components/admin/submit-button";
import { getFaqs } from "@/db/queries";
import type { Faq } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

function FaqFields({ faq }: { faq?: Faq }) {
  return (
    <>
      <Field label="pergunta" name="question" defaultValue={faq?.question} required maxLength={300} />
      <TextArea label="resposta" name="answer" defaultValue={faq?.answer} required maxLength={3000} rows={4} />
    </>
  );
}

export default async function FaqPage() {
  await requireAdmin();
  const rows = await getFaqs();

  return (
    <>
      <PageHeader title="faq" description="Perguntas frequentes exibidas no comando faq." />

      <details className="card mb-6">
        <summary className="cursor-pointer text-term-neon">+ nova pergunta</summary>
        <form action={createFaq} className="mt-4 grid gap-4">
          <FaqFields />
          <div>
            <SubmitButton>adicionar</SubmitButton>
          </div>
        </form>
      </details>

      {rows.length === 0 ? (
        <p className="text-term-dim">Nenhuma pergunta cadastrada ainda.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((faq, index) => (
            <li key={faq.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 flex-1">{faq.question}</p>
                <div className="flex gap-2">
                  <form action={moveFaq.bind(null, faq.id, "up")}>
                    <button type="submit" className="btn" disabled={index === 0} aria-label="Mover para cima">
                      ↑
                    </button>
                  </form>
                  <form action={moveFaq.bind(null, faq.id, "down")}>
                    <button type="submit" className="btn" disabled={index === rows.length - 1} aria-label="Mover para baixo">
                      ↓
                    </button>
                  </form>
                </div>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-term-dim hover:text-term-neon">editar</summary>
                <form action={updateFaq.bind(null, faq.id)} className="mt-4 grid gap-4">
                  <FaqFields faq={faq} />
                  <div>
                    <SubmitButton>salvar alterações</SubmitButton>
                  </div>
                </form>
                <form action={deleteFaq.bind(null, faq.id)} className="mt-3">
                  <DeleteButton confirmText="Excluir esta pergunta?" />
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
