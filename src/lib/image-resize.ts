import { MAX_IMAGE_DATA_URL } from "./image-data";
import { loadCanvasFromFile } from "./ascii-browser";

/** Reduz e comprime um canvas até caber no limite do banco. Roda só no navegador (admin). */
export function canvasToJpegDataUrl(source: HTMLCanvasElement, maxSide = 900): string {
  let scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  for (let attempt = 0; attempt < 6; attempt++) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(source.width * scale));
    c.height = Math.max(1, Math.round(source.height * scale));
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("Seu navegador não suporta canvas.");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff"; // PNG com fundo transparente vira fundo branco no JPEG
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(source, 0, 0, c.width, c.height);
    for (const quality of [0.86, 0.74, 0.62]) {
      const url = c.toDataURL("image/jpeg", quality);
      if (url.length <= MAX_IMAGE_DATA_URL) return url;
    }
    scale *= 0.8;
  }
  throw new Error("A imagem ficou grande demais para salvar. Tente uma menor.");
}

export async function fileToJpegDataUrl(file: File, maxSide = 900): Promise<string> {
  return canvasToJpegDataUrl(await loadCanvasFromFile(file), maxSide);
}
