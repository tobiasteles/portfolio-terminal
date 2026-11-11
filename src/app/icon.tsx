import { ImageResponse } from "next/og";
import { BlackHoleArt } from "@/lib/og-card";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon: o buraco negro com o disco laranja.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#040203", borderRadius: 8 }}>
        <BlackHoleArt size={30} />
      </div>
    ),
    { ...size },
  );
}
