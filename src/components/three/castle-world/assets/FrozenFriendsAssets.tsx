"use client";

import React, { Suspense, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Sparkles, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Vec3 } from "../types";
import { playerWorldPos } from "../playerTracker";
import {
  FROZEN_BUNNY_SPOTS,
  FROZEN_CARROT_PATCH_POS,
  FROZEN_CAVE,
  FROZEN_DEN_FOOTPRINTS,
  FROZEN_IGLOOS,
  FROZEN_LOG_SPOTS,
  FROZEN_MARSHMALLOW_HEIGHT,
  FROZEN_MARSHMALLOW_YAW,
  FROZEN_PENGUIN_FAMILY_POS,
  FROZEN_PINE_SPOTS,
  FROZEN_PROP_SPOTS,
  FROZEN_SKATERS,
  FROZEN_SKATING_POND_POS,
  FROZEN_SKATING_POND_R,
  FROZEN_SLIDE_CHUTE,
  FROZEN_SLIDE_PAD,
  FROZEN_SLIDE_PIPE_R,
  FROZEN_SLIDE_POS,
  FROZEN_SLIDE_TOP_Y,
  FROZEN_SLIDE_TOWER_R,
  FROZEN_SNOW_DEN_POS,
  FROZEN_SNOW_DEN_R,
  FROZEN_WATERFALL_POOL_POS,
  FROZEN_WATERFALL_POOL_R,
  iglooTunnel,
  type IglooSpot,
} from "../worldData";

type GroundClick = (e: ThreeEvent<PointerEvent>) => void;

function dampAngle(cur: number, target: number, lambda: number, dt: number) {
  const diff = Math.atan2(Math.sin(target - cur), Math.cos(target - cur));
  return cur + diff * (1 - Math.exp(-lambda * dt));
}

// ---------------------------------------------------------------------------------------------
// Winter pack pieces (pines, rocks, drifts, stump, bushes, little trees, logs) as instanced meshes:
// one draw call per model however many are placed.
// ---------------------------------------------------------------------------------------------
const WINTER_MODEL_URL = "/models/winter.glb";
// Height of the big pines in world units at scale 1
const WINTER_PINE_HEIGHT = 3.9;
// Rocks, drifts, logs etc. are modelled ~2.4× bigger than the island needs
const WINTER_PROP_SCALE = 0.42;

type Placement = { x: number; z: number; rotY: number; s: number };

function WinterInstancedMesh({
  geometry,
  material,
  list,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  list: Placement[];
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    list.forEach((p, i) => {
      o.position.set(p.x, 0, p.z);
      o.rotation.set(0, p.rotY, 0);
      o.scale.setScalar(p.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [list]);
  return <instancedMesh ref={ref} args={[geometry, material, list.length]} castShadow dispose={null} />;
}

function WinterInstances() {
  const { nodes } = useGLTF(WINTER_MODEL_URL);
  const groups = useMemo(() => {
    const byNode = new Map<string, Placement[]>();
    const add = (name: string, p: Placement) => {
      const list = byNode.get(name) ?? [];
      list.push(p);
      byNode.set(name, list);
    };
    const heightOf = (name: string) => {
      const mesh = nodes[name] as THREE.Mesh | undefined;
      if (!mesh) return 1;
      mesh.geometry.computeBoundingBox();
      const bb = mesh.geometry.boundingBox!;
      return Math.max(bb.max.y - bb.min.y, 0.001);
    };
    FROZEN_PINE_SPOTS.forEach((tree, idx) => {
      const variant = idx === 2 || idx === 6 ? "tree_big_snow" : idx % 2 === 0 ? "tree_chr_big" : "tree_chr_small";
      add(variant, {
        x: tree.pos[0],
        z: tree.pos[2],
        rotY: idx * 1.7,
        s: (WINTER_PINE_HEIGHT / heightOf(variant)) * tree.scale,
      });
    });
    FROZEN_PROP_SPOTS.forEach((p) =>
      add(p.kind, { x: p.pos[0], z: p.pos[2], rotY: p.rotY, s: WINTER_PROP_SCALE * p.scale })
    );
    FROZEN_LOG_SPOTS.forEach((l) => add("log", { x: l.pos[0], z: l.pos[2], rotY: l.rotY, s: WINTER_PROP_SCALE * l.scale }));
    return [...byNode.entries()]
      .map(([name, list]) => ({ name, list, mesh: nodes[name] as THREE.Mesh | undefined }))
      .filter((g): g is { name: string; list: Placement[]; mesh: THREE.Mesh } => !!g.mesh);
  }, [nodes]);

  return (
    <>
      {groups.map((g) => (
        <WinterInstancedMesh key={g.name} geometry={g.mesh.geometry} material={g.mesh.material} list={g.list} />
      ))}
    </>
  );
}
useGLTF.preload(WINTER_MODEL_URL);

// ---------------------------------------------------------------------------------------------
// Penguins
// ---------------------------------------------------------------------------------------------
const PENGUIN_BODY = "#1e293b";
const PENGUIN_ORANGE = "#fb923c";

/** Round little penguin (~0.95 tall at scale 1) with a cosy scarf; flaps and waddles on its own. */
function Penguin3D({
  scarf,
  scale = 1,
  phase = 0,
  flapSpeed = 6,
}: {
  scarf: string;
  scale?: number;
  phase?: number;
  flapSpeed?: number;
}) {
  const bodyRef = useRef<THREE.Group>(null);
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    const flap = 0.35 + Math.sin(t * flapSpeed) * 0.3;
    if (leftRef.current) leftRef.current.rotation.z = flap;
    if (rightRef.current) rightRef.current.rotation.z = -flap;
    if (bodyRef.current) bodyRef.current.rotation.z = Math.sin(t * 3.2) * 0.07;
  });

  return (
    <group scale={scale}>
      <group ref={bodyRef}>
        {/* Body & white tummy */}
        <mesh position={[0, 0.45, 0]} scale={[1, 1.22, 0.95]} castShadow>
          <sphereGeometry args={[0.36, 18, 16]} />
          <meshStandardMaterial color={PENGUIN_BODY} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.42, 0.15]} scale={[0.92, 1.12, 0.62]}>
          <sphereGeometry args={[0.3, 16, 14]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Head & white face */}
        <mesh position={[0, 0.93, 0]}>
          <sphereGeometry args={[0.25, 18, 16]} />
          <meshStandardMaterial color={PENGUIN_BODY} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.9, 0.12]} scale={[1.1, 0.95, 0.62]}>
          <sphereGeometry args={[0.19, 14, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Eyes & beak */}
        {[-0.08, 0.08].map((ex) => (
          <mesh key={`pe-${ex}`} position={[ex, 0.96, 0.235]}>
            <sphereGeometry args={[0.038, 10, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
        ))}
        <mesh position={[0, 0.87, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.06, 0.15, 10]} />
          <meshStandardMaterial color={PENGUIN_ORANGE} roughness={0.4} />
        </mesh>
        {/* Scarf */}
        <mesh position={[0, 0.74, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.06, 8, 20]} />
          <meshStandardMaterial color={scarf} roughness={0.5} />
        </mesh>
        {/* Flippers */}
        <group ref={leftRef} position={[-0.33, 0.62, 0]}>
          <mesh position={[-0.04, -0.15, 0]} scale={[0.32, 1, 0.7]}>
            <sphereGeometry args={[0.17, 10, 10]} />
            <meshStandardMaterial color={PENGUIN_BODY} roughness={0.45} />
          </mesh>
        </group>
        <group ref={rightRef} position={[0.33, 0.62, 0]}>
          <mesh position={[0.04, -0.15, 0]} scale={[0.32, 1, 0.7]}>
            <sphereGeometry args={[0.17, 10, 10]} />
            <meshStandardMaterial color={PENGUIN_BODY} roughness={0.45} />
          </mesh>
        </group>
      </group>
      {/* Feet */}
      {[-0.12, 0.12].map((fx) => (
        <mesh key={`pf-${fx}`} position={[fx, 0.04, 0.12]} scale={[1, 0.4, 1.4]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color={PENGUIN_ORANGE} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

const SKATER_DODGE_R = 1.45;

/** Penguins skating loops on the pond; they swerve out of the unicorn's way. */
function SkatingPenguins3D() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const state = useRef<{ pos: THREE.Vector2; yaw: number }[] | null>(null);
  const [cx, , cz] = FROZEN_SKATING_POND_POS;

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = s.clock.elapsedTime;
    if (!state.current) {
      state.current = FROZEN_SKATERS.map((sk) => ({
        pos: new THREE.Vector2(cx + Math.cos(sk.phase) * sk.r, cz + Math.sin(sk.phase) * sk.r),
        yaw: 0,
      }));
    }
    FROZEN_SKATERS.forEach((sk, i) => {
      const st = state.current![i];
      const g = refs.current[i];
      const a = sk.phase + sk.speed * t;
      let tx = cx + Math.cos(a) * sk.r;
      let tz = cz + Math.sin(a) * sk.r;
      // Swerve: keep the loop point at least SKATER_DODGE_R from the unicorn
      const px = tx - playerWorldPos.x;
      const pz = tz - playerWorldPos.z;
      const pd = Math.hypot(px, pz);
      if (pd < SKATER_DODGE_R) {
        const ux = pd > 1e-3 ? px / pd : Math.cos(a);
        const uz = pd > 1e-3 ? pz / pd : Math.sin(a);
        tx = playerWorldPos.x + ux * SKATER_DODGE_R;
        tz = playerWorldPos.z + uz * SKATER_DODGE_R;
      }
      // …but stay on the ice
      const ox = tx - cx;
      const oz = tz - cz;
      const od = Math.hypot(ox, oz);
      const maxR = FROZEN_SKATING_POND_R - 0.35;
      if (od > maxR) {
        tx = cx + (ox / od) * maxR;
        tz = cz + (oz / od) * maxR;
      }
      const prevX = st.pos.x;
      const prevY = st.pos.y;
      const k = 1 - Math.exp(-5 * dt);
      st.pos.x += (tx - st.pos.x) * k;
      st.pos.y += (tz - st.pos.y) * k;
      const vx = st.pos.x - prevX;
      const vz = st.pos.y - prevY;
      if (Math.hypot(vx, vz) > 1e-4) st.yaw = dampAngle(st.yaw, Math.atan2(vx, vz), 8, dt);
      if (g) {
        g.position.set(st.pos.x, FROZEN_SKATING_POND_POS[1], st.pos.y);
        g.rotation.set(0, st.yaw, Math.sin(t * 2 + sk.phase) * 0.12 * Math.sign(sk.speed));
      }
    });
  });

  return (
    <>
      {FROZEN_SKATERS.map((sk, i) => (
        <group
          key={`skater-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[cx + Math.cos(sk.phase) * sk.r, FROZEN_SKATING_POND_POS[1], cz + Math.sin(sk.phase) * sk.r]}
        >
          <Penguin3D scarf={sk.scarf} scale={0.85} phase={i * 1.3} flapSpeed={4} />
        </group>
      ))}
    </>
  );
}

/** Mum, dad & baby penguin by the igloo plaza; they turn to watch the unicorn when she's close. */
function PenguinFamily3D() {
  const rootRef = useRef<THREE.Group>(null);
  const yawRef = useRef(0);
  const [x, , z] = FROZEN_PENGUIN_FAMILY_POS;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const dx = playerWorldPos.x - x;
    const dz = playerWorldPos.z - z;
    const target = Math.hypot(dx, dz) < 7 ? Math.atan2(dx, dz) : 0;
    yawRef.current = dampAngle(yawRef.current, target, 4, dt);
    if (rootRef.current) rootRef.current.rotation.y = yawRef.current;
  });

  return (
    <group position={FROZEN_PENGUIN_FAMILY_POS}>
      {/* Little snowy mound they stand around */}
      <mesh position={[0, 0.02, 0]} scale={[1, 0.12, 1]}>
        <sphereGeometry args={[1.0, 20, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      <group ref={rootRef}>
        <group position={[-0.42, 0.06, -0.15]}>
          <Penguin3D scarf="#38bdf8" scale={1.05} phase={0.4} />
        </group>
        <group position={[0.42, 0.06, -0.1]}>
          <Penguin3D scarf="#f472b6" scale={1.0} phase={1.7} />
        </group>
        <group position={[0, 0.06, 0.45]}>
          <Penguin3D scarf="#fde047" scale={0.6} phase={2.9} flapSpeed={9} />
        </group>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// Snow bunnies & their carrot patch
// ---------------------------------------------------------------------------------------------
function SnowBunny3D({ position, phase }: { position: Vec3; phase: number }) {
  const hopRef = useRef<THREE.Group>(null);
  // Face the carrot patch
  const yaw = Math.atan2(FROZEN_CARROT_PATCH_POS[0] - position[0], FROZEN_CARROT_PATCH_POS[2] - position[2]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 3.4 + phase;
    if (hopRef.current) {
      const h = Math.max(0, Math.sin(t));
      hopRef.current.position.y = h * 0.28;
      hopRef.current.rotation.x = -h * 0.25;
    }
  });

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <group ref={hopRef}>
        <mesh position={[0, 0.24, 0]} scale={[1, 0.85, 1.15]} castShadow>
          <sphereGeometry args={[0.26, 16, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.46, 0.18]}>
          <sphereGeometry args={[0.17, 14, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
        {[-0.065, 0.065].map((ex) => (
          <group key={`be-${ex}`}>
            <mesh position={[ex, 0.7, 0.14]} rotation={[-0.15, 0, ex * 2]} scale={[0.32, 1, 0.22]}>
              <sphereGeometry args={[0.15, 10, 10]} />
              <meshStandardMaterial color="#ffffff" roughness={0.6} />
            </mesh>
            <mesh position={[ex, 0.49, 0.33]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color="#1e1b4b" roughness={0.2} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.44, 0.35]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.26, -0.27]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function CarrotPatch3D() {
  const carrots: [number, number][] = [
    [0, 0],
    [0.34, 0.2],
    [-0.32, 0.24],
    [0.2, -0.34],
    [-0.24, -0.3],
  ];
  return (
    <group position={FROZEN_CARROT_PATCH_POS}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.7, 0.74, 0.08, 18]} />
        <meshStandardMaterial color="#a16207" roughness={0.9} />
      </mesh>
      {carrots.map(([x, z], i) => (
        <group key={`carrot-${i}`} position={[x, 0.08, z]}>
          <mesh position={[0, 0.06, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.07, 0.2, 8]} />
            <meshStandardMaterial color="#f97316" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <coneGeometry args={[0.08, 0.22, 6]} />
            <meshStandardMaterial color="#4ade80" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// Igloos
// ---------------------------------------------------------------------------------------------
function Igloo3D({ igloo, flag }: { igloo: IglooSpot; flag?: boolean }) {
  const { r } = igloo;
  const tunnel = iglooTunnel(igloo);
  const tunnelLen = tunnel.reach - 0.6 * r;
  const tunnelMid = 0.6 * r + tunnelLen / 2;
  return (
    <group position={igloo.pos}>
      {/* Snow-block dome */}
      <mesh castShadow>
        <sphereGeometry args={[r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#f8fafc" roughness={0.35} clearcoat={0.4} />
      </mesh>
      {/* Block courses */}
      {[0.28, 0.55, 0.8].map((h) => {
        const phi = Math.asin(h);
        return (
          <mesh key={`course-${h}`} position={[0, r * h, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r * Math.cos(phi) + 0.005, 0.035, 6, 36]} />
            <meshStandardMaterial color="#bae6fd" roughness={0.4} />
          </mesh>
        );
      })}
      {/* Entrance tunnel (half buried in the snow) with a dark doorway */}
      <group rotation={[0, igloo.doorYaw, 0]}>
        <mesh position={[0, 0, tunnelMid]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[tunnel.radius, tunnel.radius, tunnelLen, 18]} />
          <meshPhysicalMaterial color="#f1f5f9" roughness={0.35} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 0, tunnel.reach + 0.005]}>
          <circleGeometry args={[tunnel.radius * 0.72, 18]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, tunnel.reach - 0.02]} rotation={[0, 0, 0]}>
          <torusGeometry args={[tunnel.radius * 0.86, 0.05, 6, 20, Math.PI]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {flag && (
        <group position={[0, r - 0.05, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.0, 6]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.25} />
          </mesh>
          <mesh position={[0.2, 0.86, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.15]}>
            <coneGeometry args={[0.14, 0.4, 3]} />
            <meshStandardMaterial color="#f472b6" roughness={0.45} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// Frozen Waterfall, Ice Cave & the snow monster's den (west side)
// ---------------------------------------------------------------------------------------------
const ROCK = "#c7d2fe";
const ROCK_DARK = "#a5b4fc";
const SNOW = "#f8fafc";

function RockLump({ position, r, color = ROCK }: { position: Vec3; r: number; color?: string }) {
  return (
    <mesh position={position} rotation={[position[0] * 0.7, position[2] * 1.3, 0]}>
      <dodecahedronGeometry args={[r, 0]} />
      <meshStandardMaterial color={color} roughness={0.85} flatShading />
    </mesh>
  );
}

/** Snowy rock block covering exactly [minX, maxX] × [minZ, maxZ] (matches a FROZEN_ROCK_BOXES entry). */
function RockBlock({
  minX,
  maxX,
  minZ,
  maxZ,
  height,
}: {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  height: number;
}) {
  const w = maxX - minX;
  const d = maxZ - minZ;
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  return (
    <group>
      <mesh position={[cx, height / 2, cz]} castShadow>
        <boxGeometry args={[w, height, d]} />
        <meshStandardMaterial color={ROCK} roughness={0.9} />
      </mesh>
      <mesh position={[cx, height + 0.12, cz]}>
        <boxGeometry args={[w + 0.12, 0.26, d + 0.12]} />
        <meshStandardMaterial color={SNOW} roughness={0.55} />
      </mesh>
    </group>
  );
}

const FALLS_Z = FROZEN_WATERFALL_POOL_POS[2];
const CLIFF_H = 5.2;

function FrozenWaterfall3D({ onGroundClick }: { onGroundClick: GroundClick }) {
  const icicles = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const z = FALLS_Z - 1.4 + (i / 10) * 2.8;
        const h = 2.6 + ((i * 7) % 5) * 0.45;
        return { z, h, r: 0.16 + ((i * 3) % 4) * 0.04 };
      }),
    []
  );
  return (
    <group>
      {/* Cliff (matches the rock box x ∈ [-67.5, -64.0], z ∈ [-9.0, 2.3]) */}
      <RockBlock minX={-67.5} maxX={-64.0} minZ={-9.0} maxZ={2.3} height={CLIFF_H} />
      <RockLump position={[-64.7, 1.2, -7.6]} r={0.75} />
      <RockLump position={[-64.6, 3.4, -7.0]} r={0.6} color={ROCK_DARK} />
      <RockLump position={[-64.7, 1.6, 0.6]} r={0.8} />
      <RockLump position={[-64.6, 3.8, 1.2]} r={0.55} color={ROCK_DARK} />
      <RockLump position={[-65.6, CLIFF_H + 0.3, -7.8]} r={0.7} />
      <RockLump position={[-66.4, CLIFF_H + 0.2, 0.9]} r={0.8} />
      {/* Stream on the clifftop feeding the falls */}
      <mesh position={[-65.9, CLIFF_H + 0.27, FALLS_Z]}>
        <boxGeometry args={[3.3, 0.04, 2.4]} />
        <meshPhysicalMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.3} roughness={0.05} clearcoat={1} />
      </mesh>
      {/* The falls, frozen mid-tumble */}
      <mesh position={[-63.88, CLIFF_H / 2 + 0.1, FALLS_Z]}>
        <boxGeometry args={[0.24, CLIFF_H + 0.2, 3.1]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          emissive="#38bdf8"
          emissiveIntensity={0.35}
          roughness={0.05}
          clearcoat={1}
          transparent
          opacity={0.85}
        />
      </mesh>
      {icicles.map((ic, i) => (
        <mesh key={`fall-${i}`} position={[-63.72, CLIFF_H - ic.h / 2 + 0.1, ic.z]}>
          <cylinderGeometry args={[ic.r, ic.r * 0.45, ic.h, 6]} />
          <meshPhysicalMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.45} roughness={0.05} clearcoat={1} />
        </mesh>
      ))}
      {/* Frozen splash at the foot of the falls */}
      <mesh position={[-63.75, 0.12, FALLS_Z]} scale={[0.5, 0.42, 1.5]}>
        <sphereGeometry args={[1.1, 16, 10]} />
        <meshPhysicalMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.3} roughness={0.08} clearcoat={1} />
      </mesh>
      {/* Walkable ice pool */}
      <mesh
        position={FROZEN_WATERFALL_POOL_POS}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={onGroundClick}
      >
        <circleGeometry args={[FROZEN_WATERFALL_POOL_R, 32]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          emissive="#38bdf8"
          emissiveIntensity={0.28}
          roughness={0.04}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[FROZEN_WATERFALL_POOL_POS[0], 0.022, FALLS_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.4, 28]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
      <Sparkles count={18} position={[-63.4, 2.6, FALLS_Z]} scale={[1.2, 5, 3.4]} size={5} speed={0.5} color="#e0f2fe" />
    </group>
  );
}

const CAVE_WALL_H = 3.6;
const CAVE_CRYSTALS: { pos: Vec3; rot: Vec3; s: number; color: string }[] = [
  { pos: [-65.5, 0.5, 4.3], rot: [0.3, 0, -0.5], s: 1.0, color: "#c4b5fd" },
  { pos: [-65.5, 1.6, 5.4], rot: [0, 0, -0.9], s: 0.8, color: "#7dd3fc" },
  { pos: [-65.5, 0.6, 7.6], rot: [-0.3, 0, -0.6], s: 1.1, color: "#f0abfc" },
  { pos: [-63.0, 0.9, 3.55], rot: [0.9, 0, 0], s: 0.85, color: "#7dd3fc" },
  { pos: [-62.0, 2.0, 3.55], rot: [1.1, 0, 0.2], s: 0.7, color: "#c4b5fd" },
  { pos: [-63.4, 1.2, 8.45], rot: [-0.9, 0, 0], s: 0.9, color: "#f0abfc" },
  { pos: [-62.0, 0.4, 8.45], rot: [-0.7, 0, -0.2], s: 0.75, color: "#7dd3fc" },
];

function IceCave3D({ onGroundClick }: { onGroundClick: GroundClick }) {
  const c = FROZEN_CAVE;
  const gemRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (gemRef.current) gemRef.current.emissiveIntensity = 0.55 + Math.sin(state.clock.elapsedTime * 2) * 0.25;
  });
  const archIcicles = [55, 75, 90, 105, 125].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return { y: 0.6 + 2.55 * Math.sin(a), z: c.mouthZ + 2.55 * Math.cos(a), len: 0.28 + (deg % 20) * 0.01 };
  });
  return (
    <group>
      {/* Rock walls (each matches a FROZEN_ROCK_BOXES entry) */}
      <RockBlock minX={-67.5} maxX={c.maxX} minZ={2.3} maxZ={c.minZ} height={CAVE_WALL_H} />
      <RockBlock minX={-67.5} maxX={c.maxX} minZ={c.maxZ} maxZ={9.7} height={CAVE_WALL_H} />
      <RockBlock minX={-67.5} maxX={c.minX} minZ={c.minZ} maxZ={c.maxZ} height={CAVE_WALL_H + 0.6} />
      <RockLump position={[-62.4, CAVE_WALL_H + 0.2, 2.9]} r={0.6} />
      <RockLump position={[-66.0, CAVE_WALL_H + 0.3, 9.1]} r={0.75} color={ROCK_DARK} />
      <RockLump position={[-62.6, CAVE_WALL_H + 0.15, 9.2]} r={0.5} />
      {/* Rocky roof over the back of the cave (the front stays open so the camera can look in) */}
      <mesh position={[-66.0, CAVE_WALL_H + 0.25, c.mouthZ]}>
        <boxGeometry args={[3.0, 0.5, 7.4]} />
        <meshStandardMaterial color={ROCK_DARK} roughness={0.9} />
      </mesh>
      <mesh position={[-66.0, CAVE_WALL_H + 0.62, c.mouthZ]}>
        <boxGeometry args={[3.1, 0.24, 7.5]} />
        <meshStandardMaterial color={SNOW} roughness={0.55} />
      </mesh>
      {/* Glittering ice arch over the mouth (inner top ≈ 3.15) */}
      <mesh position={[c.maxX - 0.2, 0.6, c.mouthZ]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[3.0, 0.45, 10, 30, Math.PI]} />
        <meshPhysicalMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.4} roughness={0.1} clearcoat={1} />
      </mesh>
      {archIcicles.map((ic, i) => (
        <mesh key={`aic-${i}`} position={[c.maxX - 0.2, ic.y - ic.len / 2, ic.z]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.09, ic.len, 6]} />
          <meshPhysicalMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.6} roughness={0.05} clearcoat={1} />
        </mesh>
      ))}
      {/* Glowing frosty floor */}
      <mesh position={[(c.minX + c.maxX) / 2, 0.012, c.mouthZ]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onGroundClick}>
        <planeGeometry args={[c.maxX - c.minX, c.maxZ - c.minZ]} />
        <meshStandardMaterial ref={gemRef} color="#ddd6fe" emissive="#a78bfa" emissiveIntensity={0.55} roughness={0.3} />
      </mesh>
      {/* Crystals growing out of the walls */}
      {CAVE_CRYSTALS.map((cr, i) => (
        <group key={`ccr-${i}`} position={cr.pos} rotation={cr.rot} scale={cr.s}>
          <mesh position={[0, 0.28, 0]} scale={[1, 1.8, 1]}>
            <octahedronGeometry args={[0.18, 0]} />
            <meshPhysicalMaterial color={cr.color} emissive={cr.color} emissiveIntensity={0.7} roughness={0.08} clearcoat={1} />
          </mesh>
          <mesh position={[0.14, 0.14, 0.05]} rotation={[0, 0, -0.5]} scale={[1, 1.6, 1]}>
            <octahedronGeometry args={[0.11, 0]} />
            <meshPhysicalMaterial color={cr.color} emissive={cr.color} emissiveIntensity={0.7} roughness={0.08} clearcoat={1} />
          </mesh>
        </group>
      ))}
      {/* Glowing stalactites under the roof */}
      {[4.2, 5.4, 6.6, 7.8].map((z, i) => (
        <mesh key={`stal-${i}`} position={[-64.7, CAVE_WALL_H - 0.25 - (i % 2) * 0.15, z]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.12, 0.6 + (i % 2) * 0.3, 6]} />
          <meshPhysicalMaterial color="#e0f2fe" emissive="#a78bfa" emissiveIntensity={0.6} roughness={0.05} clearcoat={1} />
        </mesh>
      ))}
      <Sparkles count={16} position={[-63.4, 1.6, c.mouthZ]} scale={[3.6, 2.8, 4.2]} size={4} speed={0.3} color="#e9d5ff" />
    </group>
  );
}

/** Snow monster's den: a flat, clear patch of fresh snow with giant footprints leading from the cave. */
function SnowMonsterDen3D({ onGroundClick }: { onGroundClick: GroundClick }) {
  const [dx, , dz] = FROZEN_SNOW_DEN_POS;
  const prints = FROZEN_DEN_FOOTPRINTS.map(([x, z], i) => {
    const [nx, nz] = i + 1 < FROZEN_DEN_FOOTPRINTS.length ? FROZEN_DEN_FOOTPRINTS[i + 1] : [dx, dz];
    const yaw = Math.atan2(nx - x, nz - z);
    return { x, z, yaw, side: i % 2 === 0 ? -1 : 1 };
  });
  return (
    <group>
      <mesh position={[dx, 0.01, dz]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onGroundClick}>
        <circleGeometry args={[FROZEN_SNOW_DEN_R, 36]} />
        <meshStandardMaterial color="#ffffff" roughness={0.75} />
      </mesh>
      <mesh position={[dx, 0.014, dz]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[FROZEN_SNOW_DEN_R - 0.14, FROZEN_SNOW_DEN_R, 40]} />
        <meshStandardMaterial color="#bfdbfe" roughness={0.6} />
      </mesh>
      {prints.map((p, i) => (
        <group key={`print-${i}`} position={[p.x + Math.cos(p.yaw) * 0.25 * p.side, 0.016, p.z - Math.sin(p.yaw) * 0.25 * p.side]} rotation={[0, p.yaw, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.75, 1, 1]}>
            <circleGeometry args={[0.45, 18]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
          </mesh>
          {[-0.24, 0, 0.24].map((tx) => (
            <mesh key={`toe-${tx}`} position={[tx, 0.002, 0.52 - Math.abs(tx) * 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.12, 12]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// Marshmallow, the gentle snow giant who lives in the den (Draco GLB, ~60 KB, 4k tris, 512px WebP skin). The model is
// 1 unit tall with its origin at the feet and faces +z. Unrigged, so the whole body breathes, sways, turns a little
// toward Sarvin and leans down to say hello when she comes close.
// ---------------------------------------------------------------------------------------------
const MARSHMALLOW_MODEL_URL = "/models/marshmallow.glb";
const MARSHMALLOW_NOTICE_DIST = 7.5;
// Small enough that the arms stay inside the collision capsule while it turns
const MARSHMALLOW_MAX_TURN = 0.22;

function MarshmallowModel3D() {
  const { scene } = useGLTF(MARSHMALLOW_MODEL_URL);
  const yawRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const state = useRef({ yaw: FROZEN_MARSHMALLOW_YAW, near: 0 });
  const [px, , pz] = FROZEN_SNOW_DEN_POS;

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      // The skin reads grey under the scene lights: tint it a little whiter and let it glow faintly through its own
      // texture (which also lights up the cyan eyes)
      const brighten = (m: THREE.Material) => {
        const mat = (m as THREE.MeshStandardMaterial).clone();
        mat.color.setRGB(1.12, 1.14, 1.2);
        if (mat.map) {
          mat.emissiveMap = mat.map;
          mat.emissive.set("#ffffff");
          mat.emissiveIntensity = 0.28;
        }
        mat.roughness = 0.55;
        mat.metalness = 0;
        return mat;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(brighten) : brighten(mesh.material);
    });
    return clone;
  }, [scene]);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = s.clock.elapsedTime;
    const st = state.current;
    const dx = playerWorldPos.x - px;
    const dz = playerWorldPos.z - pz;
    const near = Math.hypot(dx, dz) < MARSHMALLOW_NOTICE_DIST;
    st.near += ((near ? 1 : 0) - st.near) * (1 - Math.exp(-3 * dt));

    const toPlayer = Math.atan2(dx, dz);
    const turn = THREE.MathUtils.clamp(
      Math.atan2(Math.sin(toPlayer - FROZEN_MARSHMALLOW_YAW), Math.cos(toPlayer - FROZEN_MARSHMALLOW_YAW)),
      -MARSHMALLOW_MAX_TURN,
      MARSHMALLOW_MAX_TURN,
    );
    st.yaw = dampAngle(st.yaw, near ? FROZEN_MARSHMALLOW_YAW + turn : FROZEN_MARSHMALLOW_YAW, 2, dt);
    if (yawRef.current) yawRef.current.rotation.y = st.yaw;

    if (bodyRef.current) {
      const n = st.near;
      // Slow, big breaths; a heavy side-to-side sway that gets a happy wobble when she is near
      const breathe = Math.sin(t * 1.3);
      bodyRef.current.scale.set(1 + breathe * 0.012, 1 + breathe * 0.022, 1 + breathe * 0.012);
      bodyRef.current.rotation.z = Math.sin(t * 0.9) * 0.035 + Math.sin(t * 3.2) * 0.035 * n;
      // Leans down toward her to say hello
      bodyRef.current.rotation.x = Math.sin(t * 0.7) * 0.015 + 0.1 * n;
      bodyRef.current.position.y = Math.abs(Math.sin(t * 3.2)) * 0.06 * n;
    }
  });

  return (
    <group position={FROZEN_SNOW_DEN_POS}>
      <group ref={yawRef} rotation={[0, FROZEN_MARSHMALLOW_YAW, 0]}>
        <group ref={bodyRef}>
          <primitive object={model} scale={FROZEN_MARSHMALLOW_HEIGHT} />
        </group>
      </group>
    </group>
  );
}
useGLTF.preload(MARSHMALLOW_MODEL_URL);

/** Simple snowball stand-in while the model loads. */
function MarshmallowFallback3D() {
  const h = FROZEN_MARSHMALLOW_HEIGHT;
  return (
    <group position={FROZEN_SNOW_DEN_POS} rotation={[0, FROZEN_MARSHMALLOW_YAW, 0]}>
      <mesh position={[0, h * 0.3, 0]} scale={[1.25, 1, 0.9]} castShadow>
        <sphereGeometry args={[h * 0.3, 16, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      <mesh position={[0, h * 0.72, 0]} castShadow>
        <sphereGeometry args={[h * 0.2, 16, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * h * 0.07, h * 0.76, h * 0.18]}>
          <sphereGeometry args={[h * 0.03, 10, 8]} />
          <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Marshmallow3D() {
  return (
    <Suspense fallback={<MarshmallowFallback3D />}>
      <MarshmallowModel3D />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------------------------
// Spiral Ice Slide
// ---------------------------------------------------------------------------------------------
const UP = new THREE.Vector3(0, 1, 0);

function buildChute() {
  const SEG = 10;
  const R = FROZEN_SLIDE_PIPE_R;
  const pts = FROZEN_SLIDE_CHUTE.map((p) => new THREE.Vector3(...p));
  const positions: number[] = [];
  const indices: number[] = [];
  const lipA: THREE.Vector3[] = [];
  const lipB: THREE.Vector3[] = [];
  const tan = new THREE.Vector3();
  const side = new THREE.Vector3();
  const norm = new THREE.Vector3();
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    tan.subVectors(b, a).normalize();
    side.crossVectors(tan, UP).normalize();
    norm.crossVectors(side, tan).normalize();
    for (let j = 0; j <= SEG; j++) {
      const th = -Math.PI / 2 + (j / SEG) * Math.PI;
      const v = p
        .clone()
        .addScaledVector(norm, R * (1 - Math.cos(th)))
        .addScaledVector(side, R * Math.sin(th));
      positions.push(v.x, v.y, v.z);
      if (j === 0) lipA.push(v.clone());
      if (j === SEG) lipB.push(v.clone());
    }
  });
  for (let i = 0; i < pts.length - 1; i++) {
    for (let j = 0; j < SEG; j++) {
      const a = i * (SEG + 1) + j;
      const b = a + 1;
      const c = a + SEG + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const lips = [lipA, lipB].map(
    (pl) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pl), pl.length * 2, 0.07, 6, false)
  );
  return { geo, lips };
}

function IceSlide3D({ onGroundClick }: { onGroundClick: GroundClick }) {
  const { geo, lips } = useMemo(() => buildChute(), []);
  const padMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const arrowsRef = useRef<THREE.Group>(null);
  const [sx, , sz] = FROZEN_SLIDE_POS;
  const [px, , pz] = FROZEN_SLIDE_PAD;

  // Tapping the slide itself walks the unicorn to the lift pad
  const toPad = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.point.set(px, 0, pz);
      onGroundClick(e);
    },
    [onGroundClick, px, pz]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (padMatRef.current) padMatRef.current.emissiveIntensity = 0.7 + Math.sin(t * 3) * 0.35;
    if (arrowsRef.current) arrowsRef.current.position.y = 0.5 + ((t * 0.8) % 1) * 0.9;
  });

  // Railing round the top platform, open where the chute starts (≈46°) — angle convention x = cos a, z = sin a
  const railGapStart = ((46 - 28) * Math.PI) / 180;
  const railGapEnd = ((46 + 28) * Math.PI) / 180;
  const railArc = Math.PI * 2 - (railGapEnd - railGapStart);
  const railPosts = Array.from({ length: 10 }, (_, i) => railGapEnd + (i / 9) * railArc);
  const flagA = ((46 + 180) * Math.PI) / 180;

  return (
    <group>
      <group position={[sx, 0, sz]}>
        {/* Ice tower */}
        <mesh position={[0, FROZEN_SLIDE_TOP_Y / 2, 0]} onPointerDown={toPad} castShadow>
          <cylinderGeometry args={[FROZEN_SLIDE_TOWER_R, FROZEN_SLIDE_TOWER_R * 1.08, FROZEN_SLIDE_TOP_Y, 20]} />
          <meshPhysicalMaterial color="#e0f2fe" roughness={0.25} clearcoat={0.7} />
        </mesh>
        {[1.1, 2.3, 3.5].map((y) => (
          <mesh key={`tring-${y}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[FROZEN_SLIDE_TOWER_R + 0.03, 0.06, 6, 28]} />
            <meshStandardMaterial color="#c4b5fd" roughness={0.4} />
          </mesh>
        ))}
        {/* Top platform & railing */}
        <mesh position={[0, FROZEN_SLIDE_TOP_Y - 0.1, 0]} onPointerDown={toPad}>
          <cylinderGeometry args={[FROZEN_SLIDE_TOWER_R + 0.2, FROZEN_SLIDE_TOWER_R + 0.1, 0.2, 20]} />
          <meshPhysicalMaterial color="#bae6fd" roughness={0.2} clearcoat={0.85} />
        </mesh>
        {railPosts.map((a, i) => (
          <mesh key={`rpost-${i}`} position={[Math.cos(a) * 1.38, FROZEN_SLIDE_TOP_Y + 0.28, Math.sin(a) * 1.38]}>
            <cylinderGeometry args={[0.05, 0.05, 0.56, 6]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.45} roughness={0.25} />
          </mesh>
        ))}
        <group rotation={[0, -railGapEnd, 0]}>
          <mesh position={[0, FROZEN_SLIDE_TOP_Y + 0.56, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.38, 0.05, 6, 32, railArc]} />
            <meshStandardMaterial color="#f9a8d4" roughness={0.35} />
          </mesh>
        </group>
        {/* Pennant flag */}
        <group position={[Math.cos(flagA) * 1.1, FROZEN_SLIDE_TOP_Y, Math.sin(flagA) * 1.1]}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1.8, 6]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.25} />
          </mesh>
          <mesh position={[0.28, 1.58, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.15]}>
            <coneGeometry args={[0.2, 0.56, 3]} />
            <meshStandardMaterial color="#f472b6" roughness={0.45} />
          </mesh>
        </group>
      </group>

      {/* The spiral chute (world coordinates) */}
      <mesh geometry={geo} onPointerDown={toPad} castShadow>
        <meshPhysicalMaterial color="#bae6fd" roughness={0.12} clearcoat={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={lips[0]}>
        <meshStandardMaterial color="#f9a8d4" roughness={0.35} />
      </mesh>
      <mesh geometry={lips[1]}>
        <meshStandardMaterial color="#c4b5fd" roughness={0.35} />
      </mesh>

      {/* Glowing snowflake lift pad: step on it to float up to the top */}
      <group position={[px, 0, pz]}>
        <mesh position={[0, 0.03, 0]} onPointerDown={onGroundClick}>
          <cylinderGeometry args={[0.85, 0.9, 0.06, 6]} />
          <meshStandardMaterial ref={padMatRef} color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a, i) => (
          <mesh key={`pflake-${i}`} position={[0, 0.07, 0]} rotation={[0, a, 0]}>
            <boxGeometry args={[1.25, 0.02, 0.1]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
          </mesh>
        ))}
        <group ref={arrowsRef}>
          {[0, 0.38].map((y) => (
            <mesh key={`parrow-${y}`} position={[0, y, 0]}>
              <coneGeometry args={[0.22, 0.26, 4]} />
              <meshStandardMaterial color="#f9a8d4" emissive="#f472b6" emissiveIntensity={0.6} transparent opacity={0.85} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// Everything the Frozen Land expansion adds, in one place
// ---------------------------------------------------------------------------------------------
export function FrozenExpansion3D({ onGroundClick }: { onGroundClick: GroundClick }) {
  return (
    <group>
      <Suspense fallback={null}>
        <WinterInstances />
      </Suspense>
      <IceSlide3D onGroundClick={onGroundClick} />
      {FROZEN_IGLOOS.map((ig, i) => (
        <Igloo3D key={`igloo-${i}`} igloo={ig} flag={i === 0} />
      ))}
      <PenguinFamily3D />
      <SkatingPenguins3D />
      <FrozenWaterfall3D onGroundClick={onGroundClick} />
      <IceCave3D onGroundClick={onGroundClick} />
      <SnowMonsterDen3D onGroundClick={onGroundClick} />
      <Marshmallow3D />
      <CarrotPatch3D />
      {FROZEN_BUNNY_SPOTS.map((p, i) => (
        <SnowBunny3D key={`bunny-${i}`} position={p} phase={i * 1.6} />
      ))}
    </group>
  );
}
