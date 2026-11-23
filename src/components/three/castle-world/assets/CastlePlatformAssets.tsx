"use client";

import React, { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { ExtrudedHeart3D, ExtrudedStar3D } from "../../MagicalDecor3D";
import type { Vec3 } from "../types";
import { CASTLE_RAMP, UPPER_CASTLE_Y, UPPER_CASTLE_Z } from "../worldData";

// Reusable fairytale castle tower with pastel marble shaft, glowing arched windows, conical spire & waving flag
function CastleTower3D({
  position,
  radius = 1.35,
  height = 5.4,
  roofColor = "#ff6eb4",
  roofHeight = 2.6,
  flagColor = "#fde047",
}: {
  position: Vec3;
  radius?: number;
  height?: number;
  roofColor?: string;
  roofHeight?: number;
  flagColor?: string;
}) {
  const flagRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3.4 + position[0]) * 0.28;
    }
  });

  return (
    <group position={position}>
      {/* Tower marble base plinth */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[radius + 0.16, radius + 0.24, 0.5, 22]} />
        <meshPhysicalMaterial color="#f3e8ff" roughness={0.32} clearcoat={0.25} />
      </mesh>
      {/* Main cylindrical tower body */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius + 0.08, height, 22]} />
        <meshPhysicalMaterial color="#fff5fa" roughness={0.28} clearcoat={0.32} />
      </mesh>
      {/* Golden cornice ring under roof */}
      <mesh position={[0, height + 0.05, 0]}>
        <cylinderGeometry args={[radius + 0.18, radius + 0.12, 0.26, 22]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>
      {/* Glowing arched windows (front & inner side) */}
      {[0, Math.PI / 2, -Math.PI / 2].map((angle, i) => (
        <group
          key={`win-${i}`}
          position={[
            Math.sin(angle) * (radius + 0.02),
            height * 0.62,
            Math.cos(angle) * (radius + 0.02),
          ]}
          rotation={[0, angle, 0]}
        >
          <mesh>
            <boxGeometry args={[0.48, 0.72, 0.08]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.02, 0.03]}>
            <boxGeometry args={[0.34, 0.56, 0.06]} />
            <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.95} />
          </mesh>
        </group>
      ))}
      {/* Conical fairytale spire roof */}
      <mesh position={[0, height + 0.18 + roofHeight / 2, 0]}>
        <coneGeometry args={[radius + 0.34, roofHeight, 24]} />
        <meshPhysicalMaterial color={roofColor} roughness={0.22} clearcoat={0.62} />
      </mesh>
      {/* Golden finial pole + waving pennant flag */}
      <mesh position={[0, height + roofHeight + 0.55, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.9, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, height + roofHeight + 1.02, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#fde047" emissive="#fbbf24" emissiveIntensity={0.6} />
      </mesh>
      <mesh
        ref={flagRef}
        position={[0.36, height + roofHeight + 0.72, 0]}
        rotation={[0, 0, -0.06]}
      >
        <boxGeometry args={[0.68, 0.32, 0.04]} />
        <meshStandardMaterial color={flagColor} roughness={0.35} />
      </mesh>
    </group>
  );
}

// Perimeter castle wall with pink/gold cornice and crenellated battlements
function CastleWallSegment3D({
  position,
  length,
  rotationY = 0,
  height = 2.6,
}: {
  position: Vec3;
  length: number;
  rotationY?: number;
  height?: number;
}) {
  const merlons = useMemo(() => {
    const count = Math.max(3, Math.floor(length / 1.35));
    return Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * (length / count));
  }, [length]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main marble wall */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[length, height, 0.85]} />
        <meshPhysicalMaterial color="#fff4f9" roughness={0.3} clearcoat={0.25} />
      </mesh>
      {/* Pastel lavender lower dado trim */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[length + 0.04, 0.64, 0.94]} />
        <meshStandardMaterial color="#f3e8ff" roughness={0.4} />
      </mesh>
      {/* Golden cornice molding */}
      <mesh position={[0, height + 0.08, 0]}>
        <boxGeometry args={[length + 0.08, 0.18, 1.02]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>
      {/* Battlements / crenellations */}
      {merlons.map((mx, idx) => (
        <mesh key={`merlon-${idx}`} position={[mx, height + 0.42, 0]}>
          <boxGeometry args={[0.68, 0.52, 0.88]} />
          <meshPhysicalMaterial color="#ffe4f3" roughness={0.28} clearcoat={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Decorative pastel & gold royal overlook balcony railing
function BalconyRailing3D({
  position,
  length,
}: {
  position: Vec3;
  length: number;
}) {
  const posts = useMemo(() => {
    const count = Math.max(3, Math.round(length / 1.8) + 1);
    return Array.from({ length: count }, (_, i) => (i / (count - 1) - 0.5) * length);
  }, [length]);

  return (
    <group position={position}>
      {/* Top pink marble handrail + mid gold bar */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[length + 0.2, 0.12, 0.18]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[length + 0.1, 0.1, 0.12]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>
      {posts.map((px, idx) => (
        <group key={`bpost-${idx}`} position={[px, 0, 0]}>
          <mesh position={[0, 0.44, 0]}>
            <cylinderGeometry args={[0.1, 0.13, 0.88, 12]} />
            <meshPhysicalMaterial color="#fff5fa" roughness={0.28} clearcoat={0.35} />
          </mesh>
          {(idx === 0 || idx === posts.length - 1 || idx % 2 === 0) && (
            <mesh position={[0, 0.98, 0]}>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#fbbf24"
                emissiveIntensity={0.95}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

// Royal Princess Throne & Birthday Star Gazebo on the Upper Royal Castle Terrace
function RoyalThroneGazebo3D({ position }: { position: Vec3 }) {
  const pillarOffsets: [number, number][] = [
    [-1.55, -1.55],
    [1.55, -1.55],
    [-1.55, 1.55],
    [1.55, 1.55],
  ];

  return (
    <group position={position}>
      {/* Two-tiered circular marble & gold dais */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[2.35, 2.55, 0.32, 32]} />
        <meshPhysicalMaterial color="#fff1f7" roughness={0.25} clearcoat={0.38} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[1.95, 2.08, 0.24, 32]} />
        <meshPhysicalMaterial color="#fbcfe8" roughness={0.28} clearcoat={0.35} />
      </mesh>
      <mesh position={[0, 0.49, 0]}>
        <cylinderGeometry args={[1.98, 1.98, 0.05, 32]} />
        <meshStandardMaterial color="#fde047" metalness={0.5} roughness={0.25} />
      </mesh>

      {/* 4 Slender Royal Gazebo Pillars */}
      {pillarOffsets.map(([px, pz], i) => (
        <group key={`gp-${i}`} position={[px, 0.48, pz]}>
          <mesh position={[0, 1.65, 0]}>
            <cylinderGeometry args={[0.13, 0.16, 3.3, 14]} />
            <meshPhysicalMaterial color="#fff5fa" roughness={0.25} clearcoat={0.4} />
          </mesh>
          <mesh position={[0, 3.32, 0]}>
            <cylinderGeometry args={[0.22, 0.14, 0.2, 14]} />
            <meshStandardMaterial color="#fde047" metalness={0.5} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Scalloped Pink & Gold Gazebo Dome Canopy */}
      <mesh position={[0, 3.92, 0]}>
        <cylinderGeometry args={[2.35, 2.42, 0.26, 28]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>
      <mesh position={[0, 4.75, 0]}>
        <coneGeometry args={[2.45, 1.55, 28]} />
        <meshPhysicalMaterial color="#ff6eb4" roughness={0.2} clearcoat={0.7} />
      </mesh>
      <ExtrudedStar3D
        position={[0, 5.95, 0]}
        scale={0.92}
        color="#fde047"
        emissive="#f59e0b"
        emissiveIntensity={0.6}
        spin
      />

      {/* Plush Princess Throne Chair at center of dais */}
      <group position={[0, 0.5, -0.25]}>
        {/* Golden seat base + pink velvet cushion */}
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[1.25, 0.58, 1.0]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.65, 0.04]}>
          <boxGeometry args={[1.05, 0.2, 0.88]} />
          <meshPhysicalMaterial color="#ff5fa2" roughness={0.35} clearcoat={0.3} />
        </mesh>
        {/* High royal backrest */}
        <mesh position={[0, 1.42, -0.42]}>
          <boxGeometry args={[1.22, 1.75, 0.22]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.42, -0.3]}>
          <boxGeometry args={[0.98, 1.48, 0.14]} />
          <meshPhysicalMaterial color="#ff6eb4" roughness={0.3} clearcoat={0.35} />
        </mesh>
        {/* Armrests */}
        <mesh position={[-0.58, 0.82, 0.04]}>
          <boxGeometry args={[0.18, 0.22, 0.96]} />
          <meshStandardMaterial color="#fde047" metalness={0.5} roughness={0.25} />
        </mesh>
        <mesh position={[0.58, 0.82, 0.04]}>
          <boxGeometry args={[0.18, 0.22, 0.96]} />
          <meshStandardMaterial color="#fde047" metalness={0.5} roughness={0.25} />
        </mesh>
        {/* Heart crest atop throne */}
        <ExtrudedHeart3D
          position={[0, 2.52, -0.35]}
          scale={0.52}
          color="#ff6eb4"
          emissive="#ec4899"
          emissiveIntensity={0.4}
        />
      </group>
    </group>
  );
}

// Grand Sloped Royal Ramp connecting Lower Castle Courtyard (z = -36.5, y = 0) to Upper Castle Terrace (z = -42.5, y = 2.6)
export function RoyalCastleRamp3D({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const width = 5.6;
  const run = CASTLE_RAMP.startZ - CASTLE_RAMP.endZ; // 6.0
  const rise = CASTLE_RAMP.endY - CASTLE_RAMP.startY; // 2.6
  const slopeLength = Math.hypot(run, rise);
  const slopeAngle = Math.atan2(rise, run);
  const midZ = (CASTLE_RAMP.startZ + CASTLE_RAMP.endZ) / 2; // -39.5
  const midY = (CASTLE_RAMP.startY + CASTLE_RAMP.endY) / 2; // 1.3

  // Solid triangular marble wedge underneath so there is zero gap below the ramp
  const wedgeGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(run, 0);
    shape.lineTo(run, rise);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: width,
      bevelEnabled: false,
    });
  }, [run, rise, width]);

  const railPostFractions = [0.06, 0.37, 0.68, 0.96];

  return (
    <group>
      {/* Clickable solid pastel marble ramp wedge (exact x ∈ [-2.8, 2.8], z ∈ [-42.5, -36.5]) */}
      <mesh
        geometry={wedgeGeo}
        position={[-width / 2, 0, CASTLE_RAMP.startZ]}
        rotation={[0, Math.PI / 2, 0]}
        onPointerDown={onGroundClick}
        receiveShadow
      >
        <meshPhysicalMaterial color="#fff1f7" roughness={0.28} clearcoat={0.35} />
      </mesh>

      {/* Sloped royal pink & gold carpet runner — sits cleanly proud of the slope with zero Z-fighting */}
      <group position={[0, midY, midZ]} rotation={[slopeAngle, 0, 0]}>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[2.95, 0.01, slopeLength]} />
          <meshStandardMaterial color="#fde047" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.026, 0]} onPointerDown={onGroundClick}>
          <boxGeometry args={[2.6, 0.014, slopeLength]} />
          <meshStandardMaterial color="#ff6eb4" roughness={0.5} />
        </mesh>
      </group>

      {/* Sloped pastel & gold side railings with glowing fairy orbs */}
      {[-2.68, 2.68].map((rx) => (
        <group key={`rrail-${rx}`}>
          {/* Sloped handrails */}
          <group position={[rx, midY, midZ]} rotation={[slopeAngle, 0, 0]}>
            <mesh position={[0, 0.72, 0]}>
              <boxGeometry args={[0.18, 0.12, slopeLength]} />
              <meshStandardMaterial color="#fbcfe8" roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.38, 0]}>
              <boxGeometry args={[0.12, 0.1, slopeLength]} />
              <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
            </mesh>
          </group>
          {/* Vertical baluster posts along the slope */}
          {railPostFractions.map((frac, idx) => {
            const pz = CASTLE_RAMP.startZ - run * frac;
            const py = CASTLE_RAMP.startY + rise * frac;
            return (
              <group key={`rpost-${rx}-${idx}`} position={[rx, py, pz]}>
                <mesh position={[0, 0.44, 0]}>
                  <cylinderGeometry args={[0.11, 0.14, 0.88, 12]} />
                  <meshPhysicalMaterial color="#fff5fa" roughness={0.28} clearcoat={0.35} />
                </mesh>
                <mesh position={[0, 0.98, 0]}>
                  <sphereGeometry args={[0.15, 12, 12]} />
                  <meshStandardMaterial
                    color="#fef08a"
                    emissive="#fbbf24"
                    emissiveIntensity={1.0}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// Walkable Royal Bridge connecting the Main Grass Island (z = -17) to the Royal Castle Platform (z = -24.5)
export function RoyalBridge3D({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const postZs = [-17.4, -19.1, -20.8, -22.5, -24.2];

  return (
    <group>
      {/* Clickable pastel marble bridge deck — butts cleanly between grass (z = -17.0) and castle (z = -24.5) */}
      <mesh position={[0, -0.18, -20.75]} onPointerDown={onGroundClick} receiveShadow>
        <boxGeometry args={[5.4, 0.36, 7.5]} />
        <meshPhysicalMaterial color="#fff1f7" roughness={0.28} clearcoat={0.35} />
      </mesh>

      {/* Golden & lavender underside support arch beams */}
      <mesh position={[0, -0.56, -20.75]}>
        <boxGeometry args={[4.9, 0.44, 7.4]} />
        <meshStandardMaterial color="#e9d5ff" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.38, -20.75]}>
        <boxGeometry args={[5.55, 0.14, 7.48]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>

      {/* Royal pink & gold carpet runner across the bridge (exact z ∈ [-24.5, -17.0], zero overlap!) */}
      <mesh position={[0, 0.026, -20.75]} onPointerDown={onGroundClick}>
        <boxGeometry args={[2.6, 0.014, 7.5]} />
        <meshStandardMaterial color="#ff6eb4" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.02, -20.75]}>
        <boxGeometry args={[2.95, 0.01, 7.5]} />
        <meshStandardMaterial color="#fde047" roughness={0.4} />
      </mesh>

      {/* Left & right pastel bridge railings with glowing fairy orbs */}
      {[-2.52, 2.52].map((rx) => (
        <group key={`rail-${rx}`}>
          {/* Top & mid handrails */}
          <mesh position={[rx, 0.72, -20.8]}>
            <boxGeometry args={[0.18, 0.12, 7.6]} />
            <meshStandardMaterial color="#fbcfe8" roughness={0.35} />
          </mesh>
          <mesh position={[rx, 0.38, -20.8]}>
            <boxGeometry args={[0.12, 0.1, 7.6]} />
            <meshStandardMaterial color="#fde68a" metalness={0.4} roughness={0.25} />
          </mesh>
          {/* Baluster posts + glowing fairy orbs */}
          {postZs.map((pz) => (
            <group key={`post-${rx}-${pz}`} position={[rx, 0, pz]}>
              <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.12, 0.15, 0.9, 12]} />
                <meshPhysicalMaterial color="#fff5fa" roughness={0.28} clearcoat={0.35} />
              </mesh>
              <mesh position={[0, 1.02, 0]}>
                <sphereGeometry args={[0.17, 14, 14]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#fbbf24"
                  emissiveIntensity={1.05}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

// Two-Level Floating Royal Castle Platform:
// Lower Courtyard (y = 0, z ∈ [-42.5, -24.5]) + Sloped Royal Ramp + Upper Royal Terrace (y = 2.6, z ∈ [-58.5, -42.5])
export function RoyalCastlePlatform3D({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const cloudPuffs: [number, number, number, number][] = [
    [-13.5, -2.5, -26.5, 2.6],
    [13.5, -2.5, -26.5, 2.6],
    [-14.2, -2.6, -34.5, 2.9],
    [14.2, -2.6, -34.5, 2.9],
    [-14.2, -2.5, -44.0, 3.0],
    [14.2, -2.5, -44.0, 3.0],
    [-13.4, -2.5, -55.5, 2.9],
    [13.4, -2.5, -55.5, 2.9],
    [0, -3.1, -58.0, 3.4],
    [-5.5, -2.9, -25.2, 2.4],
    [5.5, -2.9, -25.2, 2.4],
  ];

  return (
    <group>
      {/* === LOWER CASTLE COURTYARD DECK (30 × 18, z ∈ [-42.5, -24.5], y = 0) === */}
      <mesh position={[0, -0.25, -33.5]} onPointerDown={onGroundClick} receiveShadow>
        <boxGeometry args={[30, 0.5, 18.0]} />
        <meshPhysicalMaterial color="#fff5fa" roughness={0.35} clearcoat={0.22} />
      </mesh>
      {/* Lower inlaid lavender courtyard mosaic border */}
      <mesh position={[0, 0.01, -33.5]} onPointerDown={onGroundClick}>
        <boxGeometry args={[24.5, 0.008, 14.5]} />
        <meshStandardMaterial color="#f5e9ff" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.015, -33.5]} onPointerDown={onGroundClick}>
        <boxGeometry args={[22.6, 0.008, 12.6]} />
        <meshStandardMaterial color="#fff8fc" roughness={0.4} />
      </mesh>

      {/* Lower Royal Pink & Gold Carpet (exact z ∈ [-36.5, -24.5], butts cleanly with Bridge & Ramp!) */}
      <mesh position={[0, 0.026, -30.5]} onPointerDown={onGroundClick}>
        <boxGeometry args={[2.6, 0.014, 12.0]} />
        <meshStandardMaterial color="#ff6eb4" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.02, -30.5]}>
        <boxGeometry args={[2.95, 0.01, 12.0]} />
        <meshStandardMaterial color="#fde047" roughness={0.4} />
      </mesh>

      {/* === UPPER ROYAL CASTLE TERRACE (30 × 16, z ∈ [-58.5, -42.5], y = 2.6) === */}
      {/* Top pastel marble floor slab */}
      <mesh
        position={[0, UPPER_CASTLE_Y - 0.25, -50.5]}
        onPointerDown={onGroundClick}
        receiveShadow
      >
        <boxGeometry args={[30, 0.5, 16.0]} />
        <meshPhysicalMaterial color="#fff5fa" roughness={0.35} clearcoat={0.22} />
      </mesh>
      {/* Solid lavender marble riser cliff supporting upper terrace from y = -0.5 to y = 2.1 */}
      <mesh position={[0, 0.8, -50.5]}>
        <boxGeometry args={[29.8, 2.6, 15.8]} />
        <meshPhysicalMaterial color="#f3e8ff" roughness={0.42} clearcoat={0.18} />
      </mesh>
      {/* Golden cornice trim along the front upper terrace cliff face (z = -42.5) */}
      <mesh position={[-8.85, UPPER_CASTLE_Y - 0.52, UPPER_CASTLE_Z + 0.02]}>
        <boxGeometry args={[12.3, 0.16, 0.18]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>
      <mesh position={[8.85, UPPER_CASTLE_Y - 0.52, UPPER_CASTLE_Z + 0.02]}>
        <boxGeometry args={[12.3, 0.16, 0.18]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>

      {/* Upper inlaid courtyard mosaic border */}
      <mesh position={[0, UPPER_CASTLE_Y + 0.01, -50.5]} onPointerDown={onGroundClick}>
        <boxGeometry args={[24.5, 0.008, 12.5]} />
        <meshStandardMaterial color="#f5e9ff" roughness={0.45} />
      </mesh>
      <mesh position={[0, UPPER_CASTLE_Y + 0.015, -50.5]} onPointerDown={onGroundClick}>
        <boxGeometry args={[22.6, 0.008, 10.6]} />
        <meshStandardMaterial color="#fff8fc" roughness={0.4} />
      </mesh>

      {/* Upper Royal Pink & Gold Carpet (exact z ∈ [-51.5, -42.5], butts cleanly with Ramp top!) */}
      <mesh position={[0, UPPER_CASTLE_Y + 0.026, -47.0]} onPointerDown={onGroundClick}>
        <boxGeometry args={[2.6, 0.014, 9.0]} />
        <meshStandardMaterial color="#ff6eb4" roughness={0.5} />
      </mesh>
      <mesh position={[0, UPPER_CASTLE_Y + 0.02, -47.0]}>
        <boxGeometry args={[2.95, 0.01, 9.0]} />
        <meshStandardMaterial color="#fde047" roughness={0.4} />
      </mesh>

      {/* Upper Front Overlook Balcony Railings (left & right of the sloped ramp) */}
      <BalconyRailing3D position={[-7.9, UPPER_CASTLE_Y, UPPER_CASTLE_Z - 0.18]} length={9.6} />
      <BalconyRailing3D position={[7.9, UPPER_CASTLE_Y, UPPER_CASTLE_Z - 0.18]} length={9.6} />

      {/* === GRAND SLOPED ROYAL RAMP (z ∈ [-42.5, -36.5], y: 0 -> 2.6) === */}
      <RoyalCastleRamp3D onGroundClick={onGroundClick} />

      {/* === EXTENDED FLOATING FAIRYTALE CLIFF UNDERSIDE (z ∈ [-58.5, -24.5]) === */}
      <mesh position={[0, -1.5, -41.5]}>
        <boxGeometry args={[29.2, 2.0, 33.2]} />
        <meshStandardMaterial color="#e9d5ff" roughness={0.72} />
      </mesh>
      <mesh position={[0, -2.95, -41.5]}>
        <boxGeometry args={[28.0, 0.9, 32.0]} />
        <meshStandardMaterial color="#c084fc" roughness={0.78} />
      </mesh>

      {/* Fluffy pastel clouds tucked around the floating castle underside */}
      {cloudPuffs.map(([cx, cy, cz, cr], idx) => (
        <mesh key={`ccloud-${idx}`} position={[cx, cy, cz]} scale={[1.35, 0.62, 1.25]}>
          <sphereGeometry args={[cr, 18, 18]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#ffffff" : "#fff0f7"}
            roughness={0.6}
          />
        </mesh>
      ))}

      {/* === GRAND OPEN CASTLE GATEHOUSE (South Entrance at z = -25.0, y = 0) === */}
      <CastleTower3D
        position={[-4.2, 0, -25.0]}
        radius={1.35}
        height={5.4}
        roofColor="#ff6eb4"
        roofHeight={2.6}
        flagColor="#fde047"
      />
      <CastleTower3D
        position={[4.2, 0, -25.0]}
        radius={1.35}
        height={5.4}
        roofColor="#c084fc"
        roofHeight={2.6}
        flagColor="#fde047"
      />

      {/* Wide Open Golden Gatehouse Archway overhead (x ∈ [-2.8, 2.8], y = 4.2 clear!) */}
      <group position={[0, 0, -25.0]}>
        <mesh position={[0, 4.45, 0]}>
          <boxGeometry args={[6.2, 0.95, 1.2]} />
          <meshPhysicalMaterial color="#fff4f9" roughness={0.28} clearcoat={0.32} />
        </mesh>
        <mesh position={[0, 4.98, 0]}>
          <boxGeometry args={[6.4, 0.2, 1.32]} />
          <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
        </mesh>
        {/* Decorative golden arch rib framing the open walkthrough */}
        <mesh position={[0, 3.65, 0.52]}>
          <torusGeometry args={[2.65, 0.16, 12, 32, Math.PI]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.55} roughness={0.22} />
        </mesh>
        {/* Gatehouse battlements */}
        {[-2.2, -1.1, 0, 1.1, 2.2].map((bx) => (
          <mesh key={`gbat-${bx}`} position={[bx, 5.32, 0]}>
            <boxGeometry args={[0.62, 0.48, 1.1]} />
            <meshPhysicalMaterial color="#ffe4f3" roughness={0.28} clearcoat={0.3} />
          </mesh>
        ))}
        {/* Pink Heart Royal Crest above the Gate */}
        <ExtrudedHeart3D
          position={[0, 5.95, 0.45]}
          scale={0.78}
          color="#ff6eb4"
          emissive="#ec4899"
          emissiveIntensity={0.42}
        />
      </group>

      {/* === PERIMETER CASTLE WALLS (Lower + Stepped Upper Level) === */}
      {/* South flanking walls (y = 0) */}
      <CastleWallSegment3D position={[-9.0, 0, -25.0]} length={8.6} />
      <CastleWallSegment3D position={[9.0, 0, -25.0]} length={8.6} />
      {/* Lower West & East courtyard walls (y = 0, z ∈ [-42.5, -25.0]) */}
      <CastleWallSegment3D position={[-13.8, 0, -33.75]} length={17.5} rotationY={Math.PI / 2} />
      <CastleWallSegment3D position={[13.8, 0, -33.75]} length={17.5} rotationY={Math.PI / 2} />
      {/* Upper West & East terrace walls (y = 2.6, z ∈ [-57.5, -42.5]) */}
      <CastleWallSegment3D
        position={[-13.8, UPPER_CASTLE_Y, -50.0]}
        length={15.0}
        rotationY={Math.PI / 2}
      />
      <CastleWallSegment3D
        position={[13.8, UPPER_CASTLE_Y, -50.0]}
        length={15.0}
        rotationY={Math.PI / 2}
      />
      {/* Upper North back wall (y = 2.6, z = -57.5) */}
      <CastleWallSegment3D
        position={[0, UPPER_CASTLE_Y, -57.5]}
        length={27.2}
        height={3.2}
      />

      {/* === LOWER SOUTH CORNER TOWERS (y = 0) === */}
      <CastleTower3D
        position={[-13.8, 0, -25.0]}
        radius={1.45}
        height={5.0}
        roofColor="#ff6eb4"
        roofHeight={2.5}
        flagColor="#7dd3fc"
      />
      <CastleTower3D
        position={[13.8, 0, -25.0]}
        radius={1.45}
        height={5.0}
        roofColor="#c084fc"
        roofHeight={2.5}
        flagColor="#ff85c0"
      />

      {/* === MID-TERRACE STEP-UP TOWERS (frame the lower-to-upper wall transition at z = -42.5) === */}
      <CastleTower3D
        position={[-13.8, 0, UPPER_CASTLE_Z]}
        radius={1.4}
        height={6.6}
        roofColor="#fde047"
        roofHeight={2.6}
        flagColor="#ff6eb4"
      />
      <CastleTower3D
        position={[13.8, 0, UPPER_CASTLE_Z]}
        radius={1.4}
        height={6.6}
        roofColor="#7dd3fc"
        roofHeight={2.6}
        flagColor="#c084fc"
      />

      {/* === UPPER NORTH CORNER TOWERS (sitting cleanly on y = 2.6 at z = -57.5) === */}
      <CastleTower3D
        position={[-13.8, UPPER_CASTLE_Y, -57.5]}
        radius={1.6}
        height={6.4}
        roofColor="#7dd3fc"
        roofHeight={3.2}
        flagColor="#fde047"
      />
      <CastleTower3D
        position={[13.8, UPPER_CASTLE_Y, -57.5]}
        radius={1.6}
        height={6.4}
        roofColor="#ff6eb4"
        roofHeight={3.2}
        flagColor="#fde047"
      />

      {/* === 2 GRAND TALL ROYAL SPIRES FLANKING THE UPPER THRONE BACKDROP === */}
      <CastleTower3D
        position={[-5.8, UPPER_CASTLE_Y, -57.2]}
        radius={1.7}
        height={7.8}
        roofColor="#c084fc"
        roofHeight={3.8}
        flagColor="#ff6eb4"
      />
      <CastleTower3D
        position={[5.8, UPPER_CASTLE_Y, -57.2]}
        radius={1.7}
        height={7.8}
        roofColor="#7dd3fc"
        roofHeight={3.8}
        flagColor="#fde047"
      />

      {/* === ROYAL PRINCESS THRONE & BIRTHDAY STAR GAZEBO (Upper Terrace Center) === */}
      <RoyalThroneGazebo3D position={[0, UPPER_CASTLE_Y, -53.2]} />
    </group>
  );
}
