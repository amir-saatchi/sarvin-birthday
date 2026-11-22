"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RAINBOW_COLORS = ["#ff7ab6", "#ffbe76", "#fef08a", "#7dd3fc", "#c084fc"];

export function RainbowArch3D({
  position = [0, -0.4, -3.4],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {RAINBOW_COLORS.map((color, index) => (
        <mesh key={color} rotation={[0, 0, 0]}>
          <torusGeometry args={[3.4 - index * 0.24, 0.13, 18, 64, Math.PI]} />
          <meshStandardMaterial
            color={color}
            roughness={0.28}
            metalness={0.05}
            emissive={color}
            emissiveIntensity={0.14}
          />
        </mesh>
      ))}
    </group>
  );
}

export function FluffyCloud3D({
  position = [0, 0, 0],
  scale = 1,
  speed = 0.8,
  tint = "#ffffff",
}: {
  position?: [number, number, number];
  scale?: number;
  speed?: number;
  tint?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      initialY + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.14;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.72, 20, 20]} />
        <meshStandardMaterial color={tint} roughness={0.65} />
      </mesh>
      <mesh position={[-0.65, -0.14, 0.05]}>
        <sphereGeometry args={[0.52, 18, 18]} />
        <meshStandardMaterial color={tint} roughness={0.65} />
      </mesh>
      <mesh position={[0.68, -0.12, 0.04]}>
        <sphereGeometry args={[0.56, 18, 18]} />
        <meshStandardMaterial color={tint} roughness={0.65} />
      </mesh>
      <mesh position={[0.25, 0.28, -0.05]}>
        <sphereGeometry args={[0.48, 18, 18]} />
        <meshStandardMaterial color={tint} roughness={0.65} />
      </mesh>
      <mesh position={[-0.3, 0.22, -0.04]}>
        <sphereGeometry args={[0.44, 18, 18]} />
        <meshStandardMaterial color={tint} roughness={0.65} />
      </mesh>
    </group>
  );
}

export function CuteUnicorn3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  celebrating = false,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  celebrating?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    if (celebrating) {
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 7)) * 0.45;
      groupRef.current.rotation.y = rotation[1] + Math.sin(t * 4) * 0.45;
    } else {
      groupRef.current.position.y = position[1] + Math.sin(t * 2.4) * 0.07;
      groupRef.current.rotation.z = Math.sin(t * 2) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Chubby white body */}
      <mesh position={[0, 0.36, 0]} scale={[0.92, 0.85, 1.15]}>
        <sphereGeometry args={[0.52, 24, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Cute little pastel hooves/legs */}
      {[
        [-0.24, -0.08, 0.26],
        [0.24, -0.08, 0.26],
        [-0.24, -0.08, -0.26],
        [0.24, -0.08, -0.26],
      ].map(([lx, ly, lz], idx) => (
        <group key={idx} position={[lx, ly, lz]}>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.1, 0.11, 0.28, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.12, 0.09, 16]} />
            <meshStandardMaterial color="#f472b6" roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Rainbow fluffy tail */}
      <mesh position={[0, 0.42, -0.64]} rotation={[0.4, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#f472b6" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.28, -0.76]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#c084fc" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.15, -0.82]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.35} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.96, 0.26]}>
        <mesh>
          <sphereGeometry args={[0.44, 24, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.28} />
        </mesh>

        {/* Rosy muzzle */}
        <mesh position={[0, -0.1, 0.36]} scale={[1.05, 0.78, 0.7]}>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshStandardMaterial color="#ffd6ec" roughness={0.35} />
        </mesh>

        {/* Big kawaii eyes */}
        <mesh position={[-0.18, 0.05, 0.36]}>
          <sphereGeometry args={[0.068, 16, 16]} />
          <meshStandardMaterial color="#2e1065" roughness={0.1} />
        </mesh>
        <mesh position={[0.18, 0.05, 0.36]}>
          <sphereGeometry args={[0.068, 16, 16]} />
          <meshStandardMaterial color="#2e1065" roughness={0.1} />
        </mesh>
        {/* Eye sparkles */}
        <mesh position={[-0.16, 0.08, 0.415]}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.2, 0.08, 0.415]}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Rosy cheeks */}
        <mesh position={[-0.27, -0.05, 0.31]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color="#ff9ec9" roughness={0.5} />
        </mesh>
        <mesh position={[0.27, -0.05, 0.31]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color="#ff9ec9" roughness={0.5} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.25, 0.38, -0.02]} rotation={[0, 0, 0.35]}>
          <coneGeometry args={[0.12, 0.28, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0.25, 0.38, -0.02]} rotation={[0, 0, -0.35]}>
          <coneGeometry args={[0.12, 0.28, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>

        {/* Magical Golden Unicorn Horn */}
        <mesh position={[0, 0.56, 0.16]} rotation={[0.28, 0, 0]}>
          <coneGeometry args={[0.095, 0.46, 20]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.45}
            roughness={0.2}
            emissive="#f59e0b"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Rainbow Mane Tufts */}
        <mesh position={[-0.11, 0.38, 0.15]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#f472b6" roughness={0.35} />
        </mesh>
        <mesh position={[0.11, 0.38, 0.15]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#c084fc" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.32, -0.24]}>
          <sphereGeometry args={[0.19, 16, 16]} />
          <meshStandardMaterial color="#7dd3fc" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.1, -0.36]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#fef08a" roughness={0.35} />
        </mesh>

        {/* Princess Tiara when celebrating */}
        {celebrating && (
          <mesh position={[0, 0.42, 0.2]} rotation={[0.15, 0, 0]}>
            <torusGeometry args={[0.2, 0.04, 12, 24]} />
            <meshStandardMaterial color="#fde047" metalness={0.7} roughness={0.15} />
          </mesh>
        )}
      </group>
    </group>
  );
}
