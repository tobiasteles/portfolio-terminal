import { getFaqs, getProfile, getProjects, getSkills } from "@/db/queries";
import { UniversoHome } from "@/components/universo/universo-home";
import { projectImageSrc, publicImageSrc } from "@/lib/image-data";
import type { OrbitProject } from "@/lib/orbit";
import { TIMELINE } from "@/lib/timeline";

// Os dados vêm do banco; o admin chama revalidatePath("/") ao salvar.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, skills, rows, faqs] = await Promise.all([
    getProfile(),
    getSkills(),
    getProjects(),
    getFaqs(),
  ]);

  const projects: OrbitProject[] = rows.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    // a imagem sai sempre por /imagem/projeto/ID (mesmo site: sem problema de CORS e sem peso no HTML)
    imageUrl: projectImageSrc(p.id, p.imageUrl),
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
    technologies: p.technologies,
  }));

  return (
    <main>
      <UniversoHome
        profile={{ ...profile, photoUrl: publicImageSrc(profile.photoUrl, "/foto") }}
        skills={skills}
        faqs={faqs}
        projects={projects}
        timeline={TIMELINE}
        year={new Date().getFullYear()}
      />

      {/* Buscadores e leitores de tela não enxergam o 3D: este resumo expõe o mesmo conteúdo em HTML. */}
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
        <h2>Trajetória</h2>
        <ul>
          {TIMELINE.map((t) => (
            <li key={t.id}>
              {t.title}, {t.place} ({t.period})
            </li>
          ))}
        </ul>
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
    </main>
  );
}
