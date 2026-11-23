"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Sparkles, useGLTF } from "@react-three/drei";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { ExtrudedStar3D } from "../../MagicalDecor3D";
import type { Vec3 } from "../types";
import {
  FROZEN_CRYSTAL_SPOTS,
  FROZEN_GAZEBO_POS,
  FROZEN_LANTERN_SPOTS,
  FROZEN_OLAF_POS,
  FROZEN_PINE_SPOTS,
  FROZEN_SKATING_POND_POS,
  FROZEN_SNOWMAN_POS,
} from "../worldData";
import { CrystalCluster3D } from "./WorldLandmarkAssets";

// Sparkling icy-blue & silver crystal archway framing the West bridge entrance
export function IceArchway3D({
  position = [-19.6, 0, 2.0],
  rotation = [0, Math.PI / 2, 0],
}: {
  position?: Vec3;
  rotation?: Vec3;
}) {
  const crestRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (crestRef.current) {
      crestRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.4) * 0.2;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Left & Right Faceted Crystal Pillars (local x = Â±2.65 -> clear 5.3 opening) */}
      {[-2.65, 2.65].map((px) => (
        <group key={`ice-pillar-${px}`} position={[px, 0, 0]}>
          {/* Silver/frost plinth base */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.42, 0.52, 0.5, 6]} />
            <meshPhysicalMaterial color="#e0f2fe" roughness={0.22} clearcoat={0.75} />
          </mesh>
          {/* Hexagonal ice crystal shaft */}
          <mesh position={[0, 1.65, 0]}>
            <cylinderGeometry args={[0.28, 0.34, 2.4, 6]} />
            <meshPhysicalMaterial
              color="#7dd3fc"
              emissive="#38bdf8"
              emissiveIntensity={0.22}
              roughness={0.14}
              clearcoat={0.95}
            />
          </mesh>
          {/* Silver capital collar */}
          <mesh position={[0, 2.9, 0]}>
            <cylinderGeometry args={[0.44, 0.32, 0.24, 6]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.55} roughness={0.2} />
          </mesh>
          {/* Decorative side crystal shard */}
          <mesh
            position={[px < 0 ? -0.34 : 0.34, 0.9, 0]}
            rotation={[0, 0, px < 0 ? 0.32 : -0.32]}
          >
            <coneGeometry args={[0.16, 0.95, 6]} />
            <meshPhysicalMaterial
              color="#bae6fd"
              emissive="#38bdf8"
              emissiveIntensity={0.35}
              roughness={0.12}
              clearcoat={1}
            />
          </mesh>
        </group>
      ))}

      {/* Sparkling Icy-Blue & Silver Twin Arch Ribs */}
      <mesh position={[0, 2.95, 0]}>
        <torusGeometry args={[2.65, 0.2, 12, 36, Math.PI]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          emissive="#38bdf8"
          emissiveIntensity={0.35}
          roughness={0.12}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 2.95, 0]}>
        <torusGeometry args={[2.32, 0.11, 10, 32, Math.PI]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.55} roughness={0.2} />
      </mesh>

      {/* Glowing 6-Pointed Snowflake Crest at the Peak */}
      <group ref={crestRef} position={[0, 5.75, 0]}>
        {[0, Math.PI / 3, (2 * Math.PI) / 3].map((angle, idx) => (
          <mesh key={`flake-arm-${idx}`} rotation={[0, 0, angle]}>
            <boxGeometry args={[1.38, 0.12, 0.14]} />
            <meshPhysicalMaterial
              color="#e0f2fe"
              emissive="#7dd3fc"
              emissiveIntensity={0.85}
              roughness={0.1}
              clearcoat={1}
            />
          </mesh>
        ))}
        <mesh>
          <octahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#38bdf8"
            emissiveIntensity={1.1}
          />
        </mesh>
      </group>
    </group>
  );
}

// Walkable Crystal Ice Bridge spanning exact x âˆˆ [-27.5, -20.0] (center x = -23.75, z = 2.0, length 7.5, width 5.4)
// Butt-jointed with zero overlap and zero Z-fighting against Green Land (x = -20.0) and Frozen Land (x = -27.5)
export function CrystalIceBridge3D({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const postXs = [-20.4, -22.05, -23.75, -25.45, -27.1];

  return (
    <group>
      {/* Clickable icy turquoise marble bridge deck (exact x âˆˆ [-27.5, -20.0], top at y = 0) */}
      <mesh position={[-23.75, -0.18, 2.0]} onPointerDown={onGroundClick} receiveShadow>
        <boxGeometry args={[7.5, 0.36, 5.4]} />
        <meshPhysicalMaterial color="#e0f7ff" roughness={0.22} clearcoat={0.65} />
      </mesh>

      {/* Glacier-blue & silver underside support beams (inset slightly in X for zero overlap) */}
      <mesh position={[-23.75, -0.56, 2.0]}>
        <boxGeometry args={[7.4, 0.44, 4.9]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.45} />
      </mesh>
      <mesh position={[-23.75, -0.38, 2.0]}>
        <boxGeometry args={[7.48, 0.14, 5.55]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.22} />
      </mesh>

      {/* Frosty blue & silver runner strip (exact 7.5 length along X, proud of y = 0 with zero Z-fighting) */}
      <mesh position={[-23.75, 0.02, 2.0]}>
        <boxGeometry args={[7.5, 0.01, 2.95]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.45} roughness={0.25} />
      </mesh>
      <mesh position={[-23.75, 0.026, 2.0]} onPointerDown={onGroundClick}>
        <boxGeometry args={[7.5, 0.014, 2.6]} />
        <meshPhysicalMaterial color="#7dd3fc" roughness={0.22} clearcoat={0.75} />
      </mesh>

      {/* North & South crystal bridge railings with glowing icy-blue orbs */}
      {[-0.52, 4.52].map((rz) => (
        <group key={`ice-rail-${rz}`}>
          {/* Top icy-crystal & mid silver handrails */}
          <mesh position={[-23.75, 0.72, rz]}>
            <boxGeometry args={[7.5, 0.12, 0.18]} />
            <meshPhysicalMaterial color="#bae6fd" roughness={0.2} clearcoat={0.85} />
          </mesh>
          <mesh position={[-23.75, 0.38, rz]}>
            <boxGeometry args={[7.5, 0.1, 0.12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.22} />
          </mesh>
          {/* Crystal baluster posts + glowing icy-blue orbs */}
          {postXs.map((px) => (
            <group key={`ice-post-${rz}-${px}`} position={[px, 0, rz]}>
              <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.12, 0.15, 0.9, 6]} />
                <meshPhysicalMaterial color="#e0f2fe" roughness={0.2} clearcoat={0.8} />
              </mesh>
              <mesh position={[0, 1.02, 0]}>
                <sphereGeometry args={[0.17, 14, 14]} />
                <meshStandardMaterial
                  color="#bae6fd"
                  emissive="#38bdf8"
                  emissiveIntensity={1.1}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

// Cute layered snow-dusted pastel pine tree
export function FrozenPineTree3D({
  position,
  color = "#7dd3fc",
  scale = 1,
}: {
  position: Vec3;
  color?: string;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Woody trunk */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.18, 0.26, 1.1, 10]} />
        <meshStandardMaterial color="#a16207" roughness={0.78} />
      </mesh>
      {/* Bottom pine tier + snow dusting */}
      <mesh position={[0, 1.45, 0]}>
        <coneGeometry args={[1.18, 1.35, 10]} />
        <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.35} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <coneGeometry args={[0.92, 0.85, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.42} />
      </mesh>
      {/* Middle pine tier + snow dusting */}
      <mesh position={[0, 2.32, 0]}>
        <coneGeometry args={[0.92, 1.2, 10]} />
        <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.35} />
      </mesh>
      <mesh position={[0, 2.48, 0]}>
        <coneGeometry args={[0.7, 0.72, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.42} />
      </mesh>
      {/* Top pine tier + crisp white snow cap */}
      <mesh position={[0, 3.08, 0]}>
        <coneGeometry args={[0.64, 1.0, 10]} />
        <meshPhysicalMaterial color={color} roughness={0.32} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 3.24, 0]}>
        <coneGeometry args={[0.45, 0.62, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.38} />
      </mesh>
    </group>
  );
}

// Iconic cheerful Olaf snowman character ("I like warm hugs!")
function OlafPrimitive3D({
  position,
  rotation = [0, 0.45, 0],
  scale = 1,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(t * 2.8)) * 0.08;
      bodyRef.current.rotation.z = Math.sin(t * 2.4) * 0.05;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = 0.72 + Math.sin(t * 5.0) * 0.25;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -0.72 - Math.sin(t * 5.0 + 0.6) * 0.28;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={bodyRef}>
        {/* Two cute round snow feet */}
        {[-0.24, 0.24].map((fx) => (
          <mesh key={`ofoot-${fx}`} position={[fx, 0.14, 0.1]} scale={[1, 0.65, 1.25]}>
            <sphereGeometry args={[0.18, 14, 14]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.22} clearcoat={0.55} />
          </mesh>
        ))}

        {/* Plump pear-shaped lower snow body */}
        <mesh position={[0, 0.64, 0]} scale={[1.05, 0.94, 0.98]}>
          <sphereGeometry args={[0.56, 22, 22]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={0.6} />
        </mesh>

        {/* Slightly narrower upper snow torso */}
        <mesh position={[0, 1.32, 0]} scale={[0.92, 0.95, 0.9]}>
          <sphereGeometry args={[0.38, 22, 22]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={0.6} />
        </mesh>

        {/* 3 Iconic round charcoal buttons down the front */}
        <mesh position={[0, 1.38, 0.34]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.88, 0.51]}>
          <sphereGeometry args={[0.085, 12, 12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.54, 0.54]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.7} />
        </mesh>

        {/* Iconic tall goofy oval Olaf head */}
        <group position={[0, 2.02, 0.02]}>
          {/* Main elongated vertical head */}
          <mesh scale={[0.84, 1.2, 0.88]}>
            <sphereGeometry args={[0.38, 22, 22]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.18} clearcoat={0.65} />
          </mesh>
          {/* Rounded lower cheek / jaw puff */}
          <mesh position={[0, -0.18, 0.08]} scale={[1.05, 0.78, 0.92]}>
            <sphereGeometry args={[0.3, 18, 18]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.18} clearcoat={0.65} />
          </mesh>

          {/* Expressive wide eyes (white sclera + dark pupils + catchlights) */}
          {[-0.12, 0.12].map((ex) => (
            <group key={`oeye-${ex}`} position={[ex, 0.14, 0.28]}>
              <mesh scale={[0.88, 1.15, 0.55]}>
                <sphereGeometry args={[0.095, 14, 14]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.01, 0.042]}>
                <sphereGeometry args={[0.048, 12, 12]} />
                <meshStandardMaterial color="#111827" roughness={0.15} />
              </mesh>
              <mesh position={[0.016, 0.018, 0.078]}>
                <sphereGeometry args={[0.016, 8, 8]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
              </mesh>
            </group>
          ))}

          {/* Raised brown twig eyebrows */}
          <mesh position={[-0.13, 0.3, 0.26]} rotation={[0, 0, 0.22]}>
            <boxGeometry args={[0.14, 0.032, 0.035]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.85} />
          </mesh>
          <mesh position={[0.13, 0.3, 0.26]} rotation={[0, 0, -0.22]}>
            <boxGeometry args={[0.14, 0.032, 0.035]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.85} />
          </mesh>

          {/* Long bright orange carrot nose */}
          <mesh position={[0, 0.02, 0.46]} rotation={[Math.PI / 2 - 0.06, 0, 0]}>
            <coneGeometry args={[0.075, 0.46, 12]} />
            <meshPhysicalMaterial color="#f97316" roughness={0.35} clearcoat={0.35} />
          </mesh>

          {/* Big joyful open-mouth grin + iconic single white bucktooth */}
          <mesh position={[0, -0.17, 0.32]} scale={[1.25, 0.72, 0.45]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#1f2937" roughness={0.65} />
          </mesh>
          {/* Single big front bucktooth */}
          <mesh position={[0, -0.11, 0.38]}>
            <boxGeometry args={[0.13, 0.1, 0.04]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>

          {/* 3 Iconic brown twig hairs sticking out the top of Olaf's head */}
          <mesh position={[0, 0.58, -0.02]} rotation={[0.08, 0, 0.04]}>
            <cylinderGeometry args={[0.018, 0.024, 0.38, 8]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.9} />
          </mesh>
          <mesh position={[-0.08, 0.54, -0.02]} rotation={[0.05, 0, 0.34]}>
            <cylinderGeometry args={[0.016, 0.022, 0.3, 8]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.9} />
          </mesh>
          <mesh position={[0.08, 0.54, -0.02]} rotation={[0.05, 0, -0.34]}>
            <cylinderGeometry args={[0.016, 0.022, 0.3, 8]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.9} />
          </mesh>
        </group>

        {/* Left & Right expressive waving 3-fingered brown twig arms ("Warm hugs!") */}
        <group ref={leftArmRef} position={[-0.34, 1.4, 0]}>
          <mesh position={[-0.28, 0.16, 0]} rotation={[0, 0, 1.05]}>
            <cylinderGeometry args={[0.024, 0.032, 0.66, 8]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.88} />
          </mesh>
          {/* 3 twig fingers */}
          {[-0.35, 0, 0.35].map((ang, i) => (
            <mesh key={`lf-${i}`} position={[-0.58, 0.34 + i * 0.02, 0]} rotation={[0, 0, 1.05 + ang]}>
              <cylinderGeometry args={[0.014, 0.018, 0.2, 6]} />
              <meshStandardMaterial color="#5c3a21" roughness={0.88} />
            </mesh>
          ))}
        </group>

        <group ref={rightArmRef} position={[0.34, 1.4, 0]}>
          <mesh position={[0.28, 0.16, 0]} rotation={[0, 0, -1.05]}>
            <cylinderGeometry args={[0.024, 0.032, 0.66, 8]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.88} />
          </mesh>
          {/* 3 twig fingers */}
          {[-0.35, 0, 0.35].map((ang, i) => (
            <mesh key={`rf-${i}`} position={[0.58, 0.34 + i * 0.02, 0]} rotation={[0, 0, -1.05 + ang]}>
              <cylinderGeometry args={[0.014, 0.018, 0.2, 6]} />
              <meshStandardMaterial color="#5c3a21" roughness={0.88} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

const OLAF_MODEL_URL = "/models/olaf.glb";
const OLAF_HEIGHT = 1.9;

// Real Olaf model (Draco-compressed GLB, ~28 KB) with primitive fallback while loading
function OlafModel3D({
  position,
  rotation = [0, 0.45, 0],
  scale = 1,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  const { scene } = useGLTF(OLAF_MODEL_URL);
  const bodyRef = useRef<THREE.Group>(null);

  const { model, fit, offset } = useMemo(() => {
    const clone = skeletonClone(scene);
    clone.traverse((o) => {
      const mesh = o as THREE.SkinnedMesh;
      if (mesh.isMesh) {
        mesh.frustumCulled = false;
        mesh.castShadow = true;
      }
    });
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return {
      model: clone,
      fit: OLAF_HEIGHT / Math.max(size.y, 0.001),
      offset: [-center.x, -box.min.y, -center.z] as Vec3,
    };
  }, [scene]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(t * 2.8)) * 0.08;
      bodyRef.current.rotation.z = Math.sin(t * 2.4) * 0.05;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={bodyRef}>
        <group scale={fit}>
          <primitive object={model} position={offset} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(OLAF_MODEL_URL);

// Iconic cheerful Olaf snowman character ("I like warm hugs!")
export function OlafCharacter3D(props: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  return (
    <Suspense fallback={<OlafPrimitive3D {...props} />}>
      <OlafModel3D {...props} />
    </Suspense>
  );
}

// Adorable glossy 3-sphere Kawaii Snowman waving near the skating pond!
export function KawaiiSnowman3D({
  position,
  rotation = [0, -0.8, 0],
  scale = 1,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -0.65 + Math.sin(t * 4.5) * 0.35;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 2.2) * 0.04;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={bodyRef}>
        {/* Bottom snow sphere */}
        <mesh position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.68, 22, 22]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={0.6} />
        </mesh>
        {/* Middle snow sphere */}
        <mesh position={[0, 1.48, 0]}>
          <sphereGeometry args={[0.5, 22, 22]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={0.6} />
        </mesh>
        {/* Head snow sphere */}
        <mesh position={[0, 2.22, 0]}>
          <sphereGeometry args={[0.39, 22, 22]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.18} clearcoat={0.65} />
        </mesh>

        {/* Cute pastel buttons on belly */}
        {[1.62, 1.42, 1.22].map((by, idx) => (
          <mesh key={`btn-${idx}`} position={[0, by, 0.48]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshPhysicalMaterial
              color={idx % 2 === 0 ? "#ff6eb4" : "#7dd3fc"}
              roughness={0.2}
              clearcoat={0.7}
            />
          </mesh>
        ))}

        {/* Cozy pink scarf + trailing scarf tail */}
        <mesh position={[0, 1.88, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.37, 0.1, 12, 24]} />
          <meshStandardMaterial color="#ff6eb4" roughness={0.45} />
        </mesh>
        <mesh position={[0.22, 1.62, 0.34]} rotation={[0.15, 0.2, -0.18]}>
          <boxGeometry args={[0.16, 0.45, 0.08]} />
          <meshStandardMaterial color="#ff85c0" roughness={0.45} />
        </mesh>

        {/* Sparkly dark eyes + white catchlights */}
        {[-0.14, 0.14].map((ex) => (
          <group key={`eye-${ex}`} position={[ex, 2.28, 0.34]}>
            <mesh>
              <sphereGeometry args={[0.052, 12, 12]} />
              <meshStandardMaterial color="#1e1b4b" roughness={0.15} />
            </mesh>
            <mesh position={[0.018, 0.02, 0.04]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}

        {/* Rosy kawaii cheeks */}
        {[-0.22, 0.22].map((cx) => (
          <mesh key={`cheek-${cx}`} position={[cx, 2.16, 0.31]} scale={[1.2, 0.75, 0.5]}>
            <sphereGeometry args={[0.068, 10, 10]} />
            <meshStandardMaterial color="#fda4af" roughness={0.5} />
          </mesh>
        ))}

        {/* Cute carrot nose */}
        <mesh position={[0, 2.2, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.065, 0.3, 12]} />
          <meshStandardMaterial color="#fb923c" roughness={0.35} />
        </mesh>

        {/* Pastel winter beanie + fluffy pom-pom + mini golden crown */}
        <group position={[0, 2.52, 0]} rotation={[-0.08, 0, 0.05]}>
          <mesh>
            <sphereGeometry args={[0.36, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color="#c084fc" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.35, 0.075, 10, 22]} />
            <meshStandardMaterial color="#fbcfe8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.55} />
          </mesh>
          {/* Tiny golden birthday crown nestled on the beanie brim */}
          <mesh position={[0, 0.22, 0.28]} rotation={[0.35, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.12, 6]} />
            <meshStandardMaterial color="#fde047" metalness={0.55} roughness={0.2} />
          </mesh>
        </group>

        {/* Left wooden stick arm */}
        <group position={[-0.46, 1.56, 0]} rotation={[0, 0, 0.58]}>
          <mesh position={[-0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.042, 0.62, 8]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
        </group>

        {/* Right wooden stick arm (animated waving!) */}
        <group ref={rightArmRef} position={[0.46, 1.62, 0]} rotation={[0, 0, -0.65]}>
          <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.042, 0.66, 8]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
          <mesh position={[0.56, 0.08, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.018, 0.024, 0.2, 6]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// Crystal post topped with a glowing frosty-blue diamond lantern
export function IceLantern3D({ position }: { position: Vec3 }) {
  const gemRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (gemRef.current) {
      gemRef.current.rotation.y = state.clock.elapsedTime * 1.2 + position[0];
    }
  });

  return (
    <group position={position}>
      {/* Faceted crystal base */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.2, 0.28, 0.24, 6]} />
        <meshPhysicalMaterial color="#e0f2fe" roughness={0.2} clearcoat={0.8} />
      </mesh>
      {/* Silver/ice shaft */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.065, 0.09, 1.9, 6]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.22} />
      </mesh>
      {/* Lantern cradle ring */}
      <mesh position={[0, 2.08, 0]}>
        <cylinderGeometry args={[0.2, 0.12, 0.12, 6]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Glowing frosty-blue diamond lantern */}
      <mesh ref={gemRef} position={[0, 2.38, 0]} scale={[0.85, 1.25, 0.85]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          emissive="#38bdf8"
          emissiveIntensity={1.25}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

// Snowy / ice crystal perimeter fence row closing Frozen Land cleanly
function IceFenceRow3D({
  position,
  length,
  rotationY = 0,
}: {
  position: Vec3;
  length: number;
  rotationY?: number;
}) {
  const posts = useMemo(() => {
    const count = Math.max(2, Math.round(length / 1.45) + 1);
    return Array.from({ length: count }, (_, i) => (i / (count - 1) - 0.5) * length);
  }, [length]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Ice-crystal horizontal rails */}
      <mesh position={[0, 0.56, 0]}>
        <boxGeometry args={[length + 0.14, 0.1, 0.1]} />
        <meshPhysicalMaterial color="#bae6fd" roughness={0.22} clearcoat={0.75} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[length + 0.14, 0.09, 0.09]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.45} roughness={0.25} />
      </mesh>
      {/* Crystal fence posts with snowy caps */}
      {posts.map((px, idx) => (
        <group key={`ifpost-${idx}`} position={[px, 0, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 0.8, 6]} />
            <meshPhysicalMaterial color="#f0f9ff" roughness={0.22} clearcoat={0.7} />
          </mesh>
          <mesh position={[0, 0.86, 0]}>
            <coneGeometry args={[0.11, 0.18, 6]} />
            <meshPhysicalMaterial
              color="#7dd3fc"
              emissive="#38bdf8"
              emissiveIntensity={0.45}
              roughness={0.15}
              clearcoat={0.95}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Sparkling Ice Palace Gazebo at [-49.5, 0, 2.0] with translucent dome & giant spinning golden/cyan star topper
function IcePalaceGazebo3D({ position }: { position: Vec3 }) {
  const pillarAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
  const chandelierRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (chandelierRef.current) {
      chandelierRef.current.rotation.y = state.clock.elapsedTime * 0.9;
    }
  });

  return (
    <group position={position}>
      {/* Two-tiered icy crystalline dais */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[2.5, 2.7, 0.32, 8]} />
        <meshPhysicalMaterial color="#e0f2fe" roughness={0.2} clearcoat={0.75} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[2.1, 2.22, 0.22, 8]} />
        <meshPhysicalMaterial color="#bae6fd" roughness={0.18} clearcoat={0.85} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[2.12, 2.12, 0.05, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.55} roughness={0.2} />
      </mesh>

      {/* 6 Faceted Crystal Pillars */}
      {pillarAngles.map((angle, idx) => {
        const px = Math.cos(angle) * 1.9;
        const pz = Math.sin(angle) * 1.9;
        return (
          <group key={`ice-gaz-p-${idx}`} position={[px, 0.48, pz]}>
            <mesh position={[0, 1.7, 0]}>
              <cylinderGeometry args={[0.14, 0.18, 3.4, 6]} />
              <meshPhysicalMaterial
                color="#e0f7ff"
                emissive="#7dd3fc"
                emissiveIntensity={0.18}
                roughness={0.14}
                clearcoat={0.95}
              />
            </mesh>
            <mesh position={[0, 3.45, 0]}>
              <cylinderGeometry args={[0.25, 0.15, 0.22, 6]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.55} roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Silver/Ice Cornice Ring */}
      <mesh position={[0, 4.05, 0]}>
        <cylinderGeometry args={[2.38, 2.46, 0.28, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* Translucent Icy-Blue Dome */}
      <mesh position={[0, 4.18, 0]}>
        <sphereGeometry args={[2.32, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={0.32}
          roughness={0.1}
          clearcoat={1}
          transparent
          opacity={0.78}
        />
      </mesh>

      {/* Crystal Spire Finial Base + Giant Spinning 3D Golden/Cyan Star Topper */}
      <mesh position={[0, 6.65, 0]}>
        <coneGeometry args={[0.38, 0.72, 6]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          emissive="#38bdf8"
          emissiveIntensity={0.55}
          roughness={0.12}
          clearcoat={1}
        />
      </mesh>
      <ExtrudedStar3D
        position={[0, 7.55, 0]}
        scale={1.12}
        color="#fde047"
        emissive="#38bdf8"
        emissiveIntensity={0.65}
        spin
      />

      {/* Glowing Floating Ice Crystal Chandelier Inside */}
      <mesh ref={chandelierRef} position={[0, 2.75, 0]} scale={[0.7, 1.35, 0.7]}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          emissive="#38bdf8"
          emissiveIntensity={1.0}
          roughness={0.08}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

// Floating 28 Ã— 30 Snowy Frozen Land Island (x âˆˆ [-55.5, -27.5], z âˆˆ [-13.0, 17.0], centered at [-41.5, 0, 2.0])
export function FrozenLandPlatform3D({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const cloudPuffs: [number, number, number, number][] = [
    [-54.5, -2.5, -11.5, 2.7],
    [-28.5, -2.5, -11.5, 2.5],
    [-54.8, -2.6, 2.0, 3.0],
    [-54.5, -2.5, 15.5, 2.7],
    [-28.5, -2.5, 15.5, 2.5],
    [-41.5, -3.0, -12.8, 3.2],
    [-41.5, -3.0, 16.8, 3.2],
    [-48.0, -2.9, 16.0, 2.6],
    [-35.0, -2.9, -12.0, 2.6],
  ];

  const pondRimStones = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return {
        x: Math.cos(a) * 4.25,
        z: Math.sin(a) * 4.25,
        rotY: a,
        scale: 0.8 + (i % 3) * 0.18,
      };
    });
  }, []);

  const icePathTiles = [-29.2, -31.8, -34.4, -37.0, -39.6, -42.2, -44.8];

  return (
    <group>
      {/* === CRISP SNOWY TOP DECK (28 Ã— 30, exact x âˆˆ [-55.5, -27.5], z âˆˆ [-13.0, 17.0], top at y = 0) === */}
      <mesh position={[-41.5, -0.25, 2.0]} onPointerDown={onGroundClick} receiveShadow>
        <boxGeometry args={[28, 0.5, 30]} />
        <meshPhysicalMaterial color="#f0f9ff" roughness={0.42} clearcoat={0.28} />
      </mesh>

      {/* Chunky Glacier-Blue & Icy-Indigo Floating Cliff Underside */}
      <mesh position={[-41.5, -1.55, 2.0]}>
        <boxGeometry args={[27.2, 2.1, 29.2]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.62} />
      </mesh>
      <mesh position={[-41.5, -3.05, 2.0]}>
        <boxGeometry args={[25.8, 0.9, 27.8]} />
        <meshStandardMaterial color="#6366f1" roughness={0.72} />
      </mesh>

      {/* Snowy Cloud Puffs Tucked Underneath */}
      {cloudPuffs.map(([cx, cy, cz, cr], idx) => (
        <mesh key={`fcloud-${idx}`} position={[cx, cy, cz]} scale={[1.35, 0.62, 1.25]}>
          <sphereGeometry args={[cr, 16, 16]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#ffffff" : "#e0f2fe"}
            roughness={0.55}
          />
        </mesh>
      ))}

      {/* Frosty Crystal Path Tiles from Bridge Arrival to Ice Palace Gazebo */}
      {icePathTiles.map((tx, idx) => (
        <mesh key={`ipath-${idx}`} position={[tx, 0.02, 2.0]} onPointerDown={onGroundClick}>
          <cylinderGeometry args={[0.92, 0.98, 0.05, 6]} />
          <meshPhysicalMaterial
            color={idx % 2 === 0 ? "#bae6fd" : "#e0e7ff"}
            roughness={0.22}
            clearcoat={0.75}
          />
        </mesh>
      ))}

      {/* === SHIMMERING FROZEN SKATING POND ([-39.5, 0.015, 7.5], clickable!) === */}
      <group position={FROZEN_SKATING_POND_POS}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onGroundClick}>
          <circleGeometry args={[4.2, 36]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            emissive="#38bdf8"
            emissiveIntensity={0.24}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.06}
          />
        </mesh>
        {/* Subtle frost skate swirl rings */}
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.3, 2.42, 32]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.48} />
        </mesh>
        <mesh position={[0.6, 0.007, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.2, 28]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.45} />
        </mesh>
        {/* Pastel Crystal Rim Stones */}
        {pondRimStones.map((stone, idx) => (
          <mesh
            key={`prim-${idx}`}
            position={[stone.x, 0.14, stone.z]}
            rotation={[0.15, stone.rotY, 0.1]}
            scale={stone.scale}
          >
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshPhysicalMaterial
              color={idx % 2 === 0 ? "#e0f2fe" : "#ddd6fe"}
              roughness={0.18}
              clearcoat={0.85}
            />
          </mesh>
        ))}
      </group>

      {/* === SPARKLING ICE PALACE GAZEBO ([-49.5, 0, 2.0]) === */}
      <IcePalaceGazebo3D position={FROZEN_GAZEBO_POS} />

      {/* === PERIMETER SNOWY / ICE CRYSTAL FENCES (closing all 4 corners cleanly, east bridge opening z âˆˆ [-0.8, 4.8]) === */}
      {/* West Edge (x = -54.9, z âˆˆ [-12.4, 16.4]) */}
      <IceFenceRow3D position={[-54.9, 0, 2.0]} length={28.8} rotationY={Math.PI / 2} />
      {/* North Edge (z = -12.4, x âˆˆ [-54.9, -28.1]) */}
      <IceFenceRow3D position={[-41.5, 0, -12.4]} length={26.8} />
      {/* South Edge (z = 16.4, x âˆˆ [-54.9, -28.1]) */}
      <IceFenceRow3D position={[-41.5, 0, 16.4]} length={26.8} />
      {/* East Edge North Segment (x = -28.1, z âˆˆ [-12.4, -0.8]) */}
      <IceFenceRow3D position={[-28.1, 0, -6.6]} length={11.6} rotationY={Math.PI / 2} />
      {/* East Edge South Segment (x = -28.1, z âˆˆ [4.8, 16.4]) */}
      <IceFenceRow3D position={[-28.1, 0, 10.6]} length={11.6} rotationY={Math.PI / 2} />

      {/* === FROZEN PINE TREES === */}
      {FROZEN_PINE_SPOTS.map((tree, idx) => (
        <FrozenPineTree3D
          key={`fpine-${idx}`}
          position={tree.pos}
          color={tree.color}
          scale={tree.scale}
        />
      ))}

      {/* === KAWAII SNOWMAN (waving near the skating pond!) === */}
      <KawaiiSnowman3D position={FROZEN_SNOWMAN_POS} rotation={[0, -0.95, 0]} scale={1.15} />

      {/* === OLAF CHARACTER (cheering along the snowy avenue!) === */}
      <OlafCharacter3D position={FROZEN_OLAF_POS} rotation={[0, 0.55, 0]} scale={1.18} />

      {/* === ICE LANTERNS === */}
      {FROZEN_LANTERN_SPOTS.map((lp, idx) => (
        <IceLantern3D key={`ilantern-${idx}`} position={lp} />
      ))}

      {/* === ICY CRYSTAL CLUSTERS === */}
      {FROZEN_CRYSTAL_SPOTS.map((cp, idx) => (
        <CrystalCluster3D key={`icrys-${idx}`} position={cp} palette="ice" />
      ))}

      {/* === SNOWY MAGICAL SPARKLES === */}
      <Sparkles
        count={75}
        position={[-41.5, 3.6, 2.0]}
        scale={[26, 7.5, 28]}
        size={4.6}
        speed={0.35}
        color="#e0f2fe"
      />
    </group>
  );
}
