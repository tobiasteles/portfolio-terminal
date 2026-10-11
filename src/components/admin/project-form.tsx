import type { Project } from "@/db/schema";
import { Field, TextArea } from "./fields";
import { SubmitButton } from "./submit-button";

export function ProjectForm({
  project,
  action,
  submitLabel,
}: {
  project?: Project;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-4 grid gap-4">
      <Field label="título" name="title" defaultValue={project?.title} required maxLength={160} />
      <TextArea
        label="descrição curta"
        name="description"
        defaultValue={project?.description}
        required
        maxLength={600}
        rows={3}
      />
      <Field
        label="imagem (URL)"
        name="imageUrl"
        type="url"
        defaultValue={project?.imageUrl}
        placeholder="https://..."
        hint="Link direto para uma imagem hospedada (Vercel Blob, Cloudinary, GitHub raw etc.)."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="link da aplicação (live demo)" name="liveUrl" type="url" defaultValue={project?.liveUrl} placeholder="https://..." />
        <Field label="link do GitHub" name="githubUrl" type="url" defaultValue={project?.githubUrl} placeholder="https://github.com/..." />
      </div>
      <Field
        label="tecnologias"
        name="technologies"
        defaultValue={project?.technologies.join(", ")}
        placeholder="Next.js, TypeScript, Tailwind"
        hint="Separe por vírgula."
      />
      <div>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
