"use client";

import { useEffect, useRef } from "react";

const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number) => Math.max(0, Math.min(1, x));

const DARK_PAUSE = 0.5; // segundos de preto total antes do ponto acender
const GROW = 3.2; // segundos até a luz chegar ao tamanho final

type Burst = { x: number; y: number; born: number; life: number; n: number; seed: number; len: number };

/**
 * O "recomeço" depois da queda: um ponto branco-quente acende no escuro, cresce até virar uma luz
 * alaranjada grande e solta uma onda de choque suave. Depois disso, ficam estrelinhas minúsculas
 * explodindo em volta (por trás do cartão do Sobre).
 */
export function Rebirth({ instant, reduced }: { instant: boolean; reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0;
    let h = 0;
    let raf = 0;
    const start = performance.now() - (instant || reduced ? (DARK_PAUSE + GROW) * 1000 : 0);
    const bursts: Burst[] = [];
    let nextBurst = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const sec = (now - start) / 1000;
      const q = clamp((sec - DARK_PAUSE) / GROW);
      const cx = w / 2;
      const cy = h / 2;
      const base = Math.min(w, h);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      if (q > 0) {
        const qe = ease(q);
        // depois de crescer, a luz "respira" de leve
        const breathe = q >= 1 && !reduced ? 1 + Math.sin(sec * 0.9) * 0.025 : 1;
        const rr = lerp(2, base * 0.62, qe) * breathe;
        const a = Math.min(1, q * 3);

        const b = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        b.addColorStop(0, `rgba(255,248,225,${a})`);
        b.addColorStop(0.3, `rgba(255,196,100,${0.85 * a})`);
        b.addColorStop(0.7, `rgba(255,112,30,${0.38 * a})`);
        b.addColorStop(1, "rgba(255,80,0,0)");
        ctx.fillStyle = b;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fill();

        // onda de choque suave
        if (q < 1) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = `rgba(255,170,70,${(1 - q) * 0.4})`;
          ctx.beginPath();
          ctx.arc(cx, cy, qe * Math.max(w, h) * 0.6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // cantos escuros, para o centro ficar em destaque
      const v = ctx.createRadialGradient(cx, cy, base * 0.25, cx, cy, Math.max(w, h) * 0.75);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);

      // estrelinhas explodindo: minúsculas, em volta do cartão
      if (!reduced && q >= 0.55) {
        if (sec >= nextBurst && bursts.length < 14) {
          nextBurst = sec + 0.22 + Math.random() * 0.4;
          const side = Math.random();
          // sorteia mais perto das bordas do que do centro
          const ang = Math.random() * Math.PI * 2;
          const dist = (0.28 + Math.random() * 0.62) * Math.max(w, h) * (side < 0.5 ? 0.55 : 0.4);
          bursts.push({
            x: cx + Math.cos(ang) * dist,
            y: cy + Math.sin(ang) * dist * 0.8,
            born: sec,
            life: 0.9 + Math.random() * 0.7,
            n: 6 + Math.floor(Math.random() * 6),
            seed: Math.random() * Math.PI,
            len: 3 + Math.random() * 6,
          });
        }
        for (let i = bursts.length - 1; i >= 0; i--) {
          const s = bursts[i];
          const age = (sec - s.born) / s.life;
          if (age >= 1) {
            bursts.splice(i, 1);
            continue;
          }
          const grow = 1 - Math.pow(1 - age, 3);
          const alpha = (1 - age) * 0.9;
          ctx.lineCap = "round";
          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(255,${Math.round(lerp(240, 170, age))},${Math.round(lerp(200, 90, age))},${alpha})`;
          for (let k = 0; k < s.n; k++) {
            const ang = s.seed + (k / s.n) * Math.PI * 2;
            const r1 = grow * s.len * 1.4;
            const r2 = r1 + s.len * (1 - age) * 0.8;
            ctx.beginPath();
            ctx.moveTo(s.x + Math.cos(ang) * r1, s.y + Math.sin(ang) * r1);
            ctx.lineTo(s.x + Math.cos(ang) * r2, s.y + Math.sin(ang) * r2);
            ctx.stroke();
          }
          // o ponto de luz no centro da explosão
          ctx.fillStyle = `rgba(255,240,210,${alpha * (1 - age)})`;
          ctx.fillRect(s.x - 0.75, s.y - 0.75, 1.5, 1.5);
        }
      }

      if (reduced && q >= 1) return; // quadro final parado
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [instant, reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
