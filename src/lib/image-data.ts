/** Imagens enviadas pelo admin ficam no banco como "data URL" (data:image/jpeg;base64,...). */

export const MAX_IMAGE_DATA_URL = 400_000; // caracteres (~300 KB de imagem)
export const IMAGE_DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

export function isImageDataUrl(value: string | null | undefined): value is string {
  return !!value && value.length <= MAX_IMAGE_DATA_URL && IMAGE_DATA_URL_RE.test(value);
}

export function parseImageDataUrl(value: string | null | undefined) {
  if (!isImageDataUrl(value)) return null;
  const comma = value.indexOf(",");
  const mime = value.slice(5, value.indexOf(";"));
  return { mime, bytes: Buffer.from(value.slice(comma + 1), "base64") };
}

/** Resposta HTTP com a imagem e cache longo (a URL muda quando a imagem muda, via ?v=). */
export function imageResponse(image: { mime: string; bytes: Buffer }) {
  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/** Hash curto só para mudar a URL quando a imagem muda. */
export function versionOf(value: string) {
  let h = 5381;
  for (let i = 0; i < value.length; i += 13) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return `${(h >>> 0).toString(36)}${value.length.toString(36)}`;
}

/**
 * Para o navegador: se a imagem está guardada como data URL, devolve o endereço curto
 * (/foto ou /imagem/projeto/1) em vez de colocar a imagem inteira dentro do HTML da página.
 */
export function publicImageSrc(value: string | null, route: string): string | null {
  if (!value) return null;
  return isImageDataUrl(value) ? `${route}?v=${versionOf(value)}` : value;
}
