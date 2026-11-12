import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { imageResponse, parseImageDataUrl } from "@/lib/image-data";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const OK_TYPES = /^image\/(png|jpe?g|webp|gif|avif)$/i;

/**
 * Imagem de um projeto, sempre servida pelo próprio site:
 *  - enviada pelo admin (data URL no banco): devolve os bytes;
 *  - link https cadastrado no admin: busca a imagem e repassa. Assim ela carrega mesmo em sites que não
 *    liberam uso em 3D (CORS) e o card e o planeta mostram a mesma imagem. O endereço vem do banco,
 *    nunca da URL da requisição, então isto não é um proxy aberto.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });

  const [row] = await db
    .select({ imageUrl: projects.imageUrl })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  const source = row?.imageUrl;
  if (!source) return new Response("Not found", { status: 404 });

  const embedded = parseImageDataUrl(source);
  if (embedded) return imageResponse(embedded);

  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (url.protocol !== "https:" || url.hostname === "localhost") return new Response("Not found", { status: 404 });

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "portfolio-image-proxy", Accept: "image/*" },
      cache: "no-store",
    });
    const type = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
    if (!res.ok || !OK_TYPES.test(type)) return new Response("Bad image", { status: 502 });
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) return new Response("Too large", { status: 502 });
    return new Response(bytes, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }
}
