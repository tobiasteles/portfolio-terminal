import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getProfile } from "@/db/queries";
import { siteUrl } from "@/lib/site";

// Lê nome/cargo/retrato do banco a cada requisição (não congela no build).
export const dynamic = "force-dynamic";

export const alt = "Portfólio em formato de terminal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  bg: "#0c0c0c",
  line: "#3a3a3a",
  fg: "#cccccc",
  dim: "#767676",
  neon: "#cccccc",
  amber: "#f9f1a5",
};

// Fonte opcional. Sem o arquivo, a imagem sai com a fonte padrão e sem o retrato ASCII
// (o retrato precisa de fonte monoespaçada para não desalinhar).
async function loadFont() {
  try {
    return await readFile(join(process.cwd(), "src/assets/JetBrainsMono-Bold.ttf"));
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [profile, font] = await Promise.all([getProfile(), loadFont()]);

  const art = font && profile.photoAscii ? profile.photoAscii.split("\n") : null;
  let artFont = 0;
  if (art) {
    const cols = Math.max(...art.map((row) => row.length), 1);
    artFont = Math.min(12, 430 / (cols * 0.6), 440 / art.length);
  }

  const nameSize = art ? 68 : 88;
  const host = new URL(siteUrl).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 36,
          background: C.bg,
          backgroundImage: `radial-gradient(circle at 15% 10%, #1f1f1f 0%, ${C.bg} 55%)`,
          fontFamily: font ? "JetBrains Mono" : undefined,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 48,
            padding: "40px 52px",
            border: `2px solid ${C.line}`,
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontSize: 28, color: C.dim }}>
              <span>{"C:\\Users\\visitante> whoami"}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: nameSize,
                  lineHeight: 1.05,
                  color: C.neon,
                  
                }}
              >
                {profile.name}
              </div>
              <div style={{ display: "flex", marginTop: 22, fontSize: 34, color: C.fg }}>
                {profile.headline}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 26, color: C.dim }}>{host}</span>
              <div style={{ width: 16, height: 30, marginLeft: 14, background: C.neon }} />
            </div>
          </div>

          {art && (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 430 }}>
              {art.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    height: artFont,
                    fontSize: artFont,
                    lineHeight: 1,
                    whiteSpace: "pre",
                    color: C.neon,
                  }}
                >
                  {row || " "}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "JetBrains Mono", data: font, style: "normal", weight: 700 }] : undefined,
    },
  );
}
