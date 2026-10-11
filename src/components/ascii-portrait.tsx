import type { CSSProperties } from "react";

type Props = {
  art: string;
  label: string;
  /** Revela o retrato linha por linha (só CSS). */
  animate?: boolean;
  className?: string;
};

export function AsciiPortrait({ art, label, animate = false, className = "" }: Props) {
  const rows = art.split("\n");
  return (
    <figure role="img" aria-label={label} className={`m-0 ${className}`}>
      <pre
        aria-hidden="true"
        className="glow-soft m-0 font-mono text-[7px] leading-none text-term-neon sm:text-[8px]"
        style={{ WebkitTextSizeAdjust: "100%" }}
      >
        {rows.map((row, i) => (
          <span
            key={i}
            className={animate ? "ascii-row" : "block"}
            style={animate ? ({ "--r": i } as CSSProperties) : undefined}
          >
            {row || "\u00a0"}
          </span>
        ))}
      </pre>
    </figure>
  );
}
