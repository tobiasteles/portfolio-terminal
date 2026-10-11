import { CELL_ASPECT, cropRect, pixelsToAscii, type AsciiOptions } from "./ascii";

const MAX_SIDE = 800; // limita o canvas de trabalho para os sliders ficarem fluidos

function loadImage(src: string, cors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("load"));
    img.src = src;
  });
}

function toWorkCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não suporta canvas.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.getImageData(0, 0, 1, 1); // lança SecurityError se o canvas estiver "contaminado" por CORS
  return canvas;
}

export async function loadCanvasFromFile(file: File): Promise<HTMLCanvasElement> {
  const objectUrl = URL.createObjectURL(file);
  try {
    return toWorkCanvas(await loadImage(objectUrl, false));
  } catch {
    throw new Error("Não foi possível ler este arquivo como imagem.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function loadCanvasFromUrl(url: string): Promise<HTMLCanvasElement> {
  try {
    return toWorkCanvas(await loadImage(url, true));
  } catch {
    throw new Error(
      "Não foi possível carregar essa URL. O endereço pode estar incorreto ou o site bloqueia o uso da imagem (CORS). Baixe a foto e use o upload.",
    );
  }
}

function halve(source: HTMLCanvasElement): HTMLCanvasElement {
  const next = document.createElement("canvas");
  next.width = Math.ceil(source.width / 2);
  next.height = Math.ceil(source.height / 2);
  const ctx = next.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, next.width, next.height);
  return next;
}

export function canvasToAscii(source: HTMLCanvasElement, options: AsciiOptions): string {
  const { sx, sy, sw, sh } = cropRect(source.width, source.height, options.zoom);
  const cols = options.cols;
  const rows = Math.max(1, Math.round(cols * CELL_ASPECT * (sh / sw)));

  let work = document.createElement("canvas");
  work.width = Math.max(1, Math.round(sw));
  work.height = Math.max(1, Math.round(sh));
  const wctx = work.getContext("2d")!;
  wctx.imageSmoothingQuality = "high";
  wctx.drawImage(source, sx, sy, sw, sh, 0, 0, work.width, work.height);

  // Reduz pela metade até chegar perto do tamanho final (evita serrilhado).
  while (work.width > cols * 2 && work.height > rows * 2) work = halve(work);

  const out = document.createElement("canvas");
  out.width = cols;
  out.height = rows;
  const octx = out.getContext("2d", { willReadFrequently: true })!;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(work, 0, 0, cols, rows);

  const { data } = octx.getImageData(0, 0, cols, rows);
  return pixelsToAscii(data, cols, rows, options);
}
