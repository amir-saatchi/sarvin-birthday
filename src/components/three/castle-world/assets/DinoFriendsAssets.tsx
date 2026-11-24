"use client";

import React, { useMemo, useRef } from "react";
import { type ThreeEvent } from "@react-three/fiber";
import { useFrame } from "../landFrame";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Vec2, Vec3 } from "../types";
import { playerWorldPos } from "../playerTracker";

// ---------------------------------------------------------------------------------------------
// Shared helpers for the sculpted dino friends (GLB models with flat pastel materials, no textures)
// ---------------------------------------------------------------------------------------------

function dampAngle(cur: number, target: number, lambda: number, dt: number) {
  const diff = Math.atan2(Math.sin(target - cur), Math.cos(target - cur));
  return cur + diff * (1 - Math.exp(-lambda * dt));
}

function wrapAngle(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/** Clone a GLB scene, recolour its materials by name and work out the scale/offset that stands it on y = 0 at `height`. */
function usePastelModel(scene: THREE.Group, height: number, colors: Record<string, string> = {}) {
  return useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      const recolor = (m: THREE.Material) => {
        const mat = (m as THREE.MeshStandardMaterial).clone();
        const c = colors[mat.name];
        if (c) mat.color.set(c);
        mat.roughness = mat.name === "Eye" ? 0.15 : 0.5;
        mat.metalness = 0;
        return mat;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(recolor) : recolor(mesh.material);
    });
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return {
      model: clone,
      fit: height / Math.max(size.y, 0.001),
      offset: [-center.x, -box.min.y, -center.z] as Vec3,
    };
    // colors is a static per-instance palette
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, height]);
}

// ---------------------------------------------------------------------------------------------
// Triceratops friend — lilac body, pink frill, nods its head and wags its tail when Sarvin is near
// ---------------------------------------------------------------------------------------------

const TRICERATOPS_URL = "/models/triceratops.glb";
const TRICERATOPS_NOTICE_DIST = 6.5;

export function TriceratopsModel3D({
  position,
  yaw,
  height,
}: {
  position: Vec3;
  yaw: number;
  height: number;
}) {
  const { scene } = useGLTF(TRICERATOPS_URL);
  const { model, fit, offset } = usePastelModel(scene as THREE.Group, height);
  const yawRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const st = useRef({ yaw, near: 0, head: 0 });

  // Head / Tail nodes of the cloned model, looked up once (kept in a ref: they are animated every frame)
  const partsRef = useRef<{
    model: THREE.Object3D;
    head: THREE.Object3D | null;
    tail: THREE.Object3D | null;
    headRest: THREE.Euler;
    tailRest: THREE.Euler;
  } | null>(null);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = s.clock.elapsedTime;
    const S = st.current;
    const dx = playerWorldPos.x - position[0];
    const dz = playerWorldPos.z - position[2];
    const near = Math.hypot(dx, dz) < TRICERATOPS_NOTICE_DIST;
    S.near += ((near ? 1 : 0) - S.near) * (1 - Math.exp(-4 * dt));
    const rel = wrapAngle(Math.atan2(dx, dz) - yaw);

    // The long body only leans a little (it has to stay inside its capsule); the head does the looking
    S.yaw = dampAngle(S.yaw, near ? yaw + THREE.MathUtils.clamp(rel, -0.12, 0.12) : yaw, 2.5, dt);
    if (yawRef.current) yawRef.current.rotation.y = S.yaw;
    const headTurn = near ? THREE.MathUtils.clamp(rel - (S.yaw - yaw), -0.45, 0.45) : 0;
    S.head = S.head + (headTurn - S.head) * (1 - Math.exp(-4 * dt));

    if (!partsRef.current || partsRef.current.model !== model) {
      const head = model.getObjectByName("Head") ?? null;
      const tail = model.getObjectByName("Tail") ?? null;
      partsRef.current = {
        model,
        head,
        tail,
        headRest: head ? head.rotation.clone() : new THREE.Euler(),
        tailRest: tail ? tail.rotation.clone() : new THREE.Euler(),
      };
    }
    const parts = partsRef.current;
    const n = S.near;
    if (bodyRef.current) {
      bodyRef.current.scale.set(1, 1 + Math.sin(t * 1.6) * 0.016, 1);
      bodyRef.current.rotation.z = Math.sin(t * 1.2) * 0.02;
    }
    if (parts.head) {
      // Gentle idle bob, plus a happy double-nod when Sarvin comes close
      parts.head.rotation.x = parts.headRest.x + Math.sin(t * 1.4) * 0.04 + Math.sin(t * 6) * 0.12 * n;
      parts.head.rotation.y = parts.headRest.y + S.head;
    }
    if (parts.tail) {
      parts.tail.rotation.y = parts.tailRest.y + Math.sin(t * (2 + 4 * n)) * (0.12 + 0.18 * n);
    }
  });

  return (
    <group position={position}>
      <group ref={yawRef} rotation={[0, yaw, 0]}>
        <group ref={bodyRef}>
          <group scale={fit}>
            <primitive object={model} position={offset} />
          </group>
        </group>
      </group>
    </group>
  );
}
useGLTF.preload(TRICERATOPS_URL);

// ---------------------------------------------------------------------------------------------
// Sitting dino friends (one model, two palettes: Big Blue and Baby Pink)
// ---------------------------------------------------------------------------------------------

const SITTING_DINO_URL = "/models/sitting-dino.glb";

export const BABY_PINK_DINO_COLORS: Record<string, string> = {
  Body: "#f9a8d4",
  Belly: "#fdf2f8",
  Spikes: "#c4b5fd",
  Cheek: "#fb7185",
};

export function SittingDinoModel3D({
  position,
  yaw,
  height,
  colors,
  noticeDist = 5,
}: {
  position: Vec3;
  yaw: number;
  height: number;
  colors?: Record<string, string>;
  noticeDist?: number;
}) {
  const { scene } = useGLTF(SITTING_DINO_URL);
  const { model, fit, offset } = usePastelModel(scene as THREE.Group, height, colors);
  const yawRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const st = useRef({ yaw, near: 0 });
  // Small per-instance phase so the two sitting dinos don't breathe in sync
  const phase = position[0] * 0.37 + position[2] * 0.21;

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = s.clock.elapsedTime + phase;
    const S = st.current;
    const dx = playerWorldPos.x - position[0];
    const dz = playerWorldPos.z - position[2];
    const near = Math.hypot(dx, dz) < noticeDist;
    S.near += ((near ? 1 : 0) - S.near) * (1 - Math.exp(-4 * dt));
    const rel = wrapAngle(Math.atan2(dx, dz) - yaw);
    S.yaw = dampAngle(S.yaw, near ? yaw + THREE.MathUtils.clamp(rel, -0.5, 0.5) : yaw, 3, dt);
    if (yawRef.current) yawRef.current.rotation.y = S.yaw;

    if (bodyRef.current) {
      const n = S.near;
      const hop = Math.max(0, Math.sin(t * 5.5)) * n;
      const squash = 1 - hop * 0.06 + Math.sin(t * 1.9) * 0.02;
      bodyRef.current.scale.set(1 + (1 - squash) * 0.5, squash, 1 + (1 - squash) * 0.5);
      bodyRef.current.position.y = hop * 0.16 * (height / 2);
      bodyRef.current.rotation.z = Math.sin(t * 1.4) * 0.035 + Math.sin(t * 5.5) * 0.05 * n;
    }
  });

  return (
    <group position={position}>
      <group ref={yawRef} rotation={[0, yaw, 0]}>
        <group ref={bodyRef}>
          <group scale={fit}>
            <primitive object={model} position={offset} />
          </group>
        </group>
      </group>
    </group>
  );
}
useGLTF.preload(SITTING_DINO_URL);

// ---------------------------------------------------------------------------------------------
// Fossil Dig: a sandy pit with a cute fossil skeleton on a rounded stone plinth
// ---------------------------------------------------------------------------------------------

const BONE = "#fffbeb";
const BONE_SHADE = "#fde68a";

function Bone3D({ position, rotationY = 0, length = 0.5 }: { position: Vec3; rotationY?: number; length?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, length, 8]} />
        <meshStandardMaterial color={BONE} roughness={0.5} />
      </mesh>
      {[-1, 1].map((side) =>
        [-1, 1].map((k) => (
          <mesh key={`${side}${k}`} position={[(side * length) / 2, 0, k * 0.05]}>
            <sphereGeometry args={[0.065, 10, 8]} />
            <meshStandardMaterial color={BONE} roughness={0.5} />
          </mesh>
        ))
      )}
    </group>
  );
}

export function FossilDig3D({
  pitPos,
  skeletonPos,
  plinthHalf,
  plinthR,
  onGroundClick,
}: {
  pitPos: Vec3;
  skeletonPos: Vec3;
  plinthHalf: number;
  plinthR: number;
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const skullRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (skullRef.current) skullRef.current.rotation.z = Math.sin(t * 1.3) * 0.06;
    if (tailRef.current) tailRef.current.rotation.y = Math.sin(t * 1.8) * 0.12;
  });

  const ribs = [-0.75, -0.35, 0.05, 0.45];
  const rimStones = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        return { x: Math.cos(a) * 3.05, z: Math.sin(a) * 2.45, s: 0.7 + (i % 3) * 0.18, a };
      }),
    []
  );
  const plinthTop = 0.5;
  const sx = skeletonPos[0] - pitPos[0];
  const sz = skeletonPos[2] - pitPos[2];

  return (
    <group position={pitPos}>
      {/* Sandy pit (flat, walkable) */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 1, 1]} onPointerDown={onGroundClick} receiveShadow>
        <circleGeometry args={[2.45, 40]} />
        <meshStandardMaterial color="#fde68a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 1, 1]}>
        <ringGeometry args={[1.6, 1.72, 40]} />
        <meshStandardMaterial color="#fcd34d" transparent opacity={0.6} />
      </mesh>
      {/* Low flat rim pebbles */}
      {rimStones.map((r, i) => (
        <mesh key={`rim-${i}`} position={[r.x, 0.04, r.z]} rotation={[0, r.a, 0]} scale={[r.s * 1.2, r.s * 0.35, r.s]}>
          <dodecahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color={i % 2 ? "#e7e5e4" : "#fed7aa"} roughness={0.8} />
        </mesh>
      ))}
      {/* Little bones peeking out of the sand */}
      <Bone3D position={[-1.9, 0.05, 0.9]} rotationY={0.6} />
      <Bone3D position={[1.7, 0.05, 1.4]} rotationY={-0.4} length={0.4} />
      <Bone3D position={[-0.6, 0.05, 1.7]} rotationY={1.8} length={0.42} />
      <Bone3D position={[2.4, 0.05, -0.2]} rotationY={2.4} length={0.36} />

      {/* Rounded stone plinth (stadium: box + two round ends) — matches the capsule collider */}
      <group position={[sx, 0, sz]}>
        <mesh position={[0, plinthTop / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[plinthHalf * 2, plinthTop, plinthR * 2]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.85} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * plinthHalf, plinthTop / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[plinthR, plinthR, plinthTop, 28]} />
            <meshStandardMaterial color="#d6d3d1" roughness={0.85} />
          </mesh>
        ))}
        {/* Mossy top slab */}
        <mesh position={[0, plinthTop + 0.03, 0]}>
          <boxGeometry args={[plinthHalf * 2, 0.06, plinthR * 1.7]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.8} />
        </mesh>

        {/* Kawaii skeleton: head faces +x, standing on the plinth */}
        <group position={[0, plinthTop + 0.06, 0]} scale={1.2}>
          {/* Legs */}
          {[
            [0.55, 0.3],
            [0.55, -0.3],
            [-0.45, 0.3],
            [-0.45, -0.3],
          ].map(([lx, lz], i) => (
            <group key={`leg-${i}`} position={[lx, 0, lz]}>
              <mesh position={[0, 0.32, 0]}>
                <cylinderGeometry args={[0.06, 0.07, 0.64, 8]} />
                <meshStandardMaterial color={BONE} roughness={0.5} />
              </mesh>
              <mesh position={[0.04, 0.04, 0]} scale={[1.4, 0.6, 1]}>
                <sphereGeometry args={[0.1, 10, 8]} />
                <meshStandardMaterial color={BONE_SHADE} roughness={0.5} />
              </mesh>
            </group>
          ))}
          {/* Spine */}
          {Array.from({ length: 9 }, (_, i) => {
            const x = -1.0 + i * 0.25;
            const y = 0.92 + Math.sin((i / 8) * Math.PI) * 0.18;
            return (
              <mesh key={`v-${i}`} position={[x, y, 0]}>
                <sphereGeometry args={[0.1, 10, 8]} />
                <meshStandardMaterial color={BONE} roughness={0.45} />
              </mesh>
            );
          })}
          {/* Ribs */}
          {ribs.map((rx, i) => (
            <mesh key={`rib-${i}`} position={[rx + 0.2, 1.0, 0]} rotation={[Math.PI, Math.PI / 2, 0]}>
              <torusGeometry args={[0.3 - Math.abs(i - 1.5) * 0.03, 0.045, 8, 20, Math.PI]} />
              <meshStandardMaterial color={BONE} roughness={0.5} />
            </mesh>
          ))}
          {/* Neck + skull */}
          <group position={[1.05, 1.1, 0]} ref={skullRef}>
            <mesh position={[-0.12, -0.06, 0]} rotation={[0, 0, -0.9]}>
              <cylinderGeometry args={[0.06, 0.07, 0.34, 8]} />
              <meshStandardMaterial color={BONE} roughness={0.5} />
            </mesh>
            <mesh position={[0.18, 0.14, 0]} scale={[1.25, 0.95, 0.9]}>
              <sphereGeometry args={[0.26, 18, 14]} />
              <meshStandardMaterial color={BONE} roughness={0.45} />
            </mesh>
            <mesh position={[0.42, 0.06, 0]} scale={[1, 0.6, 0.8]}>
              <sphereGeometry args={[0.18, 14, 10]} />
              <meshStandardMaterial color={BONE} roughness={0.45} />
            </mesh>
            {/* Big friendly eye holes + rosy cheeks */}
            {[-1, 1].map((side) => (
              <group key={side}>
                <mesh position={[0.26, 0.22, side * 0.19]}>
                  <sphereGeometry args={[0.075, 12, 10]} />
                  <meshStandardMaterial color="#44403c" roughness={0.3} />
                </mesh>
                <mesh position={[0.29, 0.25, side * 0.23]}>
                  <sphereGeometry args={[0.022, 8, 6]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
                </mesh>
                <mesh position={[0.36, 0.08, side * 0.17]} scale={[1, 0.6, 1]}>
                  <sphereGeometry args={[0.05, 10, 8]} />
                  <meshStandardMaterial color="#fda4af" roughness={0.5} />
                </mesh>
              </group>
            ))}
          </group>
          {/* Tail bones */}
          <group position={[-1.1, 0.9, 0]} ref={tailRef}>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={`tb-${i}`} position={[-0.17 * (i + 1), -0.09 * (i + 1), 0]}>
                <sphereGeometry args={[0.085 - i * 0.012, 10, 8]} />
                <meshStandardMaterial color={BONE} roughness={0.45} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// Bouncy dino-egg trampoline (walk onto it to bounce, like the pink mushrooms)
// ---------------------------------------------------------------------------------------------

export function BounceEgg3D({ position, color, spotColor }: { position: Vec3; color: string; spotColor: string }) {
  const eggRef = useRef<THREE.Group>(null);
  const squish = useRef(0);
  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const onTop =
      Math.hypot(playerWorldPos.x - position[0], playerWorldPos.z - position[2]) < 0.95 && playerWorldPos.y < 0.5;
    squish.current += ((onTop ? 1 : 0) - squish.current) * (1 - Math.exp(-14 * dt));
    if (eggRef.current) {
      const wob = Math.sin(s.clock.elapsedTime * 2 + position[0]) * 0.02;
      const q = squish.current;
      eggRef.current.scale.set(1 + q * 0.12, 1 - q * 0.35 + wob, 1 + q * 0.12);
    }
  });
  // Spots sit on the dome surface (radius 0.9, squashed to 0.45 tall)
  const spots: Vec3[] = (
    [
      [0, 0],
      [0.35, 0.2],
      [-0.3, 0.3],
      [0.05, -0.42],
      [-0.48, -0.22],
      [0.55, -0.3],
    ] as Vec2[]
  ).map(([x, z]) => [x, 0.45 * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / 0.81)) - 0.01, z]);
  return (
    <group position={position}>
      {/* Grassy nest ring */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.98, 0.12, 8, 28]} />
        <meshStandardMaterial color="#a3e635" roughness={0.7} />
      </mesh>
      <group ref={eggRef}>
        {/* Half-buried giant egg — a soft dome you bounce on */}
        <mesh position={[0, 0, 0]} scale={[1, 0.5, 1]} castShadow>
          <sphereGeometry args={[0.9, 26, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.6} />
        </mesh>
        {spots.map((p, i) => (
          <mesh key={i} position={p} scale={[1, 0.45, 1]}>
            <sphereGeometry args={[0.1 + (i % 2) * 0.03, 10, 8]} />
            <meshStandardMaterial color={spotColor} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// Prehistoric fern and spotted mushroom (Fern Grove decor; colliders: 0.5*scale and 0.42)
// ---------------------------------------------------------------------------------------------

export function PrehistoricFern3D({ position, color, scale = 1 }: { position: Vec3; color: string; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.7 + position[0]) * 0.06;
  });
  const fronds = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ a: (i / 7) * Math.PI * 2 + (i % 2) * 0.2, tilt: 0.6 + (i % 3) * 0.12 })),
    []
  );
  return (
    <group position={position} scale={scale}>
      {/* Stubby trunk hub */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.2, 0.32, 0.44, 10]} />
        <meshStandardMaterial color="#a16207" roughness={0.85} />
      </mesh>
      <group ref={ref} position={[0, 0.42, 0]}>
        {fronds.map((f, i) => (
          <group key={i} rotation={[0, f.a, 0]}>
            <group rotation={[f.tilt, 0, 0]}>
              {/* Long leaf blade, pointing out and up */}
              <mesh position={[0, 0.42, 0]} scale={[0.2, 0.45, 0.06]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshStandardMaterial color={i % 2 ? color : "#4ade80"} roughness={0.6} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        ))}
        {/* Curly fiddlehead in the middle */}
        <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.035, 8, 16, Math.PI * 1.5]} />
          <meshStandardMaterial color="#86efac" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 0.42, 6]} />
          <meshStandardMaterial color="#86efac" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

export function SpottedMushroom3D({ position, color }: { position: Vec3; color: string }) {
  const capRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (capRef.current) {
      const t = s.clock.elapsedTime * 1.6 + position[2];
      capRef.current.scale.set(1 + Math.sin(t) * 0.03, 1 - Math.sin(t) * 0.03, 1 + Math.sin(t) * 0.03);
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.13, 0.18, 0.6, 12]} />
        <meshStandardMaterial color="#fffbeb" roughness={0.45} />
      </mesh>
      <group ref={capRef} position={[0, 0.6, 0]}>
        <mesh scale={[1, 0.62, 1]} castShadow>
          <sphereGeometry args={[0.42, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.5} />
        </mesh>
        {[
          [0, 0.26, 0],
          [0.24, 0.16, 0.1],
          [-0.2, 0.17, 0.16],
          [0.06, 0.15, -0.26],
          [-0.18, 0.16, -0.18],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[0.065, 8, 6]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// Three-toed dino footprints guiding to the new areas (flat decals, walkable)
// ---------------------------------------------------------------------------------------------

export function DinoFootprints3D({ trails }: { trails: Vec2[][] }) {
  const prints = useMemo(() => {
    const out: { x: number; z: number; yaw: number; side: number }[] = [];
    for (const trail of trails) {
      trail.forEach(([x, z], i) => {
        const [nx, nz] = trail[Math.min(i + 1, trail.length - 1)];
        const [px, pz] = trail[Math.max(i - 1, 0)];
        const yaw = Math.atan2(nx - px, nz - pz);
        const side = i % 2 ? 1 : -1;
        // Step left/right of the trail line
        out.push({ x: x + Math.cos(yaw) * 0.22 * side, z: z - Math.sin(yaw) * 0.22 * side, yaw, side });
      });
    }
    return out;
  }, [trails]);

  return (
    <group>
      {prints.map((p, i) => (
        <group key={i} position={[p.x, 0.018, p.z]} rotation={[0, p.yaw, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.8, 1, 1]}>
            <circleGeometry args={[0.2, 16]} />
            <meshStandardMaterial color="#4d9e4a" roughness={0.9} transparent opacity={0.75} />
          </mesh>
          {[-0.45, 0, 0.45].map((a, k) => (
            <mesh
              key={k}
              position={[Math.sin(a) * 0.27, 0.001, Math.cos(a) * 0.27]}
              rotation={[-Math.PI / 2, 0, -a]}
              scale={[0.5, 1, 1]}
            >
              <circleGeometry args={[0.11, 12]} />
              <meshStandardMaterial color="#4d9e4a" roughness={0.9} transparent opacity={0.75} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// Picnic blanket with a birthday cake in the middle (only the cake is solid: r 0.55 collider)
// ---------------------------------------------------------------------------------------------

export function PicnicBlanket3D({
  position,
  onGroundClick,
}: {
  position: Vec3;
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const flameRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (flameRef.current) {
      const f = 1 + Math.sin(s.clock.elapsedTime * 12) * 0.12;
      flameRef.current.children.forEach((c) => c.scale.set(1, f, 1));
    }
  });
  const tiles = useMemo(() => {
    const out: { x: number; z: number; pink: boolean }[] = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) out.push({ x: -1.25 + i * 0.5, z: -1.25 + j * 0.5, pink: (i + j) % 2 === 0 });
    return out;
  }, []);
  return (
    <group position={position}>
      {tiles.map((tl, i) => (
        <mesh key={i} position={[tl.x, 0.02, tl.z]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onGroundClick} receiveShadow>
          <planeGeometry args={[0.5, 0.5]} />
          <meshStandardMaterial color={tl.pink ? "#f9a8d4" : "#fff1f2"} roughness={0.85} />
        </mesh>
      ))}
      {/* Plates & cups (flat) */}
      {[
        [-0.95, -0.95, "#fde68a"],
        [0.95, -0.95, "#bae6fd"],
        [-0.95, 0.95, "#c4b5fd"],
        [0.95, 0.95, "#bbf7d0"],
      ].map(([x, z, c], i) => (
        <group key={i} position={[x as number, 0.03, z as number]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.18, 0.03, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          <mesh position={[0.05, 0.03, 0.02]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshStandardMaterial color={c as string} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Birthday cake: two pastel tiers + 5 candles */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.47, 0.3, 24]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[0.44, 0.04, 8, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.43, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.32, 0.24, 22]} />
        <meshStandardMaterial color="#ddd6fe" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.03, 22]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <group ref={flameRef}>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={`fl-${i}`} position={[Math.cos(a) * 0.17, 0.75, Math.sin(a) * 0.17]}>
              <sphereGeometry args={[0.035, 8, 6]} />
              <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={1.4} />
            </mesh>
          );
        })}
      </group>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={`cd-${i}`} position={[Math.cos(a) * 0.17, 0.64, Math.sin(a) * 0.17]}>
            <cylinderGeometry args={[0.02, 0.02, 0.16, 6]} />
            <meshStandardMaterial color={i % 2 ? "#f472b6" : "#60a5fa"} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}
