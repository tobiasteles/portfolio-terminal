import { saveProfile } from "@/app/admin/_actions/profile";
import { Field, PageHeader, TextArea } from "@/components/admin/fields";
import { PhotoAsciiEditor } from "@/components/admin/photo-ascii-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { getProfile } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";

export default async function ProfilePage() {
  await requireAdmin();
  const profile = await getProfile();

  return (
    <>
      <PageHeader
        title="perfil"
        description="Informações pessoais e foto exibidas no terminal (comandos about e whoami) e no rodapé."
      />

      <form action={saveProfile} className="card grid max-w-4xl gap-4">
        <PhotoAsciiEditor initialAscii={profile.photoAscii} initialUrl={profile.photoUrl} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="nome" name="name" defaultValue={profile.name} required maxLength={120} />
          <Field label="título profissional" name="headline" defaultValue={profile.headline} required maxLength={200} />
        </div>
        <TextArea label="bio" name="bio" defaultValue={profile.bio} required maxLength={3000} rows={6} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="localização" name="location" defaultValue={profile.location} maxLength={120} />
          <Field label="e-mail de contato" name="email" type="email" defaultValue={profile.email} />
        </div>
        <Field label="GitHub" name="githubUrl" type="url" defaultValue={profile.githubUrl} placeholder="https://github.com/usuario" />
        <Field label="LinkedIn" name="linkedinUrl" type="url" defaultValue={profile.linkedinUrl} placeholder="https://www.linkedin.com/in/usuario" />
        <Field
          label="currículo (PDF)"
          name="resumeUrl"
          defaultValue={profile.resumeUrl}
          placeholder="/curriculo.pdf"
          hint="Caminho de um arquivo em public/ (ex.: /curriculo.pdf) ou uma URL https:// pública."
        />
        <div>
          <SubmitButton>salvar perfil</SubmitButton>
        </div>
      </form>
    </>
  );
}
