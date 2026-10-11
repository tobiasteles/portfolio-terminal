import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon: prompt ">_" neon sobre fundo escuro.
export default function Icon() {
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
          border: "2px solid #3dff8b",
          borderRadius: 6,
          color: "#3dff8b",
          fontSize: 19,
          fontWeight: 700,
          paddingBottom: 2,
        }}
      >
        {">_"}
      </div>
    ),
    { ...size },
  );
}
