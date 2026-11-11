import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { imageResponse, parseImageDataUrl } from "@/lib/image-data";

export const dynamic = "force-dynamic";

/** Imagem de projeto enviada pelo admin (guardada no banco). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });

  const [row] = await db
    .select({ imageUrl: projects.imageUrl })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  const image = parseImageDataUrl(row?.imageUrl);
  if (!image) return new Response("Not found", { status: 404 });
  return imageResponse(image);
}
