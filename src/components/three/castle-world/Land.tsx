"use client";

import React, { useRef } from "react";
import { useFrame as useR3FFrame } from "@react-three/fiber";
import * as THREE from "three";
import { StaticMerge } from "./assets/StaticMerge";
import { playerWorldPos } from "./playerTracker";
import { DINO_ISLAND, FROZEN_ISLAND, MELODY_ISLAND, CASTLE_DECK_HALF_W, CASTLE_DECK_NORTH_Z } from "./worldData";
import { landShift, warpToWorld, type LandId } from "./worldSpace";
import { LandActiveContext } from "./landFrame";

// Each land is drawn in its own group, moved out from the garden (see worldSpace.ts), with its own
// static merge. Only the land the unicorn is near does any work each frame:
// - within ANIMATE_R: everything runs as normal
// - further: its animations (frame callbacks from landFrame's useFrame) and matrix updates stop, and it is
//   still drawn, frozen, which can't be told apart at that distance
// - beyond DRAW_R (the land on the far side of the garden): not drawn either
// Distances are in metres on screen from the unicorn to the nearest edge of the land, with a margin
// so a land doesn't flicker on and off at the threshold.

const ANIMATE_R = 50;
const DRAW_R = 95;
const MARGIN = 5;

/** Layout rectangles of the lands (before they are moved out) */
const LAND_RECTS: Record<LandId, { minX: number; maxX: number; minZ: number; maxZ: number }> = {
  castle: { minX: -CASTLE_DECK_HALF_W, maxX: CASTLE_DECK_HALF_W, minZ: CASTLE_DECK_NORTH_Z, maxZ: -24.5 },
  frozen: FROZEN_ISLAND,
  dino: DINO_ISLAND,
  melody: MELODY_ISLAND,
};

const skipMatrixUpdate = () => {};

export function Land({ id, children }: { id: LandId; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const active = useRef(true);
  const drawn = useRef(true);
  const shift = landShift(id);

  useR3FFrame(() => {
    const group = groupRef.current;
    // Position not known yet (first frames): keep everything running
    if (!group || Math.abs(playerWorldPos.x) > 1e5) return;
    const [px, pz] = warpToWorld(playerWorldPos.x, playerWorldPos.z);
    const r = LAND_RECTS[id];
    const dx = Math.max(r.minX + shift[0] - px, 0, px - (r.maxX + shift[0]));
    const dz = Math.max(r.minZ + shift[2] - pz, 0, pz - (r.maxZ + shift[2]));
    const dist = Math.hypot(dx, dz);

    const animate = dist < ANIMATE_R + (active.current ? MARGIN : 0);
    const draw = dist < DRAW_R + (drawn.current ? MARGIN : 0);
    if (animate !== active.current) {
      active.current = animate;
      if (animate) {
        // Back to three.js' own update, and catch up on anything that changed meanwhile
        delete (group as Partial<THREE.Group>).updateMatrixWorld;
        group.matrixWorldNeedsUpdate = true;
      } else {
        // Nothing inside moves while paused, so the whole subtree can skip its per-frame matrix work
        group.updateMatrixWorld = skipMatrixUpdate;
      }
    }
    if (draw !== drawn.current) {
      drawn.current = draw;
      group.visible = draw;
    }
  });

  return (
    <LandActiveContext.Provider value={active}>
      {/* noMerge: the garden's merge around it leaves the land to its own */}
      <group ref={groupRef} position={shift} userData={{ noMerge: true }}>
        <StaticMerge activeRef={active}>{children}</StaticMerge>
      </group>
    </LandActiveContext.Provider>
  );
}
