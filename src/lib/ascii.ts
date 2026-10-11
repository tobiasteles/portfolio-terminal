/**
 * Conversão imagem -> arte ASCII. Funções puras, sem DOM.
 * O gerador no navegador (ascii-browser.ts) só prepara os pixels e chama pixelsToAscii.
 */

// Rampa clássica de 70 níveis, do mais denso ao mais claro.
const DETAILED = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

/** Cada rampa vai do "vazio" (espaço) ao mais denso, para fundo escuro. */
export const RAMPS = {
  classico: " .:-=+*#%@",
  detalhado: [...DETAILED].reverse().join(""),
  contraste: " .:oO#@",
} as const;

export type RampName = keyof typeof RAMPS;

export const RAMP_LABELS: Record<RampName, string> = {
  classico: "clássico (. : - = + * # % @)",
  detalhado: "detalhado (70 símbolos)",
  contraste: "alto contraste (. : o O # @)",
};

export type AsciiOptions = {
  /** Largura em caracteres. */
  cols: number;
  /** 1 = neutro. */
  contrast: number;
  /** -0.5 a 0.5. */
  brightness: number;
  /** Inverte claro/escuro (útil para fotos escuras sobre fundo claro). */
  invert: boolean;
  ramp: RampName;
  /** 1 = enquadramento inteiro; maior = aproxima do rosto. */
  zoom: number;
};

export const DEFAULT_OPTIONS: AsciiOptions = {
  cols: 64,
  contrast: 1.4,
  brightness: 0,
  invert: false,
  ramp: "classico",
  zoom: 1,
};

/** Largura/altura de uma célula de caractere (fonte mono 0.6em com line-height 1). */
export const CELL_ASPECT = 0.6;

const PORTRAIT = 4 / 5;

/** Recorte em retrato 4:5, ancorado no terço superior (onde ficam os rostos). */
export function cropRect(width: number, height: number, zoom: number) {
  let sw = width;
  let sh = height;
  if (width / height > PORTRAIT) sw = height * PORTRAIT;
  else sh = width / PORTRAIT;
  sw /= zoom;
  sh /= zoom;
  return { sx: (width - sw) / 2, sy: (height - sh) * 0.3, sw, sh };
}

/** `data` é RGBA (como ImageData.data). Transparência é composta sobre preto. */
export function pixelsToAscii(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  { contrast, brightness, invert, ramp }: Pick<AsciiOptions, "contrast" | "brightness" | "invert" | "ramp">,
): string {
  const chars = RAMPS[ramp];
  const last = chars.length - 1;
  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3] / 255;
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) * alpha;
      let v = (lum / 255 - 0.5) * contrast + 0.5 + brightness;
      v = Math.min(1, Math.max(0, v));
      if (invert) v = 1 - v;
      line += chars[Math.round(v * last)];
    }
    lines.push(line.replace(/\s+$/, ""));
  }
  return lines.join("\n");
}

/** Usado também no servidor: só ASCII imprimível, tamanho limitado. */
export function isValidAsciiArt(value: string) {
  if (!/^[\x20-\x7E\n]+$/.test(value)) return false;
  const lines = value.split("\n");
  return lines.length <= 100 && lines.every((l) => l.length <= 160);
}
