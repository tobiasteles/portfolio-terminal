import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Ícone da tela inicial do iPhone/iPad (o iOS aplica os cantos arredondados).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#040805",
          color: "#3dff8b",
          fontSize: 104,
          fontWeight: 700,
          paddingBottom: 10,
        }}
      >
        {">_"}
      </div>
    ),
    { ...size },
  );
}
