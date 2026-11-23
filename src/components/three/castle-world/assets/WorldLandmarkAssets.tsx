"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ExtrudedStar3D } from "../../MagicalDecor3D";
import type { Vec3 } from "../types";

// Giant 3D Swirled Lollipop for the Candy Forest!
export function GiantLollipop3D({
  position,
  color,
  stripeColor = "#ffffff",
  scale = 1,
}: {
  position: Vec3;
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

// Glowing Magic Crystal Cluster (supports purple/pink magic & frosty ice palettes)
export function CrystalCluster3D({
  position,
  palette = "magic",
}: {
  position: Vec3;
  palette?: "magic" | "ice";
}) {
  const colors =
    palette === "ice"
      ? {
          main: "#7dd3fc",
          mainEmissive: "#38bdf8",
          right: "#bae6fd",
          rightEmissive: "#0ea5e9",
          left: "#c4b5fd",
          leftEmissive: "#818cf8",
        }
      : {
          main: "#c084fc",
          mainEmissive: "#a855f7",
          right: "#f472b6",
          rightEmissive: "#ec4899",
          left: "#818cf8",
          leftEmissive: "#6366f1",
        };

  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]} rotation={[0.08, 0.2, 0.05]}>
        <coneGeometry args={[0.38, 1.65, 6]} />
        <meshPhysicalMaterial
          color={colors.main}
          emissive={colors.mainEmissive}
          emissiveIntensity={0.45}
          roughness={0.12}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0.42, 0.52, 0.18]} rotation={[0.2, 0, -0.35]}>
        <coneGeometry args={[0.24, 1.05, 6]} />
        <meshPhysicalMaterial
          color={colors.right}
          emissive={colors.rightEmissive}
          emissiveIntensity={0.4}
          roughness={0.12}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[-0.38, 0.45, -0.15]} rotation={[-0.18, 0.3, 0.32]}>
        <coneGeometry args={[0.22, 0.9, 6]} />
        <meshPhysicalMaterial
          color={colors.left}
          emissive={colors.leftEmissive}
          emissiveIntensity={0.4}
          roughness={0.12}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

// Royal Pastel Lamp Post with glowing fairy orb
export function FairyLampPost3D({ position }: { position: Vec3 }) {
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
export function WishingFountain3D({ position }: { position: Vec3 }) {
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

// Wooden/pastel fence segment along the terrace edge
export function FenceRow3D({
  position,
  rotation = [0, 0, 0],
  count = 6,
}: {
  position: Vec3;
  rotation?: Vec3;
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
