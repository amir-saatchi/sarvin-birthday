"use client";

import React from "react";
import { GrassDeck3D, GrassTufts3D } from "./assets/GrassAssets";
import { StaticMerge } from "./assets/StaticMerge";
import {
  BounceMushroomBatch3D,
  CrystalClusterBatch3D,
  FairyLampBatch3D,
  GiantFlowerBatch3D,
  GiftBoxBatch3D,
  LollipopBatch3D,
  PalmTreeBatch3D,
  PastelTreeBatch3D,
} from "./assets/BatchedProps";
import type { Vec3 } from "./types";
import type { ThreeEvent } from "@react-three/fiber";
import {
  FluffyCloud3D,
  MagicWand3D,
  RainbowArch3D,
} from "../MagicalDecor3D";
import {
  Butterfly3D,
  CrystalIceBridge3D,
  DinoLandPlatform3D,
  DinoLogBridge3D,
  FenceRow3D,
  FrozenLandPlatform3D,
  FrozenPineTree3D,
  IceArchway3D,
  JungleArchway3D,
  MelodyKuromiArchway3D,
  MelodyKuromiPlatform3D,
  PastelRibbonBridge3D,
  RoyalBridge3D,
  RoyalCastlePlatform3D,
  WishingFountain3D,
} from "./assets";
import {
  BOUNCE_MUSHROOMS,
  BUTTERFLY_SPOTS,
  CLOUD_SPOTS,
  CIRCLE_OBSTACLES,
  CRYSTAL_SPOTS,
  FENCE_SPOTS,
  FLOWER_SPOTS,
  GIFT_SPOTS,
  LAMP_SPOTS,
  LILY_PAD_SPOTS,
  LOLLIPOP_SPOTS,
  RAISED_TERRACES,
  SKY_MINI_ISLANDS,
  STEPPING_STONES,
  TREE_SPOTS,
} from "./worldData";

// Spots the garden's grass tufts stay off: paths, carpet, pond, picnic meadow and everything solid
const GARDEN_TUFT_CLEAR = [
  ...CIRCLE_OBSTACLES.map((o) => ({ x: o.x, z: o.z, r: o.r + 0.3 })),
  ...STEPPING_STONES.map(([x, z]) => ({ x, z, r: 1.0 })),
  ...Array.from({ length: 11 }, (_, i) => ({ x: 0, z: -6 - i * 1.1, r: 1.7 })),
  { x: 11.6, z: 11.4, r: 3.9 },
  { x: -11.5, z: 11.6, r: 3.7 },
];

// Props standing on the distant sky mini-islands, gathered so each kind is one batched draw
const islandAt = (pos: Vec3, dx: number, dy: number, dz: number): Vec3 => [pos[0] + dx, pos[1] + dy, pos[2] + dz];
const SKY_TREES = SKY_MINI_ISLANDS.flatMap((isl) =>
  isl.theme === "castle"
    ? [{ pos: islandAt(isl.pos, -0.4, 0.42, 0), color: isl.treeColor, scale: 0.95 }]
    : isl.theme === "melody"
      ? [{ pos: islandAt(isl.pos, -0.55, 0.42, -0.2), color: isl.treeColor, scale: 0.95 }]
      : isl.theme === "grass"
        ? [{ pos: islandAt(isl.pos, 0, 0.4, 0), color: isl.treeColor, scale: 1.0 }]
        : []
);
const SKY_PALMS = SKY_MINI_ISLANDS.filter((isl) => isl.theme === "dino").map((isl) => ({
  pos: islandAt(isl.pos, -0.3, 0.42, 0),
  color: isl.treeColor,
  scale: 0.95,
}));
const SKY_LOLLIPOPS = SKY_MINI_ISLANDS.filter((isl) => isl.theme === "melody").map((isl) => ({
  pos: islandAt(isl.pos, 1.05, 0.42, 0.55),
  color: isl.pos[0] < 0 ? "#ff6eb4" : "#c084fc",
  scale: 0.85,
}));
const SKY_MAGIC_CRYSTALS = SKY_MINI_ISLANDS.filter((isl) => isl.theme === "castle").map((isl) =>
  islandAt(isl.pos, 1.05, 0.42, 0.5)
);
const SKY_ICE_CRYSTALS = SKY_MINI_ISLANDS.filter((isl) => isl.theme === "frozen").map((isl) =>
  islandAt(isl.pos, 1.1, 0.42, 0.6)
);
const GARDEN_TREES = [...TREE_SPOTS, ...SKY_TREES];
const GARDEN_LOLLIPOPS = [...LOLLIPOP_SPOTS, ...SKY_LOLLIPOPS];
const GARDEN_MAGIC_CRYSTALS = [...CRYSTAL_SPOTS, ...SKY_MAGIC_CRYSTALS];

function CastleWorldTerrainImpl({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  return (
    <StaticMerge>
      {/* HUGE Chunky Layered Super-Mario-3D-World Grass Island (40×38!) */}
      <group>
        <GrassDeck3D position={[0, -0.25, 2.0]} size={[40, 0.5, 38]} color="#4ade80" onPointerDown={onGroundClick} />
        <GrassTufts3D minX={-19.4} maxX={19.4} minZ={-16.6} maxZ={20.4} count={700} keepClear={GARDEN_TUFT_CLEAR} seed={11} />
        <mesh position={[0, -1.6, 2.0]}>
          <boxGeometry args={[39.4, 2.2, 37.4]} />
          <meshStandardMaterial color="#d97706" roughness={0.85} />
        </mesh>
        <mesh position={[0, -3.1, 2.0]}>
          <boxGeometry args={[38.4, 0.9, 36.4]} />
          <meshStandardMaterial color="#b45309" roughness={0.9} />
        </mesh>

        {/* Distant Floating Sky Mini-Islands — themed to match their neighboring world! */}
        {SKY_MINI_ISLANDS.map((isl, idx) => {
          const isFrozen = isl.theme === "frozen";
          const isCastle = isl.theme === "castle";
          const isDino = isl.theme === "dino";
          const isMelody = isl.theme === "melody";
          const isWestMelody = isMelody && isl.pos[0] < 0;
          const topColor = isFrozen
            ? "#f0f9ff"
            : isCastle
              ? "#fff5fa"
              : isDino
                ? "#65d46e"
                : isMelody
                  ? isWestMelody
                    ? "#ffe4f1"
                    : "#f3e8ff"
                  : "#4ade80";
          const cliffColor = isFrozen
            ? "#38bdf8"
            : isCastle
              ? "#c084fc"
              : isDino
                ? "#d97706"
                : isMelody
                  ? isWestMelody
                    ? "#f472b6"
                    : "#a855f7"
                  : "#c26512";

          return (
            <group key={`sky-isl-${idx}`} position={isl.pos}>
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[isl.size, 0.45, isl.size]} />
                <meshStandardMaterial color={topColor} roughness={isFrozen ? 0.35 : 0.65} />
              </mesh>
              <mesh position={[0, -0.7, 0]}>
                <boxGeometry args={[isl.size - 0.3, 1.4, isl.size - 0.3]} />
                <meshStandardMaterial color={cliffColor} roughness={isFrozen ? 0.35 : 0.85} />
              </mesh>
              {/* Trees, palms, lollipops & crystals on the islands are drawn by the batches below */}
              {isFrozen && <FrozenPineTree3D position={[-0.4, 0.42, 0]} color={isl.treeColor} scale={1.05} />}
            </group>
          );
        })}

        {/* Raised Corner Terraces (Super Mario 3D World stepped hills — clickable & jumpable!) */}
        {RAISED_TERRACES.map((ter, i) => (
          <group key={`ter-${i}`} position={[ter.x, ter.y, ter.z]}>
            <mesh position={[0, 0.2, 0]} onPointerDown={onGroundClick}>
              <boxGeometry args={[ter.halfW * 2, 0.35, ter.halfD * 2]} />
              <meshStandardMaterial color="#22c55e" roughness={0.65} />
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[ter.halfW * 2 - 0.3, 0.75, ter.halfD * 2 - 0.3]} />
              <meshStandardMaterial color="#c26512" roughness={0.85} />
            </mesh>
          </group>
        ))}

        {/* Royal Pink Carpet leading up through the Rainbow Arch to the bridge edge (z = -17.0) */}
        <mesh position={[0, 0.026, -11.45]} onPointerDown={onGroundClick}>
          <boxGeometry args={[2.6, 0.014, 11.1]} />
          <meshStandardMaterial color="#ff6eb4" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.02, -11.45]}>
          <boxGeometry args={[2.95, 0.01, 11.1]} />
          <meshStandardMaterial color="#fde047" roughness={0.4} />
        </mesh>

        {/* Pastel Stepping Stones */}
        {STEPPING_STONES.map(([sx, sz], idx) => (
          <mesh key={`st-${idx}`} position={[sx, 0.03, sz]} onPointerDown={onGroundClick}>
            <cylinderGeometry args={[0.66, 0.72, 0.07, 16]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? "#fde68a" : "#fbcfe8"}
              roughness={0.45}
            />
          </mesh>
        ))}

        {/* Southeast Shimmering Fairy Pond with Lily Pads & Lotus Blossoms */}
        <group position={[11.6, 0.03, 11.4]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onGroundClick}>
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
          {LILY_PAD_SPOTS.map(([lx, ly, lz], i) => (
            <group key={`lily-${i}`} position={[lx, ly, lz]}>
              <mesh onPointerDown={onGroundClick}>
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
        <mesh
          position={[-11.5, 0.03, 11.6]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={onGroundClick}
        >
          <circleGeometry args={[3.4, 28]} />
          <meshStandardMaterial color="#fbcfe8" roughness={0.6} />
        </mesh>
      </group>

      {/* Perimeter Pastel Fences */}
      {FENCE_SPOTS.map((fence, i) => (
        <FenceRow3D
          key={`fence-${i}`}
          position={fence.pos}
          rotation={fence.rotation}
          count={fence.count}
        />
      ))}

      {/* Giant Rainbow Arch framing the entrance to the Royal Bridge */}
      <RainbowArch3D position={[0, 0, -16.6]} scale={1.85} />

      {/* Walkable Royal Bridge & Floating Royal Castle Platform */}
      <RoyalBridge3D onGroundClick={onGroundClick} />
      <RoyalCastlePlatform3D onGroundClick={onGroundClick} />

      {/* West Frozen Land Gateway: Ice Archway, Crystal Ice Bridge & Floating Frozen Land */}
      <IceArchway3D position={[-19.6, 0, 2.0]} rotation={[0, Math.PI / 2, 0]} />
      <CrystalIceBridge3D onGroundClick={onGroundClick} />
      <FrozenLandPlatform3D onGroundClick={onGroundClick} />

      {/* East Dinosaur Land Gateway: Jungle Archway, Dino Log Bridge & Floating Dinosaur Land */}
      <JungleArchway3D position={[19.6, 0, 2.0]} rotation={[0, Math.PI / 2, 0]} />
      <DinoLogBridge3D onGroundClick={onGroundClick} />
      <DinoLandPlatform3D onGroundClick={onGroundClick} />

      {/* South My Melody & Kuromi Land Gateway: Dual-Theme Ribbon Archway, Pastel Ribbon Bridge & Floating Island */}
      <MelodyKuromiArchway3D position={[0, 0, 20.4]} />
      <PastelRibbonBridge3D onGroundClick={onGroundClick} />
      <MelodyKuromiPlatform3D onGroundClick={onGroundClick} />

      {/* Royal Lamp Posts (main avenue + castle courtyard) */}
      <FairyLampBatch3D spots={LAMP_SPOTS} />

      {/* Central Wishing Fountain */}
      <WishingFountain3D position={[0, 0, 3.6]} />

      {/* Cotton-Candy Trees */}
      <PastelTreeBatch3D spots={GARDEN_TREES} />
      <PalmTreeBatch3D spots={SKY_PALMS} />
      <CrystalClusterBatch3D spots={SKY_ICE_CRYSTALS} palette="ice" />

      {/* Giant Kawaii Flowers (Melody's Meadow & Castle Courtyard planters) */}
      <GiantFlowerBatch3D spots={FLOWER_SPOTS} />

      {/* Giant Swirled Lollipops (Southwest Candy Forest!) */}
      <LollipopBatch3D spots={GARDEN_LOLLIPOPS} />

      {/* Glowing Magic Crystal Clusters (East Kuromi Plaza!) */}
      <CrystalClusterBatch3D spots={GARDEN_MAGIC_CRYSTALS} />

      {/* Fluttering 3D Butterflies */}
      {BUTTERFLY_SPOTS.map((bf, i) => (
        <Butterfly3D key={`bf-${i}`} center={bf.center} color={bf.color} speed={bf.speed} />
      ))}

      {/* Bouncy Pink Mushrooms */}
      <BounceMushroomBatch3D spots={BOUNCE_MUSHROOMS} />

      {/* Gift Boxes & Magic Wands around the Kingdom & Castle Courtyard */}
      <GiftBoxBatch3D spots={GIFT_SPOTS} />
      <MagicWand3D position={[-13.0, 1.5, 0.8]} scale={1.1} />

      {/* Fluffy Sky Clouds */}
      {CLOUD_SPOTS.map((cloud, i) => (
        <FluffyCloud3D
          key={`cloud-${i}`}
          position={cloud.pos}
          scale={cloud.scale}
          tint={cloud.tint}
        />
      ))}
    </StaticMerge>
  );
}

// Static world geometry: only redraw if the (stable) click handler changes, not on every pickup/message
export const CastleWorldTerrain = React.memo(CastleWorldTerrainImpl);
