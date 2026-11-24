"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { getHeartGeometry } from "../../MagicalDecor3D";
import { defineProp, group, part, PropBatch, type PropPlacement } from "./PropBatch";
import type { Vec3 } from "../types";

// The world's most repeated props, each described once and drawn with one call for all its copies.
// Shapes and colours match the single-copy components they replace (PastelTree3D, GiantFlower3D…).

const { CylinderGeometry: Cyl, SphereGeometry: Sph, BoxGeometry: Box, ConeGeometry: Cone, TorusGeometry: Torus } =
  THREE;

// ---------- Recipes ----------

const PASTEL_TREE = defineProp(() => [
  part(new Cyl(0.2, 0.32, 1.9, 12), { pos: [0, 0.95, 0], color: "#d97706", roughness: 0.65 }),
  part(new Sph(0.95, 18, 18), { pos: [0, 2.15, 0], color: "tint", roughness: 0.32, clearcoat: 0.28 }),
  part(new Sph(0.6, 14, 14), { pos: [0.58, 1.85, 0.32], color: "tint", roughness: 0.32, clearcoat: 0.28 }),
  part(new Sph(0.62, 14, 14), { pos: [-0.54, 1.88, -0.25], color: "tint", roughness: 0.32, clearcoat: 0.28 }),
]);

const GIANT_FLOWER = defineProp(() => [
  part(new Cyl(0.055, 0.075, 0.9, 8), { pos: [0, 0.45, 0], color: "#22c55e", roughness: 0.5 }),
  part(new Sph(0.14, 10, 10), {
    pos: [0.16, 0.35, 0],
    rot: [0, 0, -0.5],
    scale: [1.4, 0.4, 0.7],
    color: "#4ade80",
    roughness: 0.45,
  }),
  ...group({ pos: [0, 0.95, 0], rot: [0.35, 0, 0] }, [
    part(new Sph(0.16, 12, 12), { color: "#fde047", roughness: 0.3 }),
    ...[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2;
      return part(new Sph(0.16, 12, 12), {
        pos: [Math.cos(a) * 0.24, Math.sin(a) * 0.24, -0.02],
        color: "tint",
        roughness: 0.25,
        clearcoat: 0.45,
      });
    }),
  ]),
]);

const BOUNCE_MUSHROOM = defineProp(() => [
  part(new Cyl(0.26, 0.34, 0.56, 14), { pos: [0, 0.28, 0], color: "#fffbeb", roughness: 0.4 }),
  part(new Sph(0.72, 20, 20), {
    pos: [0, 0.58, 0],
    scale: [1, 0.52, 1],
    color: "#ff5fa2",
    roughness: 0.22,
    clearcoat: 0.65,
  }),
  ...(
    [
      [0, 0.94, 0],
      [0.42, 0.78, 0.22],
      [-0.4, 0.78, 0.25],
      [0.12, 0.78, -0.45],
      [-0.3, 0.78, -0.32],
    ] as Vec3[]
  ).map((pos) => part(new Sph(0.12, 10, 10), { pos, color: "#ffffff", roughness: 0.3 })),
]);

const LOLLIPOP = defineProp(() => [
  part(new Cyl(0.07, 0.07, 1.8, 10), { pos: [0, 0.9, 0], color: "#ffffff", roughness: 0.3 }),
  part(new Cyl(0.62, 0.62, 0.22, 24), {
    pos: [0, 2.0, 0],
    rot: [Math.PI / 2, 0, 0],
    color: "tint",
    roughness: 0.18,
    clearcoat: 0.8,
  }),
  part(new Torus(0.36, 0.06, 10, 22), { pos: [0, 2.0, 0.12], color: "tint2", roughness: 0.25 }),
  part(new Torus(0.16, 0.05, 10, 18), { pos: [0, 2.0, 0.13], color: "tint2", roughness: 0.25 }),
]);

const FAIRY_LAMP = defineProp(() => [
  part(new Cyl(0.2, 0.26, 0.2, 12), { pos: [0, 0.1, 0], color: "#fbbf24", metalness: 0.5, roughness: 0.25 }),
  part(new Cyl(0.06, 0.08, 2.0, 10), { pos: [0, 1.15, 0], color: "#fde68a", metalness: 0.45, roughness: 0.25 }),
  part(new Sph(0.26, 16, 16), {
    pos: [0, 2.25, 0],
    color: "#fef08a",
    roughness: 1,
    emissive: "#fbbf24",
    emissiveIntensity: 1.2,
  }),
]);

const GIFT_BOX = defineProp(() => {
  const ribbon = { color: "tint2" as const, roughness: 0.2, clearcoat: 0.6 };
  return [
    part(new Box(0.56, 0.54, 0.56), { pos: [0, 0.28, 0], color: "tint", roughness: 0.25, clearcoat: 0.45 }),
    part(new Box(0.62, 0.13, 0.62), { pos: [0, 0.58, 0], color: "tint", roughness: 0.22, clearcoat: 0.55 }),
    part(new Box(0.64, 0.64, 0.12), { pos: [0, 0.32, 0], ...ribbon }),
    part(new Box(0.12, 0.64, 0.64), { pos: [0, 0.32, 0], ...ribbon }),
    part(new Torus(0.11, 0.036, 12, 20), { pos: [-0.12, 0.72, 0], rot: [0, 0, 0.45], ...ribbon }),
    part(new Torus(0.11, 0.036, 12, 20), { pos: [0.12, 0.72, 0], rot: [0, 0, -0.45], ...ribbon }),
    part(new Sph(0.065, 12, 12), { pos: [0, 0.7, 0], color: "tint2", roughness: 0.2 }),
  ];
});

const PALM_TREE = defineProp(() => {
  const segments: { pos: Vec3; rotZ: number; rTop: number; rBot: number }[] = [
    { pos: [0, 0.4, 0], rotZ: -0.06, rTop: 0.24, rBot: 0.3 },
    { pos: [0.08, 1.15, 0], rotZ: -0.14, rTop: 0.21, rBot: 0.25 },
    { pos: [0.22, 1.88, 0], rotZ: -0.2, rTop: 0.18, rBot: 0.22 },
    { pos: [0.4, 2.58, 0], rotZ: -0.15, rTop: 0.15, rBot: 0.19 },
    { pos: [0.54, 3.24, 0], rotZ: -0.06, rTop: 0.13, rBot: 0.16 },
  ];
  const frond = { roughness: 0.35, clearcoat: 0.28 };
  return [
    ...segments.map((seg, idx) =>
      part(new Cyl(seg.rTop, seg.rBot, 0.82, 10), {
        pos: seg.pos,
        rot: [0, 0, seg.rotZ],
        color: idx % 2 === 0 ? "#a16207" : "#92400e",
        roughness: 0.82,
      })
    ),
    ...group({ pos: [0.58, 3.62, 0] }, [
      ...[0, 2.1, 4.2].map((ang) =>
        part(new Sph(0.17, 12, 12), {
          pos: [Math.cos(ang) * 0.24, -0.14, Math.sin(ang) * 0.24],
          color: "#78350f",
          roughness: 0.38,
          clearcoat: 0.35,
        })
      ),
      ...[0, 1.05, 2.1, 3.15, 4.2, 5.25].flatMap((ang, idx) =>
        group({ rot: [0, ang, 0] }, [
          part(new Sph(0.58, 12, 10), {
            pos: [0.58, 0.22, 0],
            rot: [0, 0, 0.34],
            scale: [1.35, 0.18, 0.45],
            color: idx % 2 === 0 ? "tint" : "#4ade80",
            ...frond,
          }),
          part(new Sph(0.52, 12, 10), {
            pos: [1.45, 0.08, 0],
            rot: [0, 0, -0.45],
            scale: [1.15, 0.14, 0.36],
            color: idx % 2 === 0 ? "#4ade80" : "tint",
            ...frond,
          }),
        ])
      ),
    ]),
  ];
});

const JUNGLE_LANTERN = defineProp(() => [
  part(new Cyl(0.2, 0.28, 0.24, 8), { pos: [0, 0.12, 0], color: "#b45309", roughness: 0.8 }),
  part(new Cyl(0.07, 0.095, 1.9, 8), { pos: [0, 1.12, 0], color: "#a16207", roughness: 0.72 }),
  ...[0.65, 1.25, 1.8].map((ny) =>
    part(new Torus(0.09, 0.024, 6, 12), {
      pos: [0, ny, 0],
      rot: [Math.PI / 2, 0, 0],
      color: "#78350f",
      roughness: 0.78,
    })
  ),
  part(new Cyl(0.22, 0.13, 0.12, 8), { pos: [0, 2.08, 0], color: "#78350f", roughness: 0.75 }),
  part(new Sph(0.24, 16, 16), {
    pos: [0, 2.38, 0],
    color: "#fef08a",
    emissive: "#f59e0b",
    emissiveIntensity: 1.25,
    roughness: 0.12,
    clearcoat: 0.9,
    pulse: 0.08,
  }),
  part(new Cone(0.32, 0.22, 8), { pos: [0, 2.68, 0], color: "#22c55e", roughness: 0.55 }),
]);

const ICE_LANTERN = defineProp(() => [
  part(new Cyl(0.2, 0.28, 0.24, 6), { pos: [0, 0.12, 0], color: "#e0f2fe", roughness: 0.2, clearcoat: 0.8 }),
  part(new Cyl(0.065, 0.09, 1.9, 6), { pos: [0, 1.12, 0], color: "#cbd5e1", metalness: 0.5, roughness: 0.22 }),
  part(new Cyl(0.2, 0.12, 0.12, 6), { pos: [0, 2.08, 0], color: "#e2e8f0", metalness: 0.5, roughness: 0.2 }),
  part(new THREE.OctahedronGeometry(0.28, 0), {
    pos: [0, 2.38, 0],
    scale: [0.85, 1.25, 0.85],
    color: "#bae6fd",
    emissive: "#38bdf8",
    emissiveIntensity: 1.25,
    roughness: 0.1,
    clearcoat: 1,
    spin: 1.2,
  }),
]);

const CRYSTAL_PALETTES = {
  magic: ["#c084fc", "#a855f7", "#f472b6", "#ec4899", "#818cf8", "#6366f1"],
  ice: ["#7dd3fc", "#38bdf8", "#bae6fd", "#0ea5e9", "#c4b5fd", "#818cf8"],
};
function crystalRecipe(palette: keyof typeof CRYSTAL_PALETTES) {
  return defineProp(() => {
    const [main, mainE, right, rightE, left, leftE] = CRYSTAL_PALETTES[palette];
    const gem = { roughness: 0.12, clearcoat: 1 };
    return [
      part(new Cone(0.38, 1.65, 6), {
        pos: [0, 0.8, 0],
        rot: [0.08, 0.2, 0.05],
        color: main,
        emissive: mainE,
        emissiveIntensity: 0.45,
        ...gem,
      }),
      part(new Cone(0.24, 1.05, 6), {
        pos: [0.42, 0.52, 0.18],
        rot: [0.2, 0, -0.35],
        color: right,
        emissive: rightE,
        emissiveIntensity: 0.4,
        ...gem,
      }),
      part(new Cone(0.22, 0.9, 6), {
        pos: [-0.38, 0.45, -0.15],
        rot: [-0.18, 0.3, 0.32],
        color: left,
        emissive: leftE,
        emissiveIntensity: 0.4,
        ...gem,
      }),
    ];
  });
}
const CRYSTAL_MAGIC = crystalRecipe("magic");
const CRYSTAL_ICE = crystalRecipe("ice");

/** Castle battlement block (CastleWallSegment3D) */
export const MERLON = defineProp(() => [
  part(new Box(0.68, 0.52, 0.88), { color: "#ffe4f3", roughness: 0.28, clearcoat: 0.3 }),
]);

/** Cream garden fence post (FenceRow3D) */
export const GARDEN_FENCE_POST = defineProp(() => [
  part(new Box(0.16, 0.76, 0.16), { pos: [0, 0.38, 0], color: "#fef3c7", roughness: 0.45 }),
]);

/** Bamboo fence post with a leafy cap; the cap takes the copy's tint (JungleFenceRow3D) */
export const JUNGLE_FENCE_POST = defineProp(() => [
  part(new Cyl(0.085, 0.105, 0.84, 8), { pos: [0, 0.42, 0], color: "#78350f", roughness: 0.8 }),
  part(new Sph(0.1, 8, 8), { pos: [0, 0.86, 0], scale: [1.2, 0.55, 1.2], color: "tint", roughness: 0.55 }),
]);

/** Floating collectible heart coin (was ExtrudedHeart3D inside drei <Float>) */
const HEART_COIN = defineProp(() => [
  part(getHeartGeometry(0.032, 0.12, true), {
    scale: 0.64,
    color: "tint",
    roughness: 0.18,
    metalness: 0.08,
    clearcoat: 0.9,
    glowTint: 0.3,
    bob: 0.1,
  }),
]);

// ---------- Batches ----------

type ColoredSpot = { pos: Vec3; color: string; scale?: number };

function useSpots<T>(spots: T[], toPlacement: (s: T) => PropPlacement) {
  // Spot arrays are module constants, so this runs once per mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => spots.map(toPlacement), [spots]);
}

/** Every heart coin in one draw; collected ones are hidden without rebuilding the batch */
export function HeartCoinBatch3D({ spots, collected }: { spots: Vec3[]; collected: boolean[] }) {
  const items = useSpots(spots, (pos) => ({ pos }));
  const tinted = useMemo(
    () => items.map((it, idx) => ({ ...it, tint: idx % 2 === 0 ? "#ff6eb4" : "#c084fc" })),
    [items]
  );
  return <PropBatch recipe={HEART_COIN} items={tinted} hidden={collected} />;
}

export function PastelTreeBatch3D({ spots }: { spots: ColoredSpot[] }) {
  const items = useSpots(spots, (s) => ({ pos: s.pos, scale: s.scale, tint: s.color }));
  return <PropBatch recipe={PASTEL_TREE} items={items} />;
}

export function GiantFlowerBatch3D({ spots }: { spots: ColoredSpot[] }) {
  const items = useSpots(spots, (s) => ({ pos: s.pos, scale: s.scale, tint: s.color }));
  return <PropBatch recipe={GIANT_FLOWER} items={items} />;
}

export function BounceMushroomBatch3D({ spots }: { spots: Vec3[] }) {
  const items = useSpots(spots, (pos) => ({ pos }));
  return <PropBatch recipe={BOUNCE_MUSHROOM} items={items} />;
}

export function LollipopBatch3D({ spots }: { spots: (ColoredSpot & { stripeColor?: string })[] }) {
  const items = useSpots(spots, (s) => ({
    pos: s.pos,
    scale: s.scale,
    tint: s.color,
    tint2: s.stripeColor ?? "#ffffff",
  }));
  return <PropBatch recipe={LOLLIPOP} items={items} />;
}

export function FairyLampBatch3D({ spots }: { spots: Vec3[] }) {
  const items = useSpots(spots, (pos) => ({ pos }));
  return <PropBatch recipe={FAIRY_LAMP} items={items} />;
}

export function GiftBoxBatch3D({
  spots,
}: {
  spots: { pos: Vec3; scale: number; boxColor: string; ribbonColor: string; rotY?: number }[];
}) {
  const items = useSpots(spots, (g) => ({
    pos: g.pos,
    scale: g.scale,
    rotY: g.rotY,
    tint: g.boxColor,
    tint2: g.ribbonColor,
  }));
  return <PropBatch recipe={GIFT_BOX} items={items} />;
}

export function PalmTreeBatch3D({ spots }: { spots: (Omit<ColoredSpot, "color"> & { color?: string })[] }) {
  const items = useSpots(spots, (s) => ({ pos: s.pos, scale: s.scale, tint: s.color ?? "#22c55e" }));
  return <PropBatch recipe={PALM_TREE} items={items} />;
}

export function JungleLanternBatch3D({ spots }: { spots: Vec3[] }) {
  const items = useSpots(spots, (pos) => ({ pos }));
  return <PropBatch recipe={JUNGLE_LANTERN} items={items} />;
}

export function IceLanternBatch3D({ spots }: { spots: Vec3[] }) {
  const items = useSpots(spots, (pos) => ({ pos }));
  return <PropBatch recipe={ICE_LANTERN} items={items} />;
}

export function CrystalClusterBatch3D({ spots, palette = "magic" }: { spots: Vec3[]; palette?: "magic" | "ice" }) {
  const items = useSpots(spots, (pos) => ({ pos }));
  return <PropBatch recipe={palette === "ice" ? CRYSTAL_ICE : CRYSTAL_MAGIC} items={items} />;
}
