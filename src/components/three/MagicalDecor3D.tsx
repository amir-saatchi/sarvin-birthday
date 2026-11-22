"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RAINBOW_COLORS = [
  "#ff6eb4",
  "#ffa94d",
  "#fde047",
  "#6ee7b7",
  "#7dd3fc",
  "#c084fc",
];

// Reusable 5-pointed beveled 3D star geometry
export function useStarGeometry(outerR = 0.36, innerR = 0.16, depth = 0.1) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const spikes = 5;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i / (spikes * 2)) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: outerR * 0.11,
      bevelThickness: depth * 0.45,
    });
    geo.center();
    return geo;
  }, [outerR, innerR, depth]);
}

// Reusable beveled 3D heart geometry
export function useHeartGeometry(scale = 0.032, depth = 0.12) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 3 * scale);
    shape.bezierCurveTo(
      0, 3 * scale,
      -5 * scale, 10 * scale,
      -10 * scale, 5 * scale
    );
    shape.bezierCurveTo(
      -14 * scale, 0,
      -8 * scale, -7 * scale,
      0, -12 * scale
    );
    shape.bezierCurveTo(
      8 * scale, -7 * scale,
      14 * scale, 0,
      10 * scale, 5 * scale
    );
    shape.bezierCurveTo(
      5 * scale, 10 * scale,
      0, 3 * scale,
      0, 3 * scale
    );

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
    geo.center();
    return geo;
  }, [scale, depth]);
}

export function ExtrudedStar3D({
  position = [0, 0, 0],
  scale = 1,
  color = "#fde047",
  emissive = "#f59e0b",
  emissiveIntensity = 0.4,
  spin = false,
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  spin?: boolean;
}) {
  const geo = useStarGeometry(0.36, 0.16, 0.09);
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (spin && ref.current) {
      ref.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <mesh ref={ref} geometry={geo} position={position} scale={scale}>
      <meshPhysicalMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        metalness={0.35}
        roughness={0.18}
        clearcoat={0.8}
      />
    </mesh>
  );
}

export function ExtrudedHeart3D({
  position = [0, 0, 0],
  scale = 1,
  color = "#ff6eb4",
  emissive = "#ec4899",
  emissiveIntensity = 0.25,
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  const geo = useHeartGeometry(0.032, 0.12);
  return (
    <mesh geometry={geo} position={position} scale={scale}>
      <meshPhysicalMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.18}
        metalness={0.08}
        clearcoat={0.9}
      />
    </mesh>
  );
}

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
        <mesh key={color}>
          <torusGeometry args={[3.55 - index * 0.2, 0.11, 20, 72, Math.PI]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.22}
            metalness={0.05}
            clearcoat={0.65}
            emissive={color}
            emissiveIntensity={0.14}
          />
        </mesh>
      ))}
      {/* Twin fluffy clouds anchoring the rainbow ends */}
      <FluffyCloud3D position={[-3.05, 0.1, 0.2]} scale={0.62} speed={0.5} tint="#ffffff" />
      <FluffyCloud3D position={[3.05, 0.1, 0.2]} scale={0.62} speed={0.55} tint="#fff5fa" />
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
      initialY + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.12;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.72, 22, 22]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
      <mesh position={[-0.65, -0.14, 0.05]}>
        <sphereGeometry args={[0.52, 20, 20]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
      <mesh position={[0.68, -0.12, 0.04]}>
        <sphereGeometry args={[0.56, 20, 20]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
      <mesh position={[0.25, 0.28, -0.05]}>
        <sphereGeometry args={[0.48, 20, 20]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
      <mesh position={[-0.3, 0.22, -0.04]}>
        <sphereGeometry args={[0.44, 20, 20]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
    </group>
  );
}

// Reusable arched glowing castle window with golden frame
function CastleWindow3D({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Golden arch frame */}
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.05, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.55} roughness={0.22} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.26, 0.2, 0.05]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.55} roughness={0.22} />
      </mesh>
      {/* Glowing warm window glass */}
      <mesh position={[0, 0.08, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.04, 16]} />
        <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.95} />
      </mesh>
      <mesh position={[0, -0.02, 0.02]}>
        <boxGeometry args={[0.19, 0.17, 0.04]} />
        <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.95} />
      </mesh>
      {/* Window sill */}
      <mesh position={[0, -0.13, 0.03]}>
        <boxGeometry args={[0.3, 0.045, 0.08]} />
        <meshStandardMaterial color="#fde68a" metalness={0.4} roughness={0.25} />
      </mesh>
    </group>
  );
}

// Enchanted miniature 3D Fairy Princess Castle with 5 towers, battlements, grand gate & balcony
export function FairyCastle3D({
  position = [0, -0.6, -4.4],
  scale = 0.72,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const mainFlagRef = useRef<THREE.Mesh>(null);
  const leftFlagRef = useRef<THREE.Mesh>(null);
  const rightFlagRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mainFlagRef.current) mainFlagRef.current.rotation.y = Math.sin(t * 3.2) * 0.28;
    if (leftFlagRef.current) leftFlagRef.current.rotation.y = Math.sin(t * 3.5 + 1) * 0.25;
    if (rightFlagRef.current) rightFlagRef.current.rotation.y = Math.sin(t * 3.5 + 2) * 0.25;
  });

  return (
    <group position={position} scale={scale}>
      {/* Fluffy multi-puff pastel cloud island base */}
      <group position={[0, -0.35, 0]}>
        <mesh scale={[2.2, 0.48, 1.4]}>
          <sphereGeometry args={[1.1, 24, 24]} />
          <meshStandardMaterial color="#f8f0ff" roughness={0.55} />
        </mesh>
        <mesh position={[-1.45, -0.08, 0.15]} scale={[1.05, 0.52, 0.9]}>
          <sphereGeometry args={[0.78, 18, 18]} />
          <meshStandardMaterial color="#ffffff" roughness={0.55} />
        </mesh>
        <mesh position={[1.45, -0.08, 0.15]} scale={[1.05, 0.52, 0.9]}>
          <sphereGeometry args={[0.78, 18, 18]} />
          <meshStandardMaterial color="#fff5fa" roughness={0.55} />
        </mesh>
        {/* Soft pastel courtyard terrace */}
        <mesh position={[0, 0.26, 0.15]}>
          <cylinderGeometry args={[1.85, 1.98, 0.18, 32]} />
          <meshPhysicalMaterial color="#fbcfe8" roughness={0.35} clearcoat={0.25} />
        </mesh>
      </group>

      {/* Main Castle Keep */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.85, 1.45, 1.15]} />
        <meshPhysicalMaterial color="#fff4f9" roughness={0.28} clearcoat={0.3} />
      </mesh>

      {/* Golden horizontal cornice molding along top of keep */}
      <mesh position={[0, 1.46, 0.02]}>
        <boxGeometry args={[1.95, 0.09, 1.24]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>

      {/* Castle Battlements (crenellations) across front roofline */}
      {[-0.78, -0.47, -0.16, 0.16, 0.47, 0.78].map((bx) => (
        <mesh key={`bat-${bx}`} position={[bx, 1.6, 0.55]}>
          <boxGeometry args={[0.19, 0.2, 0.14]} />
          <meshPhysicalMaterial color="#ffe4f3" roughness={0.28} clearcoat={0.3} />
        </mesh>
      ))}

      {/* Grand Arched Princess Gate (properly upright!) */}
      <group position={[0, 0.36, 0.58]}>
        {/* Outer golden arch frame */}
        <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.08, 22]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.55} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.68, 0.46, 0.08]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.55} roughness={0.2} />
        </mesh>
        {/* Royal lavender double doors */}
        <mesh position={[0, 0.24, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.06, 20]} />
          <meshPhysicalMaterial color="#a855f7" roughness={0.25} clearcoat={0.5} />
        </mesh>
        <mesh position={[0, 0.02, 0.03]}>
          <boxGeometry args={[0.54, 0.44, 0.06]} />
          <meshPhysicalMaterial color="#a855f7" roughness={0.25} clearcoat={0.5} />
        </mesh>
        {/* Center door seam & golden handles */}
        <mesh position={[0, 0.08, 0.065]}>
          <boxGeometry args={[0.025, 0.56, 0.02]} />
          <meshStandardMaterial color="#fde047" metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[-0.08, 0.05, 0.075]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#fde047" metalness={0.65} roughness={0.2} />
        </mesh>
        <mesh position={[0.08, 0.05, 0.075]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#fde047" metalness={0.65} roughness={0.2} />
        </mesh>
        {/* Cute golden steps leading to the gate */}
        <mesh position={[0, -0.24, 0.14]}>
          <boxGeometry args={[0.76, 0.08, 0.22]} />
          <meshStandardMaterial color="#fef08a" roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.32, 0.26]}>
          <boxGeometry args={[0.88, 0.08, 0.24]} />
          <meshStandardMaterial color="#fde68a" roughness={0.3} />
        </mesh>
        {/* Heart Crest above gate */}
        <ExtrudedHeart3D position={[0, 0.68, 0.04]} scale={0.32} color="#ff6eb4" />
      </group>

      {/* Glowing arched windows on front keep */}
      <CastleWindow3D position={[-0.56, 1.02, 0.58]} scale={0.95} />
      <CastleWindow3D position={[0.56, 1.02, 0.58]} scale={0.95} />

      {/* Center Tall Princess Spire */}
      <group position={[0, 1.98, -0.06]}>
        <mesh>
          <cylinderGeometry args={[0.48, 0.54, 1.65, 24]} />
          <meshPhysicalMaterial color="#ffe8f4" roughness={0.25} clearcoat={0.35} />
        </mesh>
        {/* Golden tower balcony collar */}
        <mesh position={[0, 0.68, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.52, 0.055, 12, 26]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.55} roughness={0.2} />
        </mesh>
        {/* Glowing spire window */}
        <CastleWindow3D position={[0, 0.18, 0.49]} scale={0.95} />
        {/* Glossy lavender conical roof + gold rim */}
        <mesh position={[0, 1.25, 0]}>
          <coneGeometry args={[0.68, 1.25, 24]} />
          <meshPhysicalMaterial color="#c084fc" roughness={0.18} clearcoat={0.75} />
        </mesh>
        <mesh position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.66, 0.035, 10, 26]} />
          <meshStandardMaterial color="#fde047" metalness={0.55} roughness={0.2} />
        </mesh>
        {/* Golden spire finial + waving pink flag */}
        <mesh position={[0, 2.02, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.46, 10]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.65} roughness={0.18} />
        </mesh>
        <mesh position={[0, 1.88, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color="#fde047" metalness={0.65} roughness={0.18} />
        </mesh>
        <mesh ref={mainFlagRef} position={[0.18, 2.12, 0]}>
          <boxGeometry args={[0.34, 0.16, 0.025]} />
          <meshStandardMaterial color="#ff6eb4" emissive="#f472b6" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Left & Right Main Flanking Towers */}
      {[-1.12, 1.12].map((tx, idx) => (
        <group key={tx} position={[tx, 1.02, 0.15]}>
          <mesh>
            <cylinderGeometry args={[0.38, 0.42, 1.9, 22]} />
            <meshPhysicalMaterial color="#f5ebff" roughness={0.26} clearcoat={0.35} />
          </mesh>
          {/* Decorative golden band */}
          <mesh position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.41, 0.04, 10, 22]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.55} roughness={0.2} />
          </mesh>
          {/* Glossy pink & sky-blue roofs */}
          <mesh position={[0, 1.38, 0]}>
            <coneGeometry args={[0.54, 1.0, 22]} />
            <meshPhysicalMaterial
              color={idx === 0 ? "#ff6eb4" : "#7dd3fc"}
              roughness={0.18}
              clearcoat={0.75}
            />
          </mesh>
          {/* Mini spire flagpole & waving pennant */}
          <mesh position={[0, 1.98, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.34, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.65} roughness={0.2} />
          </mesh>
          <mesh
            ref={idx === 0 ? leftFlagRef : rightFlagRef}
            position={[0.13, 2.06, 0]}
          >
            <boxGeometry args={[0.24, 0.12, 0.02]} />
            <meshStandardMaterial color={idx === 0 ? "#fde047" : "#ff6eb4"} />
          </mesh>
          {/* Arched tower windows */}
          <CastleWindow3D position={[0, 0.42, 0.38]} scale={0.82} />
          <CastleWindow3D position={[0, -0.26, 0.4]} scale={0.75} />
        </group>
      ))}

      {/* Outer Mini Princess Turrets */}
      {[-1.72, 1.72].map((ox, idx) => (
        <group key={ox} position={[ox, 0.62, 0.25]}>
          <mesh>
            <cylinderGeometry args={[0.26, 0.29, 1.15, 18]} />
            <meshPhysicalMaterial color="#fff1f7" roughness={0.28} clearcoat={0.3} />
          </mesh>
          <mesh position={[0, 0.88, 0]}>
            <coneGeometry args={[0.37, 0.68, 18]} />
            <meshPhysicalMaterial
              color={idx === 0 ? "#c084fc" : "#ff85c0"}
              roughness={0.18}
              clearcoat={0.7}
            />
          </mesh>
          <mesh position={[0, 1.25, 0]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color="#fde047" metalness={0.65} roughness={0.2} />
          </mesh>
          <CastleWindow3D position={[0, 0.16, 0.26]} scale={0.62} />
        </group>
      ))}

      {/* Tiny pastel blossom bushes flanking the castle gate */}
      {[-0.68, 0.68].map((gx) => (
        <group key={gx} position={[gx, 0.08, 0.86]}>
          <mesh>
            <sphereGeometry args={[0.16, 14, 14]} />
            <meshStandardMaterial color="#86efac" roughness={0.45} />
          </mesh>
          <mesh position={[0.08, 0.08, 0.08]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color="#ff85c0" />
          </mesh>
          <mesh position={[-0.07, 0.1, 0.06]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color="#fde047" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Detailed wrapped 3D Gift Box with satin ribbon & double-loop bow
export function KawaiiGiftBox3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  boxColor = "#ff85c0",
  ribbonColor = "#fde047",
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  boxColor?: string;
  ribbonColor?: string;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Box base */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.56, 0.54, 0.56]} />
        <meshPhysicalMaterial color={boxColor} roughness={0.25} clearcoat={0.45} />
      </mesh>
      {/* Box lid */}
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[0.62, 0.13, 0.62]} />
        <meshPhysicalMaterial color={boxColor} roughness={0.22} clearcoat={0.55} />
      </mesh>
      {/* Vertical crossing ribbons */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.64, 0.64, 0.12]} />
        <meshPhysicalMaterial color={ribbonColor} roughness={0.2} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.12, 0.64, 0.64]} />
        <meshPhysicalMaterial color={ribbonColor} roughness={0.2} clearcoat={0.6} />
      </mesh>
      {/* Cute 3D bow loops on top */}
      <mesh position={[-0.12, 0.72, 0]} rotation={[0, 0, 0.45]}>
        <torusGeometry args={[0.11, 0.036, 12, 20]} />
        <meshPhysicalMaterial color={ribbonColor} roughness={0.2} clearcoat={0.6} />
      </mesh>
      <mesh position={[0.12, 0.72, 0]} rotation={[0, 0, -0.45]}>
        <torusGeometry args={[0.11, 0.036, 12, 20]} />
        <meshPhysicalMaterial color={ribbonColor} roughness={0.2} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color={ribbonColor} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Floating Fairy Magic Wand with beveled 5-point star tip
export function MagicWand3D({
  position = [0, 0, 0],
  rotation = [0, 0, -0.35],
  scale = 1,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = initialY + Math.sin(t * 2.2) * 0.14;
    ref.current.rotation.z = rotation[2] + Math.sin(t * 1.6) * 0.1;
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* Pastel pink wand handle */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.042, 0.032, 1.05, 14]} />
        <meshPhysicalMaterial color="#ff85c0" roughness={0.2} clearcoat={0.7} />
      </mesh>
      {/* Golden collar & pommel */}
      <mesh position={[0, 0.16, 0]}>
        <torusGeometry args={[0.065, 0.022, 10, 18]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.88, 0]}>
        <sphereGeometry args={[0.065, 14, 14]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Glowing 5-pointed star tip */}
      <ExtrudedStar3D position={[0, 0.38, 0]} scale={0.78} color="#fde047" emissive="#f59e0b" emissiveIntensity={0.6} />
    </group>
  );
}

// Adorable 3D Kawaii Bunny Mini-Figurines (My Melody pink & Kuromi purple inspired!)
export function KawaiiBunnyFriend3D({
  variant = "pink",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: {
  variant?: "pink" | "purple";
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const initialY = position[1];
  const isPink = variant === "pink";
  const hoodColor = isPink ? "#ff7ab6" : "#4c1d95";
  const accentColor = isPink ? "#fde047" : "#f472b6";

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = initialY + Math.sin(t * 2.6 + (isPink ? 0 : 2)) * 0.06;
    ref.current.rotation.z = Math.sin(t * 1.9 + (isPink ? 0 : 1.5)) * 0.05;
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* Chubby sitting body */}
      <mesh position={[0, 0.24, 0]} scale={[0.9, 0.95, 0.85]}>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshPhysicalMaterial color={hoodColor} roughness={0.25} clearcoat={0.45} />
      </mesh>
      {/* White belly patch */}
      <mesh position={[0, 0.22, 0.22]} scale={[0.8, 0.9, 0.4]}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color="#fffaf5" roughness={0.4} />
      </mesh>
      {/* Little paws */}
      <mesh position={[-0.22, 0.26, 0.14]}>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshStandardMaterial color="#fffaf5" roughness={0.35} />
      </mesh>
      <mesh position={[0.22, 0.26, 0.14]}>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshStandardMaterial color="#fffaf5" roughness={0.35} />
      </mesh>

      {/* Head & Hood */}
      <group position={[0, 0.68, 0]}>
        <mesh>
          <sphereGeometry args={[0.36, 24, 24]} />
          <meshPhysicalMaterial color={hoodColor} roughness={0.22} clearcoat={0.5} />
        </mesh>
        {/* Cream face oval */}
        <mesh position={[0, -0.02, 0.24]} scale={[1.05, 0.86, 0.55]}>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshStandardMaterial color="#fffaf5" roughness={0.35} />
        </mesh>
        {/* Sparkly Eyes */}
        <mesh position={[-0.12, 0.0, 0.36]}>
          <sphereGeometry args={[0.042, 12, 12]} />
          <meshStandardMaterial color="#2e1065" roughness={0.1} />
        </mesh>
        <mesh position={[0.12, 0.0, 0.36]}>
          <sphereGeometry args={[0.042, 12, 12]} />
          <meshStandardMaterial color="#2e1065" roughness={0.1} />
        </mesh>
        {/* Rosy cheeks */}
        <mesh position={[-0.19, -0.06, 0.33]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={isPink ? "#ffb3d9" : "#e9d5ff"} roughness={0.5} />
        </mesh>
        <mesh position={[0.19, -0.06, 0.33]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={isPink ? "#ffb3d9" : "#e9d5ff"} roughness={0.5} />
        </mesh>
        {/* Tiny button nose */}
        <mesh position={[0, -0.05, 0.38]}>
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshStandardMaterial color={accentColor} roughness={0.3} />
        </mesh>

        {isPink ? (
          <>
            {/* Pink bunny ears (one upright, one cute floppy) */}
            <mesh position={[-0.16, 0.44, 0]} rotation={[0, 0, 0.16]} scale={[0.7, 1.7, 0.55]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshPhysicalMaterial color={hoodColor} roughness={0.22} clearcoat={0.45} />
            </mesh>
            <mesh position={[0.24, 0.34, 0.04]} rotation={[0.1, 0, -0.68]} scale={[0.7, 1.55, 0.55]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshPhysicalMaterial color={hoodColor} roughness={0.22} clearcoat={0.45} />
            </mesh>
            {/* Cute yellow ribbon bow */}
            <mesh position={[0.12, 0.28, 0.25]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.14, 0.08, 0.06]} />
              <meshStandardMaterial color="#fde047" roughness={0.25} />
            </mesh>
            <mesh position={[0.22, 0.24, 0.25]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.14, 0.08, 0.06]} />
              <meshStandardMaterial color="#fde047" roughness={0.25} />
            </mesh>
            <mesh position={[0.17, 0.26, 0.27]}>
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshStandardMaterial color="#f472b6" />
            </mesh>
          </>
        ) : (
          <>
            {/* Purple jester-bunny pointy ears with pink pom-poms */}
            <mesh position={[-0.2, 0.42, 0]} rotation={[0, 0, 0.32]}>
              <coneGeometry args={[0.14, 0.44, 16]} />
              <meshPhysicalMaterial color={hoodColor} roughness={0.22} clearcoat={0.45} />
            </mesh>
            <mesh position={[0.2, 0.42, 0]} rotation={[0, 0, -0.32]}>
              <coneGeometry args={[0.14, 0.44, 16]} />
              <meshPhysicalMaterial color={hoodColor} roughness={0.22} clearcoat={0.45} />
            </mesh>
            <mesh position={[-0.27, 0.62, 0]}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshStandardMaterial color="#f472b6" roughness={0.25} />
            </mesh>
            <mesh position={[0.27, 0.62, 0]}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshStandardMaterial color="#f472b6" roughness={0.25} />
            </mesh>
            {/* Tiny pink heart emblem on forehead */}
            <ExtrudedHeart3D position={[0, 0.21, 0.32]} scale={0.24} color="#f472b6" />
          </>
        )}
      </group>
    </group>
  );
}

// Upgraded glossy toy-vinyl 3D Unicorn with fluttering fairy wings, spiraled golden horn & pastel bow
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
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      if (celebrating) {
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 7)) * 0.45;
        groupRef.current.rotation.y = rotation[1] + Math.sin(t * 4) * 0.45;
      } else {
        groupRef.current.position.y = position[1] + Math.sin(t * 2.4) * 0.07;
        groupRef.current.rotation.z = Math.sin(t * 2) * 0.04;
      }
    }
    const flap = Math.sin(t * (celebrating ? 14 : 6.5)) * 0.35;
    if (leftWingRef.current) leftWingRef.current.rotation.y = -0.35 + flap;
    if (rightWingRef.current) rightWingRef.current.rotation.y = 0.35 - flap;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Chubby glossy white body */}
      <mesh position={[0, 0.36, 0]} scale={[0.92, 0.85, 1.18]}>
        <sphereGeometry args={[0.52, 26, 26]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={0.55} />
      </mesh>

      {/* Soft pastel neck connecting body to head */}
      <mesh position={[0, 0.68, 0.22]} rotation={[-0.25, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.35, 18]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={0.55} />
      </mesh>

      {/* Cute golden collar with heart charm */}
      <mesh position={[0, 0.64, 0.22]} rotation={[Math.PI / 2 - 0.25, 0, 0]}>
        <torusGeometry args={[0.27, 0.035, 12, 24]} />
        <meshStandardMaterial color="#f472b6" roughness={0.25} />
      </mesh>
      <ExtrudedHeart3D position={[0, 0.56, 0.48]} scale={0.26} color="#fde047" />

      {/* Fluttering pearlescent Fairy Wings! */}
      <group ref={leftWingRef} position={[-0.36, 0.54, -0.05]}>
        <mesh position={[-0.26, 0.14, 0]} rotation={[0.15, 0, 0.4]} scale={[1.35, 0.72, 0.18]}>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshPhysicalMaterial
            color="#fbcfe8"
            emissive="#f472b6"
            emissiveIntensity={0.2}
            roughness={0.15}
            clearcoat={0.9}
            transparent
            opacity={0.88}
          />
        </mesh>
        <mesh position={[-0.2, -0.06, 0]} rotation={[0.1, 0, -0.2]} scale={[1.0, 0.55, 0.16]}>
          <sphereGeometry args={[0.2, 14, 14]} />
          <meshPhysicalMaterial
            color="#e9d5ff"
            roughness={0.15}
            clearcoat={0.9}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>
      <group ref={rightWingRef} position={[0.36, 0.54, -0.05]}>
        <mesh position={[0.26, 0.14, 0]} rotation={[0.15, 0, -0.4]} scale={[1.35, 0.72, 0.18]}>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshPhysicalMaterial
            color="#fbcfe8"
            emissive="#f472b6"
            emissiveIntensity={0.2}
            roughness={0.15}
            clearcoat={0.9}
            transparent
            opacity={0.88}
          />
        </mesh>
        <mesh position={[0.2, -0.06, 0]} rotation={[0.1, 0, 0.2]} scale={[1.0, 0.55, 0.16]}>
          <sphereGeometry args={[0.2, 14, 14]} />
          <meshPhysicalMaterial
            color="#e9d5ff"
            roughness={0.15}
            clearcoat={0.9}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* Cute little pastel hooves/legs */}
      {[
        [-0.24, -0.08, 0.28],
        [0.24, -0.08, 0.28],
        [-0.24, -0.08, -0.26],
        [0.24, -0.08, -0.26],
      ].map(([lx, ly, lz], idx) => (
        <group key={idx} position={[lx, ly, lz]}>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.1, 0.11, 0.28, 16]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.22} clearcoat={0.5} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.115, 0.125, 0.095, 16]} />
            <meshPhysicalMaterial color="#f472b6" roughness={0.2} clearcoat={0.7} />
          </mesh>
        </group>
      ))}

      {/* Flowing multi-curl rainbow tail */}
      <mesh position={[0, 0.44, -0.64]}>
        <sphereGeometry args={[0.21, 16, 16]} />
        <meshPhysicalMaterial color="#ff6eb4" roughness={0.25} clearcoat={0.4} />
      </mesh>
      <mesh position={[0.04, 0.3, -0.78]}>
        <sphereGeometry args={[0.19, 16, 16]} />
        <meshPhysicalMaterial color="#c084fc" roughness={0.25} clearcoat={0.4} />
      </mesh>
      <mesh position={[-0.03, 0.17, -0.86]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshPhysicalMaterial color="#7dd3fc" roughness={0.25} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.07, -0.9]}>
        <sphereGeometry args={[0.12, 14, 14]} />
        <meshPhysicalMaterial color="#fde047" roughness={0.25} clearcoat={0.4} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.98, 0.28]}>
        <mesh>
          <sphereGeometry args={[0.44, 26, 26]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={0.55} />
        </mesh>

        {/* Rosy muzzle + tiny nostrils */}
        <mesh position={[0, -0.1, 0.37]} scale={[1.06, 0.78, 0.7]}>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshPhysicalMaterial color="#ffd6ec" roughness={0.28} clearcoat={0.3} />
        </mesh>
        <mesh position={[-0.07, -0.07, 0.52]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
        <mesh position={[0.07, -0.07, 0.52]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>

        {/* Big kawaii eyes + dual star sparkles */}
        <mesh position={[-0.18, 0.05, 0.36]}>
          <sphereGeometry args={[0.074, 18, 18]} />
          <meshPhysicalMaterial color="#2e1065" roughness={0.05} clearcoat={1} />
        </mesh>
        <mesh position={[0.18, 0.05, 0.36]}>
          <sphereGeometry args={[0.074, 18, 18]} />
          <meshPhysicalMaterial color="#2e1065" roughness={0.05} clearcoat={1} />
        </mesh>
        <mesh position={[-0.16, 0.085, 0.42]}>
          <sphereGeometry args={[0.024, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.2, 0.085, 0.42]}>
          <sphereGeometry args={[0.024, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.2, 0.025, 0.42]}>
          <sphereGeometry args={[0.012, 10, 10]} />
          <meshBasicMaterial color="#fbcfe8" />
        </mesh>
        <mesh position={[0.16, 0.025, 0.42]}>
          <sphereGeometry args={[0.012, 10, 10]} />
          <meshBasicMaterial color="#fbcfe8" />
        </mesh>

        {/* Rosy cheeks */}
        <mesh position={[-0.28, -0.05, 0.31]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#ff9ec9" roughness={0.45} />
        </mesh>
        <mesh position={[0.28, -0.05, 0.31]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#ff9ec9" roughness={0.45} />
        </mesh>

        {/* Sculpted Ears with pink inner ear */}
        <group position={[-0.26, 0.38, -0.02]} rotation={[0, 0, 0.36]}>
          <mesh>
            <coneGeometry args={[0.125, 0.3, 16]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.22} clearcoat={0.5} />
          </mesh>
          <mesh position={[0, -0.02, 0.05]}>
            <coneGeometry args={[0.07, 0.2, 12]} />
            <meshStandardMaterial color="#ffb3d9" roughness={0.4} />
          </mesh>
        </group>
        <group position={[0.26, 0.38, -0.02]} rotation={[0, 0, -0.36]}>
          <mesh>
            <coneGeometry args={[0.125, 0.3, 16]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.22} clearcoat={0.5} />
          </mesh>
          <mesh position={[0, -0.02, 0.05]}>
            <coneGeometry args={[0.07, 0.2, 12]} />
            <meshStandardMaterial color="#ffb3d9" roughness={0.4} />
          </mesh>
        </group>

        {/* Spiraled Golden Unicorn Horn */}
        <group position={[0, 0.56, 0.16]} rotation={[0.28, 0, 0]}>
          <mesh>
            <coneGeometry args={[0.095, 0.48, 20]} />
            <meshPhysicalMaterial
              color="#fbbf24"
              metalness={0.55}
              roughness={0.18}
              clearcoat={0.8}
              emissive="#f59e0b"
              emissiveIntensity={0.25}
            />
          </mesh>
          {/* Decorative spiral rings along horn */}
          {[
            [-0.12, 0.082],
            [-0.02, 0.064],
            [0.08, 0.046],
          ].map(([hy, hr], i) => (
            <mesh key={i} position={[0, hy, 0]} rotation={[Math.PI / 2, 0, 0.2]}>
              <torusGeometry args={[hr, 0.015, 8, 18]} />
              <meshStandardMaterial color="#fef08a" metalness={0.6} roughness={0.15} />
            </mesh>
          ))}
        </group>

        {/* Lush Rainbow Mane Curls */}
        <mesh position={[-0.12, 0.38, 0.16]}>
          <sphereGeometry args={[0.145, 16, 16]} />
          <meshPhysicalMaterial color="#ff6eb4" roughness={0.25} clearcoat={0.4} />
        </mesh>
        <mesh position={[0.12, 0.38, 0.16]}>
          <sphereGeometry args={[0.145, 16, 16]} />
          <meshPhysicalMaterial color="#c084fc" roughness={0.25} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 0.33, -0.24]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshPhysicalMaterial color="#7dd3fc" roughness={0.25} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 0.1, -0.37]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshPhysicalMaterial color="#fde047" roughness={0.25} clearcoat={0.4} />
        </mesh>

        {/* Princess Tiara with jewels when celebrating */}
        {celebrating && (
          <group position={[0, 0.42, 0.2]} rotation={[0.15, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.21, 0.04, 12, 24]} />
              <meshStandardMaterial color="#fde047" metalness={0.75} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0.11, 0.16]}>
              <octahedronGeometry args={[0.065, 0]} />
              <meshStandardMaterial color="#ff6eb4" emissive="#ec4899" emissiveIntensity={0.6} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
