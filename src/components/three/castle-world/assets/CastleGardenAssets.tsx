"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "../landFrame";
import * as THREE from "three";
import { ExtrudedHeart3D, ExtrudedStar3D } from "../../MagicalDecor3D";
import type { Vec3 } from "../types";

// Attractions of the grand Royal Castle: Heart Rose Garden, Pony Carousel, Birthday Cake,
// Royal Crown pedestal and Swan Pond. Simple meshes; repeated small parts are instanced.

/** Writes per-instance transforms (and optional colors) into an InstancedMesh once. */
function useInstanceLayout(
  ref: React.RefObject<THREE.InstancedMesh | null>,
  items: { pos: Vec3; scale?: Vec3; color?: string }[]
) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const c = new THREE.Color();
    items.forEach((it, i) => {
      const s = it.scale ?? [1, 1, 1];
      m.compose(new THREE.Vector3(...it.pos), q, new THREE.Vector3(...s));
      mesh.setMatrixAt(i, m);
      if (it.color) mesh.setColorAt(i, c.set(it.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, items]);
}

// Classic heart curve, scaled to ~4.3 wide × 3.9 deep; lobes point north (−z) once laid flat
function heartPoint(t: number, s: number): [number, number] {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [x * s, (y + 2.5) * s];
}

// Flat heart-shaped lawn outlined by a hedge of roses. Walkable (the star floats above its middle).
export function HeartRoseBed3D({ position }: { position: Vec3 }) {
  const scale = 0.135;
  const lawnGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const n = 48;
    for (let i = 0; i <= n; i++) {
      const [x, y] = heartPoint((i / n) * Math.PI * 2, scale);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    return new THREE.ShapeGeometry(shape, 24);
  }, []);

  const roses = useMemo(() => {
    const colors = ["#ff6eb4", "#f43f5e", "#ffffff", "#ff85c0"];
    const n = 30;
    return Array.from({ length: n }, (_, i) => {
      const [x, y] = heartPoint((i / n) * Math.PI * 2, scale * 1.04);
      return { pos: [x, 0.34, -y] as Vec3, color: colors[i % colors.length] };
    });
  }, []);
  const leaves = useMemo(
    () => roses.map((r) => ({ pos: [r.pos[0], 0.16, r.pos[2]] as Vec3, scale: [1, 0.7, 1] as Vec3 })),
    [roses]
  );

  const roseRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);
  useInstanceLayout(roseRef, roses);
  useInstanceLayout(leafRef, leaves);

  return (
    <group position={position}>
      <mesh geometry={lawnGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <meshStandardMaterial color="#86efac" roughness={0.6} />
      </mesh>
      <instancedMesh ref={leafRef} args={[undefined, undefined, leaves.length]}>
        <sphereGeometry args={[0.3, 10, 8]} />
        <meshStandardMaterial color="#16a34a" roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={roseRef} args={[undefined, undefined, roses.length]}>
        <sphereGeometry args={[0.19, 10, 8]} />
        <meshPhysicalMaterial roughness={0.3} clearcoat={0.4} />
      </instancedMesh>
    </group>
  );
}

// Round clipped topiary in a marble pot (two stacked green balls)
export function Topiary3D({
  position,
  color = "#4ade80",
}: {
  position: Vec3;
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.42, 0.32, 0.6, 14]} />
        <meshPhysicalMaterial color="#fff5fa" roughness={0.3} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.7, 8]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 2.22, 0]}>
        <sphereGeometry args={[0.36, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
    </group>
  );
}

const PONY_COLORS = ["#ffffff", "#fbcfe8", "#e9d5ff", "#bae6fd", "#fef08a", "#fecdd3"];
const PONY_SADDLES = ["#ff6eb4", "#c084fc", "#7dd3fc", "#fde047", "#ff85c0", "#a78bfa"];

// Little unicorn pony on a golden carousel pole
function CarouselPony3D({ color, saddle }: { color: string; saddle: string }) {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.24, 0.5, 4, 10]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.36, 0.08, 0.5]} />
        <meshStandardMaterial color={saddle} roughness={0.4} />
      </mesh>
      <mesh position={[0.46, 0.3, 0]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.15, 0.3, 4, 10]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.4} />
      </mesh>
      <mesh position={[0.6, 0.55, 0]} rotation={[0, 0, -0.9]}>
        <coneGeometry args={[0.05, 0.28, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.25} />
      </mesh>
      {[-0.22, 0.22].map((lx) => (
        <mesh key={lx} position={[lx, -0.32, 0]} rotation={[0, 0, lx > 0 ? -0.5 : 0.5]}>
          <cylinderGeometry args={[0.06, 0.05, 0.36, 6]} />
          <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// Slowly turning pony carousel with bobbing unicorn ponies
export function RoyalCarousel3D({ position }: { position: Vec3 }) {
  const spinRef = useRef<THREE.Group>(null);
  const ponyRefs = useRef<(THREE.Group | null)[]>([]);
  const ponyCount = 6;
  const ponyRadius = 1.75;

  const scallops = useMemo(() => {
    const n = 16;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return {
        pos: [Math.cos(a) * 2.78, 3.42, Math.sin(a) * 2.78] as Vec3,
        color: i % 2 === 0 ? "#ff6eb4" : "#ffffff",
      };
    });
  }, []);
  const scallopRef = useRef<THREE.InstancedMesh>(null);
  useInstanceLayout(scallopRef, scallops);

  useFrame((state, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += Math.min(delta, 0.05) * 0.55;
    const t = state.clock.elapsedTime;
    ponyRefs.current.forEach((p, i) => {
      if (p) p.position.y = 1.45 + Math.sin(t * 2.2 + i * 1.3) * 0.28;
    });
  });

  return (
    <group position={position}>
      {/* Round platform with golden rim */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[2.6, 2.7, 0.36, 32]} />
        <meshPhysicalMaterial color="#fbcfe8" roughness={0.3} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[2.62, 2.62, 0.04, 32]} />
        <meshStandardMaterial color="#fde047" metalness={0.45} roughness={0.25} />
      </mesh>
      {/* Center column */}
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.42, 0.48, 3.2, 16]} />
        <meshPhysicalMaterial color="#e9d5ff" roughness={0.3} clearcoat={0.4} />
      </mesh>

      {/* Turning ring of ponies */}
      <group ref={spinRef}>
        {Array.from({ length: ponyCount }, (_, i) => {
          const a = (i / ponyCount) * Math.PI * 2;
          const x = Math.cos(a) * ponyRadius;
          const z = Math.sin(a) * ponyRadius;
          return (
            <group key={`pony-${i}`} position={[x, 0, z]} rotation={[0, Math.PI / 2 - a, 0]}>
              <mesh position={[0, 1.9, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 3.1, 8]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.55} roughness={0.22} />
              </mesh>
              <group
                ref={(el) => {
                  ponyRefs.current[i] = el;
                }}
                position={[0, 1.45, 0]}
              >
                <CarouselPony3D
                  color={PONY_COLORS[i % PONY_COLORS.length]}
                  saddle={PONY_SADDLES[i % PONY_SADDLES.length]}
                />
              </group>
            </group>
          );
        })}
      </group>

      {/* Striped canopy roof */}
      <mesh position={[0, 3.55, 0]}>
        <cylinderGeometry args={[2.85, 2.85, 0.3, 32]} />
        <meshStandardMaterial color="#fde68a" metalness={0.4} roughness={0.3} />
      </mesh>
      <instancedMesh ref={scallopRef} args={[undefined, undefined, scallops.length]}>
        <sphereGeometry args={[0.32, 10, 8]} />
        <meshStandardMaterial roughness={0.4} />
      </instancedMesh>
      <mesh position={[0, 4.45, 0]}>
        <coneGeometry args={[3.0, 1.6, 32]} />
        <meshPhysicalMaterial color="#ff85c0" roughness={0.25} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 4.75, 0]}>
        <coneGeometry args={[2.1, 1.25, 32]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.25} clearcoat={0.6} />
      </mesh>
      <ExtrudedStar3D
        position={[0, 5.75, 0]}
        scale={0.7}
        color="#fde047"
        emissive="#f59e0b"
        emissiveIntensity={0.6}
        spin
      />
    </group>
  );
}

// Giant three-tier birthday cake with five flickering candles (Sarvin is five!)
export function BirthdayCake3D({ position }: { position: Vec3 }) {
  const flameRefs = useRef<(THREE.Mesh | null)[]>([]);
  const candleCount = 5;

  const berries = useMemo(() => {
    const n = 12;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return {
        pos: [Math.cos(a) * 1.38, 1.18, Math.sin(a) * 1.38] as Vec3,
        color: i % 2 === 0 ? "#f43f5e" : "#fde047",
      };
    });
  }, []);
  const berryRef = useRef<THREE.InstancedMesh>(null);
  useInstanceLayout(berryRef, berries);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    flameRefs.current.forEach((f, i) => {
      if (f) {
        const s = 1 + Math.sin(t * 11 + i * 2.1) * 0.15;
        f.scale.set(s, 1 + Math.sin(t * 13 + i) * 0.22, s);
      }
    });
  });

  const tiers: { r: number; h: number; y: number; color: string; icing: string }[] = [
    { r: 1.6, h: 0.9, y: 0.12, color: "#ff85c0", icing: "#ffffff" },
    { r: 1.12, h: 0.75, y: 1.02, color: "#e9d5ff", icing: "#ff6eb4" },
    { r: 0.72, h: 0.6, y: 1.77, color: "#fff7ed", icing: "#c084fc" },
  ];
  const topY = 2.37;

  return (
    <group position={position}>
      {/* Golden cake stand */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.85, 1.9, 0.12, 32]} />
        <meshStandardMaterial color="#fde047" metalness={0.5} roughness={0.25} />
      </mesh>
      {tiers.map((tier, i) => (
        <group key={`tier-${i}`} position={[0, tier.y, 0]}>
          <mesh position={[0, tier.h / 2, 0]}>
            <cylinderGeometry args={[tier.r, tier.r, tier.h, 32]} />
            <meshPhysicalMaterial color={tier.color} roughness={0.35} clearcoat={0.3} />
          </mesh>
          {/* Icing rim on top edge */}
          <mesh position={[0, tier.h, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[tier.r - 0.04, 0.09, 8, 32]} />
            <meshPhysicalMaterial color={tier.icing} roughness={0.3} clearcoat={0.5} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={berryRef} args={[undefined, undefined, berries.length]}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshPhysicalMaterial roughness={0.25} clearcoat={0.6} />
      </instancedMesh>

      {/* Five candles */}
      {Array.from({ length: candleCount }, (_, i) => {
        const a = (i / candleCount) * Math.PI * 2;
        const x = Math.cos(a) * 0.42;
        const z = Math.sin(a) * 0.42;
        return (
          <group key={`candle-${i}`} position={[x, topY, z]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.5, 10]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#7dd3fc" : "#ff6eb4"} roughness={0.4} />
            </mesh>
            <mesh
              ref={(el) => {
                flameRefs.current[i] = el;
              }}
              position={[0, 0.62, 0]}
            >
              <sphereGeometry args={[0.09, 10, 8]} />
              <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={1.4} />
            </mesh>
          </group>
        );
      })}
      <ExtrudedHeart3D
        position={[0, topY + 0.32, 0]}
        scale={0.45}
        color="#ff6eb4"
        emissive="#ec4899"
        emissiveIntensity={0.4}
      />
    </group>
  );
}

// Golden princess crown slowly turning above a marble pedestal and velvet cushion
export function RoyalCrownPedestal3D({ position }: { position: Vec3 }) {
  const crownRef = useRef<THREE.Group>(null);
  const points = 6;

  useFrame((state, delta) => {
    if (!crownRef.current) return;
    crownRef.current.rotation.y += Math.min(delta, 0.05) * 0.7;
    crownRef.current.position.y = 2.05 + Math.sin(state.clock.elapsedTime * 1.8) * 0.1;
  });

  const jewelColors = ["#ff6eb4", "#7dd3fc", "#c084fc", "#34d399", "#f43f5e", "#fde047"];

  return (
    <group position={position}>
      {/* Marble pedestal */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 0.24, 24]} />
        <meshPhysicalMaterial color="#f3e8ff" roughness={0.3} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 1.0, 24]} />
        <meshPhysicalMaterial color="#fff5fa" roughness={0.28} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 1.24, 0]}>
        <cylinderGeometry args={[0.95, 0.8, 0.12, 24]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>
      {/* Velvet cushion */}
      <mesh position={[0, 1.42, 0]} scale={[1, 0.38, 1]}>
        <sphereGeometry args={[0.72, 18, 12]} />
        <meshPhysicalMaterial color="#c026d3" roughness={0.5} clearcoat={0.2} />
      </mesh>

      {/* Crown */}
      <group ref={crownRef} position={[0, 2.05, 0]}>
        <mesh>
          <cylinderGeometry args={[0.62, 0.55, 0.42, 24, 1, true]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.65}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.56, 0.06, 8, 24]} />
          <meshStandardMaterial color="#fde047" metalness={0.6} roughness={0.2} />
        </mesh>
        {Array.from({ length: points }, (_, i) => {
          const a = (i / points) * Math.PI * 2;
          const x = Math.cos(a) * 0.6;
          const z = Math.sin(a) * 0.6;
          return (
            <group key={`pt-${i}`} position={[x, 0.42, z]}>
              <mesh>
                <coneGeometry args={[0.15, 0.45, 8]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.65} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.28, 0]}>
                <sphereGeometry args={[0.09, 10, 8]} />
                <meshPhysicalMaterial
                  color={jewelColors[i % jewelColors.length]}
                  emissive={jewelColors[i % jewelColors.length]}
                  emissiveIntensity={0.35}
                  roughness={0.1}
                  clearcoat={1}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

// One gliding swan: body, curved neck, head with orange beak, folded wings
function Swan3D() {
  return (
    <group>
      <mesh scale={[1, 0.62, 1.45]}>
        <sphereGeometry args={[0.36, 14, 10]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.35} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.38, 0.38]} rotation={[-0.35, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 0.6, 8]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.35} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.7, 0.5]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.35} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.68, 0.68]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.18, 8]} />
        <meshStandardMaterial color="#fb923c" roughness={0.4} />
      </mesh>
      {/* Pink blush wings */}
      {[-0.22, 0.22].map((wx) => (
        <mesh key={wx} position={[wx, 0.12, -0.08]} scale={[0.35, 0.5, 1.1]}>
          <sphereGeometry args={[0.3, 10, 8]} />
          <meshPhysicalMaterial color="#fdf2f8" roughness={0.35} clearcoat={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Round marble pond with two swans swimming in circles and floating lily pads
export function SwanPond3D({ position }: { position: Vec3 }) {
  const swansRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!swansRef.current) return;
    swansRef.current.rotation.y -= Math.min(delta, 0.05) * 0.35;
    swansRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 1.6) * 0.02;
  });

  const lilies: [number, number, number][] = [
    [0.4, 0.27, 0.3],
    [-0.8, 0.27, -0.5],
    [1.6, 0.27, -0.9],
  ];

  return (
    <group position={position}>
      {/* Marble rim and basin */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[2.8, 2.9, 0.3, 36]} />
        <meshPhysicalMaterial color="#f3e8ff" roughness={0.3} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.66, 0.1, 8, 40]} />
        <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[2.45, 2.45, 0.04, 36]} />
        <meshPhysicalMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={0.22}
          roughness={0.08}
          clearcoat={1}
        />
      </mesh>
      {lilies.map(([lx, ly, lz], i) => (
        <group key={`lily-${i}`} position={[lx, ly + 0.04, lz]}>
          <mesh>
            <cylinderGeometry args={[0.32, 0.32, 0.03, 14]} />
            <meshStandardMaterial color="#22c55e" roughness={0.45} />
          </mesh>
          {i !== 1 && (
            <mesh position={[0, 0.08, 0]}>
              <sphereGeometry args={[0.12, 10, 8]} />
              <meshPhysicalMaterial color="#ff85c0" roughness={0.25} clearcoat={0.5} />
            </mesh>
          )}
        </group>
      ))}
      {/* Two swans circling, facing along their path */}
      <group ref={swansRef} position={[0, 0.3, 0]}>
        <group position={[1.35, 0, 0]}>
          <Swan3D />
        </group>
        <group position={[-1.35, 0, 0]} rotation={[0, Math.PI, 0]}>
          <Swan3D />
        </group>
      </group>
    </group>
  );
}
