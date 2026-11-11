"use client";

import { useState } from "react";
import { fileToJpegDataUrl } from "@/lib/image-resize";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * Campo de imagem: aceita um link https:// OU um arquivo do computador.
 * O arquivo é reduzido no navegador (JPEG) e salvo junto com o formulário no campo `name`.
 */
export function ImageUploadField({
  label,
  name,
  defaultValue,
  hint,
  maxSide = 1000,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  maxSide?: number;
}) {
  const initial = defaultValue ?? "";
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const isUpload = value.startsWith("data:");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      setError("Envie uma imagem PNG, JPG ou WebP.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("A imagem passa de 10 MB.");
      return;
    }
    try {
      setValue(await fileToJpegDataUrl(file, maxSide));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm text-term-dim">{label}</span>

      <div className="flex flex-wrap items-start gap-3">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Prévia" className="h-20 w-32 border border-term-line object-cover" />
        )}

        <div className="grid min-w-[16rem] flex-1 gap-2">
          <input
            type="url"
            value={isUpload ? "" : value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isUpload ? "imagem enviada do computador" : "https://... (link direto da imagem)"}
            className="admin-input"
          />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
            className="text-sm file:mr-3 file:border file:border-term-line file:bg-term-panel file:px-3 file:py-1.5 file:text-term-fg hover:file:border-term-neon"
          />
          {value && (
            <div>
              <button type="button" onClick={() => setValue("")} className="btn btn-danger">
                remover imagem
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-term-danger">
          {error}
        </p>
      )}
      {hint && <span className="text-xs text-term-dim">{hint}</span>}

      <input type="hidden" name={name} value={value} />
    </div>
  );
}
