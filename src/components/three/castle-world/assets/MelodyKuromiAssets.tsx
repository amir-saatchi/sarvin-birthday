"use client";

import React, { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import {
  ExtrudedHeart3D,
  ExtrudedStar3D,
  KawaiiBunnyFriend3D,
} from "../../MagicalDecor3D";
import type { Vec3 } from "../types";
import {
  CIRCLE_OBSTACLES,
  FRIENDSHIP_MONUMENT_POS,
  KUROMI_CANDY_CART_POS,
  KUROMI_HOST_POS,
  KUROMI_RINK_POS,
  KUROMI_RINK_R,
  KUROMI_STAGE_POS,
  KUROMI_STAR_PADS,
  MELODY_COTTAGE_POS,
  MELODY_FLOWER_SPOTS,
  MELODY_GIFT_SPOTS,
  MELODY_HOST_POS,
  MELODY_ISLAND,
  MELODY_JELLY_PADS,
  MELODY_LAMP_SPOTS,
  MELODY_LOLLIPOP_SPOTS,
  MELODY_PATH_STONES,
  MELODY_TEA_TABLE_POS,
  MELODY_TREE_SPOTS,
  MELODY_WHEEL_PAD,
  MELODY_WHEEL_POS,
} from "../worldData";
import { GrassDeck3D, GrassTufts3D } from "./GrassAssets";
import {
  BouncePad3D,
  CandyPathStones3D,
  KuromiMoonSwing3D,
  KuromiSkateRink3D,
  MelodyFerrisWheel3D,
  PastelRibbonFence3D,
  StrawberryGarden3D,
  TeacupTwirl3D,
  type RibbonFenceRow,
} from "./MelodyFriendsAssets";
import {
  FairyLampBatch3D,
  GiantFlowerBatch3D,
  GiftBoxBatch3D,
  LollipopBatch3D,
  PastelTreeBatch3D,
} from "./BatchedProps";

// Reusable cute 3D ribbon bow accent
function PastelBow3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = "#ff6eb4",
  centerColor = "#fde047",
}: {
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
  color?: string;
  centerColor?: string;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Left & Right plump bow loops */}
      <mesh position={[-0.32, 0.04, 0]} rotation={[0, 0, 0.25]} scale={[1.2, 0.82, 0.52]}>
        <sphereGeometry args={[0.3, 14, 14]} />
        <meshPhysicalMaterial color={color} roughness={0.22} clearcoat={0.75} />
      </mesh>
      <mesh position={[0.32, 0.04, 0]} rotation={[0, 0, -0.25]} scale={[1.2, 0.82, 0.52]}>
        <sphereGeometry args={[0.3, 14, 14]} />
        <meshPhysicalMaterial color={color} roughness={0.22} clearcoat={0.75} />
      </mesh>
      {/* Trailing ribbon tails */}
      <mesh position={[-0.2, -0.24, -0.02]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.14, 0.36, 0.07]} />
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.6} />
      </mesh>
      <mesh position={[0.2, -0.24, -0.02]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.14, 0.36, 0.07]} />
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.6} />
      </mesh>
      {/* Center knot */}
      <mesh position={[0, 0, 0.05]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshPhysicalMaterial color={centerColor} roughness={0.2} clearcoat={0.85} />
      </mesh>
    </group>
  );
}

// Dual-theme archway framing the South Pastel Ribbon Bridge entrance at [0, 0, 20.4]
// Left pillar: My Melody strawberry pink with pink bow; Right pillar: Kuromi lavender/plum with golden star
export function MelodyKuromiArchway3D({
  position = [0, 0, 20.4],
  rotation = [0, 0, 0],
}: {
  position?: Vec3;
  rotation?: Vec3;
}) {
  const crestRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (crestRef.current) {
      crestRef.current.rotation.y = state.clock.elapsedTime * 0.9;
    }
  });

  const archBeads = [-1.8, -0.95, 0, 0.95, 1.8];

  return (
    <group position={position} rotation={rotation}>
      {/* Left Pillar (x = -2.65): My Melody Strawberry Pink with Pink Bow Accent */}
      <group position={[-2.65, 0, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.45, 0.56, 0.5, 12]} />
          <meshPhysicalMaterial color="#fbcfe8" roughness={0.25} clearcoat={0.55} />
        </mesh>
        <mesh position={[0, 1.65, 0]}>
          <cylinderGeometry args={[0.28, 0.34, 2.4, 14]} />
          <meshPhysicalMaterial color="#ff85c0" roughness={0.22} clearcoat={0.68} />
        </mesh>
        {/* Cream pearl rings */}
        {[0.95, 1.65, 2.35].map((ry) => (
          <mesh key={`mp-ring-${ry}`} position={[0, ry, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.33, 0.045, 8, 18]} />
            <meshStandardMaterial color="#fff1f7" roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 2.92, 0]}>
          <cylinderGeometry args={[0.44, 0.32, 0.24, 12]} />
          <meshPhysicalMaterial color="#ff6eb4" roughness={0.2} clearcoat={0.7} />
        </mesh>
        {/* Cute Pink Bow Accent on the Melody pillar */}
        <PastelBow3D
          position={[0, 2.15, 0.34]}
          scale={0.85}
          color="#ff4d94"
          centerColor="#fef08a"
        />
        <PastelBow3D
          position={[0, 2.15, -0.34]}
          rotation={[0, Math.PI, 0]}
          scale={0.85}
          color="#ff4d94"
          centerColor="#fef08a"
        />
      </group>

      {/* Right Pillar (x = +2.65): Kuromi Lavender & Plum with Golden Star Accent */}
      <group position={[2.65, 0, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.45, 0.56, 0.5, 12]} />
          <meshPhysicalMaterial color="#581c87" roughness={0.28} clearcoat={0.55} />
        </mesh>
        <mesh position={[0, 1.65, 0]}>
          <cylinderGeometry args={[0.28, 0.34, 2.4, 14]} />
          <meshPhysicalMaterial color="#c084fc" roughness={0.22} clearcoat={0.68} />
        </mesh>
        {/* Plum & lilac rings */}
        {[0.95, 1.65, 2.35].map((ry) => (
          <mesh key={`kp-ring-${ry}`} position={[0, ry, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.33, 0.045, 8, 18]} />
            <meshStandardMaterial color="#7e22ce" roughness={0.32} />
          </mesh>
        ))}
        <mesh position={[0, 2.92, 0]}>
          <cylinderGeometry args={[0.44, 0.32, 0.24, 12]} />
          <meshPhysicalMaterial color="#6b21a8" roughness={0.22} clearcoat={0.7} />
        </mesh>
        {/* Golden Star Accents on the Kuromi pillar */}
        <ExtrudedStar3D
          position={[0, 2.15, 0.36]}
          scale={0.48}
          color="#fde047"
          emissive="#f59e0b"
          emissiveIntensity={0.65}
        />
        <ExtrudedStar3D
          position={[0, 2.15, -0.36]}
          scale={0.48}
          color="#fde047"
          emissive="#f59e0b"
          emissiveIntensity={0.65}
        />
      </group>

      {/* Twin Pastel Ribbon Arches Overhead */}
      <mesh position={[0, 2.95, 0]}>
        <torusGeometry args={[2.65, 0.22, 12, 38, Math.PI]} />
        <meshPhysicalMaterial color="#ff6eb4" roughness={0.2} clearcoat={0.78} />
      </mesh>
      <mesh position={[0, 2.95, 0]}>
        <torusGeometry args={[2.3, 0.14, 10, 34, Math.PI]} />
        <meshPhysicalMaterial color="#c084fc" roughness={0.2} clearcoat={0.78} />
      </mesh>

      {/* Pearl & Pastel Gem Accents Along the Ribbon Arch */}
      {archBeads.map((bx, idx) => {
        const by = 2.95 + Math.sqrt(Math.max(0.01, 2.65 * 2.65 - bx * bx));
        return (
          <mesh key={`arch-bead-${idx}`} position={[bx, by, 0.2]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshPhysicalMaterial
              color={idx % 2 === 0 ? "#fef08a" : "#ffffff"}
              emissive={idx % 2 === 0 ? "#f59e0b" : "#f472b6"}
              emissiveIntensity={0.35}
              roughness={0.18}
              clearcoat={0.9}
            />
          </mesh>
        );
      })}

      {/* Gently Spinning Glowing Pink Heart & Golden Star Crest at the Peak */}
      <group ref={crestRef} position={[0, 5.95, 0]}>
        <ExtrudedHeart3D
          position={[-0.36, 0.02, 0]}
          scale={0.72}
          color="#ff6eb4"
          emissive="#ec4899"
          emissiveIntensity={0.65}
        />
        <ExtrudedStar3D
          position={[0.38, 0.04, 0]}
          scale={0.68}
          color="#fde047"
          emissive="#f59e0b"
          emissiveIntensity={0.75}
        />
      </group>
    </group>
  );
}

// Walkable Pastel Ribbon Bridge spanning exact z ∈ [21.0, 28.5] (center [0, 0, 24.75], length 7.5, width 5.4)
// Exact butt-jointed seams with zero overlap and zero Z-fighting against Green Land (z = 21.0) & Melody & Kuromi Land (z = 28.5)
export function PastelRibbonBridge3D({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const postZs = [21.4, 23.05, 24.75, 26.45, 28.1];

  return (
    <group>
      {/* Clickable pastel cream-pink marble deck (exact z ∈ [21.0, 28.5], top at y = 0) */}
      <mesh position={[0, -0.18, 24.75]} onPointerDown={onGroundClick} receiveShadow>
        <boxGeometry args={[5.4, 0.36, 7.5]} />
        <meshPhysicalMaterial color="#fff1f7" roughness={0.32} clearcoat={0.35} />
      </mesh>

      {/* Underside pastel pink & lavender trim beams (inset slightly in Z for zero overlap) */}
      <mesh position={[0, -0.56, 24.75]}>
        <boxGeometry args={[4.9, 0.44, 7.4]} />
        <meshStandardMaterial color="#c084fc" roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.38, 24.75]}>
        <boxGeometry args={[5.55, 0.14, 7.48]} />
        <meshStandardMaterial color="#f472b6" roughness={0.5} />
      </mesh>

      {/* Pink-and-Lavender Ribbon Runner Strip (exact 7.5 length along Z, cleanly stepped in Y for zero Z-fighting) */}
      <mesh position={[0, 0.018, 24.75]}>
        <boxGeometry args={[2.96, 0.01, 7.5]} />
        <meshStandardMaterial color="#fde047" roughness={0.4} />
      </mesh>
      <mesh position={[-0.65, 0.026, 24.75]} onPointerDown={onGroundClick}>
        <boxGeometry args={[1.3, 0.012, 7.5]} />
        <meshPhysicalMaterial color="#ff85c0" roughness={0.28} clearcoat={0.45} />
      </mesh>
      <mesh position={[0.65, 0.026, 24.75]} onPointerDown={onGroundClick}>
        <boxGeometry args={[1.3, 0.012, 7.5]} />
        <meshPhysicalMaterial color="#c084fc" roughness={0.28} clearcoat={0.45} />
      </mesh>
      <mesh position={[0, 0.034, 24.75]}>
        <boxGeometry args={[0.14, 0.008, 7.5]} />
        <meshStandardMaterial color="#fef9c3" roughness={0.35} />
      </mesh>

      {/* West & East Bridge Railings with Alternating Pink & Lavender Posts + Glowing Lantern Orbs */}
      {[-2.52, 2.52].map((rx) => (
        <group key={`ribbon-rail-${rx}`}>
          {/* Top & Mid Pastel Handrails spanning exact 7.5 along Z */}
          <mesh position={[rx, 0.72, 24.75]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 7.5, 10]} />
            <meshPhysicalMaterial
              color={rx < 0 ? "#ff85c0" : "#c084fc"}
              roughness={0.28}
              clearcoat={0.55}
            />
          </mesh>
          <mesh position={[rx, 0.38, 24.75]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 7.5, 10]} />
            <meshStandardMaterial color="#fff1f7" roughness={0.38} />
          </mesh>
          {/* Alternating Pink & Lavender Posts with Glowing Heart/Orb Lanterns */}
          {postZs.map((pz, idx) => {
            const isPink = (idx + (rx < 0 ? 0 : 1)) % 2 === 0;
            return (
              <group key={`ribbon-post-${rx}-${pz}`} position={[rx, 0, pz]}>
                <mesh position={[0, 0.45, 0]}>
                  <cylinderGeometry args={[0.11, 0.14, 0.9, 10]} />
                  <meshPhysicalMaterial
                    color={isPink ? "#ff6eb4" : "#a855f7"}
                    roughness={0.26}
                    clearcoat={0.55}
                  />
                </mesh>
                {isPink ? (
                  <ExtrudedHeart3D
                    position={[0, 1.08, 0]}
                    scale={0.36}
                    color="#ff85c0"
                    emissive="#ec4899"
                    emissiveIntensity={0.95}
                  />
                ) : (
                  <mesh position={[0, 1.04, 0]}>
                    <sphereGeometry args={[0.17, 14, 14]} />
                    <meshStandardMaterial
                      color="#f3e8ff"
                      emissive="#c084fc"
                      emissiveIntensity={1.15}
                    />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// My Melody's Strawberry-Pink Cottage with cream walls, scalloped icing roof trim, giant pink bow, bunny-ear finials & glowing heart window
export function MelodyCottage3D({
  position = MELODY_COTTAGE_POS,
}: {
  position?: Vec3;
}) {
  const scallopAngles = useMemo(
    () => Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2),
    []
  );

  return (
    <group position={position} rotation={[0, 0.45, 0]}>
      {/* Pastel pink stone base terrace */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[2.35, 2.52, 0.32, 24]} />
        <meshPhysicalMaterial color="#fbcfe8" roughness={0.35} clearcoat={0.35} />
      </mesh>

      {/* Cozy cream cylindrical cottage walls */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[1.95, 2.08, 2.35, 24]} />
        <meshPhysicalMaterial color="#fff7fb" roughness={0.32} clearcoat={0.3} />
      </mesh>

      {/* Strawberry-pink rounded dome/cone roof */}
      <mesh position={[0, 3.35, 0]}>
        <coneGeometry args={[2.55, 2.15, 24]} />
        <meshPhysicalMaterial color="#ff6eb4" roughness={0.22} clearcoat={0.72} />
      </mesh>
      {/* Soft whipped-cream roof cap */}
      <mesh position={[0, 4.35, 0]}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.22} clearcoat={0.65} />
      </mesh>

      {/* Scalloped white icing roof trim around the eaves */}
      {scallopAngles.map((ang, idx) => (
        <mesh
          key={`icing-${idx}`}
          position={[Math.cos(ang) * 2.36, 2.34, Math.sin(ang) * 2.36]}
        >
          <sphereGeometry args={[0.32, 12, 12]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={0.75} />
        </mesh>
      ))}

      {/* Cute Bunny-Ear Finial Accents on Top of the Roof! */}
      <mesh position={[-0.42, 4.95, 0]} rotation={[0, 0, 0.24]} scale={[0.55, 1.65, 0.42]}>
        <sphereGeometry args={[0.42, 14, 14]} />
        <meshPhysicalMaterial color="#ff85c0" roughness={0.22} clearcoat={0.72} />
      </mesh>
      <mesh position={[0.45, 4.88, 0.08]} rotation={[0.18, 0, -0.42]} scale={[0.55, 1.55, 0.42]}>
        <sphereGeometry args={[0.42, 14, 14]} />
        <meshPhysicalMaterial color="#ff85c0" roughness={0.22} clearcoat={0.72} />
      </mesh>
      {/* Inner cream ear highlights */}
      <mesh position={[-0.4, 4.92, 0.14]} rotation={[0, 0, 0.24]} scale={[0.32, 1.25, 0.25]}>
        <sphereGeometry args={[0.38, 12, 12]} />
        <meshStandardMaterial color="#fff1f7" roughness={0.35} />
      </mesh>

      {/* Giant Pink Bow on the Front of the Roof */}
      <PastelBow3D
        position={[0, 3.18, 1.55]}
        rotation={[-0.35, 0, 0]}
        scale={1.45}
        color="#ff4d94"
        centerColor="#fde047"
      />

      {/* Cute Arched Pink Front Door with Golden Knob */}
      <group position={[0, 0.32, 1.98]}>
        <mesh position={[0, 0.68, 0]}>
          <boxGeometry args={[0.92, 1.36, 0.18]} />
          <meshPhysicalMaterial color="#ff85c0" roughness={0.25} clearcoat={0.6} />
        </mesh>
        <mesh position={[0, 1.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.18, 16]} />
          <meshPhysicalMaterial color="#ff85c0" roughness={0.25} clearcoat={0.6} />
        </mesh>
        <mesh position={[0.26, 0.72, 0.12]}>
          <sphereGeometry args={[0.085, 10, 10]} />
          <meshStandardMaterial color="#fde047" metalness={0.55} roughness={0.2} />
        </mesh>
      </group>

      {/* Glowing Warm Heart Windows on Left & Right Sides */}
      {[-1.78, 1.78].map((wx, idx) => (
        <group
          key={`mwin-${idx}`}
          position={[wx, 1.55, 0.85]}
          rotation={[0, wx < 0 ? -1.1 : 1.1, 0]}
        >
          <mesh position={[0, 0, -0.02]}>
            <cylinderGeometry args={[0.48, 0.48, 0.12, 18]} />
            <meshPhysicalMaterial color="#ff85c0" roughness={0.25} clearcoat={0.6} />
          </mesh>
          <ExtrudedHeart3D
            position={[0, 0.02, 0.08]}
            scale={0.44}
            color="#fef08a"
            emissive="#fbbf24"
            emissiveIntensity={1.15}
          />
        </group>
      ))}
    </group>
  );
}

// Cute pastel round tea party table with pink tablecloth, glossy teapot, tiny cupcakes & macarons
export function KawaiiTeaTable3D({
  position = MELODY_TEA_TABLE_POS,
}: {
  position?: Vec3;
}) {
  return (
    <group position={position}>
      {/* Round pedestal base & stem */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.52, 0.62, 0.16, 18]} />
        <meshPhysicalMaterial color="#fff1f7" roughness={0.28} clearcoat={0.45} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.72, 14]} />
        <meshPhysicalMaterial color="#fbcfe8" roughness={0.28} clearcoat={0.45} />
      </mesh>

      {/* Pink draped tablecloth tabletop */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[1.05, 1.16, 0.34, 22]} />
        <meshPhysicalMaterial color="#ff85c0" roughness={0.3} clearcoat={0.4} />
      </mesh>
      {/* White lace rim around tablecloth */}
      <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.13, 0.06, 8, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </mesh>

      {/* Glossy Strawberry-Pink Teapot in the Center */}
      <group position={[0, 1.03, 0]}>
        <mesh position={[0, 0.22, 0]} scale={[1.05, 0.9, 1.05]}>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshPhysicalMaterial color="#ff6eb4" roughness={0.14} clearcoat={0.92} />
        </mesh>
        {/* Teapot lid & golden knob */}
        <mesh position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.07, 14]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.16} clearcoat={0.85} />
        </mesh>
        <mesh position={[0, 0.51, 0]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#fde047" metalness={0.5} roughness={0.2} />
        </mesh>
        {/* Spout & handle */}
        <mesh position={[0.28, 0.24, 0]} rotation={[0, 0, -0.65]}>
          <cylinderGeometry args={[0.035, 0.055, 0.24, 10]} />
          <meshPhysicalMaterial color="#ff6eb4" roughness={0.16} clearcoat={0.85} />
        </mesh>
        <mesh position={[-0.26, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.12, 0.032, 8, 14]} />
          <meshPhysicalMaterial color="#ff6eb4" roughness={0.16} clearcoat={0.85} />
        </mesh>
      </group>

      {/* Tiny Pastel Cupcakes & Macarons on the Table */}
      {[
        [-0.52, 1.06, 0.28, "#fde047"],
        [0.52, 1.06, 0.24, "#c084fc"],
        [-0.36, 1.06, -0.46, "#7dd3fc"],
        [0.4, 1.06, -0.42, "#fda4af"],
      ].map(([tx, ty, tz, col], idx) => (
        <group key={`treat-${idx}`} position={[tx as number, ty as number, tz as number]}>
          {idx % 2 === 0 ? (
            <>
              {/* Cupcake */}
              <mesh position={[0, 0.07, 0]}>
                <cylinderGeometry args={[0.11, 0.085, 0.14, 12]} />
                <meshStandardMaterial color="#fde68a" roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.18, 0]}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshPhysicalMaterial color={col as string} roughness={0.2} clearcoat={0.75} />
              </mesh>
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshPhysicalMaterial color="#ff4d94" roughness={0.15} clearcoat={0.9} />
              </mesh>
            </>
          ) : (
            <>
              {/* Macaron */}
              <mesh position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.05, 14]} />
                <meshPhysicalMaterial color={col as string} roughness={0.22} clearcoat={0.7} />
              </mesh>
              <mesh position={[0, 0.08, 0]}>
                <cylinderGeometry args={[0.11, 0.11, 0.035, 14]} />
                <meshStandardMaterial color="#ffffff" roughness={0.35} />
              </mesh>
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.05, 14]} />
                <meshPhysicalMaterial color={col as string} roughness={0.22} clearcoat={0.7} />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Two Cute Little Pastel Tea Stools */}
      {[-1.25, 1.25].map((sx, idx) => (
        <group key={`stool-${idx}`} position={[sx, 0, 0.25]}>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.12, 0.16, 0.44, 10]} />
            <meshStandardMaterial color="#fff1f7" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.12, 16]} />
            <meshPhysicalMaterial
              color={idx === 0 ? "#fbcfe8" : "#e9d5ff"}
              roughness={0.25}
              clearcoat={0.55}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Kuromi's Playful Lavender & Deep-Plum Starlight Concert Stage with twin jester-pointed roof spires, glowing pink heart backdrop arch & spinning floating purple stars
export function KuromiStage3D({
  position = KUROMI_STAGE_POS,
}: {
  position?: Vec3;
}) {
  const starOrbitRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (starOrbitRef.current) {
      starOrbitRef.current.rotation.y = state.clock.elapsedTime * 0.85;
    }
  });

  return (
    <group position={position} rotation={[0, -0.45, 0]}>
      {/* Raised Lavender & Plum Concert Deck */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[2.35, 2.55, 0.52, 24]} />
        <meshPhysicalMaterial color="#581c87" roughness={0.28} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <cylinderGeometry args={[2.18, 2.25, 0.08, 24]} />
        <meshPhysicalMaterial color="#c084fc" roughness={0.22} clearcoat={0.75} />
      </mesh>
      {/* Glowing stage rim dots */}
      {[-1.4, -0.7, 0, 0.7, 1.4].map((lx, idx) => (
        <mesh key={`slight-${idx}`} position={[lx, 0.58, 2.02]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#ff85c0" : "#fde047"}
            emissive={idx % 2 === 0 ? "#ec4899" : "#f59e0b"}
            emissiveIntensity={1.1}
          />
        </mesh>
      ))}

      {/* Back Stage Pillars */}
      {[-1.72, 1.72].map((px) => (
        <group key={`kpil-${px}`} position={[px, 0.56, -0.85]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.22, 0.26, 2.8, 12]} />
            <meshPhysicalMaterial color="#6b21a8" roughness={0.26} clearcoat={0.6} />
          </mesh>
          <mesh position={[0, 2.85, 0]}>
            <sphereGeometry args={[0.28, 12, 12]} />
            <meshPhysicalMaterial color="#ff6eb4" roughness={0.2} clearcoat={0.8} />
          </mesh>
        </group>
      ))}

      {/* Glowing Pink Heart Backdrop Arch */}
      <group position={[0, 2.1, -0.85]}>
        <mesh>
          <torusGeometry args={[1.72, 0.16, 12, 32, Math.PI]} />
          <meshPhysicalMaterial
            color="#ff6eb4"
            emissive="#ec4899"
            emissiveIntensity={0.45}
            roughness={0.18}
            clearcoat={0.85}
          />
        </mesh>
        {/* Big glowing neon pink heart centerpiece */}
        <ExtrudedHeart3D
          position={[0, 0.65, 0.08]}
          scale={1.08}
          color="#ff85c0"
          emissive="#ec4899"
          emissiveIntensity={0.75}
        />
      </group>

      {/* Twin Jester-Pointed Roof Spires with Golden Bell Tips */}
      {[-1.08, 1.08].map((sx, idx) => (
        <group
          key={`jspire-${idx}`}
          position={[sx, 3.85, -0.85]}
          rotation={[0, 0, sx < 0 ? 0.34 : -0.34]}
        >
          <mesh position={[0, 0.65, 0]}>
            <coneGeometry args={[0.56, 1.55, 14]} />
            <meshPhysicalMaterial color="#4c1d95" roughness={0.25} clearcoat={0.68} />
          </mesh>
          {/* Lavender collar cuff */}
          <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.52, 0.1, 8, 16]} />
            <meshPhysicalMaterial color="#d8b4fe" roughness={0.22} clearcoat={0.7} />
          </mesh>
          {/* Golden jester bell pom-pom */}
          <mesh position={[0, 1.48, 0]}>
            <sphereGeometry args={[0.22, 14, 14]} />
            <meshStandardMaterial
              color="#fde047"
              emissive="#f59e0b"
              emissiveIntensity={0.65}
              metalness={0.45}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Cute Starlight Microphone Stand Front-Center */}
      <group position={[0, 0.58, 0.72]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.24, 0.28, 0.1, 14]} />
          <meshStandardMaterial color="#4c1d95" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.05, 10]} />
          <meshStandardMaterial color="#fde047" metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.18, 0.06]} rotation={[0.4, 0, 0]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshPhysicalMaterial color="#ff6eb4" roughness={0.18} clearcoat={0.9} />
        </mesh>
      </group>

      {/* Gently Spinning Floating Purple & Golden Stars Overhead */}
      <group ref={starOrbitRef} position={[0, 4.75, -0.2]}>
        {[0, 2.1, 4.2].map((ang, idx) => (
          <ExtrudedStar3D
            key={`kstar-${idx}`}
            position={[Math.cos(ang) * 1.45, Math.sin(ang * 2) * 0.22, Math.sin(ang) * 1.45]}
            scale={0.52}
            color={idx % 2 === 0 ? "#c084fc" : "#fde047"}
            emissive={idx % 2 === 0 ? "#a855f7" : "#f59e0b"}
            emissiveIntensity={0.78}
          />
        ))}
      </group>
    </group>
  );
}

// Kuromi's Cute Lavender & Plum-Trimmed Candy / Macaron Cart with striped pink/purple canopy & pastel treats
export function KuromiCandyCart3D({
  position = KUROMI_CANDY_CART_POS,
}: {
  position?: Vec3;
}) {
  const canopyStripes = [-0.72, -0.36, 0, 0.36, 0.72];

  return (
    <group position={position} rotation={[0, -0.35, 0]}>
      {/* Cart Body (Lavender & Plum trim) */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.75, 0.78, 1.02]} />
        <meshPhysicalMaterial color="#c084fc" roughness={0.25} clearcoat={0.55} />
      </mesh>
      <mesh position={[0, 1.06, 0]}>
        <boxGeometry args={[1.88, 0.12, 1.12]} />
        <meshPhysicalMaterial color="#6b21a8" roughness={0.25} clearcoat={0.6} />
      </mesh>
      {/* Front decorative pink heart badge */}
      <ExtrudedHeart3D
        position={[0, 0.66, 0.54]}
        scale={0.38}
        color="#ff85c0"
        emissive="#ec4899"
        emissiveIntensity={0.45}
      />

      {/* 4 Cute Pastel Wheels */}
      {[
        [-0.65, 0.26, 0.54],
        [0.65, 0.26, 0.54],
        [-0.65, 0.26, -0.54],
        [0.65, 0.26, -0.54],
      ].map(([wx, wy, wz], idx) => (
        <mesh
          key={`cwheel-${idx}`}
          position={[wx, wy, wz]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.26, 0.26, 0.1, 16]} />
          <meshPhysicalMaterial color="#581c87" roughness={0.3} clearcoat={0.5} />
        </mesh>
      ))}

      {/* 4 Canopy Support Poles */}
      {[
        [-0.78, 1.62, 0.44],
        [0.78, 1.62, 0.44],
        [-0.78, 1.62, -0.44],
        [0.78, 1.62, -0.44],
      ].map(([px, py, pz], idx) => (
        <mesh key={`cpole-${idx}`} position={[px, py, pz]}>
          <cylinderGeometry args={[0.045, 0.045, 1.12, 8]} />
          <meshStandardMaterial color="#fde047" metalness={0.45} roughness={0.25} />
        </mesh>
      ))}

      {/* Striped Pink & Purple Canopy Roof */}
      <group position={[0, 2.24, 0]}>
        {canopyStripes.map((sx, idx) => (
          <mesh key={`cstripe-${idx}`} position={[sx, 0, 0]}>
            <boxGeometry args={[0.36, 0.22, 1.24]} />
            <meshPhysicalMaterial
              color={idx % 2 === 0 ? "#ff6eb4" : "#7e22ce"}
              roughness={0.24}
              clearcoat={0.62}
            />
          </mesh>
        ))}
        {/* Cute golden star finial on top of the cart */}
        <ExtrudedStar3D
          position={[0, 0.36, 0]}
          scale={0.42}
          color="#fde047"
          emissive="#f59e0b"
          emissiveIntensity={0.65}
        />
      </group>

      {/* Pastel Macaron Stacks & Treats on Display */}
      {[
        [-0.48, 1.18, 0.12, "#ff85c0"],
        [0, 1.18, -0.1, "#fde047"],
        [0.48, 1.18, 0.14, "#7dd3fc"],
      ].map(([mx, my, mz, col], idx) => (
        <group key={`cmac-${idx}`} position={[mx as number, my as number, mz as number]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.12, 14]} />
            <meshPhysicalMaterial color={col as string} roughness={0.2} clearcoat={0.78} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.1, 14]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.22} clearcoat={0.65} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.1, 14]} />
            <meshPhysicalMaterial color={col as string} roughness={0.2} clearcoat={0.78} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Grand Center-South Friendship Arch & Tiered Birthday Macaron/Heart Fountain Monument celebrating Sarvin's 5th Birthday!
export function FriendshipHeartMonument3D({
  position = FRIENDSHIP_MONUMENT_POS,
}: {
  position?: Vec3;
}) {
  const topperRef = useRef<THREE.Group>(null);
  const starRingAngles = useMemo(
    () => Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2),
    []
  );

  useFrame((state) => {
    if (topperRef.current) {
      topperRef.current.rotation.y = state.clock.elapsedTime * 0.95;
      topperRef.current.position.y = 3.45 + Math.sin(state.clock.elapsedTime * 2.4) * 0.12;
    }
  });

  return (
    <group position={position}>
      {/* Wide Pastel Marble Circular Plinth */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[2.25, 2.48, 0.44, 28]} />
        <meshPhysicalMaterial color="#fff1f7" roughness={0.24} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[1.95, 2.1, 0.14, 28]} />
        <meshPhysicalMaterial color="#fbcfe8" roughness={0.24} clearcoat={0.55} />
      </mesh>

      {/* Tiered Giant Pastel Birthday Macaron Fountain */}
      {/* Tier 1: Strawberry Pink Macaron */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[1.38, 1.42, 0.56, 26]} />
        <meshPhysicalMaterial color="#ff85c0" roughness={0.2} clearcoat={0.72} />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[1.32, 1.32, 0.16, 26]} />
        <meshStandardMaterial color="#ffffff" roughness={0.32} />
      </mesh>
      {/* Tier 2: Lavender Macaron */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.96, 1.02, 0.58, 24]} />
        <meshPhysicalMaterial color="#c084fc" roughness={0.2} clearcoat={0.72} />
      </mesh>
      <mesh position={[0, 1.82, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.14, 24]} />
        <meshStandardMaterial color="#fef9c3" roughness={0.32} />
      </mesh>
      {/* Tier 3: Pastel Gold / Cream Top Tier */}
      <mesh position={[0, 2.18, 0]}>
        <cylinderGeometry args={[0.58, 0.64, 0.56, 22]} />
        <meshPhysicalMaterial color="#fde68a" roughness={0.22} clearcoat={0.7} />
      </mesh>

      {/* 5 Golden Birthday Stars Ring Celebrating Sarvin's 5th Birthday! */}
      {starRingAngles.map((ang, idx) => (
        <ExtrudedStar3D
          key={`bday5-star-${idx}`}
          position={[Math.cos(ang) * 1.12, 1.98, Math.sin(ang) * 1.12]}
          scale={0.34}
          color="#fde047"
          emissive="#f59e0b"
          emissiveIntensity={0.78}
        />
      ))}

      {/* Twin Friendship Arch Framing the Monument (Pink Left + Lavender Right) */}
      <mesh position={[-1.88, 1.85, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 3.0, 12]} />
        <meshPhysicalMaterial color="#ff6eb4" roughness={0.22} clearcoat={0.68} />
      </mesh>
      <mesh position={[1.88, 1.85, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 3.0, 12]} />
        <meshPhysicalMaterial color="#a855f7" roughness={0.22} clearcoat={0.68} />
      </mesh>
      <mesh position={[0, 3.35, 0]}>
        <torusGeometry args={[1.88, 0.16, 12, 34, Math.PI]} />
        <meshPhysicalMaterial color="#ff85c0" roughness={0.2} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 3.35, 0]}>
        <torusGeometry args={[1.6, 0.1, 10, 30, Math.PI]} />
        <meshPhysicalMaterial color="#c084fc" roughness={0.2} clearcoat={0.8} />
      </mesh>

      {/* Floating Gently Spinning Giant Glowing Friendship Heart Topper */}
      <group ref={topperRef} position={[0, 3.45, 0]}>
        <ExtrudedHeart3D
          position={[0, 0, 0]}
          scale={1.12}
          color="#ff6eb4"
          emissive="#ec4899"
          emissiveIntensity={0.85}
        />
      </group>
    </group>
  );
}

// Perimeter ribbon fence of the 44 × 44 island: west & east edges, the south edge (pink | lavender halves) and the
// north edge either side of the bridge opening (x ∈ [-2.8, 2.8])
const MELODY_FENCE_ROWS: RibbonFenceRow[] = [
  { from: [-21.4, 29.1], to: [-21.4, 71.9], theme: "pink" },
  { from: [21.4, 29.1], to: [21.4, 71.9], theme: "lavender" },
  { from: [-21.4, 71.9], to: [0, 71.9], theme: "pink" },
  { from: [0, 71.9], to: [21.4, 71.9], theme: "lavender" },
  { from: [-21.4, 29.1], to: [-2.8, 29.1], theme: "pink" },
  { from: [2.8, 29.1], to: [21.4, 29.1], theme: "lavender" },
];
const PROMENADE_TILES = [30.4, 33.0, 35.6, 38.2, 40.8, 43.4, 46.0];

// Floating 44 × 44 Dual-Theme My Melody & Kuromi Land Island (x ∈ [-22, 22], z ∈ [28.5, 72.5], centred at [0, 0, 50.5])
export function MelodyKuromiPlatform3D({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const cz = (MELODY_ISLAND.minZ + MELODY_ISLAND.maxZ) / 2;
  const cloudPuffs: [number, number, number, number][] = [
    [-20.5, -2.5, 31.0, 2.8],
    [20.5, -2.5, 31.0, 2.8],
    [-21.0, -2.6, 43.0, 3.2],
    [21.0, -2.6, 43.0, 3.2],
    [-21.0, -2.6, 56.0, 3.2],
    [21.0, -2.6, 56.0, 3.2],
    [-20.5, -2.5, 69.0, 2.9],
    [20.5, -2.5, 69.0, 2.9],
    [0, -3.0, 72.2, 3.4],
    [-10.5, -2.9, 71.8, 2.9],
    [10.5, -2.9, 71.8, 2.9],
  ];

  // Spots the grass tufts stay off: solid things, paths, rides, pads and the monument plaza
  const melodyTuftClear = useMemo(() => {
    const [wx, , wz] = MELODY_WHEEL_POS;
    return [
      ...CIRCLE_OBSTACLES.map((o) => ({ x: o.x, z: o.z, r: o.r + 0.3 })),
      ...MELODY_PATH_STONES.map(([x, z]) => ({ x, z, r: 0.9 })),
      ...PROMENADE_TILES.map((z) => ({ x: 0, z, r: 1.3 })),
      ...[...MELODY_JELLY_PADS, ...KUROMI_STAR_PADS].map(([x, , z]) => ({ x, z, r: 1.2 })),
      ...[-2.6, 0, 2.6].map((dx) => ({ x: wx + dx, z: wz, r: 2.2 })),
      { x: MELODY_WHEEL_PAD[0], z: MELODY_WHEEL_PAD[2], r: 1.2 },
      { x: KUROMI_RINK_POS[0], z: KUROMI_RINK_POS[2], r: KUROMI_RINK_R + 0.3 },
      { x: FRIENDSHIP_MONUMENT_POS[0], z: FRIENDSHIP_MONUMENT_POS[2], r: 3.3 },
    ];
  }, []);

  return (
    <group>
      {/* === CLICKABLE PASTEL MINT-PINK LAWN (44 × 44, top at y = 0) === */}
      <GrassDeck3D position={[0, -0.25, cz]} size={[44, 0.5, 44]} color="#a8e6b0" onPointerDown={onGroundClick} />
      <GrassTufts3D
        minX={MELODY_ISLAND.minX + 0.4}
        maxX={MELODY_ISLAND.maxX - 0.4}
        minZ={MELODY_ISLAND.minZ + 0.5}
        maxZ={MELODY_ISLAND.maxZ - 0.5}
        count={620}
        keepClear={melodyTuftClear}
        seed={37}
      />

      {/* Central Pastel Friendship Promenade Stepping Tiles */}
      {PROMENADE_TILES.map((tz, idx) => (
        <mesh key={`mprom-${idx}`} position={[0, 0.026, tz]} onPointerDown={onGroundClick}>
          <cylinderGeometry args={[0.92, 0.98, 0.036, 16]} />
          <meshStandardMaterial color={idx % 2 === 0 ? "#fbcfe8" : "#e9d5ff"} roughness={0.42} />
        </mesh>
      ))}
      {/* Pink & lavender plaza round the Friendship Monument */}
      <mesh position={[FRIENDSHIP_MONUMENT_POS[0], 0.018, FRIENDSHIP_MONUMENT_POS[2]]} onPointerDown={onGroundClick}>
        <cylinderGeometry args={[3.2, 3.2, 0.036, 40]} />
        <meshStandardMaterial color="#ffe4f1" roughness={0.45} />
      </mesh>
      <mesh position={[FRIENDSHIP_MONUMENT_POS[0], 0.04, FRIENDSHIP_MONUMENT_POS[2]]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 0.08, 6, 48]} />
        <meshStandardMaterial color="#e9d5ff" roughness={0.4} />
      </mesh>
      <CandyPathStones3D stones={MELODY_PATH_STONES} />

      {/* Chunky Dual-Tone Pink (west) & Lavender (east) Floating Cliff Underside — butt-jointed at x = 0 */}
      <mesh position={[-10.8, -1.55, cz]}>
        <boxGeometry args={[21.6, 2.1, 43.2]} />
        <meshStandardMaterial color="#f472b6" roughness={0.75} />
      </mesh>
      <mesh position={[10.8, -1.55, cz]}>
        <boxGeometry args={[21.6, 2.1, 43.2]} />
        <meshStandardMaterial color="#a855f7" roughness={0.75} />
      </mesh>
      <mesh position={[-10.45, -3.05, cz]}>
        <boxGeometry args={[20.9, 0.9, 41.8]} />
        <meshStandardMaterial color="#ec4899" roughness={0.82} />
      </mesh>
      <mesh position={[10.45, -3.05, cz]}>
        <boxGeometry args={[20.9, 0.9, 41.8]} />
        <meshStandardMaterial color="#7e22ce" roughness={0.82} />
      </mesh>

      {/* Fluffy Pastel Clouds Tucked Underneath */}
      {cloudPuffs.map(([px, py, pz, pr], idx) => (
        <mesh key={`mcloud-${idx}`} position={[px, py, pz]} scale={[1.35, 0.62, 1.25]}>
          <sphereGeometry args={[pr, 16, 16]} />
          <meshStandardMaterial color={idx % 2 === 0 ? "#fff0f7" : "#f5f3ff"} roughness={0.55} />
        </mesh>
      ))}

      {/* === PERIMETER PASTEL PINK & LAVENDER RIBBON FENCE === */}
      <PastelRibbonFence3D rows={MELODY_FENCE_ROWS} />

      {/* === LANDMARK BUILDINGS & PROPS === */}
      <MelodyCottage3D position={MELODY_COTTAGE_POS} />
      <KawaiiTeaTable3D position={MELODY_TEA_TABLE_POS} />
      <KuromiStage3D position={KUROMI_STAGE_POS} />
      <KuromiCandyCart3D position={KUROMI_CANDY_CART_POS} />
      <FriendshipHeartMonument3D position={FRIENDSHIP_MONUMENT_POS} />

      {/* === PLAY AREAS === */}
      <StrawberryGarden3D />
      <KuromiMoonSwing3D />
      {MELODY_JELLY_PADS.map((p, idx) => (
        <BouncePad3D key={`mjelly-${idx}`} position={p} variant="jelly" />
      ))}
      {KUROMI_STAR_PADS.map((p, idx) => (
        <BouncePad3D key={`kstar-${idx}`} position={p} variant="star" />
      ))}
      <TeacupTwirl3D />
      <MelodyFerrisWheel3D />
      <KuromiSkateRink3D />

      {/* === WAVING MY MELODY & CHEERING KUROMI BUNNY HOSTS === */}
      <KawaiiBunnyFriend3D variant="pink" position={MELODY_HOST_POS} rotation={[0, 2.55, 0]} scale={1.5} />
      <KawaiiBunnyFriend3D variant="purple" position={KUROMI_HOST_POS} rotation={[0, -2.55, 0]} scale={1.5} />

      {/* === PASTEL TREES, FLOWERS, LOLLIPOPS, LAMPS & GIFTS === */}
      <PastelTreeBatch3D spots={MELODY_TREE_SPOTS} />
      <GiantFlowerBatch3D spots={MELODY_FLOWER_SPOTS} />
      <LollipopBatch3D spots={MELODY_LOLLIPOP_SPOTS} />
      <FairyLampBatch3D spots={MELODY_LAMP_SPOTS} />
      <GiftBoxBatch3D spots={MELODY_GIFT_SPOTS} />

      {/* === PINK & LAVENDER FAIRY SPARKLES === */}
      <Sparkles count={64} position={[-11, 3.6, cz]} scale={[20, 7, 40]} size={4.6} speed={0.36} color="#f472b6" />
      <Sparkles count={64} position={[11, 3.6, cz]} scale={[20, 7, 40]} size={4.6} speed={0.36} color="#c084fc" />
      <Sparkles count={24} position={[-12.6, 7.5, 63.6]} scale={[11, 9, 4]} size={5.5} speed={0.3} color="#fde68a" />
    </group>
  );
}
