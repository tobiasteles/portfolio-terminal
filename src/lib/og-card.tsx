import type { ReactElement } from "react";

/** Desenha o buraco negro só com CSS (o gerador de imagens do Next entende gradientes e rotação). */
export function BlackHoleArt({ size, rotate = -24 }: { size: number; rotate?: number }) {
  const hole = size * 0.26;
  return (
    <div style={{ display: "flex", position: "relative", width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* disco de acreção */}
      <div
        style={{
          position: "absolute",
          width: size,
          height: size * 0.26,
          borderRadius: size,
          transform: `rotate(${rotate}deg)`,
          background: "radial-gradient(ellipse closest-side at center, #fff1c2 0%, #ffb454 28%, #ff5a1a 58%, rgba(120,20,0,0) 100%)",
        }}
      />
      {/* sombra do buraco negro + anel de fótons */}
      <div
        style={{
          width: hole,
          height: hole,
          borderRadius: hole,
          background: "#000000",
          boxShadow: `0 0 0 ${Math.max(2, size * 0.008)}px #ffe9b8, 0 0 ${size * 0.12}px ${size * 0.03}px rgba(255,122,26,0.55)`,
        }}
      />
    </div>
  );
}

export function ogCard({ name, headline, host }: { name: string; headline: string; host: string }): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#040203",
        backgroundImage: "radial-gradient(circle at 72% 50%, #2a1206 0%, #040203 60%)",
        fontWeight: 700,
      }}
    >
      <div style={{ position: "absolute", right: 30, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
        <BlackHoleArt size={600} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          width: 700,
          height: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#a08a7a" }}>{"// portfólio"}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05, color: "#ffe9b8" }}>{name}</div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 34, color: "#ffb454" }}>{headline}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#a08a7a" }}>{host}</div>
      </div>
    </div>
  );
}
