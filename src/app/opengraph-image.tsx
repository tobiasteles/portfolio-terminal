import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getProfile } from "@/db/queries";
import { ogCard } from "@/lib/og-card";
import { siteUrl } from "@/lib/site";

// Lê nome/cargo do banco a cada requisição (não congela no build).
export const dynamic = "force-dynamic";

export const alt = "Portfólio com um buraco negro e projetos em órbita";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Fonte opcional: sem o arquivo, a imagem sai com a fonte padrão.
async function loadFont() {
  try {
    return await readFile(join(process.cwd(), "src/assets/JetBrainsMono-Bold.ttf"));
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [profile, font] = await Promise.all([getProfile(), loadFont()]);

  return new ImageResponse(
    ogCard({ name: profile.name, headline: profile.headline, host: new URL(siteUrl).host }),
    {
      ...size,
      fonts: font ? [{ name: "JetBrains Mono", data: font, style: "normal", weight: 700 }] : undefined,
    },
  );
}
