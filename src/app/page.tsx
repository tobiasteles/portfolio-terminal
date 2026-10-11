import type { Metadata } from "next";
import { getFaqs, getProfile, getProjects, getSkills } from "@/db/queries";
import { StatusBar } from "@/components/terminal/status-bar";
import { Terminal } from "@/components/terminal/terminal";

// Os dados vêm do banco; o admin chama revalidatePath("/") ao salvar.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: `${profile.name} | ${profile.headline}`,
    description: profile.bio.slice(0, 160),
  };
}

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
      <StatusBar profile={profile} year={new Date().getFullYear()} />
    </main>
  );
}
