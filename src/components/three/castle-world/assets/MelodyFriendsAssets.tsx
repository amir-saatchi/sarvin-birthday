"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  ExtrudedHeart3D,
  ExtrudedStar3D,
  KawaiiBunnyFriend3D,
  useStarGeometry,
} from "../../MagicalDecor3D";
import type { Vec2, Vec3 } from "../types";
import { playerWorldPos } from "../playerTracker";
import {
  KUROMI_MOON_SWING_POS,
  KUROMI_RINK_POS,
  KUROMI_RINK_R,
  MELODY_STRAWBERRY_GARDEN_POS,
  MELODY_STRAWBERRY_GARDEN_R,
  MELODY_TEACUPS_POS,
  MELODY_TEACUPS_R,
  MELODY_WHEEL_GONDOLAS,
  MELODY_WHEEL_HUB_Y,
  MELODY_WHEEL_PAD,
  MELODY_WHEEL_POS,
  MELODY_WHEEL_R,
  MELODY_WHEEL_SEAT_DROP,
  MELODY_WHEEL_SPIN,
} from "../worldData";

// My Melody & Kuromi Land expansion: Ferris Wheel, Teacup Twirl, Strawberry Garden, Kuromi's Moon Swing,
// bounce pads, the Starry Skate Rink, candy path stones and the instanced ribbon fence.
// Repeated small parts (bulbs, spokes, strawberries, stones, fence posts) are instanced.

type Instance = { p: Vec3; s?: number | Vec3; r?: Vec3; c?: string };

/** Writes matrices (and colours, if any) of `items` into an InstancedMesh. */
function useInstanceLayout(ref: React.RefObject<THREE.InstancedMesh | null>, items: Instance[]) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3();
    const c = new THREE.Color();
    items.forEach((it, i) => {
      q.setFromEuler(e.set(...(it.r ?? [0, 0, 0])));
      if (typeof it.s === "number" || it.s === undefined) s.setScalar(it.s ?? 1);
      else s.set(...it.s);
      m.compose(new THREE.Vector3(...it.p), q, s);
      mesh.setMatrixAt(i, m);
      if (it.c) mesh.setColorAt(i, c.set(it.c));
    });
    mesh.count = items.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, items]);
}

/** A cylinder strut from a to b. */
function Strut({ a, b, r, color }: { a: Vec3; b: Vec3; r: number; color: string }) {
  const [ax, ay, az] = a;
  const [bx, by, bz] = b;
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(ax, ay, az);
    const vb = new THREE.Vector3(bx, by, bz);
    const dir = vb.clone().sub(va);
    const length = dir.length();
    return {
      pos: va.add(vb).multiplyScalar(0.5).toArray() as Vec3,
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()),
      len: length,
    };
  }, [ax, ay, az, bx, by, bz]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 10]} />
      <meshStandardMaterial color={color} roughness={0.32} />
    </mesh>
  );
}

const GONDOLA_COLORS = ["#ff85c0", "#c084fc", "#7dd3fc", "#fde047", "#f9a8d4", "#a78bfa", "#86efac", "#fda4af"];
const RIM_Z = 1.05;

// One gondola, hanging from its two rim pins (origin) between the rims; the unicorn stands on its floor
function FerrisGondola3D({ color }: { color: string }) {
  const floorY = -MELODY_WHEEL_SEAT_DROP;
  const cupMidY = floorY + 0.33;
  const cupTopY = floorY + 0.75;
  return (
    <group>
      {/* Hanger yoke: one rod down from each rim pin (nothing across the middle, where she sits) */}
      {[-RIM_Z + 0.06, RIM_Z - 0.06].map((z) => (
        <mesh key={z} position={[0, cupTopY / 2, z]}>
          <cylinderGeometry args={[0.05, 0.05, -cupTopY, 8]} />
          <meshStandardMaterial color="#fff7fb" roughness={0.3} />
        </mesh>
      ))}
      {/* Open cup with a floor and a cream rim */}
      <mesh position={[0, cupMidY, 0]}>
        <cylinderGeometry args={[0.98, 0.78, 0.86, 22, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.28} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, floorY - 0.02, 0]}>
        <cylinderGeometry args={[0.8, 0.74, 0.08, 22]} />
        <meshStandardMaterial color="#fff1f7" roughness={0.4} />
      </mesh>
      <mesh position={[0, cupTopY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.98, 0.07, 8, 26]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Heart badges facing north (toward the bridge) and south */}
      <ExtrudedHeart3D position={[0, cupMidY, -0.94]} scale={0.4} color="#ffffff" emissive="#f9a8d4" emissiveIntensity={0.3} />
      <ExtrudedHeart3D position={[0, cupMidY, 0.94]} scale={0.4} color="#ffffff" emissive="#f9a8d4" emissiveIntensity={0.3} />
    </group>
  );
}

// My Melody's Ferris Wheel: turns with the clock (see melodyWheelAngle), gondolas stay level; step on the glowing
// heart pad in front of it to ride once round
export function MelodyFerrisWheel3D() {
  const wheelRef = useRef<THREE.Group>(null);
  const gondolaRefs = useRef<(THREE.Group | null)[]>([]);
  const padGlowRef = useRef<THREE.Mesh>(null);
  const padHeartRef = useRef<THREE.Group>(null);
  const spokeRef = useRef<THREE.InstancedMesh>(null);
  const bulbRef = useRef<THREE.InstancedMesh>(null);
  const N = MELODY_WHEEL_GONDOLAS;
  const R = MELODY_WHEEL_R;
  const SPOKES = 12;
  const BULBS = 24;

  const spokes = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    for (const z of [-RIM_Z, RIM_Z])
      for (let k = 0; k < SPOKES; k++) {
        const a = (k / SPOKES) * Math.PI * 2;
        // Unit cylinder runs along y; turn it to point along angle a and stretch it to the rim
        out.push({ p: [(Math.cos(a) * R) / 2, (Math.sin(a) * R) / 2, z], r: [0, 0, a - Math.PI / 2], s: [1, R, 1] });
      }
    return out;
  }, [R]);
  const bulbs = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    const cols = ["#fff1a8", "#ffd1e8", "#e9d5ff", "#c7f9ff"];
    for (const z of [-RIM_Z - 0.12, RIM_Z + 0.12])
      for (let k = 0; k < BULBS; k++) {
        const a = ((k + 0.5) / BULBS) * Math.PI * 2;
        out.push({ p: [Math.cos(a) * R, Math.sin(a) * R, z], c: cols[k % cols.length] });
      }
    return out;
  }, [R]);
  useInstanceLayout(spokeRef, spokes);
  useInstanceLayout(bulbRef, bulbs);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (wheelRef.current) wheelRef.current.rotation.z = MELODY_WHEEL_SPIN * t;
    for (const g of gondolaRefs.current) if (g) g.rotation.z = -MELODY_WHEEL_SPIN * t;
    if (padGlowRef.current) {
      const s = 1 + Math.sin(t * 3) * 0.08;
      padGlowRef.current.scale.set(s, 1, s);
    }
    if (padHeartRef.current) {
      padHeartRef.current.rotation.y = t * 1.6;
      padHeartRef.current.position.y = 0.9 + Math.sin(t * 2.4) * 0.12;
    }
  });

  const [wx, , wz] = MELODY_WHEEL_POS;
  const hubY = MELODY_WHEEL_HUB_Y;
  const legs: [Vec3, Vec3][] = [
    [[-2.5, 0.3, -1.65], [0, hubY, -1.35]],
    [[2.5, 0.3, -1.65], [0, hubY, -1.35]],
    [[-2.5, 0.3, 1.65], [0, hubY, 1.35]],
    [[2.5, 0.3, 1.65], [0, hubY, 1.35]],
  ];

  return (
    <group position={MELODY_WHEEL_POS}>
      {/* Base plinth (pink) with a cream top */}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[6.4, 0.28, 3.8]} />
        <meshStandardMaterial color="#f9a8d4" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[6.0, 0.06, 3.4]} />
        <meshStandardMaterial color="#fff1f7" roughness={0.45} />
      </mesh>
      {/* A-frame legs & the hub axle */}
      {legs.map(([a, b], i) => (
        <Strut key={i} a={a} b={b} r={0.14} color={i < 2 ? "#ff85c0" : "#c084fc"} />
      ))}
      <Strut a={[-0.6, 1.6, -1.6]} b={[0.6, 1.6, -1.6]} r={0.08} color="#fff1f7" />
      <Strut a={[-0.6, 1.6, 1.6]} b={[0.6, 1.6, 1.6]} r={0.08} color="#fff1f7" />
      <mesh position={[0, hubY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 3.0, 16]} />
        <meshStandardMaterial color="#fde68a" roughness={0.3} metalness={0.3} />
      </mesh>
      {/* Big heart on the hub, facing the bridge, and a star on the back */}
      <group position={[0, hubY, -1.62]} rotation={[0, Math.PI, 0]}>
        <ExtrudedHeart3D scale={1.25} color="#ff6eb4" emissive="#ec4899" emissiveIntensity={0.55} />
      </group>
      <ExtrudedStar3D position={[0, hubY, 1.62]} scale={1.1} color="#fde047" emissive="#f59e0b" emissiveIntensity={0.6} />

      {/* The turning wheel: rims, inner rings, spokes, light bulbs and the gondolas */}
      <group ref={wheelRef} position={[0, hubY, 0]}>
        {[-RIM_Z, RIM_Z].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh>
              <torusGeometry args={[R, 0.13, 10, 64]} />
              <meshStandardMaterial color={z < 0 ? "#ff6eb4" : "#c084fc"} roughness={0.3} />
            </mesh>
            <mesh>
              <torusGeometry args={[R * 0.55, 0.08, 8, 48]} />
              <meshStandardMaterial color="#fff1f7" roughness={0.35} />
            </mesh>
          </group>
        ))}
        <instancedMesh ref={spokeRef} args={[undefined, undefined, spokes.length]} raycast={() => null}>
          <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
          <meshStandardMaterial color="#fff7fb" roughness={0.35} />
        </instancedMesh>
        <instancedMesh ref={bulbRef} args={[undefined, undefined, bulbs.length]} raycast={() => null}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
        {Array.from({ length: N }, (_, k) => {
          const a = (k / N) * Math.PI * 2;
          return (
            <group
              key={k}
              ref={(g) => {
                gondolaRefs.current[k] = g;
              }}
              position={[Math.cos(a) * R, Math.sin(a) * R, 0]}
            >
              <FerrisGondola3D color={GONDOLA_COLORS[k % GONDOLA_COLORS.length]} />
            </group>
          );
        })}
      </group>

      {/* Glowing heart boarding pad */}
      <group position={[MELODY_WHEEL_PAD[0] - wx, 0, MELODY_WHEEL_PAD[2] - wz]}>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.85, 0.9, 0.06, 28]} />
          <meshStandardMaterial color="#fff1f7" roughness={0.4} />
        </mesh>
        <mesh ref={padGlowRef} position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.66, 0.66, 0.03, 28]} />
          <meshStandardMaterial color="#ff85c0" emissive="#ec4899" emissiveIntensity={0.9} roughness={0.3} />
        </mesh>
        <group position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, Math.PI]}>
          <ExtrudedHeart3D scale={0.9} color="#ffffff" emissive="#f9a8d4" emissiveIntensity={0.7} />
        </group>
        <group ref={padHeartRef} position={[0, 0.9, 0]}>
          <ExtrudedHeart3D scale={0.5} color="#ff6eb4" emissive="#ec4899" emissiveIntensity={0.8} />
        </group>
      </group>
    </group>
  );
}

// Teacup Twirl: three giant teacups spinning on a slowly turning saucer round a big strawberry teapot
const TEACUP_COLORS: [string, string][] = [
  ["#ff85c0", "#fff1f7"],
  ["#c084fc", "#fef9c3"],
  ["#7dd3fc", "#fce7f3"],
];
function GiantTeacup3D({ color, trim }: { color: string; trim: string }) {
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.98, 0.9, 0.12, 24]} />
        <meshStandardMaterial color={trim} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.86, 0.56, 0.78, 24, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.57, 0.57, 0.06, 20]} />
        <meshStandardMaterial color={trim} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.89, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.86, 0.06, 8, 28]} />
        <meshStandardMaterial color={trim} roughness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.86, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.22, 0.06, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
      {/* Polka dots */}
      {[0, 1.6, 3.2, 4.8].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.74, 0.55, Math.sin(a) * 0.74]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color={trim} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function TeacupTwirl3D() {
  const turntableRef = useRef<THREE.Group>(null);
  const cupRefs = useRef<(THREE.Group | null)[]>([]);
  const steamRef = useRef<THREE.Group>(null);
  const scallopRef = useRef<THREE.InstancedMesh>(null);
  const R = MELODY_TEACUPS_R - 0.1;
  const scallops = useMemo<Instance[]>(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const a = (i / 30) * Math.PI * 2;
        return { p: [Math.cos(a) * R, 0.34, Math.sin(a) * R], c: i % 2 ? "#ffffff" : "#ff85c0" };
      }),
    [R]
  );
  useInstanceLayout(scallopRef, scallops);

  useFrame((state, delta) => {
    if (turntableRef.current) turntableRef.current.rotation.y += delta * 0.35;
    cupRefs.current.forEach((c, i) => {
      if (c) c.rotation.y -= delta * (1.4 + i * 0.25);
    });
    if (steamRef.current) {
      const t = state.clock.elapsedTime;
      steamRef.current.children.forEach((puff, i) => {
        const u = (t * 0.45 + i / 3) % 1;
        puff.position.y = u * 1.1;
        puff.scale.setScalar(0.5 + u * 0.8);
      });
    }
  });

  return (
    <group position={MELODY_TEACUPS_POS}>
      {/* Saucer base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[R + 0.05, R + 0.2, 0.3, 40]} />
        <meshStandardMaterial color="#fff7fb" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[R - 0.15, R - 0.15, 0.03, 40]} />
        <meshStandardMaterial color="#a7f3d0" roughness={0.45} />
      </mesh>
      <instancedMesh ref={scallopRef} args={[undefined, undefined, scallops.length]} raycast={() => null}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial roughness={0.35} />
      </instancedMesh>

      <group ref={turntableRef} position={[0, 0.32, 0]}>
        {TEACUP_COLORS.map(([col, trim], i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <group
              key={i}
              ref={(g) => {
                cupRefs.current[i] = g;
              }}
              position={[Math.cos(a) * 1.85, 0, Math.sin(a) * 1.85]}
            >
              <GiantTeacup3D color={col} trim={trim} />
              {i < 2 && (
                <KawaiiBunnyFriend3D
                  variant={i === 0 ? "pink" : "purple"}
                  position={[0, 0.18, 0]}
                  rotation={[0, i * 2, 0]}
                  scale={0.85}
                />
              )}
            </group>
          );
        })}
      </group>

      {/* Big strawberry-pink teapot in the middle, with little steam puffs */}
      <group position={[0, 0.32, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.5, 0.62, 0.5, 20]} />
          <meshStandardMaterial color="#fff1f7" roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.05, 0]} scale={[1, 0.85, 1]}>
          <sphereGeometry args={[0.72, 24, 18]} />
          <meshStandardMaterial color="#ff6eb4" roughness={0.18} />
        </mesh>
        <mesh position={[0, 1.62, 0]}>
          <cylinderGeometry args={[0.3, 0.42, 0.14, 18]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.78, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#fde047" roughness={0.25} metalness={0.4} />
        </mesh>
        <mesh position={[0.78, 1.15, 0]} rotation={[0, 0, -0.75]}>
          <cylinderGeometry args={[0.07, 0.14, 0.62, 10]} />
          <meshStandardMaterial color="#ff6eb4" roughness={0.2} />
        </mesh>
        <mesh position={[-0.74, 1.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.26, 0.07, 8, 16]} />
          <meshStandardMaterial color="#ff6eb4" roughness={0.2} />
        </mesh>
        {[0, Math.PI].map((a) => (
          <group key={a} position={[0, 1.05, 0]} rotation={[0, a, 0]}>
            <ExtrudedHeart3D position={[0, 0, 0.62]} scale={0.5} color="#ffffff" emissive="#f9a8d4" emissiveIntensity={0.35} />
          </group>
        ))}
        <group ref={steamRef} position={[0.98, 1.45, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.16, 10, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.75} roughness={0.6} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// Strawberry profile (lathe): wide shoulders, pointed tip
function makeStrawberryGeometry() {
  const pts = [
    [0, -1],
    [0.3, -0.85],
    [0.62, -0.45],
    [0.8, 0],
    [0.78, 0.3],
    [0.55, 0.55],
    [0, 0.62],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 14);
}

// My Melody's Strawberry Garden: a raised round bed of leafy plants and plump strawberries round a giant one
export function StrawberryGarden3D() {
  const berryRef = useRef<THREE.InstancedMesh>(null);
  const capRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);
  const seedRef = useRef<THREE.InstancedMesh>(null);
  const bigBerryRef = useRef<THREE.Group>(null);
  const berryGeo = useMemo(() => makeStrawberryGeometry(), []);
  const R = MELODY_STRAWBERRY_GARDEN_R;

  const { berries, caps, leaves } = useMemo(() => {
    const b: Instance[] = [];
    const c: Instance[] = [];
    const l: Instance[] = [];
    const ring = (n: number, r: number, off: number) =>
      Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2 + off).map((a) => [Math.cos(a) * r, Math.sin(a) * r]);
    // Leafy clumps
    for (const [x, z] of [...ring(10, 1.75, 0.2), ...ring(6, 1.05, 0.6)]) {
      l.push({ p: [x, 0.5, z], s: [1, 0.55, 1], c: "#4ade80" });
    }
    // Strawberries tucked among them (pink & red), each with a green cap
    const berrySpots = [...ring(12, 1.95, 0), ...ring(7, 1.3, 0.25)];
    berrySpots.forEach(([x, z], i) => {
      const s = 0.2 + (i % 3) * 0.04;
      const y = 0.5 + s * 0.9;
      b.push({ p: [x, y, z], s, r: [0, i, 0.15 * ((i % 2) * 2 - 1)], c: i % 4 === 0 ? "#fb7185" : "#f43f5e" });
      c.push({ p: [x, y + s * 0.62, z], s: [s * 1.3, s * 0.7, s * 1.3], c: "#22c55e" });
    });
    return { berries: b, caps: c, leaves: l };
  }, []);
  const seeds = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    for (let i = 0; i < 26; i++) {
      const y = -0.7 + (i / 26) * 1.15;
      const a = i * 2.4;
      // Radius of the lathe profile near this height (approximate)
      const r = y < -0.45 ? 0.3 + ((y + 1) / 0.55) * 0.32 : y < 0 ? 0.62 + ((y + 0.45) / 0.45) * 0.18 : 0.8 - y * 0.2;
      out.push({ p: [Math.cos(a) * r, y, Math.sin(a) * r], s: [1, 1.4, 1], c: "#fde68a" });
    }
    return out;
  }, []);
  useInstanceLayout(berryRef, berries);
  useInstanceLayout(capRef, caps);
  useInstanceLayout(leafRef, leaves);
  useInstanceLayout(seedRef, seeds);
  useFrame((state) => {
    if (bigBerryRef.current) {
      const t = state.clock.elapsedTime;
      bigBerryRef.current.rotation.y = t * 0.5;
      bigBerryRef.current.position.y = 1.55 + Math.sin(t * 1.8) * 0.06;
    }
  });

  return (
    <group position={MELODY_STRAWBERRY_GARDEN_POS}>
      {/* Raised bed: cream stone ring and chocolatey soil */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[R, R + 0.1, 0.44, 32]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[R - 0.18, R - 0.18, 0.04, 32]} />
        <meshStandardMaterial color="#9a5b45" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R - 0.06, 0.09, 8, 40]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <instancedMesh ref={leafRef} args={[undefined, undefined, leaves.length]} raycast={() => null}>
        <sphereGeometry args={[0.34, 10, 8]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={berryRef} args={[berryGeo, undefined, berries.length]} raycast={() => null}>
        <meshStandardMaterial roughness={0.3} />
      </instancedMesh>
      <instancedMesh ref={capRef} args={[undefined, undefined, caps.length]} raycast={() => null}>
        <coneGeometry args={[0.5, 0.5, 6]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>

      {/* Giant strawberry in the middle, slowly turning */}
      <group ref={bigBerryRef} position={[0, 1.55, 0]}>
        <mesh geometry={berryGeo} scale={0.95}>
          <meshStandardMaterial color="#f43f5e" roughness={0.25} />
        </mesh>
        <instancedMesh ref={seedRef} args={[undefined, undefined, seeds.length]} scale={0.97} raycast={() => null}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial roughness={0.4} />
        </instancedMesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, 0.6, 0]} rotation={[0.9, (i / 5) * Math.PI * 2, 0]}>
            <coneGeometry args={[0.16, 0.6, 5]} />
            <meshStandardMaterial color="#22c55e" roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.82, 0]}>
          <cylinderGeometry args={[0.05, 0.07, 0.3, 8]} />
          <meshStandardMaterial color="#16a34a" roughness={0.5} />
        </mesh>
      </group>

      {/* Little pink sign with a bow, facing the path */}
      <group position={[1.6, 0, 2.45]} rotation={[0, 0.6, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />
          <meshStandardMaterial color="#fff7fb" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.8, 0.46, 0.08]} />
          <meshStandardMaterial color="#ff85c0" roughness={0.35} />
        </mesh>
        <ExtrudedHeart3D position={[0, 1.05, 0.07]} scale={0.32} color="#f43f5e" emissive="#fb7185" emissiveIntensity={0.3} />
      </group>
    </group>
  );
}

// Kuromi's Moon Swing: a starry arch with a crescent-moon seat swinging under it (and a purple bunny riding it)
export function KuromiMoonSwing3D() {
  const swingRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (swingRef.current) swingRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.6) * 0.34;
  });
  const topY = 3.6;
  const seatY = 0.95;

  return (
    <group position={KUROMI_MOON_SWING_POS}>
      {/* Night-sky floor */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[2.05, 2.05, 0.04, 36]} />
        <meshStandardMaterial color="#3b0764" roughness={0.5} />
      </mesh>
      {[0, 1.25, 2.5, 3.75, 5.0].map((a, i) => (
        <group key={a} position={[Math.cos(a) * 1.45, 0.06, Math.sin(a) * 1.45]} rotation={[-Math.PI / 2, 0, a]}>
          <ExtrudedStar3D scale={i % 2 ? 0.55 : 0.7} color="#fde047" emissive="#f59e0b" emissiveIntensity={0.7} />
        </group>
      ))}
      {/* Striped posts & crossbar */}
      {[-1.7, 1.7].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, topY / 2, 0]}>
            <cylinderGeometry args={[0.13, 0.16, topY, 12]} />
            <meshStandardMaterial color="#6b21a8" roughness={0.35} />
          </mesh>
          {[0.8, 1.7, 2.6].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.16, 0.05, 6, 14]} />
              <meshStandardMaterial color="#f9a8d4" roughness={0.35} />
            </mesh>
          ))}
          <ExtrudedStar3D position={[0, topY + 0.42, 0]} scale={0.7} color="#fde047" emissive="#f59e0b" emissiveIntensity={0.7} />
        </group>
      ))}
      <mesh position={[0, topY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 3.6, 12]} />
        <meshStandardMaterial color="#a855f7" roughness={0.3} />
      </mesh>
      <ExtrudedHeart3D position={[0, topY + 0.38, 0]} scale={0.7} color="#ff6eb4" emissive="#ec4899" emissiveIntensity={0.6} />

      {/* The swing: ropes and a glowing crescent-moon seat */}
      <group ref={swingRef} position={[0, topY, 0]}>
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} position={[x, (seatY - topY) / 2, 0]}>
            <cylinderGeometry args={[0.03, 0.03, topY - seatY, 6]} />
            <meshStandardMaterial color="#fde68a" roughness={0.5} />
          </mesh>
        ))}
        <group position={[0, seatY - topY, 0]}>
          {/* Crescent lying like a smile, the bunny sitting in its dip */}
          <mesh rotation={[0, 0, Math.PI + 0.55]}>
            <torusGeometry args={[0.62, 0.2, 12, 28, Math.PI * 1.25]} />
            <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={0.45} roughness={0.3} />
          </mesh>
          <KawaiiBunnyFriend3D variant="purple" position={[0, -0.48, 0.05]} rotation={[0, Math.PI, 0]} scale={0.95} />
        </group>
      </group>
    </group>
  );
}

// Squishy bounce pad: pink jelly (Melody) or a star trampoline (Kuromi). Squashes while the unicorn is on it.
export function BouncePad3D({ position, variant }: { position: Vec3; variant: "jelly" | "star" }) {
  const topRef = useRef<THREE.Group>(null);
  const [px, , pz] = position;
  useFrame((state) => {
    if (!topRef.current) return;
    const d = Math.hypot(playerWorldPos.x - px, playerWorldPos.z - pz);
    const press = d < 1.0 ? Math.max(0, 1 - playerWorldPos.y / 1.2) : 0;
    const wobble = Math.sin(state.clock.elapsedTime * 3 + px) * 0.04;
    topRef.current.scale.set(1 + press * 0.15, 1 - press * 0.45 + wobble, 1 + press * 0.15);
  });
  const jelly = variant === "jelly";
  return (
    <group position={position}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.95, 1.0, 0.18, 28]} />
        <meshStandardMaterial color={jelly ? "#fff1f7" : "#4c1d95"} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.07, 8, 28]} />
        <meshStandardMaterial color={jelly ? "#ff85c0" : "#f9a8d4"} roughness={0.35} />
      </mesh>
      <group ref={topRef} position={[0, 0.18, 0]}>
        {jelly ? (
          <>
            <mesh scale={[1, 0.42, 1]}>
              <sphereGeometry args={[0.84, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshPhysicalMaterial color="#ff85c0" roughness={0.12} transmission={0} transparent opacity={0.88} clearcoat={1} />
            </mesh>
            <mesh position={[-0.25, 0.26, -0.2]} scale={[1, 0.5, 1]}>
              <sphereGeometry args={[0.12, 10, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>
            <group position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, Math.PI]}>
              <ExtrudedHeart3D scale={0.42} color="#ffffff" emissive="#f9a8d4" emissiveIntensity={0.4} />
            </group>
          </>
        ) : (
          <>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.86, 0.86, 0.06, 28]} />
              <meshStandardMaterial color="#1e1b4b" roughness={0.6} />
            </mesh>
            <group position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ExtrudedStar3D scale={2.0} color="#fde047" emissive="#f59e0b" emissiveIntensity={0.55} />
            </group>
          </>
        )}
      </group>
    </group>
  );
}

// Kuromi's Starry Skate Rink: a glossy night-purple rink (walkable, glide like on ice) with glowing star decals
// and two little skaters who swerve round the unicorn
const SKATERS: { r: number; speed: number; phase: number; variant: "pink" | "purple" }[] = [
  { r: 2.7, speed: 0.6, phase: 0, variant: "purple" },
  { r: 3.5, speed: -0.45, phase: 2.2, variant: "pink" },
];
export function KuromiSkateRink3D() {
  const starGeo = useStarGeometry(0.36, 0.16, 0.04);
  const starRef = useRef<THREE.InstancedMesh>(null);
  const skaterRefs = useRef<(THREE.Group | null)[]>([]);
  const R = KUROMI_RINK_R;
  const [cx, , cz] = KUROMI_RINK_POS;
  const stars = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    const cols = ["#fde047", "#f9a8d4", "#e9d5ff"];
    for (let i = 0; i < 12; i++) {
      const a = i * 2.39996;
      const r = 0.9 + ((i * 0.618) % 1) * (R - 1.5);
      out.push({ p: [Math.cos(a) * r, 0.055, Math.sin(a) * r], r: [-Math.PI / 2, 0, a], s: 0.9 + (i % 3) * 0.35, c: cols[i % 3] });
    }
    return out;
  }, [R]);
  useInstanceLayout(starRef, stars);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const prx = playerWorldPos.x - cx;
    const prz = playerWorldPos.z - cz;
    const pr = Math.hypot(prx, prz);
    const pa = Math.atan2(prz, prx);
    SKATERS.forEach((sk, i) => {
      const g = skaterRefs.current[i];
      if (!g) return;
      const a = sk.phase + sk.speed * t;
      let r = sk.r;
      // Swerve in or out round the unicorn when she's near their line
      const da = Math.atan2(Math.sin(pa - a), Math.cos(pa - a));
      if (pr < R + 1 && Math.abs(da) * sk.r < 1.6 && Math.abs(pr - r) < 1.4) {
        const push = (1.4 - Math.abs(pr - r)) * (1 - (Math.abs(da) * sk.r) / 1.6);
        r += (r >= pr ? 1 : -1) * push;
      }
      r = THREE.MathUtils.clamp(r, 1.0, R - 0.5);
      g.position.set(Math.cos(a) * r, 0.06 + Math.abs(Math.sin(t * 5 + i)) * 0.05, Math.sin(a) * r);
      // Face along the direction of travel (+z is the bunny's front)
      const vx = -Math.sin(a) * sk.speed;
      const vz = Math.cos(a) * sk.speed;
      g.rotation.set(0, Math.atan2(vx, vz), Math.sin(t * 2.4 + i) * 0.12);
    });
  });

  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, 0.025, 0]}>
        <cylinderGeometry args={[R, R, 0.05, 48]} />
        <meshStandardMaterial color="#4c1d95" roughness={0.12} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.1, 8, 64]} />
        <meshStandardMaterial color="#f9a8d4" emissive="#ec4899" emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.052, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R * 0.5, 0.04, 6, 48]} />
        <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={0.4} />
      </mesh>
      <instancedMesh ref={starRef} args={[starGeo, undefined, stars.length]} raycast={() => null}>
        <meshStandardMaterial emissive="#f59e0b" emissiveIntensity={0.25} roughness={0.3} />
      </instancedMesh>
      {SKATERS.map((sk, i) => (
        <group
          key={i}
          ref={(g) => {
            skaterRefs.current[i] = g;
          }}
        >
          <KawaiiBunnyFriend3D variant={sk.variant} scale={0.85} />
          {/* Little skate blades */}
          {[-0.12, 0.12].map((x) => (
            <mesh key={x} position={[x, 0.0, 0.04]}>
              <boxGeometry args={[0.06, 0.04, 0.4]} />
              <meshStandardMaterial color="#e5e7eb" metalness={0.6} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Candy stepping stones (instanced decals)
export function CandyPathStones3D({ stones }: { stones: Vec2[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const items = useMemo<Instance[]>(() => {
    const cols = ["#fbcfe8", "#e9d5ff", "#fef3c7", "#cffafe"];
    return stones.map(([x, z], i) => ({ p: [x, 0.02, z], r: [0, i * 0.7, 0], c: cols[i % cols.length] }));
  }, [stones]);
  useInstanceLayout(ref, items);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} raycast={() => null}>
      <cylinderGeometry args={[0.62, 0.66, 0.04, 14]} />
      <meshStandardMaterial roughness={0.45} />
    </instancedMesh>
  );
}

// Pastel ribbon fence: rows of posts with round caps and two rails. Posts & caps are instanced across all rows.
export type RibbonFenceRow = { from: Vec2; to: Vec2; theme: "pink" | "lavender" };
export function PastelRibbonFence3D({ rows }: { rows: RibbonFenceRow[] }) {
  const postRef = useRef<THREE.InstancedMesh>(null);
  const capRef = useRef<THREE.InstancedMesh>(null);
  const { posts, caps } = useMemo(() => {
    const p: Instance[] = [];
    const c: Instance[] = [];
    for (const row of rows) {
      const [ax, az] = row.from;
      const [bx, bz] = row.to;
      const len = Math.hypot(bx - ax, bz - az);
      const n = Math.max(2, Math.round(len / 1.5) + 1);
      const pink = row.theme === "pink";
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        const x = ax + (bx - ax) * u;
        const z = az + (bz - az) * u;
        p.push({ p: [x, 0.42, z], c: pink ? "#fff1f7" : "#f3e8ff" });
        c.push({ p: [x, 0.88, z], c: i % 2 ? "#fde047" : pink ? "#ff6eb4" : "#a855f7" });
      }
    }
    return { posts: p, caps: c };
  }, [rows]);
  useInstanceLayout(postRef, posts);
  useInstanceLayout(capRef, caps);

  return (
    <group>
      <instancedMesh ref={postRef} args={[undefined, undefined, posts.length]} raycast={() => null}>
        <cylinderGeometry args={[0.085, 0.1, 0.84, 8]} />
        <meshStandardMaterial roughness={0.42} />
      </instancedMesh>
      <instancedMesh ref={capRef} args={[undefined, undefined, caps.length]} raycast={() => null}>
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshStandardMaterial roughness={0.25} />
      </instancedMesh>
      {rows.map((row, i) => {
        const [ax, az] = row.from;
        const [bx, bz] = row.to;
        const pink = row.theme === "pink";
        return (
          <group key={i}>
            <Strut a={[ax, 0.56, az]} b={[bx, 0.56, bz]} r={0.055} color={pink ? "#ff85c0" : "#c084fc"} />
            <Strut a={[ax, 0.28, az]} b={[bx, 0.28, bz]} r={0.05} color={pink ? "#fff1f7" : "#f3e8ff"} />
          </group>
        );
      })}
    </group>
  );
}
