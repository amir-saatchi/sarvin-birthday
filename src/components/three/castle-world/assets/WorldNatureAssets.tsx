"use client";

import React, { useRef } from "react";
import { useFrame } from "../landFrame";
import * as THREE from "three";
import type { Vec3 } from "../types";

// Stylized Super Mario 3D World cotton-candy tree
export function PastelTree3D({
  position,
  color,
  scale = 1,
}: {
  position: Vec3;
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
export function GiantFlower3D({
  position,
  color,
}: {
  position: Vec3;
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

// Fluttering 3D Butterfly
export function Butterfly3D({
  center,
  color,
  speed = 1,
}: {
  center: Vec3;
  color: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const leftW = useRef<THREE.Mesh>(null);
  const rightW = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime * speed;
    if (ref.current) {
      ref.current.position.set(
        center[0] + Math.cos(elapsed) * 1.4,
        center[1] + Math.sin(elapsed * 2.2) * 0.35,
        center[2] + Math.sin(elapsed) * 1.4
      );
      ref.current.rotation.y = -elapsed;
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
export function BounceMushroom3D({ position }: { position: Vec3 }) {
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
