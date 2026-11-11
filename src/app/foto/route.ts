import { getProfile } from "@/db/queries";
import { imageResponse, parseImageDataUrl } from "@/lib/image-data";

export const dynamic = "force-dynamic";

/** Foto de perfil enviada pelo admin (guardada no banco). */
export async function GET() {
  const profile = await getProfile();
  const image = parseImageDataUrl(profile.photoUrl);
  if (!image) return new Response("Not found", { status: 404 });
  return imageResponse(image);
}
