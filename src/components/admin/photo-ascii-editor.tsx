"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { AsciiPortrait } from "@/components/ascii-portrait";
import { DEFAULT_OPTIONS, RAMP_LABELS, type AsciiOptions, type RampName } from "@/lib/ascii";
import { canvasToAscii, loadCanvasFromFile, loadCanvasFromUrl } from "@/lib/ascii-browser";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

type Status = { kind: "idle" | "loading" | "ok" | "error"; message?: string };

function Slider({
  label,
  value,
  min,
  max,
  step,
  disabled,
  format = (v: number) => String(v),
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="flex justify-between text-term-dim">
        <span>{label}</span>
        <span className="tabular-nums">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#3dff8b] disabled:opacity-40"
      />
    </label>
  );
}

/**
 * Renderiza campos ocultos `photoAscii` e `photoUrl` dentro do <form> do perfil.
 * Os inputs de URL/arquivo daqui NÃO têm `name`, então não são enviados no submit
 * (a imagem em si nunca sai do navegador; só o texto ASCII é salvo).
 */
export function PhotoAsciiEditor({
  initialAscii,
  initialUrl,
}: {
  initialAscii: string | null;
  initialUrl: string | null;
}) {
  const [ascii, setAscii] = useState(initialAscii ?? "");
  const [url, setUrl] = useState(initialUrl ?? "");
  const [savedUrl, setSavedUrl] = useState(initialUrl ?? "");
  const [opts, setOpts] = useState<AsciiOptions>(DEFAULT_OPTIONS);
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Regera o ASCII sempre que a imagem ou um ajuste mudar.
  useEffect(() => {
    if (!source) return;
    try {
      setAscii(canvasToAscii(source, opts));
    } catch {
      setStatus({ kind: "error", message: "Falha ao converter a imagem." });
    }
  }, [source, opts]);

  const set = <K extends keyof AsciiOptions>(key: K, value: AsciiOptions[K]) =>
    setOpts((o) => ({ ...o, [key]: value }));

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      setStatus({ kind: "error", message: "Envie uma imagem PNG, JPG, WebP ou GIF." });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStatus({ kind: "error", message: "A imagem passa de 10 MB." });
      return;
    }
    setStatus({ kind: "loading", message: "Lendo imagem..." });
    try {
      setSource(await loadCanvasFromFile(file));
      setSavedUrl(""); // upload não tem URL de origem
      setStatus({ kind: "ok", message: "Imagem carregada. Ajuste e salve o perfil." });
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  }

  async function onLoadUrl() {
    const value = url.trim();
    let valid = false;
    try {
      const { protocol } = new URL(value);
      valid = protocol === "http:" || protocol === "https:";
    } catch {}
    if (!valid) {
      setStatus({ kind: "error", message: "Informe uma URL http:// ou https:// válida." });
      return;
    }
    setStatus({ kind: "loading", message: "Baixando imagem..." });
    try {
      setSource(await loadCanvasFromUrl(value));
      setSavedUrl(value);
      setStatus({ kind: "ok", message: "Imagem carregada. Ajuste e salve o perfil." });
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  }

  function remove() {
    setSource(null);
    setAscii("");
    setUrl("");
    setSavedUrl("");
    setStatus({ kind: "ok", message: "Foto removida. Salve o perfil para confirmar." });
  }

  // Enter no campo de URL carrega a imagem em vez de enviar o formulário inteiro.
  const onUrlKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onLoadUrl();
    }
  };

  const tuning = source !== null;

  return (
    <fieldset className="grid gap-4 border border-term-line p-4">
      <legend className="px-2 text-term-amber">foto de perfil (arte ASCII)</legend>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="min-h-40 overflow-x-auto border border-term-line bg-term-bg p-3">
          {ascii ? (
            <AsciiPortrait art={ascii} label="Prévia do retrato em ASCII" />
          ) : (
            <p className="text-sm text-term-dim">Nenhuma foto definida.</p>
          )}
        </div>

        <div className="grid content-start gap-4">
          <div className="grid gap-1">
            <label htmlFor="photo-url" className="text-sm text-term-dim">
              URL da imagem
            </label>
            <div className="flex gap-2">
              <input
                id="photo-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={onUrlKey}
                placeholder="https://github.com/seu-usuario.png"
                className="admin-input"
              />
              <button type="button" onClick={onLoadUrl} className="btn shrink-0">
                carregar
              </button>
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="photo-file" className="text-sm text-term-dim">
              ou envie um arquivo (PNG, JPG, WebP; até 10 MB)
            </label>
            <input
              id="photo-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
              className="text-sm file:mr-3 file:border file:border-term-line file:bg-term-panel file:px-3 file:py-1.5 file:text-term-fg hover:file:border-term-neon"
            />
          </div>

          {status.kind !== "idle" && (
            <p
              role={status.kind === "error" ? "alert" : "status"}
              className={`text-sm ${status.kind === "error" ? "text-term-danger" : "text-term-dim"}`}
            >
              {status.message}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Slider label="largura (caracteres)" value={opts.cols} min={32} max={100} step={2} disabled={!tuning} onChange={(v) => set("cols", v)} />
            <Slider label="zoom" value={opts.zoom} min={1} max={3} step={0.1} disabled={!tuning} format={(v) => `${v.toFixed(1)}x`} onChange={(v) => set("zoom", v)} />
            <Slider label="contraste" value={opts.contrast} min={0.5} max={2.5} step={0.05} disabled={!tuning} format={(v) => v.toFixed(2)} onChange={(v) => set("contrast", v)} />
            <Slider label="brilho" value={opts.brightness} min={-0.4} max={0.4} step={0.02} disabled={!tuning} format={(v) => v.toFixed(2)} onChange={(v) => set("brightness", v)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-1 text-sm">
              <span className="text-term-dim">estilo dos símbolos</span>
              <select
                value={opts.ramp}
                disabled={!tuning}
                onChange={(e) => set("ramp", e.target.value as RampName)}
                className="admin-input disabled:opacity-40"
              >
                {(Object.keys(RAMP_LABELS) as RampName[]).map((name) => (
                  <option key={name} value={name}>
                    {RAMP_LABELS[name]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={opts.invert}
                disabled={!tuning}
                onChange={(e) => set("invert", e.target.checked)}
                className="accent-[#3dff8b]"
              />
              inverter claro/escuro
            </label>
          </div>

          {!tuning && (
            <p className="text-xs text-term-dim">
              Os ajustes ficam disponíveis depois de carregar uma imagem. Sem carregar nada, o retrato atual é mantido.
            </p>
          )}

          <div>
            <button type="button" onClick={remove} className="btn btn-danger">
              remover foto
            </button>
          </div>
        </div>
      </div>

      {/* Valores enviados no submit do formulário do perfil. */}
      <textarea hidden readOnly name="photoAscii" value={ascii} />
      <input type="hidden" name="photoUrl" value={savedUrl} />
    </fieldset>
  );
}
