import { createProject, deleteProject, moveProject, updateProject } from "@/app/admin/_actions/projects";
import { PageHeader } from "@/components/admin/fields";
import { ProjectForm } from "@/components/admin/project-form";
import { DeleteButton } from "@/components/admin/submit-button";
import { getProjects } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";

export default async function ProjectsPage() {
  await requireAdmin();
  const rows = await getProjects();

  return (
    <>
      <PageHeader title="projetos" description="A ordem aqui é a ordem exibida no comando projects." />

      <details className="card mb-6">
        <summary className="cursor-pointer text-term-neon">+ novo projeto</summary>
        <ProjectForm action={createProject} submitLabel="criar projeto" />
      </details>

      {rows.length === 0 ? (
        <p className="text-term-dim">Nenhum projeto cadastrado ainda.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((project, index) => (
            <li key={project.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-term-neon">{project.title}</p>
                  <p className="truncate text-xs text-term-dim">{project.technologies.join(", ") || "sem tecnologias"}</p>
                </div>
                <div className="flex gap-2">
                  <form action={moveProject.bind(null, project.id, "up")}>
                    <button type="submit" className="btn" disabled={index === 0} aria-label={`Mover ${project.title} para cima`}>
                      ↑
                    </button>
                  </form>
                  <form action={moveProject.bind(null, project.id, "down")}>
                    <button type="submit" className="btn" disabled={index === rows.length - 1} aria-label={`Mover ${project.title} para baixo`}>
                      ↓
                    </button>
                  </form>
                </div>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-term-dim hover:text-term-neon">editar</summary>
                <ProjectForm project={project} action={updateProject.bind(null, project.id)} submitLabel="salvar alterações" />
                <form action={deleteProject.bind(null, project.id)} className="mt-3">
                  <DeleteButton confirmText={`Excluir o projeto "${project.title}"?`} label="excluir projeto" />
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
