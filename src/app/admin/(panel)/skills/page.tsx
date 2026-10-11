import { createSkill, deleteSkill, updateSkill } from "@/app/admin/_actions/skills";
import { Field, PageHeader } from "@/components/admin/fields";
import { DeleteButton, SubmitButton } from "@/components/admin/submit-button";
import { getSkills } from "@/db/queries";
import type { Skill } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@/lib/constants";

function SkillFields({ skill }: { skill?: Skill }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_12rem_8rem]">
      <Field label="nome" name="name" defaultValue={skill?.name} required maxLength={80} />
      <label className="grid gap-1">
        <span className="text-sm text-term-dim">categoria</span>
        <select name="category" defaultValue={skill?.category ?? "frontend"} className="admin-input">
          {SKILL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {SKILL_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>
      <Field label="nível (0 a 100)" name="level" type="number" min={0} max={100} defaultValue={skill?.level ?? 70} required />
    </div>
  );
}

export default async function SkillsPage() {
  await requireAdmin();
  const all = await getSkills();

  return (
    <>
      <PageHeader title="tecnologias" description="Aparecem no comando skills, agrupadas por categoria." />

      <details className="card mb-6">
        <summary className="cursor-pointer text-term-neon">+ nova tecnologia</summary>
        <form action={createSkill} className="mt-4 grid gap-4">
          <SkillFields />
          <div>
            <SubmitButton>adicionar</SubmitButton>
          </div>
        </form>
      </details>

      <div className="space-y-6">
        {SKILL_CATEGORIES.map((category) => {
          const items = all.filter((s) => s.category === category);
          return (
            <section key={category}>
              <h2 className="mb-2 text-term-amber">{SKILL_CATEGORY_LABELS[category]}</h2>
              {items.length === 0 ? (
                <p className="text-sm text-term-dim">Nenhuma tecnologia nesta categoria.</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((skill) => (
                    <li key={skill.id} className="card">
                      <details>
                        <summary className="flex cursor-pointer items-center justify-between gap-3">
                          <span>{skill.name}</span>
                          <span className="tabular-nums text-term-dim">{skill.level}%</span>
                        </summary>
                        <form action={updateSkill.bind(null, skill.id)} className="mt-4 grid gap-4">
                          <SkillFields skill={skill} />
                          <div>
                            <SubmitButton>salvar</SubmitButton>
                          </div>
                        </form>
                        <form action={deleteSkill.bind(null, skill.id)} className="mt-3">
                          <DeleteButton confirmText={`Excluir "${skill.name}"?`} />
                        </form>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
