import { ImageResponse } from "next/og";
import { BlackHoleArt } from "@/lib/og-card";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Ícone da tela inicial do iPhone/iPad (o iOS aplica os cantos arredondados).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#040203" }}>
        <BlackHoleArt size={168} />
      </div>
    ),
    { ...size },
  );
}
