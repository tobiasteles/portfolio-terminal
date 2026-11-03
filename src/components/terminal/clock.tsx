"use client";

import { useEffect, useState } from "react";
import { TIMEZONE } from "@/lib/constants";

/** Relógio de Brasília. Só monta no cliente para não divergir da hidratação. */
export function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now
    ? now.toLocaleTimeString("pt-BR", { timeZone: TIMEZONE, hour12: false })
    : "--:--:--";

  return <time className="tabular-nums text-term-fg">{time} BRT</time>;
}
