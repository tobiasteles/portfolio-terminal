import { getFaqs, getProfile, getProjects, getSkills } from "@/db/queries";
import { StatusBar } from "@/components/terminal/status-bar";
import { Terminal } from "@/components/terminal/terminal";

// Os dados vêm do banco; o admin chama revalidatePath("/") ao salvar.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, skills, projects, faqs] = await Promise.all([
    getProfile(),
    getSkills(),
    getProjects(),
    getFaqs(),
  ]);

  return (
    <main className="flex h-dvh flex-col">
      <Terminal profile={profile} skills={skills} projects={projects} faqs={faqs} />

      {/* Os buscadores não digitam comandos: este resumo expõe o mesmo conteúdo em HTML. */}
      <aside className="sr-only" aria-label="Resumo do portfólio">
        <h2>Sobre {profile.name}</h2>
        <p>{profile.headline}</p>
        <p>{profile.bio}</p>
        {skills.length > 0 && (
          <>
            <h2>Tecnologias</h2>
            <ul>
              {skills.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </>
        )}
        {projects.length > 0 && (
          <>
            <h2>Projetos</h2>
            <ul>
              {projects.map((p) => (
                <li key={p.id}>
                  <strong>{p.title}</strong>: {p.description}
                  {p.liveUrl && <a href={p.liveUrl}> ver online</a>}
                  {p.githubUrl && <a href={p.githubUrl}> código no GitHub</a>}
                </li>
              ))}
            </ul>
          </>
        )}
        {faqs.length > 0 && (
          <>
            <h2>Perguntas frequentes</h2>
            <dl>
              {faqs.map((f) => (
                <div key={f.id}>
                  <dt>{f.question}</dt>
                  <dd>{f.answer}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </aside>
      <StatusBar profile={profile} year={new Date().getFullYear()} />
    </main>
  );
}
