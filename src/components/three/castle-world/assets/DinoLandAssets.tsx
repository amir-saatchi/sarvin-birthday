"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Sparkles, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ExtrudedStar3D } from "../../MagicalDecor3D";
import type { Vec3 } from "../types";
import { playerWorldPos } from "../playerTracker";
import {
  DINO_BRONTO_POS,
  DINO_BRONTO_YAW,
  DINO_FLOWER_SPOTS,
  DINO_LAGOON_POS,
  DINO_LANTERN_SPOTS,
  DINO_NEST_POS,
  DINO_PALM_SPOTS,
  DINO_STEGO_POS,
  DINO_TRIKE_POS,
  DINO_VOLCANO_POS,
  DINO_TRICERATOPS_POS,
  DINO_TRICERATOPS_YAW,
  DINO_TRICERATOPS_HEIGHT,
  DINO_BIG_BLUE_POS,
  DINO_BIG_BLUE_YAW,
  DINO_BIG_BLUE_HEIGHT,
  DINO_BABY_PINK_POS,
  DINO_BABY_PINK_YAW,
  DINO_BABY_PINK_HEIGHT,
  DINO_FOSSIL_PIT_POS,
  DINO_SKELETON_POS,
  DINO_SKELETON_PLINTH_HALF,
  DINO_SKELETON_PLINTH_R,
  DINO_PICNIC_POS,
  DINO_BOUNCE_EGGS,
  DINO_FERN_SPOTS,
  DINO_MUSHROOM_SPOTS,
  DINO_FOOTPRINT_TRAILS,
  CIRCLE_OBSTACLES,
} from "../worldData";
import { GrassDeck3D, GrassTufts3D } from "./GrassAssets";
import { GiantFlower3D } from "./WorldNatureAssets";
import {
  BABY_PINK_DINO_COLORS,
  BounceEgg3D,
  DinoFootprints3D,
  FossilDig3D,
  PicnicBlanket3D,
  PrehistoricFern3D,
  SittingDinoModel3D,
  SpottedMushroom3D,
  TriceratopsModel3D,
} from "./DinoFriendsAssets";

// Warm-wood tropical archway wrapped in vines & flowers framing the East Dino Log Bridge entrance
export function JungleArchway3D({
  position = [19.6, 0, 2.0],
  rotation = [0, Math.PI / 2, 0],
}: {
  position?: Vec3;
  rotation?: Vec3;
}) {
  const crestRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (crestRef.current) {
      crestRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.4) * 0.16;
    }
  });

  const vineHeights = [0.65, 1.25, 1.85, 2.45];

  return (
    <group position={position} rotation={rotation}>
      {/* Left & Right Sturdy Warm-Wood Pillars (local x = ±2.65 -> clear 5.3 opening) */}
      {[-2.65, 2.65].map((px) => (
        <group key={`jungle-pillar-${px}`} position={[px, 0, 0]}>
          {/* Carved warm stone/terracotta plinth base */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.44, 0.54, 0.5, 8]} />
            <meshStandardMaterial color="#d97706" roughness={0.78} />
          </mesh>
          {/* Sturdy warm-wood timber column */}
          <mesh position={[0, 1.65, 0]}>
            <cylinderGeometry args={[0.28, 0.35, 2.4, 10]} />
            <meshStandardMaterial color="#92400e" roughness={0.76} />
          </mesh>
          {/* Carved golden-wood capital */}
          <mesh position={[0, 2.9, 0]}>
            <cylinderGeometry args={[0.44, 0.32, 0.24, 8]} />
            <meshStandardMaterial color="#b45309" roughness={0.68} />
          </mesh>
          {/* Spiraling leafy green vines & tropical flowers wrapping each pillar */}
          {vineHeights.map((vh, idx) => {
            const ang = idx * 1.35 + (px < 0 ? 0 : Math.PI);
            const lx = Math.cos(ang) * 0.34;
            const lz = Math.sin(ang) * 0.34;
            return (
              <group key={`vine-${px}-${idx}`} position={[0, vh, 0]}>
                <mesh rotation={[Math.PI / 2 + 0.18, 0, ang]}>
                  <torusGeometry args={[0.33, 0.055, 8, 18]} />
                  <meshStandardMaterial color="#22c55e" roughness={0.5} />
                </mesh>
                {/* Leaf cluster */}
                <mesh position={[lx, 0.04, lz]} scale={[1.25, 0.45, 0.8]} rotation={[0.2, ang, 0.3]}>
                  <sphereGeometry args={[0.16, 10, 10]} />
                  <meshStandardMaterial color="#4ade80" roughness={0.45} />
                </mesh>
                {/* Tropical pink/yellow flower */}
                {idx % 2 === 0 && (
                  <group position={[-lx, 0.06, -lz]}>
                    <mesh>
                      <sphereGeometry args={[0.13, 10, 10]} />
                      <meshPhysicalMaterial
                        color={idx === 0 ? "#ff6eb4" : "#fde047"}
                        roughness={0.25}
                        clearcoat={0.55}
                      />
                    </mesh>
                    <mesh position={[0, 0.05, 0]}>
                      <sphereGeometry args={[0.055, 8, 8]} />
                      <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.35} />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>
      ))}

      {/* Twin Arched Timber & Leafy Vine Ribs */}
      <mesh position={[0, 2.95, 0]}>
        <torusGeometry args={[2.65, 0.22, 12, 36, Math.PI]} />
        <meshStandardMaterial color="#92400e" roughness={0.72} />
      </mesh>
      <mesh position={[0, 2.95, 0]}>
        <torusGeometry args={[2.32, 0.12, 10, 32, Math.PI]} />
        <meshStandardMaterial color="#22c55e" roughness={0.5} />
      </mesh>

      {/* Tropical flowers nestled along the arch */}
      {[-1.55, 0, 1.55].map((fx, idx) => {
        const fy = 2.95 + Math.sqrt(Math.max(0.01, 2.65 * 2.65 - fx * fx));
        return (
          <group key={`arch-fl-${idx}`} position={[fx, fy, 0.22]}>
            <mesh>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshPhysicalMaterial
                color={idx % 2 === 0 ? "#ff6eb4" : "#fde047"}
                roughness={0.22}
                clearcoat={0.65}
              />
            </mesh>
            <mesh position={[0, 0, 0.12]}>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.45} />
            </mesh>
          </group>
        );
      })}

      {/* Cute Golden Dino-Star Crest at the Peak */}
      <group ref={crestRef} position={[0, 5.85, 0]}>
        {/* Decorative tropical leaf halo behind the star */}
        {[-0.52, 0.52].map((lx) => (
          <mesh
            key={`crest-leaf-${lx}`}
            position={[lx, -0.1, -0.06]}
            rotation={[0, 0, lx < 0 ? 0.55 : -0.55]}
            scale={[1.4, 0.55, 0.35]}
          >
            <sphereGeometry args={[0.36, 12, 12]} />
            <meshStandardMaterial color="#4ade80" roughness={0.4} />
          </mesh>
        ))}
        <ExtrudedStar3D
          position={[0, 0, 0]}
          scale={0.95}
          color="#fde047"
          emissive="#f59e0b"
          emissiveIntensity={0.75}
        />
      </group>
    </group>
  );
}

// Walkable Wooden Jungle Log Bridge spanning exact x ∈ [20.0, 27.5] (center x = 23.75, z = 2.0, length 7.5, width 5.4)
// Butt-jointed with zero overlap and zero Z-fighting against Green Land (x = 20.0) and Dinosaur Land (x = 27.5)
export function DinoLogBridge3D({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const postXs = [20.4, 22.05, 23.75, 25.45, 27.1];

  return (
    <group>
      {/* Clickable warm timber plank deck (exact x ∈ [20.0, 27.5], top at y = 0) */}
      <mesh position={[23.75, -0.18, 2.0]} onPointerDown={onGroundClick} receiveShadow>
        <boxGeometry args={[7.5, 0.36, 5.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.72} />
      </mesh>

      {/* Sturdy dark-wood underside log beams (inset slightly in X for zero overlap) */}
      <mesh position={[23.75, -0.56, 2.0]}>
        <boxGeometry args={[7.4, 0.44, 4.9]} />
        <meshStandardMaterial color="#78350f" roughness={0.84} />
      </mesh>
      <mesh position={[23.75, -0.38, 2.0]}>
        <boxGeometry args={[7.48, 0.14, 5.55]} />
        <meshStandardMaterial color="#d97706" roughness={0.68} />
      </mesh>

      {/* Tropical golden/amber runner strip (exact 7.5 length along X, proud of y = 0 with zero Z-fighting) */}
      <mesh position={[23.75, 0.02, 2.0]}>
        <boxGeometry args={[7.5, 0.01, 2.95]} />
        <meshStandardMaterial color="#92400e" roughness={0.65} />
      </mesh>
      <mesh position={[23.75, 0.026, 2.0]} onPointerDown={onGroundClick}>
        <boxGeometry args={[7.5, 0.014, 2.6]} />
        <meshPhysicalMaterial color="#fbbf24" roughness={0.35} clearcoat={0.35} />
      </mesh>

      {/* North & South wooden log bridge railings with glowing amber firefly orbs */}
      {[-0.52, 4.52].map((rz) => (
        <group key={`dino-rail-${rz}`}>
          {/* Top & mid rounded bamboo/timber handrails */}
          <mesh position={[23.75, 0.72, rz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.085, 0.085, 7.5, 10]} />
            <meshStandardMaterial color="#92400e" roughness={0.74} />
          </mesh>
          <mesh position={[23.75, 0.38, rz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 7.5, 10]} />
            <meshStandardMaterial color="#b45309" roughness={0.76} />
          </mesh>
          {/* Wooden posts + glowing warm amber firefly orbs */}
          {postXs.map((px) => (
            <group key={`dino-post-${rz}-${px}`} position={[px, 0, rz]}>
              <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.12, 0.15, 0.9, 10]} />
                <meshStandardMaterial color="#78350f" roughness={0.78} />
              </mesh>
              <mesh position={[0, 1.02, 0]}>
                <sphereGeometry args={[0.17, 14, 14]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#f59e0b"
                  emissiveIntensity={1.15}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

// Curved segmented tropical palm tree with arching lush fronds & cute coconuts
export function TropicalPalmTree3D({
  position,
  color = "#22c55e",
  scale = 1,
}: {
  position: Vec3;
  color?: string;
  scale?: number;
}) {
  const frondAngles = [0, 1.05, 2.1, 3.15, 4.2, 5.25];
  const segments: { pos: Vec3; rotZ: number; rTop: number; rBot: number }[] = [
    { pos: [0, 0.4, 0], rotZ: -0.06, rTop: 0.24, rBot: 0.3 },
    { pos: [0.08, 1.15, 0], rotZ: -0.14, rTop: 0.21, rBot: 0.25 },
    { pos: [0.22, 1.88, 0], rotZ: -0.2, rTop: 0.18, rBot: 0.22 },
    { pos: [0.4, 2.58, 0], rotZ: -0.15, rTop: 0.15, rBot: 0.19 },
    { pos: [0.54, 3.24, 0], rotZ: -0.06, rTop: 0.13, rBot: 0.16 },
  ];

  return (
    <group position={position} scale={scale}>
      {/* Curved segmented wooden palm trunk */}
      {segments.map((seg, idx) => (
        <mesh key={`pseg-${idx}`} position={seg.pos} rotation={[0, 0, seg.rotZ]}>
          <cylinderGeometry args={[seg.rTop, seg.rBot, 0.82, 10]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#a16207" : "#92400e"}
            roughness={0.82}
          />
        </mesh>
      ))}

      {/* Crown group at the top of the curved trunk */}
      <group position={[0.58, 3.62, 0]}>
        {/* 3 Cute glossy brown coconuts nestled under the fronds */}
        {[0, 2.1, 4.2].map((ang, idx) => (
          <mesh
            key={`coco-${idx}`}
            position={[Math.cos(ang) * 0.24, -0.14, Math.sin(ang) * 0.24]}
          >
            <sphereGeometry args={[0.17, 12, 12]} />
            <meshPhysicalMaterial color="#78350f" roughness={0.38} clearcoat={0.35} />
          </mesh>
        ))}

        {/* 6 Arching lush tropical green fronds */}
        {frondAngles.map((ang, idx) => (
          <group key={`frond-${idx}`} rotation={[0, ang, 0]}>
            {/* Inner upward arching frond base */}
            <mesh position={[0.58, 0.22, 0]} rotation={[0, 0, 0.34]} scale={[1.35, 0.18, 0.45]}>
              <sphereGeometry args={[0.58, 12, 10]} />
              <meshPhysicalMaterial
                color={idx % 2 === 0 ? color : "#4ade80"}
                roughness={0.35}
                clearcoat={0.28}
              />
            </mesh>
            {/* Outer drooping frond tip */}
            <mesh position={[1.45, 0.08, 0]} rotation={[0, 0, -0.45]} scale={[1.15, 0.14, 0.36]}>
              <sphereGeometry args={[0.52, 12, 10]} />
              <meshPhysicalMaterial
                color={idx % 2 === 0 ? "#4ade80" : color}
                roughness={0.35}
                clearcoat={0.28}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// 1. Friendly Long-Neck Brachiosaurus — mint/teal glossy body, swaying long neck, sparkly eyes, pastel spots & wagging tail
export function KawaiiBronto3D({
  position,
  rotation = [0, -0.65, 0],
  scale = 1,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  const neckRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (neckRef.current) {
      neckRef.current.rotation.z = Math.sin(t * 1.6) * 0.08;
      neckRef.current.rotation.x = 0.06 + Math.sin(t * 1.1) * 0.05;
    }
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 3.2) * 0.22;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Plump rounded mint/teal body */}
      <mesh position={[0, 1.05, 0]} scale={[0.92, 0.86, 1.25]}>
        <sphereGeometry args={[0.85, 24, 24]} />
        <meshPhysicalMaterial color="#34d399" roughness={0.22} clearcoat={0.75} />
      </mesh>
      {/* Cream belly highlight */}
      <mesh position={[0, 0.86, 0.12]} scale={[0.72, 0.58, 1.0]}>
        <sphereGeometry args={[0.78, 18, 18]} />
        <meshPhysicalMaterial color="#d1fae5" roughness={0.28} clearcoat={0.5} />
      </mesh>

      {/* Cute pastel yellow & aqua spots along both sides */}
      {[
        [-0.72, 1.22, -0.2, "#fde047", 0.18],
        [-0.74, 1.02, 0.25, "#7dd3fc", 0.14],
        [0.72, 1.22, -0.18, "#fde047", 0.18],
        [0.74, 1.02, 0.28, "#7dd3fc", 0.14],
      ].map(([sx, sy, sz, col, r], idx) => (
        <mesh key={`bspot-${idx}`} position={[sx as number, sy as number, sz as number]}>
          <sphereGeometry args={[r as number, 12, 12]} />
          <meshPhysicalMaterial color={col as string} roughness={0.22} clearcoat={0.7} />
        </mesh>
      ))}

      {/* 4 Sturdy stubby legs with cute cream toenails */}
      {[
        [-0.46, 0.45],
        [0.46, 0.45],
        [-0.46, -0.48],
        [0.46, -0.48],
      ].map(([lx, lz], idx) => (
        <group key={`bleg-${idx}`} position={[lx, 0, lz]}>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.21, 0.24, 0.84, 14]} />
            <meshPhysicalMaterial color="#2dd4bf" roughness={0.24} clearcoat={0.7} />
          </mesh>
          <mesh position={[0, 0.08, 0.18]} scale={[1.2, 0.7, 0.7]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color="#fef9c3" roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* Gently wagging tapering tail */}
      <group ref={tailRef} position={[0, 0.95, -0.95]}>
        <mesh position={[0, -0.05, -0.48]} rotation={[-Math.PI / 2 + 0.18, 0, 0]}>
          <coneGeometry args={[0.34, 1.15, 16]} />
          <meshPhysicalMaterial color="#34d399" roughness={0.22} clearcoat={0.75} />
        </mesh>
      </group>

      {/* Gently swaying long neck & adorable kawaii head */}
      <group ref={neckRef} position={[0, 1.38, 0.68]}>
        {/* Lower neck segment */}
        <mesh position={[0, 0.68, 0.14]} rotation={[0.18, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.34, 1.48, 16]} />
          <meshPhysicalMaterial color="#34d399" roughness={0.22} clearcoat={0.75} />
        </mesh>
        {/* Upper neck segment */}
        <mesh position={[0, 1.72, 0.28]} rotation={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.92, 16]} />
          <meshPhysicalMaterial color="#2dd4bf" roughness={0.22} clearcoat={0.75} />
        </mesh>

        {/* Adorable rounded head */}
        <group position={[0, 2.28, 0.42]}>
          <mesh scale={[0.92, 0.85, 1.12]}>
            <sphereGeometry args={[0.42, 22, 22]} />
            <meshPhysicalMaterial color="#34d399" roughness={0.2} clearcoat={0.8} />
          </mesh>
          {/* Cute rounded snout */}
          <mesh position={[0, -0.06, 0.32]} scale={[0.85, 0.68, 0.9]}>
            <sphereGeometry args={[0.3, 18, 18]} />
            <meshPhysicalMaterial color="#5eead4" roughness={0.2} clearcoat={0.75} />
          </mesh>
          {/* Soft golden-yellow head crest */}
          <mesh position={[0, 0.34, -0.04]} scale={[0.45, 0.75, 0.9]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshPhysicalMaterial color="#fde047" roughness={0.22} clearcoat={0.7} />
          </mesh>
          {/* Sparkly dark eyes + white catchlights */}
          {[-0.22, 0.22].map((ex) => (
            <group key={`beye-${ex}`} position={[ex, 0.08, 0.34]}>
              <mesh>
                <sphereGeometry args={[0.075, 14, 14]} />
                <meshStandardMaterial color="#1e1b4b" roughness={0.12} />
              </mesh>
              <mesh position={[0.024, 0.028, 0.055]}>
                <sphereGeometry args={[0.025, 10, 10]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
              </mesh>
            </group>
          ))}
          {/* Rosy kawaii cheeks */}
          {[-0.28, 0.28].map((cx) => (
            <mesh key={`bcheek-${cx}`} position={[cx, -0.06, 0.3]} scale={[1.2, 0.72, 0.55]}>
              <sphereGeometry args={[0.082, 10, 10]} />
              <meshStandardMaterial color="#fda4af" roughness={0.45} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// Sculpted long-neck "Hera" (Draco GLB, ~38 KB, 10.7k tris, flat colors), recolored mint to match the pastel world.
// Unrigged, so she breathes, sways, leans her body a little toward the player and does a happy hop when they come close.
const HERA_MODEL_URL = "/models/hera.glb";
// Height incl. head crest at scale 1; she is ~1.7x as long as she is tall
const HERA_HEIGHT = 2.6;
const HERA_NOTICE_DIST = 7;
const HERA_COLORS: Record<string, string> = {
  Body: "#5eead4",
  Mouth: "#fb7185",
  Tongue: "#f43f5e",
  Eye: "#1e1b4b",
};

function dampAngle(cur: number, target: number, lambda: number, dt: number) {
  const diff = Math.atan2(Math.sin(target - cur), Math.cos(target - cur));
  return cur + diff * (1 - Math.exp(-lambda * dt));
}

function HeraModel3D({
  position,
  rotation = [0, -0.65, 0],
  scale = 1,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  const { scene } = useGLTF(HERA_MODEL_URL);
  const yawRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const restYaw = rotation[1];
  const state = useRef({ yaw: restYaw, near: 0 });

  const { model, fit, offset } = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      const recolor = (m: THREE.Material) => {
        const mat = (m as THREE.MeshStandardMaterial).clone();
        const c = HERA_COLORS[mat.name];
        if (c) mat.color.set(c);
        mat.roughness = mat.name === "Eye" ? 0.15 : 0.45;
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
      fit: HERA_HEIGHT / Math.max(size.y, 0.001),
      offset: [-center.x, -box.min.y, -center.z] as Vec3,
    };
  }, [scene]);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = s.clock.elapsedTime;
    const st = state.current;
    const dx = playerWorldPos.x - position[0];
    const dz = playerWorldPos.z - position[2];
    const near = Math.hypot(dx, dz) < HERA_NOTICE_DIST;
    st.near += ((near ? 1 : 0) - st.near) * (1 - Math.exp(-4 * dt));

    // Lean toward the player, but only a little so her long body stays inside its collision footprint
    const toPlayer = Math.atan2(dx, dz);
    const lean = THREE.MathUtils.clamp(Math.atan2(Math.sin(toPlayer - restYaw), Math.cos(toPlayer - restYaw)), -0.35, 0.35);
    st.yaw = dampAngle(st.yaw, near ? restYaw + lean : restYaw, 3, dt);
    if (yawRef.current) yawRef.current.rotation.y = st.yaw;

    if (bodyRef.current) {
      const n = st.near;
      const breathe = 1 + Math.sin(t * 1.8) * 0.018;
      bodyRef.current.scale.set(1, breathe, 1);
      bodyRef.current.position.y = Math.abs(Math.sin(t * 5)) * 0.14 * n;
      bodyRef.current.rotation.z = Math.sin(t * 1.3) * 0.03 + Math.sin(t * 5) * 0.04 * n;
      bodyRef.current.rotation.x = Math.sin(t * 1.1) * 0.02;
    }
  });

  return (
    <group position={position} scale={scale}>
      <group ref={yawRef} rotation={[0, restYaw, 0]}>
        <group ref={bodyRef}>
          <group scale={fit}>
            <primitive object={model} position={offset} />
          </group>
        </group>
      </group>
    </group>
  );
}
useGLTF.preload(HERA_MODEL_URL);

/** Dino Land long-neck: sculpted Hera model, with the primitive Bronto shown while it loads. */
export function HeraBronto3D(props: { position: Vec3; rotation?: Vec3; scale?: number }) {
  return (
    <Suspense fallback={<KawaiiBronto3D {...props} />}>
      <HeraModel3D {...props} />
    </Suspense>
  );
}

// 2. Cute Baby Triceratops — warm pastel coral/peach body, scalloped frill with golden rim, 3 ivory horns & gentle bob
export function KawaiiTrike3D({
  position,
  rotation = [0, 0.75, 0],
  scale = 1,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(t * 2.4)) * 0.07;
    }
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 2.0) * 0.08;
      headRef.current.rotation.x = Math.sin(t * 1.5) * 0.05;
    }
  });

  const frillScallops = [-0.95, -0.57, -0.19, 0.19, 0.57, 0.95];

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={bodyRef}>
        {/* Chubby coral/peach body */}
        <mesh position={[0, 0.78, 0]} scale={[1.0, 0.85, 1.18]}>
          <sphereGeometry args={[0.66, 22, 22]} />
          <meshPhysicalMaterial color="#fb923c" roughness={0.22} clearcoat={0.75} />
        </mesh>
        {/* Warm peach belly */}
        <mesh position={[0, 0.62, 0.08]} scale={[0.8, 0.6, 0.95]}>
          <sphereGeometry args={[0.58, 16, 16]} />
          <meshPhysicalMaterial color="#fed7aa" roughness={0.28} clearcoat={0.5} />
        </mesh>

        {/* 4 Cute stubby legs */}
        {[
          [-0.38, 0.34],
          [0.38, 0.34],
          [-0.38, -0.36],
          [0.38, -0.36],
        ].map(([lx, lz], idx) => (
          <group key={`tleg-${idx}`} position={[lx, 0, lz]}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.17, 0.2, 0.6, 12]} />
              <meshPhysicalMaterial color="#fdba74" roughness={0.24} clearcoat={0.68} />
            </mesh>
            <mesh position={[0, 0.07, 0.14]} scale={[1.2, 0.7, 0.7]}>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color="#fef9c3" roughness={0.35} />
            </mesh>
          </group>
        ))}

        {/* Cute short tail */}
        <mesh position={[0, 0.72, -0.82]} rotation={[-Math.PI / 2 + 0.15, 0, 0]}>
          <coneGeometry args={[0.25, 0.72, 14]} />
          <meshPhysicalMaterial color="#fb923c" roughness={0.22} clearcoat={0.75} />
        </mesh>

        {/* Big adorable Triceratops head with scalloped golden-rimmed frill & 3 ivory horns */}
        <group ref={headRef} position={[0, 1.05, 0.66]}>
          {/* Main head */}
          <mesh scale={[1.0, 0.92, 1.08]}>
            <sphereGeometry args={[0.45, 22, 22]} />
            <meshPhysicalMaterial color="#fda4af" roughness={0.2} clearcoat={0.8} />
          </mesh>
          {/* Cute snout */}
          <mesh position={[0, -0.08, 0.35]} scale={[0.92, 0.7, 0.85]}>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshPhysicalMaterial color="#fecdd3" roughness={0.22} clearcoat={0.72} />
          </mesh>

          {/* Fan-shaped scalloped frill behind the head */}
          <group position={[0, 0.2, -0.18]} rotation={[-0.25, 0, 0]}>
            <mesh scale={[1.15, 1.0, 0.22]}>
              <cylinderGeometry args={[0.62, 0.48, 0.42, 20]} />
              <meshPhysicalMaterial color="#fb7185" roughness={0.22} clearcoat={0.75} />
            </mesh>
            {/* Golden scalloped rim beads around the frill */}
            {frillScallops.map((ang, idx) => (
              <mesh
                key={`fbead-${idx}`}
                position={[Math.sin(ang) * 0.68, Math.cos(ang) * 0.56 - 0.02, 0]}
              >
                <sphereGeometry args={[0.11, 12, 12]} />
                <meshPhysicalMaterial color="#fde047" roughness={0.2} clearcoat={0.85} />
              </mesh>
            ))}
          </group>

          {/* 2 Rounded ivory brow horns */}
          {[-0.2, 0.2].map((hx) => (
            <mesh
              key={`bhorn-${hx}`}
              position={[hx, 0.32, 0.3]}
              rotation={[0.72, 0, hx < 0 ? 0.18 : -0.18]}
            >
              <coneGeometry args={[0.085, 0.38, 12]} />
              <meshPhysicalMaterial color="#fefce8" roughness={0.2} clearcoat={0.85} />
            </mesh>
          ))}
          {/* 1 Cute tiny rounded ivory nose horn */}
          <mesh position={[0, 0.08, 0.56]} rotation={[0.55, 0, 0]}>
            <coneGeometry args={[0.065, 0.22, 12]} />
            <meshPhysicalMaterial color="#fefce8" roughness={0.2} clearcoat={0.85} />
          </mesh>

          {/* Sparkly dark eyes + white catchlights */}
          {[-0.24, 0.24].map((ex) => (
            <group key={`teye-${ex}`} position={[ex, 0.06, 0.36]}>
              <mesh>
                <sphereGeometry args={[0.075, 14, 14]} />
                <meshStandardMaterial color="#1e1b4b" roughness={0.12} />
              </mesh>
              <mesh position={[0.024, 0.028, 0.055]}>
                <sphereGeometry args={[0.025, 10, 10]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
              </mesh>
            </group>
          ))}
          {/* Rosy cheeks */}
          {[-0.31, 0.31].map((cx) => (
            <mesh key={`tcheek-${cx}`} position={[cx, -0.07, 0.31]} scale={[1.2, 0.72, 0.55]}>
              <sphereGeometry args={[0.08, 10, 10]} />
              <meshStandardMaterial color="#f472b6" roughness={0.45} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// 3. Friendly Baby Stegosaurus — pastel lavender/pink body with rainbow pastel diamond plates & wagging tail
export function KawaiiStego3D({
  position,
  rotation = [0, 0.45, 0],
  scale = 1,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 3.6) * 0.26;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 2.1) * 0.08;
    }
  });

  const plates: { z: number; y: number; size: number; color: string }[] = [
    { z: 0.42, y: 1.38, size: 0.2, color: "#ff6eb4" },
    { z: 0.14, y: 1.54, size: 0.26, color: "#fde047" },
    { z: -0.16, y: 1.52, size: 0.26, color: "#7dd3fc" },
    { z: -0.44, y: 1.38, size: 0.22, color: "#4ade80" },
    { z: -0.68, y: 1.2, size: 0.17, color: "#fb923c" },
  ];

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Arched chubby lavender body */}
      <mesh position={[0, 0.82, 0]} scale={[0.94, 0.92, 1.22]}>
        <sphereGeometry args={[0.66, 22, 22]} />
        <meshPhysicalMaterial color="#c084fc" roughness={0.22} clearcoat={0.75} />
      </mesh>
      {/* Soft pastel pink belly */}
      <mesh position={[0, 0.64, 0.06]} scale={[0.76, 0.62, 0.96]}>
        <sphereGeometry args={[0.58, 16, 16]} />
        <meshPhysicalMaterial color="#f5d0fe" roughness={0.28} clearcoat={0.5} />
      </mesh>

      {/* Rainbow pastel diamond plates along the spine */}
      {plates.map((p, idx) => (
        <mesh
          key={`splate-${idx}`}
          position={[0, p.y, p.z]}
          rotation={[0, 0, Math.PI / 4]}
          scale={[0.35, 1.0, 1.0]}
        >
          <octahedronGeometry args={[p.size, 0]} />
          <meshPhysicalMaterial color={p.color} roughness={0.2} clearcoat={0.85} />
        </mesh>
      ))}

      {/* 4 Cute stubby legs */}
      {[
        [-0.36, 0.34],
        [0.36, 0.34],
        [-0.36, -0.36],
        [0.36, -0.36],
      ].map(([lx, lz], idx) => (
        <group key={`sleg-${idx}`} position={[lx, 0, lz]}>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.16, 0.19, 0.64, 12]} />
            <meshPhysicalMaterial color="#d8b4fe" roughness={0.24} clearcoat={0.7} />
          </mesh>
          <mesh position={[0, 0.07, 0.14]} scale={[1.2, 0.7, 0.7]}>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color="#fef9c3" roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* Wagging tail with cute rounded pastel tail-spikes */}
      <group ref={tailRef} position={[0, 0.74, -0.74]}>
        <mesh position={[0, -0.04, -0.44]} rotation={[-Math.PI / 2 + 0.12, 0, 0]}>
          <coneGeometry args={[0.24, 0.92, 14]} />
          <meshPhysicalMaterial color="#c084fc" roughness={0.22} clearcoat={0.75} />
        </mesh>
        {[-0.14, 0.14].map((tx) => (
          <mesh
            key={`tspike-${tx}`}
            position={[tx, 0.08, -0.68]}
            rotation={[0, 0, tx < 0 ? 0.5 : -0.5]}
          >
            <coneGeometry args={[0.06, 0.24, 10]} />
            <meshPhysicalMaterial color="#fde047" roughness={0.2} clearcoat={0.8} />
          </mesh>
        ))}
      </group>

      {/* Cute rounded Stegosaurus head */}
      <group ref={headRef} position={[0, 0.94, 0.82]}>
        <mesh scale={[0.92, 0.86, 1.12]}>
          <sphereGeometry args={[0.36, 20, 20]} />
          <meshPhysicalMaterial color="#e879f9" roughness={0.2} clearcoat={0.8} />
        </mesh>
        {/* Sparkly dark eyes + white catchlights */}
        {[-0.19, 0.19].map((ex) => (
          <group key={`seye-${ex}`} position={[ex, 0.06, 0.3]}>
            <mesh>
              <sphereGeometry args={[0.068, 12, 12]} />
              <meshStandardMaterial color="#1e1b4b" roughness={0.12} />
            </mesh>
            <mesh position={[0.02, 0.024, 0.05]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
            </mesh>
          </group>
        ))}
        {/* Rosy cheeks */}
        {[-0.25, 0.25].map((cx) => (
          <mesh key={`scheek-${cx}`} position={[cx, -0.05, 0.26]} scale={[1.2, 0.72, 0.55]}>
            <sphereGeometry args={[0.072, 10, 10]} />
            <meshStandardMaterial color="#fda4af" roughness={0.45} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Cute cartoon friendly volcano with warm glowing crater & gently rising pastel/amber magical bubbles!
export function FriendlyVolcano3D({
  position = DINO_VOLCANO_POS,
}: {
  position?: Vec3;
}) {
  const bubbleRefs = useRef<(THREE.Mesh | null)[]>([]);

  const bubbles = useMemo(
    () => [
      { ox: 0.0, oz: 0.0, r: 0.38, speed: 0.52, phase: 0.0, color: "#fde047" },
      { ox: 0.45, oz: 0.25, r: 0.3, speed: 0.62, phase: 1.1, color: "#fb923c" },
      { ox: -0.42, oz: 0.3, r: 0.34, speed: 0.48, phase: 2.2, color: "#f472b6" },
      { ox: 0.2, oz: -0.42, r: 0.28, speed: 0.58, phase: 3.3, color: "#7dd3fc" },
      { ox: -0.28, oz: -0.35, r: 0.32, speed: 0.55, phase: 4.4, color: "#c084fc" },
      { ox: 0.12, oz: 0.38, r: 0.24, speed: 0.66, phase: 5.2, color: "#fef08a" },
      { ox: -0.15, oz: 0.05, r: 0.26, speed: 0.6, phase: 2.8, color: "#fda4af" },
    ],
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    bubbles.forEach((b, idx) => {
      const mesh = bubbleRefs.current[idx];
      if (!mesh) return;
      const cycle = ((t * b.speed + b.phase) % 4.5) / 4.5; // 0..1
      mesh.position.y = 4.35 + cycle * 3.8;
      mesh.position.x = b.ox + Math.sin(t * 1.8 + b.phase) * 0.35;
      mesh.position.z = b.oz + Math.cos(t * 1.5 + b.phase) * 0.35;
      const s = cycle < 0.15 ? cycle / 0.15 : cycle > 0.85 ? (1 - cycle) / 0.15 : 1;
      mesh.scale.setScalar(Math.max(0.05, s));
    });
  });

  return (
    <group position={position}>
      {/* Grassy foothills skirt */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[2.55, 3.05, 0.7, 14]} />
        <meshStandardMaterial color="#4ade80" roughness={0.72} />
      </mesh>
      {/* Main warm terracotta/brown cartoon volcano cone */}
      <mesh position={[0, 2.35, 0]}>
        <cylinderGeometry args={[1.05, 2.65, 3.9, 14]} />
        <meshStandardMaterial color="#9a3412" roughness={0.82} />
      </mesh>
      {/* Crater rim collar */}
      <mesh position={[0, 4.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.22, 10, 22]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.85} />
      </mesh>
      {/* Warm glowing friendly amber/coral lava pool inside crater */}
      <mesh position={[0, 4.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.96, 20]} />
        <meshStandardMaterial
          color="#fb923c"
          emissive="#f59e0b"
          emissiveIntensity={1.25}
          roughness={0.25}
        />
      </mesh>

      {/* Gently rising pastel/amber magical bubbles */}
      {bubbles.map((b, idx) => (
        <mesh
          key={`vbub-${idx}`}
          ref={(el) => {
            bubbleRefs.current[idx] = el;
          }}
          position={[b.ox, 4.5, b.oz]}
        >
          <sphereGeometry args={[b.r, 16, 16]} />
          <meshPhysicalMaterial
            color={b.color}
            emissive={b.color}
            emissiveIntensity={0.35}
            roughness={0.1}
            clearcoat={1}
            transparent
            opacity={0.82}
          />
        </mesh>
      ))}
    </group>
  );
}

// Cozy twig nest holding 3 oversized pastel polka-dot dinosaur eggs (one gently wobbling!)
export function DinoNest3D({ position = DINO_NEST_POS }: { position?: Vec3 }) {
  const wobbleEggRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (wobbleEggRef.current) {
      wobbleEggRef.current.rotation.z = Math.sin(t * 4.2) * 0.14;
      wobbleEggRef.current.rotation.x = Math.cos(t * 3.1) * 0.06;
    }
  });

  const twigAngles = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);

  return (
    <group position={position}>
      {/* Soft straw/moss cushion bed */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[1.28, 1.45, 0.44, 18]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      {/* Woven twig rim */}
      <mesh position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.24, 0.22, 10, 24]} />
        <meshStandardMaterial color="#78350f" roughness={0.88} />
      </mesh>
      {twigAngles.map((ang, idx) => (
        <mesh
          key={`twig-${idx}`}
          position={[Math.cos(ang) * 1.26, 0.42, Math.sin(ang) * 1.26]}
          rotation={[0.2, ang + 0.4, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.045, 0.055, 0.65, 6]} />
          <meshStandardMaterial color={idx % 2 === 0 ? "#92400e" : "#a16207"} roughness={0.9} />
        </mesh>
      ))}

      {/* Egg 1 (Left): Mint green with pastel yellow polka dots */}
      <group position={[-0.52, 0.72, 0.16]} rotation={[0.1, 0, 0.18]}>
        <mesh scale={[0.85, 1.18, 0.85]}>
          <sphereGeometry args={[0.42, 18, 18]} />
          <meshPhysicalMaterial color="#a7f3d0" roughness={0.2} clearcoat={0.8} />
        </mesh>
        {[
          [0.24, 0.12, 0.24],
          [-0.22, -0.06, 0.25],
          [0.05, 0.26, -0.25],
        ].map(([dx, dy, dz], i) => (
          <mesh key={`e1d-${i}`} position={[dx, dy, dz]}>
            <sphereGeometry args={[0.085, 10, 10]} />
            <meshPhysicalMaterial color="#fde047" roughness={0.2} clearcoat={0.7} />
          </mesh>
        ))}
      </group>

      {/* Egg 2 (Right): Sky-blue with coral polka dots */}
      <group position={[0.52, 0.7, 0.12]} rotation={[-0.08, 0, -0.2]}>
        <mesh scale={[0.85, 1.16, 0.85]}>
          <sphereGeometry args={[0.4, 18, 18]} />
          <meshPhysicalMaterial color="#bae6fd" roughness={0.2} clearcoat={0.8} />
        </mesh>
        {[
          [-0.22, 0.12, 0.22],
          [0.2, -0.08, 0.24],
          [0.0, 0.22, -0.24],
        ].map(([dx, dy, dz], i) => (
          <mesh key={`e2d-${i}`} position={[dx, dy, dz]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshPhysicalMaterial color="#fb7185" roughness={0.2} clearcoat={0.7} />
          </mesh>
        ))}
      </group>

      {/* Egg 3 (Center-Back, gently wobbling!): Pastel pink with lavender polka dots */}
      <group ref={wobbleEggRef} position={[0, 0.42, -0.28]}>
        <group position={[0, 0.42, 0]}>
          <mesh scale={[0.86, 1.22, 0.86]}>
            <sphereGeometry args={[0.45, 20, 20]} />
            <meshPhysicalMaterial color="#fbcfe8" roughness={0.18} clearcoat={0.85} />
          </mesh>
          {[
            [0.26, 0.14, 0.26],
            [-0.26, 0.04, 0.25],
            [0.04, -0.14, 0.34],
            [0.0, 0.3, -0.26],
          ].map(([dx, dy, dz], i) => (
            <mesh key={`e3d-${i}`} position={[dx, dy, dz]}>
              <sphereGeometry args={[0.092, 10, 10]} />
              <meshPhysicalMaterial color="#c084fc" roughness={0.2} clearcoat={0.75} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// Bamboo/wood post topped with a glowing warm amber firefly lantern
export function JungleLantern3D({ position }: { position: Vec3 }) {
  const orbRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (orbRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.2 + position[0]) * 0.08;
      orbRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      {/* Stone/terracotta base */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.2, 0.28, 0.24, 8]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>
      {/* Segmented bamboo post */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.07, 0.095, 1.9, 8]} />
        <meshStandardMaterial color="#a16207" roughness={0.72} />
      </mesh>
      {/* Bamboo node rings */}
      {[0.65, 1.25, 1.8].map((ny) => (
        <mesh key={`bnode-${ny}`} position={[0, ny, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.024, 6, 12]} />
          <meshStandardMaterial color="#78350f" roughness={0.78} />
        </mesh>
      ))}
      {/* Wooden lantern cradle */}
      <mesh position={[0, 2.08, 0]}>
        <cylinderGeometry args={[0.22, 0.13, 0.12, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.75} />
      </mesh>
      {/* Glowing warm amber firefly lantern orb */}
      <mesh ref={orbRef} position={[0, 2.38, 0]}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshPhysicalMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={1.25}
          roughness={0.12}
          clearcoat={0.9}
        />
      </mesh>
      {/* Cute little leafy jungle roof cap */}
      <mesh position={[0, 2.68, 0]}>
        <coneGeometry args={[0.32, 0.22, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.55} />
      </mesh>
    </group>
  );
}

// Wooden / bamboo perimeter fence row closing Dinosaur Land cleanly
function JungleFenceRow3D({
  position,
  length,
  rotationY = 0,
}: {
  position: Vec3;
  length: number;
  rotationY?: number;
}) {
  const posts = useMemo(() => {
    const count = Math.max(2, Math.round(length / 1.5) + 1);
    return Array.from({ length: count }, (_, i) => (i / (count - 1) - 0.5) * length);
  }, [length]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Horizontal warm bamboo rails */}
      <mesh position={[0, 0.56, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, length + 0.14, 8]} />
        <meshStandardMaterial color="#b45309" roughness={0.76} />
      </mesh>
      <mesh position={[0, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, length + 0.14, 8]} />
        <meshStandardMaterial color="#92400e" roughness={0.78} />
      </mesh>
      {/* Wooden bamboo fence posts with cute tropical leaf caps */}
      {posts.map((px, idx) => (
        <group key={`jfpost-${idx}`} position={[px, 0, 0]}>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.085, 0.105, 0.84, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.86, 0]} scale={[1.2, 0.55, 1.2]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? "#4ade80" : "#22c55e"} roughness={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Floating 40 × 46 Tropical Dinosaur Land Island (x ∈ [27.5, 67.5], z ∈ [-21.0, 25.0], centered at [47.5, 0, 2.0])
export function DinoLandPlatform3D({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const cloudPuffs: [number, number, number, number][] = [
    [66.5, -2.5, -19.5, 2.8],
    [28.5, -2.5, -19.5, 2.6],
    [66.8, -2.6, 2.0, 3.2],
    [66.5, -2.5, 23.5, 2.8],
    [28.5, -2.5, 23.5, 2.6],
    [47.5, -3.0, -20.8, 3.4],
    [47.5, -3.0, 24.8, 3.4],
    [37.0, -2.9, -20.4, 2.8],
    [58.0, -2.9, -20.4, 2.8],
    [37.0, -2.9, 24.4, 2.8],
    [58.0, -2.9, 24.4, 2.8],
    [28.4, -2.8, -9.0, 2.6],
    [28.4, -2.8, 13.0, 2.6],
    [66.8, -2.8, -9.5, 2.7],
    [66.8, -2.8, 13.5, 2.7],
  ];

  const lagoonPebbles = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return {
        x: Math.cos(a) * 3.85,
        z: Math.sin(a) * 3.85,
        rotY: a,
        scale: 0.78 + (i % 3) * 0.16,
      };
    });
  }, []);

  const junglePathTiles = [29.2, 31.8, 34.4, 37.0, 39.6, 42.2, 44.8, 50.0, 52.6, 55.2, 57.8];
  // Spots the grass tufts stay off: path tiles, footprints, lagoon, fossil pit, picnic and solid things
  const dinoTuftClear = useMemo(
    () => [
      ...CIRCLE_OBSTACLES.map((o) => ({ x: o.x, z: o.z, r: o.r + 0.3 })),
      ...junglePathTiles.map((x) => ({ x, z: 2.0, r: 1.3 })),
      ...DINO_FOOTPRINT_TRAILS.flat().map(([x, z]) => ({ x, z, r: 0.7 })),
      { x: DINO_LAGOON_POS[0], z: DINO_LAGOON_POS[2], r: 4.6 },
      { x: DINO_FOSSIL_PIT_POS[0], z: DINO_FOSSIL_PIT_POS[2], r: 3.4 },
      { x: DINO_PICNIC_POS[0], z: DINO_PICNIC_POS[2], r: 2.4 },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const eggColors: [string, string][] = [
    ["#fef3c7", "#f9a8d4"],
    ["#e0f2fe", "#a78bfa"],
    ["#fce7f3", "#5eead4"],
  ];

  return (
    <group>
      {/* === SUNLIT TROPICAL GRASS TOP DECK (40 × 46, exact x ∈ [27.5, 67.5], z ∈ [-21.0, 25.0], top at y = 0) === */}
      <GrassDeck3D position={[47.5, -0.25, 2.0]} size={[40, 0.5, 46]} color="#65d46e" onPointerDown={onGroundClick} />
      <GrassTufts3D minX={28.0} maxX={67.0} minZ={-20.5} maxZ={24.5} count={560} keepClear={dinoTuftClear} seed={23} />

      {/* Chunky Warm Terracotta & Ochre Floating Cliff Underside */}
      <mesh position={[47.5, -1.55, 2.0]}>
        <boxGeometry args={[39.2, 2.1, 45.2]} />
        <meshStandardMaterial color="#d97706" roughness={0.82} />
      </mesh>
      <mesh position={[47.5, -3.05, 2.0]}>
        <boxGeometry args={[37.8, 0.9, 43.8]} />
        <meshStandardMaterial color="#b45309" roughness={0.88} />
      </mesh>

      {/* Fluffy Warm-Tinted Cloud Puffs Tucked Underneath */}
      {cloudPuffs.map(([cx, cy, cz, cr], idx) => (
        <mesh key={`dcloud-${idx}`} position={[cx, cy, cz]} scale={[1.35, 0.62, 1.25]}>
          <sphereGeometry args={[cr, 16, 16]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#fff7ed" : "#fef3c7"}
            roughness={0.55}
          />
        </mesh>
      ))}

      {/* Warm Sandy Jungle Path Tiles from Bridge Arrival toward the 9th Star */}
      {junglePathTiles.map((tx, idx) => (
        <mesh key={`dpath-${idx}`} position={[tx, 0.02, 2.0]} onPointerDown={onGroundClick}>
          <cylinderGeometry args={[0.92, 0.98, 0.05, 12]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#fde68a" : "#fed7aa"}
            roughness={0.55}
          />
        </mesh>
      ))}

      {/* === CLICKABLE JUNGLE OASIS LAGOON ([39.5, 0.015, 8.2]) === */}
      <group position={DINO_LAGOON_POS}>
        {/* Smooth sandy rim ring */}
        <mesh position={[0, -0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onGroundClick}>
          <circleGeometry args={[4.25, 36]} />
          <meshStandardMaterial color="#fde68a" roughness={0.75} />
        </mesh>
        {/* Sparkling turquoise lagoon water */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onGroundClick}>
          <circleGeometry args={[3.75, 36]} />
          <meshPhysicalMaterial
            color="#2dd4bf"
            emissive="#14b8a6"
            emissiveIntensity={0.22}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        {/* Subtle water sparkle rings */}
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.1, 2.22, 32]} />
          <meshStandardMaterial color="#ccfbf1" transparent opacity={0.45} />
        </mesh>
        <mesh position={[-0.7, 0.007, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1.05, 28]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
        {/* Smooth sandy/terracotta pebble rim stones */}
        {lagoonPebbles.map((stone, idx) => (
          <mesh
            key={`lpeb-${idx}`}
            position={[stone.x, 0.12, stone.z]}
            rotation={[0.1, stone.rotY, 0.08]}
            scale={[stone.scale * 1.15, stone.scale * 0.65, stone.scale]}
          >
            <dodecahedronGeometry args={[0.28, 1]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? "#fed7aa" : "#d6d3d1"}
              roughness={0.68}
            />
          </mesh>
        ))}
      </group>

      {/* === PERIMETER WOODEN/BAMBOO JUNGLE FENCES (closing all 4 corners cleanly, west bridge opening z ∈ [-0.8, 4.8]) === */}
      {/* East Edge (x = 66.9, z ∈ [-20.4, 24.4]) */}
      <JungleFenceRow3D position={[66.9, 0, 2.0]} length={44.8} rotationY={Math.PI / 2} />
      {/* North Edge (z = -20.4, x ∈ [28.1, 66.9]) */}
      <JungleFenceRow3D position={[47.5, 0, -20.4]} length={38.8} />
      {/* South Edge (z = 24.4, x ∈ [28.1, 66.9]) */}
      <JungleFenceRow3D position={[47.5, 0, 24.4]} length={38.8} />
      {/* West Edge North Segment (x = 28.1, z ∈ [-20.4, -0.8]) */}
      <JungleFenceRow3D position={[28.1, 0, -10.6]} length={19.6} rotationY={Math.PI / 2} />
      {/* West Edge South Segment (x = 28.1, z ∈ [4.8, 24.4]) */}
      <JungleFenceRow3D position={[28.1, 0, 14.6]} length={19.6} rotationY={Math.PI / 2} />

      {/* === TROPICAL PALM TREES === */}
      {DINO_PALM_SPOTS.map((tree, idx) => (
        <TropicalPalmTree3D
          key={`dpalm-${idx}`}
          position={tree.pos}
          color={tree.color}
          scale={tree.scale}
        />
      ))}

      {/* === 3 ADORABLE GLOSSY KAWAII DINOSAURS === */}
      <HeraBronto3D position={DINO_BRONTO_POS} rotation={[0, DINO_BRONTO_YAW, 0]} scale={1.15} />
      <KawaiiTrike3D position={DINO_TRIKE_POS} rotation={[0, 0.85, 0]} scale={1.12} />
      <KawaiiStego3D position={DINO_STEGO_POS} rotation={[0, 0.45, 0]} scale={1.12} />

      {/* === NEW DINO FRIENDS (sculpted GLB models; the triceratops falls back to the primitive trike while loading) === */}
      <Suspense
        fallback={
          <KawaiiTrike3D position={DINO_TRICERATOPS_POS} rotation={[0, DINO_TRICERATOPS_YAW, 0]} scale={1.3} />
        }
      >
        <TriceratopsModel3D
          position={DINO_TRICERATOPS_POS}
          yaw={DINO_TRICERATOPS_YAW}
          height={DINO_TRICERATOPS_HEIGHT}
        />
      </Suspense>
      <Suspense fallback={null}>
        <SittingDinoModel3D position={DINO_BIG_BLUE_POS} yaw={DINO_BIG_BLUE_YAW} height={DINO_BIG_BLUE_HEIGHT} />
        <SittingDinoModel3D
          position={DINO_BABY_PINK_POS}
          yaw={DINO_BABY_PINK_YAW}
          height={DINO_BABY_PINK_HEIGHT}
          colors={BABY_PINK_DINO_COLORS}
          noticeDist={4}
        />
      </Suspense>

      {/* === FOSSIL DIG, PICNIC, BOUNCY EGGS, FERN GROVE & FOOTPRINT TRAILS === */}
      <FossilDig3D
        pitPos={DINO_FOSSIL_PIT_POS}
        skeletonPos={DINO_SKELETON_POS}
        plinthHalf={DINO_SKELETON_PLINTH_HALF}
        plinthR={DINO_SKELETON_PLINTH_R}
        onGroundClick={onGroundClick}
      />
      <PicnicBlanket3D position={DINO_PICNIC_POS} onGroundClick={onGroundClick} />
      {DINO_BOUNCE_EGGS.map((p, idx) => (
        <BounceEgg3D key={`degg-${idx}`} position={p} color={eggColors[idx % 3][0]} spotColor={eggColors[idx % 3][1]} />
      ))}
      {DINO_FERN_SPOTS.map((f, idx) => (
        <PrehistoricFern3D key={`dfern-${idx}`} position={f.pos} color={f.color} scale={f.scale} />
      ))}
      {DINO_MUSHROOM_SPOTS.map((m, idx) => (
        <SpottedMushroom3D key={`dmush-${idx}`} position={m.pos} color={m.color} />
      ))}
      <DinoFootprints3D trails={DINO_FOOTPRINT_TRAILS} />

      {/* === FRIENDLY BUBBLE VOLCANO & COZY DINO EGG NEST === */}
      <FriendlyVolcano3D position={DINO_VOLCANO_POS} />
      <DinoNest3D position={DINO_NEST_POS} />

      {/* === JUNGLE FIREFLY LANTERNS === */}
      {DINO_LANTERN_SPOTS.map((lp, idx) => (
        <JungleLantern3D key={`dlantern-${idx}`} position={lp} />
      ))}

      {/* === TROPICAL FLOWERS === */}
      {DINO_FLOWER_SPOTS.map((fl, idx) => (
        <GiantFlower3D key={`dflower-${idx}`} position={fl.pos} color={fl.color} />
      ))}

      {/* === GOLDEN JUNGLE FIREFLY SPARKLES === */}
      <Sparkles
        count={130}
        position={[47.5, 3.6, 2.0]}
        scale={[38, 7.5, 44]}
        size={4.6}
        speed={0.38}
        color="#fde047"
      />
    </group>
  );
}
