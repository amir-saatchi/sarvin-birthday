"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { Heart, RotateCcw, Star, Trophy } from "lucide-react";
import {
  CuteUnicorn3D,
  FairyCastle3D,
  KawaiiBunnyFriend3D,
  KawaiiGiftBox3D,
  RainbowArch3D,
  FluffyCloud3D,
  MagicWand3D,
  ExtrudedStar3D,
  ExtrudedHeart3D,
} from "./MagicalDecor3D";
import { playPopSound, playSparkleSound, playVictoryFanfare } from "@/lib/soundEffects";
import { t } from "@/config/translate";

// Expanded Super-Mario-3D-World-sized open castle kingdom!
const WORLD_BOUND_X = 17.6;
const WORLD_BOUND_Z_MIN = -11.5;
const WORLD_BOUND_Z_MAX = 16.5;

const STAR_SPOTS: [number, number, number][] = [
  [0, 1.1, -9.8],       // 1. Royal Castle Gate
  [-12.8, 1.1, 1.5],    // 2. Melody's Enchanted Flower Garden
  [12.8, 1.1, 1.5],     // 3. Kuromi's Magic Crystal & Gift Plaza
  [-11.5, 1.1, 11.8],   // 4. Giant Lollipop & Candy Forest
  [11.8, 1.1, 11.5],    // 5. Shimmering Fairy Pond
  [-8.5, 1.1, -7.8],    // 6. Northwest Castle Lookout
  [8.5, 1.1, -7.8],     // 7. Northeast Castle Lookout
];

const HEART_TRAIL: [number, number, number][] = [
  // Grand central avenue from south meadow to castle
  [0, 0.72, 13.5], [0, 0.72, 11.0], [0, 0.72, 8.5],
  [0, 0.72, -1.0], [0, 0.72, -3.6], [0, 0.72, -6.2],
  // West branch to Melody's Flower Garden
  [-3.2, 0.72, 4.0], [-6.2, 0.72, 3.4], [-9.2, 0.72, 2.5],
  // East branch to Kuromi's Crystal Plaza
  [3.2, 0.72, 4.0], [6.2, 0.72, 3.4], [9.2, 0.72, 2.5],
  // Southwest branch to Candy Forest
  [-4.5, 0.72, 9.2], [-7.5, 0.72, 10.5], [-10.2, 0.72, 9.2],
  // Southeast branch to Fairy Pond
  [4.5, 0.72, 9.2], [7.5, 0.72, 10.5], [10.2, 0.72, 8.5],
  // North Castle Courtyard wings
  [-4.5, 0.72, -8.2], [-6.5, 0.72, -6.2],
  [4.5, 0.72, -8.2], [6.5, 0.72, -6.2],
  // Outer scenic loops
  [-13.5, 0.72, 6.2], [13.5, 0.72, 6.2],
  [-3.2, 0.72, 14.5], [3.2, 0.72, 14.5],
];

const BOUNCE_MUSHROOMS: [number, number, number][] = [
  [-5.2, 0, 7.2],
  [5.2, 0, 7.2],
  [-6.8, 0, -2.5],
  [6.8, 0, -2.5],
  [-13.2, 0, 7.8],
  [13.2, 0, 7.5],
];

const TREE_SPOTS: { pos: [number, number, number]; color: string; scale: number }[] = [
  { pos: [-16.5, 0, -10.5], color: "#ff85c0", scale: 1.35 },
  { pos: [16.5, 0, -10.5], color: "#c084fc", scale: 1.35 },
  { pos: [-16.8, 0, -2.5], color: "#fbcfe8", scale: 1.2 },
  { pos: [16.8, 0, -2.5], color: "#7dd3fc", scale: 1.2 },
  { pos: [-16.2, 0, 6.2], color: "#a7f3d0", scale: 1.25 },
  { pos: [16.2, 0, 6.2], color: "#ff85c0", scale: 1.25 },
  { pos: [-15.5, 0, 14.8], color: "#fde047", scale: 1.2 },
  { pos: [15.5, 0, 14.8], color: "#c084fc", scale: 1.2 },
  { pos: [-9.2, 0, -12.0], color: "#fde047", scale: 1.15 },
  { pos: [9.2, 0, -12.0], color: "#fbcfe8", scale: 1.15 },
  { pos: [-6.0, 0, 15.8], color: "#ff85c0", scale: 1.1 },
  { pos: [6.0, 0, 15.8], color: "#7dd3fc", scale: 1.1 },
];

const FLOWER_SPOTS: { pos: [number, number, number]; color: string }[] = [
  { pos: [-10.5, 0, 0.5], color: "#ff6eb4" },
  { pos: [-11.8, 0, 3.6], color: "#fde047" },
  { pos: [-14.2, 0, 2.4], color: "#c084fc" },
  { pos: [-13.6, 0, -0.8], color: "#ff85c0" },
  { pos: [-9.5, 0, 4.2], color: "#7dd3fc" },
  { pos: [-4.2, 0, 12.2], color: "#ff6eb4" },
  { pos: [4.2, 0, 12.2], color: "#fde047" },
  { pos: [-5.5, 0, -9.8], color: "#ff85c0" },
  { pos: [5.5, 0, -9.8], color: "#c084fc" },
  { pos: [-14.8, 0, 10.5], color: "#fde047" },
];

// Stylized Super Mario 3D World cotton-candy tree
function PastelTree3D({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.2, 0.32, 1.9, 12]} />
        <meshStandardMaterial color="#d97706" roughness={0.65} />
      </mesh>
      <mesh position={[0, 2.15, 0]}>
        <sphereGeometry args={[0.95, 18, 18]} />
        <meshPhysicalMaterial color={color} roughness={0.32} clearcoat={0.28} />
      </mesh>
      <mesh position={[0.58, 1.85, 0.32]}>
        <sphereGeometry args={[0.6, 14, 14]} />
        <meshPhysicalMaterial color={color} roughness={0.32} clearcoat={0.28} />
      </mesh>
      <mesh position={[-0.54, 1.88, -0.25]}>
        <sphereGeometry args={[0.62, 14, 14]} />
        <meshPhysicalMaterial color={color} roughness={0.32} clearcoat={0.28} />
      </mesh>
    </group>
  );
}

// Giant 3D Kawaii Flower
function GiantFlower3D({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.055, 0.075, 0.9, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.5} />
      </mesh>
      {/* Leaves */}
      <mesh position={[0.16, 0.35, 0]} rotation={[0, 0, -0.5]} scale={[1.4, 0.4, 0.7]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color="#4ade80" roughness={0.45} />
      </mesh>
      {/* Blossom center + 5 petals */}
      <group position={[0, 0.95, 0]} rotation={[0.35, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#fde047" roughness={0.3} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.24, Math.sin(a) * 0.24, -0.02]}>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.45} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// Giant 3D Swirled Lollipop for the Candy Forest!
function GiantLollipop3D({
  position,
  color,
  stripeColor = "#ffffff",
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  stripeColor?: string;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.8, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.22, 24]} />
        <meshPhysicalMaterial color={color} roughness={0.18} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 2.0, 0.12]}>
        <torusGeometry args={[0.36, 0.06, 10, 22]} />
        <meshStandardMaterial color={stripeColor} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.0, 0.13]}>
        <torusGeometry args={[0.16, 0.05, 10, 18]} />
        <meshStandardMaterial color={stripeColor} roughness={0.25} />
      </mesh>
    </group>
  );
}

// Glowing Magic Crystal Cluster for Kuromi's Plaza!
function CrystalCluster3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]} rotation={[0.08, 0.2, 0.05]}>
        <coneGeometry args={[0.38, 1.65, 6]} />
        <meshPhysicalMaterial
          color="#c084fc"
          emissive="#a855f7"
          emissiveIntensity={0.45}
          roughness={0.12}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0.42, 0.52, 0.18]} rotation={[0.2, 0, -0.35]}>
        <coneGeometry args={[0.24, 1.05, 6]} />
        <meshPhysicalMaterial
          color="#f472b6"
          emissive="#ec4899"
          emissiveIntensity={0.4}
          roughness={0.12}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[-0.38, 0.45, -0.15]} rotation={[-0.18, 0.3, 0.32]}>
        <coneGeometry args={[0.22, 0.9, 6]} />
        <meshPhysicalMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={0.4}
          roughness={0.12}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

// Royal Pastel Lamp Post with glowing fairy orb
function FairyLampPost3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.2, 12]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 2.0, 10]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

// Central 3D Tiered Wishing Fountain with animated water rings!
function WishingFountain3D({ position }: { position: [number, number, number] }) {
  const jetRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!jetRef.current) return;
    const s = 0.9 + Math.sin(state.clock.elapsedTime * 5) * 0.12;
    jetRef.current.scale.set(1, s, 1);
  });

  return (
    <group position={position}>
      {/* Outer marble basin */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[1.65, 1.75, 0.52, 28]} />
        <meshPhysicalMaterial color="#fff1f7" roughness={0.25} clearcoat={0.4} />
      </mesh>
      {/* Sparkling turquoise water */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[1.46, 1.46, 0.22, 28]} />
        <meshPhysicalMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={0.28}
          roughness={0.08}
          clearcoat={1}
        />
      </mesh>
      {/* Center tiered pillar */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.24, 0.34, 1.1, 16]} />
        <meshPhysicalMaterial color="#f3e8ff" roughness={0.25} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.78, 0.45, 0.22, 22]} />
        <meshPhysicalMaterial color="#ffe4f3" roughness={0.25} clearcoat={0.45} />
      </mesh>
      {/* Animated sparkling water jet + golden star topper */}
      <mesh ref={jetRef} position={[0, 1.72, 0]}>
        <coneGeometry args={[0.35, 0.72, 16]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          emissive="#7dd3fc"
          emissiveIntensity={0.45}
          transparent
          opacity={0.78}
        />
      </mesh>
      <ExtrudedStar3D position={[0, 2.2, 0]} scale={0.62} spin />
    </group>
  );
}

// Fluttering 3D Butterfly
function Butterfly3D({
  center,
  color,
  speed = 1,
}: {
  center: [number, number, number];
  color: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const leftW = useRef<THREE.Mesh>(null);
  const rightW = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (ref.current) {
      ref.current.position.set(
        center[0] + Math.cos(t) * 1.4,
        center[1] + Math.sin(t * 2.2) * 0.35,
        center[2] + Math.sin(t) * 1.4
      );
      ref.current.rotation.y = -t;
    }
    const flap = Math.sin(state.clock.elapsedTime * 16) * 0.7;
    if (leftW.current) leftW.current.rotation.z = flap;
    if (rightW.current) rightW.current.rotation.z = -flap;
  });

  return (
    <group ref={ref} position={center}>
      <mesh ref={leftW} position={[-0.14, 0, 0]} scale={[1.2, 0.15, 0.9]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh ref={rightW} position={[0.14, 0, 0]} scale={[1.2, 0.15, 0.9]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

// Bouncy spotted pink Mario-style mushroom pad
function BounceMushroom3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.26, 0.34, 0.56, 14]} />
        <meshStandardMaterial color="#fffbeb" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.58, 0]} scale={[1, 0.52, 1]}>
        <sphereGeometry args={[0.72, 20, 20]} />
        <meshPhysicalMaterial color="#ff5fa2" roughness={0.22} clearcoat={0.65} />
      </mesh>
      {[
        [0, 0.94, 0],
        [0.42, 0.78, 0.22],
        [-0.4, 0.78, 0.25],
        [0.12, 0.78, -0.45],
        [-0.3, 0.78, -0.32],
      ].map(([sx, sy, sz], i) => (
        <mesh key={i} position={[sx, sy, sz]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Wooden/pastel fence segment along the terrace edge
function FenceRow3D({
  position,
  rotation = [0, 0, 0],
  count = 6,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  count?: number;
}) {
  const posts = useMemo(
    () => Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * 1.15),
    [count]
  );
  const totalLen = (count - 1) * 1.15 + 0.3;

  return (
    <group position={position} rotation={rotation}>
      {posts.map((px) => (
        <mesh key={px} position={[px, 0.38, 0]}>
          <boxGeometry args={[0.16, 0.76, 0.16]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[totalLen, 0.1, 0.09]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[totalLen, 0.1, 0.09]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.4} />
      </mesh>
    </group>
  );
}

// Click marker ring on the grass where the player tapped
function TargetRing3D({ targetRef }: { targetRef: React.MutableRefObject<THREE.Vector3 | null> }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    if (!targetRef.current) {
      ringRef.current.visible = false;
      return;
    }
    ringRef.current.visible = true;
    ringRef.current.position.set(targetRef.current.x, 0.06, targetRef.current.z);
    const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 7) * 0.18;
    ringRef.current.scale.set(pulse, pulse, 1);
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.38, 0.6, 28]} />
      <meshBasicMaterial color="#fde047" transparent opacity={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}

function CastleWorldScene({
  collectedStars,
  collectedHearts,
  won,
  onCollectStar,
  onCollectHeart,
  onTriggerMessage,
}: {
  collectedStars: boolean[];
  collectedHearts: boolean[];
  won: boolean;
  onCollectStar: (idx: number) => void;
  onCollectHeart: (idx: number) => void;
  onTriggerMessage: (msg: string) => void;
}) {
  const { viewport, camera } = useThree();
  const isNarrow = viewport.width < 6.0;

  const playerGroupRef = useRef<THREE.Group>(null);
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 12.2));
  const playerYawRef = useRef(Math.PI);
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  const jumpVelRef = useRef(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastBounceRef = useRef(0);
  const lastFriendMsgRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const handleGroundClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const x = THREE.MathUtils.clamp(e.point.x, -WORLD_BOUND_X, WORLD_BOUND_X);
    const z = THREE.MathUtils.clamp(e.point.z, WORLD_BOUND_Z_MIN, WORLD_BOUND_Z_MAX);
    targetPosRef.current = new THREE.Vector3(x, 0, z);
    playPopSound(1.25);
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const pos = playerPosRef.current;
    const speed = 6.8;
    let moved = false;

    let kx = 0;
    let kz = 0;
    if (keysRef.current["arrowleft"] || keysRef.current["a"]) kx -= 1;
    if (keysRef.current["arrowright"] || keysRef.current["d"]) kx += 1;
    if (keysRef.current["arrowup"] || keysRef.current["w"]) kz -= 1;
    if (keysRef.current["arrowdown"] || keysRef.current["s"]) kz += 1;

    if (kx !== 0 || kz !== 0) {
      targetPosRef.current = null;
      const len = Math.hypot(kx, kz);
      const vx = (kx / len) * speed * dt;
      const vz = (kz / len) * speed * dt;
      pos.x = THREE.MathUtils.clamp(pos.x + vx, -WORLD_BOUND_X, WORLD_BOUND_X);
      pos.z = THREE.MathUtils.clamp(pos.z + vz, WORLD_BOUND_Z_MIN, WORLD_BOUND_Z_MAX);
      const desiredYaw = Math.atan2(vx, vz);
      let diff = desiredYaw - playerYawRef.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      playerYawRef.current += diff * Math.min(1, dt * 10);
      moved = true;
    } else if (targetPosRef.current) {
      const dx = targetPosRef.current.x - pos.x;
      const dz = targetPosRef.current.z - pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.22) {
        const step = Math.min(dist, speed * dt);
        pos.x += (dx / dist) * step;
        pos.z += (dz / dist) * step;
        const desiredYaw = Math.atan2(dx, dz);
        let diff = desiredYaw - playerYawRef.current;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        playerYawRef.current += diff * Math.min(1, dt * 10);
        moved = true;
      } else {
        targetPosRef.current = null;
      }
    }

    // Soft collision around central fountain (0, 3.6) so unicorn glides smoothly around it
    const fDist = Math.hypot(pos.x - 0, pos.z - 3.6);
    if (fDist < 2.15 && fDist > 0.01) {
      pos.x = (pos.x / fDist) * 2.15;
      pos.z = 3.6 + ((pos.z - 3.6) / fDist) * 2.15;
    }

    // Mushroom bounce physics
    if (pos.y > 0 || jumpVelRef.current > 0) {
      pos.y += jumpVelRef.current * dt;
      jumpVelRef.current -= 16 * dt;
      if (pos.y <= 0) {
        pos.y = 0;
        jumpVelRef.current = 0;
      }
    }

    const now = performance.now();
    for (const [mx, , mz] of BOUNCE_MUSHROOMS) {
      if (
        Math.hypot(pos.x - mx, pos.z - mz) < 0.95 &&
        pos.y < 0.2 &&
        now - lastBounceRef.current > 650
      ) {
        jumpVelRef.current = 8.0;
        lastBounceRef.current = now;
        playSparkleSound();
      }
    }

    if (playerGroupRef.current) {
      const trotHop =
        moved && pos.y === 0 ? Math.abs(Math.sin(state.clock.elapsedTime * 12)) * 0.22 : 0;
      playerGroupRef.current.position.set(pos.x, pos.y + trotHop + 0.16, pos.z);
      playerGroupRef.current.rotation.y = playerYawRef.current;
    }

    STAR_SPOTS.forEach(([sx, , sz], idx) => {
      if (!collectedStars[idx] && Math.hypot(pos.x - sx, pos.z - sz) < 1.35) {
        onCollectStar(idx);
      }
    });

    HEART_TRAIL.forEach(([hx, , hz], idx) => {
      if (!collectedHearts[idx] && Math.hypot(pos.x - hx, pos.z - hz) < 1.15) {
        onCollectHeart(idx);
      }
    });

    const triggerCooldown = (key: string, msg: string) => {
      if (!lastFriendMsgRef.current[key] || now - lastFriendMsgRef.current[key] > 5500) {
        lastFriendMsgRef.current[key] = now;
        playSparkleSound();
        onTriggerMessage(msg);
      }
    };

    if (Math.hypot(pos.x - -11.5, pos.z - 2.2) < 2.2) {
      triggerCooldown("pink", t.castleWorld.friendPinkMsg);
    } else if (Math.hypot(pos.x - 11.5, pos.z - 2.2) < 2.2) {
      triggerCooldown("purple", t.castleWorld.friendPurpleMsg);
    } else if (Math.hypot(pos.x - 0, pos.z - -10.0) < 2.6) {
      triggerCooldown("castle", t.castleWorld.castleGateMsg);
    } else if (fDist < 2.6) {
      triggerCooldown("fountain", t.castleWorld.fountainMsg);
    }

    // Smooth 3rd-person elevated follow camera
    const camOffsetY = isNarrow ? 9.2 : 7.8;
    const camOffsetZ = isNarrow ? 11.6 : 10.0;
    const desiredCamPos = new THREE.Vector3(
      THREE.MathUtils.clamp(pos.x * 0.85, -13.5, 13.5),
      camOffsetY,
      pos.z + camOffsetZ
    );
    camera.position.lerp(desiredCamPos, Math.min(1, dt * 4.5));
    camera.lookAt(pos.x * 0.9, 0.8, pos.z - 1.8);
  });

  // Winding pastel stepping stones connecting all 6 zones
  const stones = useMemo(
    () => [
      // South to Fountain
      [0, 14.5], [0, 12.6], [0, 10.7], [0, 8.8], [0, 6.9],
      // Fountain to Castle
      [0, 0.4], [0, -1.6], [0, -3.6], [0, -5.6], [0, -7.6], [0, -9.6],
      // West to Melody's Garden
      [-2.8, 3.6], [-4.8, 3.4], [-6.8, 3.1], [-8.8, 2.7], [-10.8, 2.3],
      // East to Kuromi's Plaza
      [2.8, 3.6], [4.8, 3.4], [6.8, 3.1], [8.8, 2.7], [10.8, 2.3],
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#f5d0fe", "#86efac", 0.72]} />
      <directionalLight position={[14, 22, 14]} intensity={1.25} color="#fff7ed" />
      <pointLight position={[0, 6, -12]} intensity={0.8} color="#f472b6" />
      <pointLight position={[0, 4, 3.6]} intensity={0.5} color="#7dd3fc" />

      {/* HUGE Chunky Layered Super-Mario-3D-World Grass Island (40×38!) */}
      <group>
        <mesh position={[0, -0.25, 2.0]} onPointerDown={handleGroundClick} receiveShadow>
          <boxGeometry args={[40, 0.5, 38]} />
          <meshStandardMaterial color="#4ade80" roughness={0.68} />
        </mesh>
        <mesh position={[0, -1.6, 2.0]}>
          <boxGeometry args={[39.4, 2.2, 37.4]} />
          <meshStandardMaterial color="#d97706" roughness={0.85} />
        </mesh>
        <mesh position={[0, -3.1, 2.0]}>
          <boxGeometry args={[38.4, 0.9, 36.4]} />
          <meshStandardMaterial color="#b45309" roughness={0.9} />
        </mesh>

        {/* Distant Floating Sky Mini-Islands for breathtaking depth */}
        {[
          [-26, -1.5, -14, 5.5],
          [26, -1.0, -12, 5.5],
          [-25, -2.0, 10, 4.5],
          [25, -1.8, 12, 4.5],
        ].map(([ix, iy, iz, isize], idx) => (
          <group key={`sky-isl-${idx}`} position={[ix, iy, iz]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[isize, 0.45, isize]} />
              <meshStandardMaterial color="#4ade80" roughness={0.68} />
            </mesh>
            <mesh position={[0, -0.7, 0]}>
              <boxGeometry args={[isize - 0.3, 1.4, isize - 0.3]} />
              <meshStandardMaterial color="#c26512" roughness={0.88} />
            </mesh>
            <PastelTree3D
              position={[0, 0.4, 0]}
              color={idx % 2 === 0 ? "#ff85c0" : "#c084fc"}
              scale={1.0}
            />
          </group>
        ))}

        {/* Raised Corner Terraces (Super Mario 3D World stepped hills) */}
        {[
          [-16.2, 0.5, -12.5],
          [16.2, 0.5, -12.5],
          [-16.4, 0.45, 14.5],
          [16.4, 0.45, 14.5],
        ].map(([tx, ty, tz], i) => (
          <group key={`ter-${i}`} position={[tx, ty, tz]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[5.8, 0.35, 5.8]} />
              <meshStandardMaterial color="#22c55e" roughness={0.65} />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[5.5, 0.75, 5.5]} />
              <meshStandardMaterial color="#c26512" roughness={0.85} />
            </mesh>
          </group>
        ))}

        {/* Royal Pink Carpet leading to the Castle Gate */}
        <mesh position={[0, 0.025, -9.2]} onPointerDown={handleGroundClick}>
          <boxGeometry args={[2.6, 0.04, 6.5]} />
          <meshStandardMaterial color="#ff6eb4" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.02, -9.2]}>
          <boxGeometry args={[2.95, 0.03, 6.7]} />
          <meshStandardMaterial color="#fde047" roughness={0.4} />
        </mesh>

        {/* Pastel Stepping Stones */}
        {stones.map(([sx, sz], idx) => (
          <mesh key={`st-${idx}`} position={[sx, 0.03, sz]} onPointerDown={handleGroundClick}>
            <cylinderGeometry args={[0.66, 0.72, 0.07, 16]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? "#fde68a" : "#fbcfe8"}
              roughness={0.45}
            />
          </mesh>
        ))}

        {/* Southeast Shimmering Fairy Pond with Lily Pads & Lotus Blossoms */}
        <group position={[11.6, 0.03, 11.4]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[3.6, 32]} />
            <meshPhysicalMaterial
              color="#7dd3fc"
              emissive="#38bdf8"
              emissiveIntensity={0.22}
              roughness={0.08}
              clearcoat={1}
            />
          </mesh>
          {/* Lily pads */}
          {[
            [-1.3, 0.04, 0.8],
            [1.4, 0.04, -0.9],
            [-0.4, 0.04, -1.6],
            [1.2, 0.04, 1.4],
          ].map(([lx, ly, lz], i) => (
            <group key={`lily-${i}`} position={[lx, ly, lz]}>
              <mesh>
                <cylinderGeometry args={[0.55, 0.55, 0.05, 16]} />
                <meshStandardMaterial color="#22c55e" roughness={0.45} />
              </mesh>
              {i % 2 === 0 && (
                <mesh position={[0, 0.1, 0]}>
                  <sphereGeometry args={[0.18, 12, 12]} />
                  <meshPhysicalMaterial color="#ff85c0" roughness={0.25} clearcoat={0.5} />
                </mesh>
              )}
            </group>
          ))}
        </group>

        {/* Southwest Pastel Candy & Picnic Meadow */}
        <mesh position={[-11.5, 0.03, 11.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.4, 28]} />
          <meshStandardMaterial color="#fbcfe8" roughness={0.6} />
        </mesh>
      </group>

      {/* Perimeter Pastel Fences */}
      <FenceRow3D position={[-7.5, 0, 19.6]} count={9} />
      <FenceRow3D position={[7.5, 0, 19.6]} count={9} />
      <FenceRow3D position={[-19.4, 0, 2.0]} rotation={[0, Math.PI / 2, 0]} count={14} />
      <FenceRow3D position={[19.4, 0, 2.0]} rotation={[0, Math.PI / 2, 0]} count={14} />

      {/* GRAND FAIRY PRINCESS CASTLE (North Courtyard) */}
      <FairyCastle3D position={[0, 0.45, -14.8]} scale={2.05} />

      {/* Royal Lamp Posts lining the Castle Avenue */}
      <FairyLampPost3D position={[-3.0, 0, -6.5]} />
      <FairyLampPost3D position={[3.0, 0, -6.5]} />
      <FairyLampPost3D position={[-3.0, 0, -1.2]} />
      <FairyLampPost3D position={[3.0, 0, -1.2]} />

      {/* Central Wishing Fountain + Giant Rainbow Arch */}
      <WishingFountain3D position={[0, 0, 3.6]} />
      <RainbowArch3D position={[0, 0, -3.8]} scale={1.75} />

      {/* Cotton-Candy Trees */}
      {TREE_SPOTS.map((tr, i) => (
        <PastelTree3D key={`tree-${i}`} position={tr.pos} color={tr.color} scale={tr.scale} />
      ))}

      {/* Giant Kawaii Flowers (Melody's Meadow & scattered) */}
      {FLOWER_SPOTS.map((fl, i) => (
        <GiantFlower3D key={`fl-${i}`} position={fl.pos} color={fl.color} />
      ))}

      {/* Giant Swirled Lollipops (Southwest Candy Forest!) */}
      <GiantLollipop3D position={[-13.5, 0, 11.2]} color="#ff6eb4" scale={1.25} />
      <GiantLollipop3D position={[-10.2, 0, 13.8]} color="#7dd3fc" scale={1.1} />
      <GiantLollipop3D position={[-9.2, 0, 10.2]} color="#c084fc" scale={1.15} />
      <GiantLollipop3D position={[-13.0, 0, 13.8]} color="#fde047" scale={1.0} />

      {/* Glowing Magic Crystal Clusters (East Kuromi Plaza!) */}
      <CrystalCluster3D position={[14.2, 0, 1.0]} />
      <CrystalCluster3D position={[13.2, 0, 4.2]} />
      <CrystalCluster3D position={[10.5, 0, -2.0]} />

      {/* Fluttering 3D Butterflies */}
      <Butterfly3D center={[-11.5, 2.0, 2.2]} color="#ff85c0" speed={1.1} />
      <Butterfly3D center={[11.5, 2.2, 11.4]} color="#7dd3fc" speed={0.95} />
      <Butterfly3D center={[0, 2.8, 3.6]} color="#fde047" speed={1.25} />

      {/* 6 Bouncy Pink Mushrooms */}
      {BOUNCE_MUSHROOMS.map((m, i) => (
        <BounceMushroom3D key={`mush-${i}`} position={m} />
      ))}

      {/* Interactive Kawaii Friends */}
      <KawaiiBunnyFriend3D
        variant="pink"
        position={[-11.5, 0.05, 2.2]}
        rotation={[0, 0.75, 0]}
        scale={1.45}
      />
      <KawaiiBunnyFriend3D
        variant="purple"
        position={[11.5, 0.05, 2.2]}
        rotation={[0, -0.75, 0]}
        scale={1.45}
      />

      {/* Gift Boxes & Magic Wands around the Kingdom */}
      <KawaiiGiftBox3D position={[-3.6, 0, -10.8]} scale={1.2} boxColor="#ff85c0" ribbonColor="#fde047" />
      <KawaiiGiftBox3D position={[3.6, 0, -10.8]} scale={1.2} boxColor="#c084fc" ribbonColor="#ff85c0" />
      <KawaiiGiftBox3D position={[12.8, 0, 0.2]} scale={1.05} boxColor="#7dd3fc" ribbonColor="#fde047" />
      <KawaiiGiftBox3D position={[13.8, 0, 2.8]} scale={0.95} boxColor="#ff85c0" ribbonColor="#ffffff" />
      <MagicWand3D position={[-13.0, 1.5, 0.8]} scale={1.1} />

      {/* Fluffy Sky Clouds */}
      <FluffyCloud3D position={[-14, 7.5, -16]} scale={2.3} tint="#ffffff" />
      <FluffyCloud3D position={[14, 7.2, -16]} scale={2.4} tint="#fff0f7" />
      <FluffyCloud3D position={[0, 9.2, -19]} scale={2.6} tint="#f3e8ff" />

      {/* 7 Collectible Magical Birthday Stars */}
      {STAR_SPOTS.map(
        (pos, idx) =>
          !collectedStars[idx] && (
            <Float key={`star-${idx}`} speed={2.6} floatIntensity={0.35}>
              <ExtrudedStar3D
                position={pos}
                scale={1.38}
                color="#fde047"
                emissive="#f59e0b"
                emissiveIntensity={0.68}
                spin
              />
            </Float>
          )
      )}

      {/* Collectible Heart Coin Trails */}
      {HEART_TRAIL.map(
        (pos, idx) =>
          !collectedHearts[idx] && (
            <Float key={`heart-${idx}`} speed={3} floatIntensity={0.22}>
              <ExtrudedHeart3D
                position={pos}
                scale={0.64}
                color={idx % 2 === 0 ? "#ff6eb4" : "#c084fc"}
                emissive={idx % 2 === 0 ? "#ec4899" : "#a855f7"}
                emissiveIntensity={0.35}
              />
            </Float>
          )
      )}

      {/* Glowing click-to-move destination ring */}
      <TargetRing3D targetRef={targetPosRef} />

      {/* Playable Winged Unicorn! */}
      <group ref={playerGroupRef} position={[0, 0.16, 12.2]}>
        <CuteUnicorn3D scale={0.96} celebrating={won} />
      </group>

      <Sparkles count={95} scale={[36, 7, 34]} size={4.8} speed={0.4} color="#fef08a" />
    </>
  );
}

export function CastleWorldGame3D() {
  const [collectedStars, setCollectedStars] = useState<boolean[]>(() =>
    Array(STAR_SPOTS.length).fill(false)
  );
  const [collectedHearts, setCollectedHearts] = useState<boolean[]>(() =>
    Array(HEART_TRAIL.length).fill(false)
  );
  const [won, setWon] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const starsFound = collectedStars.filter(Boolean).length;
  const heartsFound = collectedHearts.filter(Boolean).length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 3200);
  };

  const handleCollectStar = (idx: number) => {
    setCollectedStars((prev) => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      playSparkleSound();

      if (next.every(Boolean)) {
        setWon(true);
        playVictoryFanfare();
        confetti({
          particleCount: 180,
          spread: 115,
          origin: { y: 0.5 },
          colors: ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"],
        });
      }
      return next;
    });
  };

  const handleCollectHeart = (idx: number) => {
    setCollectedHearts((prev) => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      playPopSound(1.2);
      return next;
    });
  };

  const handleRestart = () => {
    setCollectedStars(Array(STAR_SPOTS.length).fill(false));
    setCollectedHearts(Array(HEART_TRAIL.length).fill(false));
    setWon(false);
    setToastMsg(null);
  };

  return (
    <div className="w-full">
      {/* Compact HUD */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-white/90 bg-white/85 px-3 py-2 shadow-md backdrop-blur sm:mb-4 sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 sm:px-4 sm:py-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500 sm:h-5 sm:w-5" />
            <span className="font-display text-sm font-bold text-purple-900 sm:text-lg">
              {t.castleWorld.starsLabel(starsFound, STAR_SPOTS.length)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 sm:px-4 sm:py-1.5">
            <Heart className="h-4 w-4 fill-pink-500 text-pink-500 sm:h-5 sm:w-5" />
            <span className="font-display text-sm font-bold text-purple-900 sm:text-lg">
              {t.castleWorld.heartsLabel(heartsFound)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="font-display inline-flex cursor-pointer items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 transition hover:bg-purple-100 active:scale-95 sm:px-3.5 sm:py-2 sm:text-sm"
        >
          <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {t.castleWorld.restart}
        </button>
      </div>

      {/* 3D Open World Exploration Canvas */}
      <div className="relative h-[60dvh] min-h-[360px] max-h-[580px] w-full touch-none overflow-hidden rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-purple-500/85 via-fuchsia-300/80 to-sky-200/90 shadow-2xl shadow-purple-300/40 sm:h-[540px] sm:rounded-[2rem]">
        <Canvas camera={{ position: [0, 8.2, 22.0], fov: 46 }} dpr={[1, 2]}>
          <CastleWorldScene
            collectedStars={collectedStars}
            collectedHearts={collectedHearts}
            won={won}
            onCollectStar={handleCollectStar}
            onCollectHeart={handleCollectHeart}
            onTriggerMessage={showToast}
          />
        </Canvas>

        {/* Kawaii Friend / Castle / Fountain Speech Toast */}
        {toastMsg && !won && (
          <div className="pointer-events-none absolute top-3 left-1/2 z-20 w-[90%] max-w-md -translate-x-1/2 text-center">
            <div className="font-display inline-block rounded-full border-2 border-white bg-white/92 px-4 py-2 text-xs font-bold text-purple-900 shadow-lg backdrop-blur sm:text-sm">
              {toastMsg}
            </div>
          </div>
        )}

        {/* All 7 Stars Win Celebration */}
        {won && (
          <div className="absolute inset-x-3 top-6 z-20 flex flex-col items-center text-center sm:inset-x-4 sm:top-8">
            <div className="kawaii-card max-w-sm rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                <Trophy className="h-4 w-4 text-amber-500" />
                {t.castleWorld.winBadge}
              </div>
              <h2 className="font-display mb-2 text-2xl font-bold text-purple-900 sm:text-3xl">
                {t.castleWorld.winTitle}
              </h2>
              <p className="mb-4 text-sm font-bold text-purple-700">
                {t.castleWorld.winMessage}
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="font-display inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2.5 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                {t.castleWorld.playAgain}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
