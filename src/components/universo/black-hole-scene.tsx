"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import { KEPLER_ORBITS, keplerPeriod, keplerPosition, type KeplerOrbit } from "@/lib/kepler";

/* ------------------------------------------------------------------ */
/* Medidas da cena                                                      */
/* ------------------------------------------------------------------ */
// A sombra do buraco negro tem raio 1 na cena. No shader, a unidade é o raio de Schwarzschild (rs),
// e a sombra aparente mede ~2,6 rs. Por isso 1 rs = 1 / 2,6 ≈ 0,385 unidades da cena (SCALE).
const HORIZON = 1;
const SCALE = 0.385;
const LENS_HALF = 8.2; // metade do lado do quadrado onde o shader desenha o buraco negro
// Disco inclinado: abre a elipse para ele parecer mais redondo, e a diagonal lembra o Gargantua.
const TILT: [number, number, number] = [0.26, 0, 0.35];
const DISK_EULER = new THREE.Euler(...TILT);
// Os planetas giram num plano ainda mais aberto, para as órbitas não virarem uma linha.
const ORBIT_TILT: [number, number, number] = [0.5, 0, 0.35];
const WARM_COLORS = ["#ffb454", "#ff6a3d", "#ffe9b8", "#ff8f5a", "#ffc978"];
const COOL_COLORS = ["#8fb4ff", "#7de0c6", "#c99bff", "#9fd3ff"];

/** Um planeta: um projeto ou um marco da trajetória. Com `imageUrl`, a imagem vira a "pele" do planeta. */
export type OrbitItem = { key: string; label: string; imageUrl: string | null };
export type OrbitStyle = "projects" | "timeline";

const STYLES = {
  // projetos em destaque: órbitas elípticas de Kepler (os raios daqui só valem para o tipo "circular")
  projects: { radii: [7.6, 8.6, 9.6], colors: WARM_COLORS, ring: "#ff9a4d", speed: 0.07 },
  // trajetória: anéis frios e separados, giram para o outro lado
  timeline: { radii: [7.9, 9.3], colors: COOL_COLORS, ring: "#8fb4ff", speed: -0.045 },
} as const;

/* ------------------------------------------------------------------ */
/* Lente gravitacional (GLSL)                                           */
/* Cada pixel dispara um raio de luz que é curvado pela gravidade do     */
/* buraco negro. Se o raio cruza o disco de acreção, pega a cor dele;    */
/* se cai no horizonte, fica preto. É daí que sai o anel de luz em volta. */
/* ------------------------------------------------------------------ */
const LENS_VERT = /* glsl */ `
varying vec2 vP;
void main(){
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const LENS_FRAG = /* glsl */ `
uniform float uTime;
uniform float uScale;
uniform float uDist;
uniform float uStepScale;
uniform int uSteps;
uniform mat3 uR;      // câmera -> espaço do disco
varying vec2 vP;

const float RIN = 3.0;    // borda interna do disco (3 rs)
const float ROUT = 18.0;  // borda externa

float hash3(vec3 p){
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise3(vec3 x){
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float fbm3(vec3 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise3(p); p = p * 2.02 + vec3(3.1, 1.7, 5.3); a *= 0.5; }
  return v;
}

// Emissão do disco num ponto 'hit' (espaço do disco, y = 0). 'dir' é a direção em que a luz viaja.
vec4 diskSample(vec3 hit, vec3 dir){
  float r = length(hit.xz);
  if (r < RIN || r > ROUT) return vec4(0.0);

  // Rotação diferencial (Kepler): perto do buraco gira bem mais rápido que longe.
  float omega = 3.4 * pow(r, -1.5);
  float a = atan(hit.z, hit.x) + omega * uTime;

  // O ruído usa cos/sin do ângulo para não ter emenda; o raio vira anéis de gás.
  vec3 q = vec3(cos(a) * 2.6, sin(a) * 2.6, r * 0.85);
  float n = fbm3(q);
  float lanes = 0.88 + 0.12 * sin(r * 7.0 + n * 8.0);
  float dens = (0.75 + 0.9 * n) * lanes;

  // Temperatura: branco-dourado por dentro, laranja no meio, vermelho nas bordas.
  float t = pow(RIN / r, 0.75);
  vec3 col = mix(vec3(0.85, 0.10, 0.02), vec3(1.0, 0.52, 0.08), smoothstep(0.25, 0.5, t));
  col = mix(col, vec3(1.0, 0.93, 0.68), smoothstep(0.5, 0.95, t));

  // Efeito Doppler: o lado que vem na nossa direção brilha muito mais.
  vec3 vTan = normalize(vec3(hit.z, 0.0, -hit.x));
  float beta = 0.8 * sqrt(0.5 / max(r - 1.0, 0.5));
  float g = sqrt(1.0 - beta * beta) / (1.0 - beta * dot(vTan, -dir));
  float beam = pow(clamp(g, 0.3, 2.0), 2.2);

  float edge = smoothstep(RIN, RIN + 0.5, r) * (1.0 - smoothstep(ROUT - 6.0, ROUT, r));
  float lum = (t * t * 7.0 + 0.35) * dens * beam * sqrt(max(1.0 - 1.0 / r, 0.0));
  float alpha = edge * clamp(0.45 + dens * 0.75, 0.0, 0.96);
  return vec4(col * lum, alpha);
}

void main(){
  // Raio saindo da câmera (no espaço da câmera) passando por este pixel.
  vec3 dir = normalize(uR * normalize(vec3(vP, -uDist)));
  vec3 pos = uR * vec3(0.0, 0.0, uDist) / uScale;

  float h2 = dot(cross(pos, dir), cross(pos, dir));
  vec3 vel = dir;
  vec3 acc = vec3(0.0);
  float accA = 0.0;
  float rmin = 1000.0;
  bool captured = false;

  for (int i = 0; i < 160; i++) {
    if (i >= uSteps) break;
    float r2 = dot(pos, pos);
    float r = sqrt(r2);
    rmin = min(rmin, r);
    if (r < 1.0) { captured = true; break; }
    if (r > 25.0 && dot(pos, vel) > 0.0) break;

    float dt = max(0.05, 0.1 * (r - 0.9)) * uStepScale;
    vel += (-1.5 * h2 * pos / (r2 * r2 * r)) * dt;   // a gravidade curva a trajetória da luz
    vec3 np = pos + vel * dt;

    if (pos.y * np.y < 0.0) {                         // cruzou o plano do disco
      float f = pos.y / (pos.y - np.y);
      vec4 d = diskSample(mix(pos, np, f), normalize(vel));
      acc += (1.0 - accA) * d.rgb * d.a;
      accA += (1.0 - accA) * d.a;
    }
    pos = np;
  }

  // Anel de fótons: luz que quase ficou presa orbitando o buraco, fina e branca.
  if (!captured) {
    float ring = exp(-pow((rmin - 1.58) / 0.05, 2.0));
    acc += (1.0 - accA) * vec3(1.0, 0.94, 0.78) * ring * 1.5;
  }

  vec3 col = 1.0 - exp(-acc * 1.5);
  float alpha = captured ? 1.0 : accA;
  gl_FragColor = vec4(col, alpha);
}
`;

/** Mantém o conteúdo sempre de frente para a câmera. */
function Facing({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    ref.current?.quaternion.copy(camera.quaternion);
  });
  return <group ref={ref}>{children}</group>;
}

function BlackHoleLens({ reduced, lite }: { reduced: boolean; lite: boolean }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScale: { value: SCALE },
      uDist: { value: 15 },
      uStepScale: { value: lite ? 1.35 : 1 },
      uSteps: { value: lite ? 90 : 140 },
      uR: { value: new THREE.Matrix3() },
    }),
    [lite],
  );
  const tmp = useMemo(
    () => ({
      m4: new THREE.Matrix4(),
      cam: new THREE.Matrix3(),
      disk: new THREE.Matrix3(),
      tilt: new THREE.Matrix3(),
      euler: new THREE.Euler(),
      mx: 0,
      my: 0,
    }),
    [],
  );

  useFrame(({ camera, pointer }, dt) => {
    if (!reduced) uniforms.uTime.value += Math.min(dt, 0.05);
    uniforms.uDist.value = camera.position.length();
    // R leva um vetor do espaço da câmera para o espaço do disco (que está inclinado).
    tmp.cam.setFromMatrix4(tmp.m4.makeRotationFromQuaternion(camera.quaternion));
    tmp.disk.setFromMatrix4(tmp.m4.makeRotationFromEuler(DISK_EULER));
    uniforms.uR.value.copy(tmp.disk).transpose().multiply(tmp.cam);

    // A luz reage ao mouse: o disco e o anel de luz inclinam de leve para onde o cursor está.
    if (!reduced) {
      tmp.mx += (pointer.x - tmp.mx) * 0.05;
      tmp.my += (pointer.y - tmp.my) * 0.05;
      tmp.euler.set(-tmp.my * 0.1, tmp.mx * 0.14, 0);
      tmp.tilt.setFromMatrix4(tmp.m4.makeRotationFromEuler(tmp.euler));
      uniforms.uR.value.premultiply(tmp.tilt);
    }
  });

  return (
    <Facing>
      <mesh renderOrder={10}>
        <planeGeometry args={[LENS_HALF * 2, LENS_HALF * 2]} />
        <shaderMaterial
          vertexShader={LENS_VERT}
          fragmentShader={LENS_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.CustomBlending}
          blendSrc={THREE.OneFactor}
          blendDst={THREE.OneMinusSrcAlphaFactor}
        />
      </mesh>
    </Facing>
  );
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
// Gira a esfera para o centro da imagem ficar sempre virado para a câmera.
const FACE = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

/**
 * Carrega a imagem do projeto como textura (ela vem do próprio site, então não há problema de CORS).
 * A imagem é recortada em quadrado no centro só para caber no planeta; a imagem inteira aparece no cartão.
 */
function useImageTexture(url: string | null) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) {
      setTex(null);
      return;
    }
    let alive = true;
    let loaded: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (t) => {
        if (!alive) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        const img = t.image as { width: number; height: number };
        const ar = img.width / img.height;
        // a face virada para a câmera é metade da esfera em largura: mostra o centro da imagem, sem esticar
        const rx = ar > 1 ? 2 / ar : 2;
        const ry = ar > 1 ? 1 : ar;
        t.repeat.set(rx, ry);
        t.offset.set(0.5 - rx / 2, 0.5 - ry / 2);
        loaded = t;
        setTex(t);
      },
      undefined,
      () => {
        if (alive) setTex(null);
      },
    );
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [url]);
  return tex;
}

type PlanetProps = {
  item: OrbitItem;
  index: number;
  total: number;
  /** órbita circular (trajetória) */
  radius: number;
  /** órbita elíptica (projetos em destaque); quando existe, manda na posição */
  kepler?: KeplerOrbit;
  clock: RefObject<number>;
  color: string;
  selected: boolean;
  holeRef: RefObject<THREE.Mesh | null>;
  onSelect: (key: string | null) => void;
  hoverRef: RefObject<boolean>;
};

function Planet({
  item,
  index,
  total,
  radius,
  kepler,
  clock,
  color,
  selected,
  holeRef,
  onSelect,
  hoverRef,
}: PlanetProps) {
  const angle = (index / total) * Math.PI * 2;
  const y = kepler ? 0 : Math.sin(index * 1.9) * 0.55;
  const tex = useImageTexture(item.imageUrl);
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const born = useRef(0);
  const tmp = useMemo(() => ({ pos: { x: 0, z: 0 }, q: new THREE.Quaternion() }), []);

  useFrame(({ camera }, dt) => {
    const d = Math.min(dt, 0.05);
    born.current += d;
    const g = group.current;
    if (!g) return;

    if (kepler) {
      keplerPosition(kepler, clock.current ?? 0, tmp.pos);
      g.position.set(tmp.pos.x, 0, tmp.pos.z);
    }
    // o planeta "nasce" crescendo, um depois do outro
    g.scale.setScalar(Math.max(0.0001, easeOutBack(clamp01((born.current - index * 0.35) / 0.9))));

    const m = body.current;
    if (!m) return;
    if (tex && m.parent) {
      m.parent.getWorldQuaternion(tmp.q);
      m.quaternion.copy(tmp.q).invert().multiply(camera.quaternion).multiply(FACE);
    } else {
      m.rotation.y += d * 0.25;
    }
  });

  const enter = () => {
    hoverRef.current = true;
    document.body.style.cursor = "pointer";
  };
  const leave = () => {
    hoverRef.current = false;
    document.body.style.cursor = "";
  };

  return (
    <group ref={group} position={kepler ? [0, 0, 0] : [Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
      <mesh
        ref={body}
        scale={selected ? 1.3 : 1}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.key);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          enter();
        }}
        onPointerOut={leave}
      >
        <sphereGeometry args={[tex ? 0.5 : 0.34, 48, 48]} />
        <meshStandardMaterial
          color={tex ? "#ffffff" : color}
          map={tex}
          emissive={tex ? "#ffffff" : color}
          emissiveMap={tex}
          emissiveIntensity={selected ? 0.8 : tex ? 0.4 : 0.28}
          roughness={0.55}
        />
      </mesh>
      <Html
        center
        position={[0, tex ? 1.0 : 0.85, 0]}
        distanceFactor={10}
        zIndexRange={[10, 0]}
        occlude={[holeRef as RefObject<THREE.Object3D>]}
        style={{ pointerEvents: "none" }}
      >
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onSelect(item.key)}
          onPointerEnter={enter}
          onPointerLeave={leave}
          className={
            "pointer-events-auto whitespace-nowrap rounded-full border px-3 py-1 font-code text-[19px] backdrop-blur-sm transition " +
            (selected
              ? "border-bh-ember bg-bh-ember/25 text-bh-flare"
              : "border-bh-line bg-bh-surface/70 text-bh-text hover:border-bh-ember")
          }
        >
          {item.label}
        </button>
      </Html>
    </group>
  );
}

/** A elipse da órbita (1ª lei de Kepler): o buraco negro fica num dos focos, na origem. */
function EllipseRing({ orbit, color }: { orbit: KeplerOrbit; color: string }) {
  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const b = orbit.a * Math.sqrt(1 - orbit.e * orbit.e);
    const c = Math.cos(orbit.omega);
    const s = Math.sin(orbit.omega);
    for (let i = 0; i < 180; i++) {
      const E = (i / 180) * Math.PI * 2;
      const px = orbit.a * (Math.cos(E) - orbit.e);
      const pz = b * Math.sin(E);
      pts.push(new THREE.Vector3(px * c - pz * s, 0, px * s + pz * c));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineLoop(geom, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 }));
  }, [orbit, color]);
  return <primitive object={line} />;
}

/**
 * A 2ª lei de Kepler, desenhada: a área varrida pela linha buraco negro → planeta em 1/8 do período.
 * Perto do buraco o setor fica largo e curto; longe, estreito e comprido, mas a área é sempre a mesma.
 */
function SweptArea({
  orbit,
  clock,
  color,
  active,
}: {
  orbit: KeplerOrbit;
  clock: RefObject<number>;
  color: string;
  active: boolean;
}) {
  const N = 28;
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array((N + 2) * 3), 3));
    const idx: number[] = [];
    for (let k = 1; k <= N; k++) idx.push(0, k, k + 1);
    g.setIndex(idx);
    return g;
  }, []);
  const tmp = useMemo(() => ({ x: 0, z: 0 }), []);

  useFrame(() => {
    const arr = geom.attributes.position.array as Float32Array;
    const span = keplerPeriod(orbit) / 8;
    const t = clock.current ?? 0;
    for (let k = 0; k <= N; k++) {
      keplerPosition(orbit, t - span * (1 - k / N), tmp);
      arr[(k + 1) * 3] = tmp.x;
      arr[(k + 1) * 3 + 1] = 0;
      arr[(k + 1) * 3 + 2] = tmp.z;
    }
    geom.attributes.position.needsUpdate = true;
  });

  return (
    <mesh geometry={geom} frustumCulled={false}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={active ? 0.3 : 0.1}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Orbits({
  items,
  style,
  selectedKey,
  holeRef,
  onSelect,
  reduced,
}: {
  items: OrbitItem[];
  style: OrbitStyle;
  selectedKey: string | null;
  holeRef: RefObject<THREE.Mesh | null>;
  onSelect: (key: string | null) => void;
  reduced: boolean;
}) {
  const cfg = STYLES[style];
  const isKepler = style === "projects";
  const group = useRef<THREE.Group>(null);
  const hoverRef = useRef(false);
  const clock = useRef(0);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    if (isKepler) {
      // só para quando você aponta, para ficar fácil de clicar; selecionado continua andando
      if (!reduced && !hoverRef.current) clock.current += d;
      return;
    }
    if (reduced || hoverRef.current || selectedKey !== null || !group.current) return;
    group.current.rotation.y += d * cfg.speed;
  });

  return (
    <group ref={group}>
      {isKepler
        ? items.slice(0, KEPLER_ORBITS.length).map((it, i) => (
            <group key={`orbit-${it.key}`}>
              <EllipseRing orbit={KEPLER_ORBITS[i]} color={cfg.ring} />
              <SweptArea
                orbit={KEPLER_ORBITS[i]}
                clock={clock}
                color={cfg.colors[i % cfg.colors.length]}
                active={it.key === selectedKey}
              />
            </group>
          ))
        : cfg.radii.slice(0, Math.min(items.length, cfg.radii.length)).map((r) => (
            <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r - 0.01, r + 0.01, 160, 1]} />
              <meshBasicMaterial color={cfg.ring} transparent opacity={0.16} side={THREE.DoubleSide} />
            </mesh>
          ))}
      {items.slice(0, isKepler ? KEPLER_ORBITS.length : items.length).map((item, i) => (
        <Planet
          key={item.key}
          item={item}
          index={i}
          total={items.length}
          radius={cfg.radii[i % cfg.radii.length]}
          kepler={isKepler ? KEPLER_ORBITS[i] : undefined}
          clock={clock}
          color={cfg.colors[i % cfg.colors.length]}
          selected={item.key === selectedKey}
          holeRef={holeRef}
          onSelect={onSelect}
          hoverRef={hoverRef}
        />
      ))}
    </group>
  );
}

/** Desloca a cena na tela (em pixels) para o buraco negro não ficar atrás dos painéis. */
function ViewShift({ x, y }: { x: number; y: number }) {
  const { camera, size } = useThree();
  const cur = useRef({ x: 0, y: 0 });
  useFrame(() => {
    const c = cur.current;
    c.x += (x - c.x) * 0.08;
    c.y += (y - c.y) * 0.08;
    const cam = camera as THREE.PerspectiveCamera;
    if (x === 0 && y === 0 && Math.abs(c.x) + Math.abs(c.y) < 0.5) {
      if (cam.view?.enabled) cam.clearViewOffset();
      return;
    }
    cam.setViewOffset(size.width, size.height, c.x, c.y, size.width, size.height);
  });
  return null;
}

/**
 * Controla a câmera em quatro momentos:
 *  1. aproximação inicial, quando o site abre (a câmera chega de longe);
 *  2. "pose": nas seções com planetas ela sobe para ver as órbitas de cima, e desce de volta depois;
 *  3. a "queda": com `dive` verdadeiro ela mergulha no buraco negro (acelerando e girando);
 *  4. o retorno da queda.
 * Também avisa a distância da câmera (para o rótulo de dilatação do tempo).
 */
const DIVE_DIST = 3.0; // pouco além de 5 rs: um círculo preto emoldurado pelo anel de luz
const HOME_DIR = new THREE.Vector3(0, 1.2, 15).normalize();
// De onde as elipses aparecem quase de frente: perto da normal do plano das órbitas, um pouco para trás.
const ORBITS_DIR = new THREE.Vector3(0, 1, 0)
  .applyEuler(new THREE.Euler(...ORBIT_TILT))
  .multiplyScalar(0.85)
  .add(new THREE.Vector3(0, 0, 0.5))
  .normalize();

function CameraRig({
  dive,
  pose,
  reduced,
  onDistance,
}: {
  dive: boolean;
  pose: "home" | "orbits";
  reduced: boolean;
  onDistance?: (d: number) => void;
}) {
  const { camera, size } = useThree();
  const controls = useThree((st) => st.controls) as unknown as { enabled: boolean } | null;
  const st = useRef({
    started: false,
    intro: reduced ? 1 : 0,
    p: 0,
    home: 15,
    dir: HOME_DIR.clone(),
    last: -1,
    frame: 0,
    // tween de pose
    pose: "home" as "home" | "orbits",
    pending: false,
    active: false,
    t: 0,
    fromDir: new THREE.Vector3(),
    fromDist: 15,
    toDir: new THREE.Vector3(),
    toDist: 15,
  });

  useEffect(() => {
    if (st.current.pose !== pose) {
      st.current.pose = pose;
      st.current.pending = true;
    }
  }, [pose]);

  useFrame((_, dt) => {
    const s = st.current;
    const d = Math.min(dt, 0.05);
    const lite = size.width < 700;

    if (!s.started) {
      s.started = true;
      s.home = lite ? 27 : 15;
      camera.position.copy(s.dir).multiplyScalar(s.home);
      camera.lookAt(0, 0, 0);
    }

    // 1) aproximação inicial
    if (s.intro < 1 && !dive && s.p === 0) {
      if (controls) controls.enabled = false;
      s.intro = Math.min(1, s.intro + d / 2.8);
      const e = 1 - Math.pow(1 - s.intro, 3);
      camera.position.copy(s.dir).multiplyScalar(THREE.MathUtils.lerp(s.home * 2.4, s.home, e));
      camera.lookAt(0, 0, 0);
      if (s.intro >= 1 && controls) controls.enabled = true;
    } else if (dive) {
      s.intro = 1;
      s.pending = false;
      s.active = false;
    }

    // 2) mudança de pose (home <-> órbitas vistas de cima)
    if (s.pending && s.intro >= 1 && !dive && s.p === 0) {
      s.pending = false;
      s.active = true;
      s.t = 0;
      s.fromDist = camera.position.length();
      s.fromDir.copy(camera.position).normalize();
      const orbits = s.pose === "orbits";
      s.toDir.copy(orbits ? ORBITS_DIR : HOME_DIR);
      s.toDist = orbits ? (lite ? 38 : 24) : s.home;
      if (controls) controls.enabled = false;
    }
    if (s.active && !dive && s.p === 0) {
      s.t = Math.min(1, s.t + d / 1.7);
      const e = s.t < 0.5 ? 4 * s.t * s.t * s.t : 1 - Math.pow(-2 * s.t + 2, 3) / 2;
      const q = new THREE.Quaternion().setFromUnitVectors(s.fromDir, s.toDir);
      const qi = new THREE.Quaternion().slerp(q, e);
      camera.position
        .copy(s.fromDir)
        .applyQuaternion(qi)
        .multiplyScalar(THREE.MathUtils.lerp(s.fromDist, s.toDist, e));
      camera.lookAt(0, 0, 0);
      if (s.t >= 1) {
        s.active = false;
        if (controls) controls.enabled = true;
      }
    }

    // 3) e 4) queda e retorno
    const target = dive ? 1 : 0;
    if (!(s.p === 0 && target === 0)) {
      if (s.p === 0) {
        s.home = camera.position.length();
        s.dir.copy(camera.position).normalize();
        if (controls) controls.enabled = false;
      }
      const step = d * (dive ? 1 / 2.6 : 1 / 1.6);
      s.p = target === 1 ? Math.min(1, s.p + step) : Math.max(0, s.p - step);

      const e = Math.pow(s.p, 2.4);
      camera.position.copy(s.dir).multiplyScalar(THREE.MathUtils.lerp(s.home, DIVE_DIST, e));
      const roll = e * 1.4;
      camera.up.set(Math.sin(roll), Math.cos(roll), 0);
      camera.lookAt(0, 0, 0);

      if (s.p === 0) {
        camera.up.set(0, 1, 0);
        camera.lookAt(0, 0, 0);
        if (controls) controls.enabled = true;
      }
    }

    s.frame++;
    if (onDistance && s.frame % 6 === 0) {
      const dist = camera.position.length();
      if (Math.abs(dist - s.last) > 0.03) {
        s.last = dist;
        onDistance(dist);
      }
    }
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Cena completa                                                        */
/* ------------------------------------------------------------------ */
export default function BlackHoleScene({
  items,
  itemStyle,
  selectedKey,
  onSelect,
  reduced,
  lite,
  showOrbits,
  shift,
  dive,
  pose,
  onDistance,
}: {
  items: OrbitItem[];
  itemStyle: OrbitStyle;
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  reduced: boolean;
  lite: boolean;
  /** Só mostra os planetas nas seções Projetos e Trajetória. */
  showOrbits: boolean;
  shift: { x: number; y: number };
  /** Mergulha no buraco negro (animação da seção Sobre). */
  dive: boolean;
  /** "orbits": a câmera sobe para ver as órbitas de cima (seções Projetos e Trajetória). */
  pose: "home" | "orbits";
  onDistance?: (d: number) => void;
}) {
  const holeRef = useRef<THREE.Mesh>(null);

  return (
    <Canvas
      dpr={[1, lite ? 1.5 : 2]}
      camera={{ position: [0, 1.2, 15], fov: 48, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#040203"]} />
      <CameraRig dive={dive} pose={pose} reduced={reduced} onDistance={onDistance} />
      <ViewShift x={shift.x} y={shift.y} />

      <ambientLight intensity={0.22} />
      <pointLight position={[0, 0, 0]} intensity={260} color="#ffb070" decay={2} />

      <Stars
        radius={90}
        depth={50}
        count={lite ? 2500 : 5500}
        factor={3.2}
        saturation={0}
        fade
        speed={reduced ? 0 : 0.4}
      />

      {/* poeira e brasas flutuando em volta, como na referência */}
      <Sparkles
        count={lite ? 70 : 160}
        scale={[22, 9, 22]}
        size={3}
        speed={reduced ? 0 : 0.25}
        opacity={0.8}
        color="#ff9a4d"
      />

      {/* esfera invisível: só serve para esconder os nomes dos planetas que passam por trás do buraco */}
      <mesh ref={holeRef} visible={false}>
        <sphereGeometry args={[HORIZON, 24, 24]} />
      </mesh>

      {/* o buraco negro em si: lente gravitacional + disco de acreção, tudo desenhado pelo shader */}
      <BlackHoleLens reduced={reduced} lite={lite} />

      {showOrbits && (
        <group rotation={ORBIT_TILT}>
          <Orbits
            key={itemStyle}
            items={items}
            style={itemStyle}
            selectedKey={selectedKey}
            holeRef={holeRef}
            onSelect={onSelect}
            reduced={reduced}
          />
        </group>
      )}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={4}
        maxDistance={52}
        rotateSpeed={0.55}
        zoomSpeed={0.6}
      />
    </Canvas>
  );
}
