"use client";

import React from "react";
import type { ThreeEvent } from "@react-three/fiber";
import {
  FluffyCloud3D,
  KawaiiGiftBox3D,
  MagicWand3D,
  RainbowArch3D,
} from "../MagicalDecor3D";
import {
  BounceMushroom3D,
  Butterfly3D,
  CrystalCluster3D,
  CrystalIceBridge3D,
  DinoLandPlatform3D,
  DinoLogBridge3D,
  FairyLampPost3D,
  FenceRow3D,
  FrozenLandPlatform3D,
  FrozenPineTree3D,
  GiantFlower3D,
  GiantLollipop3D,
  IceArchway3D,
  JungleArchway3D,
  MelodyKuromiArchway3D,
  MelodyKuromiPlatform3D,
  PastelRibbonBridge3D,
  PastelTree3D,
  RoyalBridge3D,
  RoyalCastlePlatform3D,
  TropicalPalmTree3D,
  WishingFountain3D,
} from "./assets";
import {
  BOUNCE_MUSHROOMS,
  BUTTERFLY_SPOTS,
  CLOUD_SPOTS,
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

function CastleWorldTerrainImpl({
  onGroundClick,
}: {
  onGroundClick: (e: ThreeEvent<PointerEvent>) => void;
}) {
  return (
    <>
      {/* HUGE Chunky Layered Super-Mario-3D-World Grass Island (40×38!) */}
      <group>
        <mesh position={[0, -0.25, 2.0]} onPointerDown={onGroundClick} receiveShadow>
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
              {isFrozen ? (
                <>
                  <FrozenPineTree3D position={[-0.4, 0.42, 0]} color={isl.treeColor} scale={1.05} />
                  <CrystalCluster3D position={[1.1, 0.42, 0.6]} palette="ice" />
                </>
              ) : isCastle ? (
                <>
                  <PastelTree3D position={[-0.4, 0.42, 0]} color={isl.treeColor} scale={0.95} />
                  <CrystalCluster3D position={[1.05, 0.42, 0.5]} palette="magic" />
                </>
              ) : isDino ? (
                <TropicalPalmTree3D position={[-0.3, 0.42, 0]} color={isl.treeColor} scale={0.95} />
              ) : isMelody ? (
                <>
                  <PastelTree3D position={[-0.55, 0.42, -0.2]} color={isl.treeColor} scale={0.95} />
                  <GiantLollipop3D
                    position={[1.05, 0.42, 0.55]}
                    color={isWestMelody ? "#ff6eb4" : "#c084fc"}
                    scale={0.85}
                  />
                </>
              ) : (
                <PastelTree3D position={[0, 0.4, 0]} color={isl.treeColor} scale={1.0} />
              )}
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
      {LAMP_SPOTS.map((lp, i) => (
        <FairyLampPost3D key={`lamp-${i}`} position={lp} />
      ))}

      {/* Central Wishing Fountain */}
      <WishingFountain3D position={[0, 0, 3.6]} />

      {/* Cotton-Candy Trees */}
      {TREE_SPOTS.map((tr, i) => (
        <PastelTree3D key={`tree-${i}`} position={tr.pos} color={tr.color} scale={tr.scale} />
      ))}

      {/* Giant Kawaii Flowers (Melody's Meadow & Castle Courtyard planters) */}
      {FLOWER_SPOTS.map((fl, i) => (
        <GiantFlower3D key={`fl-${i}`} position={fl.pos} color={fl.color} />
      ))}

      {/* Giant Swirled Lollipops (Southwest Candy Forest!) */}
      {LOLLIPOP_SPOTS.map((lol, i) => (
        <GiantLollipop3D
          key={`lol-${i}`}
          position={lol.pos}
          color={lol.color}
          scale={lol.scale}
        />
      ))}

      {/* Glowing Magic Crystal Clusters (East Kuromi Plaza!) */}
      {CRYSTAL_SPOTS.map((cp, i) => (
        <CrystalCluster3D key={`crys-${i}`} position={cp} />
      ))}

      {/* Fluttering 3D Butterflies */}
      {BUTTERFLY_SPOTS.map((bf, i) => (
        <Butterfly3D key={`bf-${i}`} center={bf.center} color={bf.color} speed={bf.speed} />
      ))}

      {/* Bouncy Pink Mushrooms */}
      {BOUNCE_MUSHROOMS.map((m, i) => (
        <BounceMushroom3D key={`mush-${i}`} position={m} />
      ))}

      {/* Gift Boxes & Magic Wands around the Kingdom & Castle Courtyard */}
      {GIFT_SPOTS.map((g, i) => (
        <KawaiiGiftBox3D
          key={`gift-${i}`}
          position={g.pos}
          scale={g.scale}
          boxColor={g.boxColor}
          ribbonColor={g.ribbonColor}
        />
      ))}
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
    </>
  );
}

// Static world geometry: only redraw if the (stable) click handler changes, not on every pickup/message
export const CastleWorldTerrain = React.memo(CastleWorldTerrainImpl);
