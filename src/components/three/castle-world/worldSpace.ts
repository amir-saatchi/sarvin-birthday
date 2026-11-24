import type { Vec3 } from "./types";

// Layout space vs. world space
//
// All game data (worldData.ts, physics, rides, triggers, music zones, playerWorldPos) is written in
// "layout" coordinates: the garden in the middle, each land 7.5 m across its bridge. The lands are
// drawn further out than that: each land is moved LAND_GAP metres away from the garden, and its
// bridge is drawn that much longer. warpToWorld maps a layout point to where it is drawn:
//
// - in the garden: unchanged
// - on a land: moved out by LAND_GAP (lands are drawn inside a group with landShift(), so their own
//   meshes keep using layout coordinates)
// - on a bridge: stretched along the bridge, so the 7.5 m layout bridge covers the longer drawn one
//
// Only the drawing (player, camera, pickups, things outside the land groups) and taps on the ground
// (warpToLayout) cross between the two. Movement is slowed along a bridge by the same stretch, so the
// unicorn keeps her normal speed on screen.

/** Extra distance between the garden and each land (added to every bridge) */
export const LAND_GAP = 12;

export type LandId = "castle" | "frozen" | "dino" | "melody";

type Band = {
  land: LandId;
  /** Axis the bridge runs along, and which way the land lies */
  axis: "x" | "z";
  sign: 1 | -1;
  /** Layout distance from the centre line where the bridge starts (garden edge) and ends (land edge) */
  start: number;
  end: number;
  /** Only points within this range on the other axis belong to the band */
  across: [number, number];
};

const BANDS: Band[] = [
  { land: "dino", axis: "x", sign: 1, start: 20.0, end: 27.5, across: [-22, 26] },
  { land: "frozen", axis: "x", sign: -1, start: 20.0, end: 27.5, across: [-22, 26] },
  { land: "castle", axis: "z", sign: -1, start: 17.0, end: 24.5, across: [-26, 26] },
  { land: "melody", axis: "z", sign: 1, start: 21.0, end: 28.5, across: [-23, 23] },
];

const SHIFTS: Record<LandId, Vec3> = {
  castle: [0, 0, -LAND_GAP],
  frozen: [-LAND_GAP, 0, 0],
  dino: [LAND_GAP, 0, 0],
  melody: [0, 0, LAND_GAP],
};

/** Offset of a land's group: its meshes keep their layout coordinates inside it */
export function landShift(land: LandId): Vec3 {
  return SHIFTS[land];
}

function inBand(b: Band, x: number, z: number) {
  const across = b.axis === "x" ? z : x;
  const along = (b.axis === "x" ? x : z) * b.sign;
  return across >= b.across[0] && across <= b.across[1] && along > b.start;
}

/** Layout distance along a band → drawn distance */
function stretchOut(d: number, b: Band) {
  if (d >= b.end) return d + LAND_GAP;
  return b.start + ((d - b.start) * (b.end - b.start + LAND_GAP)) / (b.end - b.start);
}

/** Drawn distance along a band → layout distance */
function stretchIn(d: number, b: Band) {
  if (d >= b.end + LAND_GAP) return d - LAND_GAP;
  return b.start + ((d - b.start) * (b.end - b.start)) / (b.end - b.start + LAND_GAP);
}

/** Where a layout point is drawn */
export function warpToWorld(x: number, z: number): [number, number] {
  let wx = x;
  let wz = z;
  for (const b of BANDS) {
    if (!inBand(b, x, z)) continue;
    if (b.axis === "x") wx = stretchOut(x * b.sign, b) * b.sign;
    else wz = stretchOut(z * b.sign, b) * b.sign;
  }
  return [wx, wz];
}

/** Layout point under a drawn point (for taps on the ground) */
export function warpToLayout(x: number, z: number): [number, number] {
  let lx = x;
  let lz = z;
  for (const b of BANDS) {
    const along = (b.axis === "x" ? x : z) * b.sign;
    const across = b.axis === "x" ? z : x;
    if (across < b.across[0] || across > b.across[1] || along <= b.start) continue;
    if (b.axis === "x") lx = stretchIn(along, b) * b.sign;
    else lz = stretchIn(along, b) * b.sign;
  }
  return [lx, lz];
}

/** A layout position as drawn (y unchanged) */
export function toWorld(p: readonly number[]): Vec3 {
  const [x, z] = warpToWorld(p[0], p[2]);
  return [x, p[1], z];
}

/**
 * How much one layout metre is stretched along x and z at a layout point (1 off the bridges).
 * Dividing a step by it keeps the drawn speed the same on the longer bridges.
 */
export function stretchAt(x: number, z: number): [number, number] {
  let sx = 1;
  let sz = 1;
  for (const b of BANDS) {
    if (!inBand(b, x, z)) continue;
    const along = (b.axis === "x" ? x : z) * b.sign;
    if (along >= b.end) continue;
    const k = (b.end - b.start + LAND_GAP) / (b.end - b.start);
    if (b.axis === "x") sx = k;
    else sz = k;
  }
  return [sx, sz];
}

export type BridgeSpan = {
  /** Drawn centre and length along the bridge axis */
  mid: number;
  len: number;
  /** Drawn positions of the railing posts along the axis */
  posts: number[];
};

/** Drawn span of a land's bridge, from the garden edge to the moved land's edge */
export function bridgeSpan(land: LandId, postSpacing = 1.7): BridgeSpan {
  const b = BANDS.find((band) => band.land === land)!;
  const from = b.start * b.sign;
  const to = (b.end + LAND_GAP) * b.sign;
  const len = Math.abs(to - from);
  const count = Math.max(2, Math.round((len - 0.8) / postSpacing) + 1);
  const posts: number[] = [];
  for (let i = 0; i < count; i++) {
    const d = b.start + 0.4 + ((len - 0.8) * i) / (count - 1);
    posts.push(d * b.sign);
  }
  return { mid: (from + to) / 2, len, posts };
}
