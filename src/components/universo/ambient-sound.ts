"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Engine = { ctx: AudioContext; master: GainNode; stop: () => void };

/** Cria um "drone" grave e lento, feito na hora com o WebAudio (sem arquivo de áudio). */
function createEngine(): Engine | null {
  const AC: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 520;
  filter.Q.value = 0.6;
  filter.connect(master);

  // eco longo, para o som parecer um espaço grande
  const delay = ctx.createDelay(1.5);
  delay.delayTime.value = 0.9;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.45;
  filter.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(master);

  const stoppable: (OscillatorNode | AudioBufferSourceNode)[] = [];

  // acorde lento em lá menor (A1, E2, A2, C3, E3), com cada nota "respirando" no seu ritmo
  [55, 82.41, 110, 130.81, 164.81].forEach((freq, i) => {
    [-4, 4].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = cents;

      const gain = ctx.createGain();
      gain.gain.value = 0.16 / (1 + i * 0.35);

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.03 + i * 0.017;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = gain.gain.value * 0.8;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      lfo.start();
      stoppable.push(osc, lfo);
    });
  });

  // o filtro abre e fecha devagar
  const filterLfo = ctx.createOscillator();
  filterLfo.frequency.value = 0.04;
  const filterLfoGain = ctx.createGain();
  filterLfoGain.gain.value = 170;
  filterLfo.connect(filterLfoGain);
  filterLfoGain.connect(filter.frequency);
  filterLfo.start();
  stoppable.push(filterLfo);

  // sopro bem baixinho
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 260;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.018;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start();
  stoppable.push(noise);

  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 2.5); // volume final: bem baixo

  return {
    ctx,
    master,
    stop: () => {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.8);
      window.setTimeout(() => {
        stoppable.forEach((n) => {
          try {
            n.stop();
          } catch {}
        });
        void ctx.close();
      }, 900);
    },
  };
}

/** Trilha ambiente: começa desligada; só toca depois de um clique (regra dos navegadores). */
export function useAmbientSound() {
  const [on, setOn] = useState(false);
  const engine = useRef<Engine | null>(null);

  const toggle = useCallback(() => {
    if (engine.current) {
      engine.current.stop();
      engine.current = null;
      setOn(false);
      return;
    }
    engine.current = createEngine();
    setOn(engine.current !== null);
  }, []);

  useEffect(
    () => () => {
      engine.current?.stop();
      engine.current = null;
    },
    [],
  );

  return { on, toggle };
}
