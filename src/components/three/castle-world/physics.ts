import * as THREE from "three";
import type { BoxObstacle, CapsuleObstacle, CircleObstacle, CollisionResolutionResult } from "./types";
import {
  BRIDGE_NORTH_Z,
  BRIDGE_SOUTH_Z,
  CAPSULE_OBSTACLES,
  CASTLE_RAMP,
  CASTLE_RAMP_SIDE_RAILS,
  CASTLE_WALL_BOXES,
  CIRCLE_OBSTACLES,
  DINO_BRIDGE_CENTER_Z,
  DINO_BRIDGE_EAST_X,
  DINO_BRIDGE_WEST_X,
  FROZEN_BRIDGE_CENTER_Z,
  FROZEN_BRIDGE_EAST_X,
  FROZEN_BRIDGE_WEST_X,
  FROZEN_CAVE,
  FROZEN_ROCK_BOXES,
  MELODY_BRIDGE_NORTH_Z,
  MELODY_BRIDGE_SOUTH_Z,
  RAISED_TERRACES,
  UNICORN_RADIUS,
  UPPER_CASTLE_BALCONY_RAILS,
  UPPER_CASTLE_CLIFF_BOXES,
  UPPER_CASTLE_Y,
  UPPER_CASTLE_Z,
  WALKABLE_ZONES,
} from "./worldData";

type SteeringZone =
  | "grass"
  | "bridge"
  | "castleLower"
  | "castleRamp"
  | "castleUpper"
  | "frozenBridge"
  | "frozen"
  | "dinoBridge"
  | "dino"
  | "melodyBridge"
  | "melody";

function getSteeringZone(x: number, z: number): SteeringZone {
  // My Melody & Kuromi Land is the only thing south of its bridge, and it is wider than the x-range where the
  // east/west bridges start, so decide it by z first
  if (z > MELODY_BRIDGE_SOUTH_Z) return "melody";
  // Dinosaur Land & Frozen Land reach further north (z -19.7) than the main island, but nothing else lies
  // east / west of their bridges
  if (x > DINO_BRIDGE_EAST_X) return "dino";
  if (x < FROZEN_BRIDGE_WEST_X) return "frozen";
  // North of the main island only the Royal Bridge and the castle exist; the castle is wider than the
  // x-range where the east/west bridges start, so decide by z first.
  if (z < BRIDGE_SOUTH_Z) {
    if (z >= BRIDGE_NORTH_Z) return "bridge";
    if (z <= UPPER_CASTLE_Z) return "castleUpper";
    if (z <= CASTLE_RAMP.startZ && Math.abs(x) <= CASTLE_RAMP.maxX) return "castleRamp";
    return "castleLower";
  }
  if (x < FROZEN_BRIDGE_WEST_X) return "frozen";
  if (x <= FROZEN_BRIDGE_EAST_X) return "frozenBridge";
  if (x >= DINO_BRIDGE_WEST_X) return "dinoBridge";
  if (z > MELODY_BRIDGE_SOUTH_Z) return "melody";
  if (z >= MELODY_BRIDGE_NORTH_Z) return "melodyBridge";
  return "grass";
}

export function clampToWalkableZones(x: number, z: number): { x: number; z: number } {
  for (const zone of WALKABLE_ZONES) {
    if (x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ) {
      return { x, z };
    }
  }

  let bestX = x;
  let bestZ = z;
  let bestDistSq = Infinity;

  for (const zone of WALKABLE_ZONES) {
    const cx = THREE.MathUtils.clamp(x, zone.minX, zone.maxX);
    const cz = THREE.MathUtils.clamp(z, zone.minZ, zone.maxZ);
    const dx = x - cx;
    const dz = z - cz;
    const distSq = dx * dx + dz * dz;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestX = cx;
      bestZ = cz;
    }
  }

  return { x: bestX, z: bestZ };
}

/** Parameter (0..1) along segment c-d of its closest approach to segment p-q, and that squared distance. */
function closestOnSecondSegment(
  px: number, pz: number, qx: number, qz: number,
  cx: number, cz: number, dx: number, dz: number
): { t: number; distSq: number } {
  const ux = qx - px, uz = qz - pz;
  const vx = dx - cx, vz = dz - cz;
  const wx = px - cx, wz = pz - cz;
  const a = ux * ux + uz * uz;
  const b = ux * vx + uz * vz;
  const c = vx * vx + vz * vz;
  const d = ux * wx + uz * wz;
  const e = vx * wx + vz * wz;
  const den = a * c - b * b;
  let s = den > 1e-9 ? THREE.MathUtils.clamp((b * e - c * d) / den, 0, 1) : 0;
  let t = c > 1e-9 ? (b * s + e) / c : 0;
  if (t < 0 || t > 1) {
    t = THREE.MathUtils.clamp(t, 0, 1);
    s = a > 1e-9 ? THREE.MathUtils.clamp((b * t - d) / a, 0, 1) : 0;
  }
  const ex = px + ux * s - (cx + vx * t);
  const ez = pz + uz * s - (cz + vz * t);
  return { t, distSq: ex * ex + ez * ez };
}

/**
 * Sliding works for round things, but along the straight flank of a capsule (Triceratops, fossil plinth) a target
 * right across it makes the slide flip sides every frame. So when the straight walk would hit a capsule's flank,
 * aim just past whichever end makes the shorter way round; once the path only grazes an end cap, walk straight on.
 */
function detourAroundCapsules(pos: THREE.Vector3, tx: number, tz: number): { x: number; z: number } {
  for (const cap of CAPSULE_OBSTACLES) {
    const reach = cap.r + UNICORN_RADIUS;
    const hit = closestOnSecondSegment(pos.x, pos.z, tx, tz, cap.ax, cap.az, cap.bx, cap.bz);
    if (hit.distSq >= reach * reach || hit.t <= 0.001 || hit.t >= 0.999) continue;
    const len = Math.hypot(cap.bx - cap.ax, cap.bz - cap.az) || 1;
    const ux = (cap.bx - cap.ax) / len;
    const uz = (cap.bz - cap.az) / len;
    const out = reach + 0.35;
    const wa = { x: cap.ax - ux * out, z: cap.az - uz * out };
    const wb = { x: cap.bx + ux * out, z: cap.bz + uz * out };
    const via = (w: { x: number; z: number }) =>
      Math.hypot(w.x - pos.x, w.z - pos.z) + Math.hypot(tx - w.x, tz - w.z);
    return via(wa) <= via(wb) ? wa : wb;
  }
  return { x: tx, z: tz };
}

/**
 * Guides click-to-move smoothly across the Royal Bridge (grass <-> castle),
 * the Sloped Royal Ramp (lower courtyard <-> upper castle terrace),
 * the Crystal Ice Bridge (grass <-> frozen land),
 * the Dino Log Bridge (grass <-> dinosaur land),
 * and the Pastel Ribbon Bridge (grass <-> My Melody & Kuromi Land),
 * and round the long flanks of capsule obstacles.
 */
export function getCrossZoneSteeringTarget(
  pos: THREE.Vector3,
  target: THREE.Vector3
): { x: number; z: number } {
  const bridge = getBridgeSteeringTarget(pos, target);
  const steer = getCaveSteeringTarget(pos, bridge.x, bridge.z);
  return CAPSULE_OBSTACLES.length ? detourAroundCapsules(pos, steer.x, steer.z) : steer;
}

function inFrozenCave(x: number, z: number): boolean {
  return (
    x >= FROZEN_CAVE.minX - 0.1 &&
    x <= FROZEN_CAVE.maxX + 0.2 &&
    z >= FROZEN_CAVE.minZ &&
    z <= FROZEN_CAVE.maxZ
  );
}

/**
 * The Ice Cave is a walled pocket with one opening (its mouth faces east). Going in or out, walk straight only
 * when the line actually passes through the opening; otherwise head for the point just outside the mouth first.
 */
function getCaveSteeringTarget(pos: THREE.Vector3, tx: number, tz: number): { x: number; z: number } {
  const posIn = inFrozenCave(pos.x, pos.z);
  if (posIn === inFrozenCave(tx, tz)) return { x: tx, z: tz };
  const outside = posIn ? { x: tx, z: tz } : { x: pos.x, z: pos.z };
  const inside = posIn ? { x: pos.x, z: pos.z } : { x: tx, z: tz };
  const mouthX = FROZEN_CAVE.maxX;
  // Clear opening between the wall ends, kept a unicorn-radius (+ a little) away from each
  const lo = FROZEN_CAVE.minZ + UNICORN_RADIUS + 0.3;
  const hi = FROZEN_CAVE.maxZ - UNICORN_RADIUS - 0.3;
  if (outside.x > mouthX + 0.01) {
    const t = (mouthX - inside.x) / (outside.x - inside.x);
    const zAtMouth = inside.z + (outside.z - inside.z) * t;
    if (zAtMouth >= lo && zAtMouth <= hi) return { x: tx, z: tz };
  }
  // Already standing at the mouth on the line in: carry on (avoids trotting in place on the waypoint)
  if (Math.hypot(pos.x - FROZEN_CAVE.mouthX, pos.z - FROZEN_CAVE.mouthZ) < 0.35) {
    return posIn ? { x: tx, z: tz } : { x: FROZEN_CAVE.maxX - 0.6, z: FROZEN_CAVE.mouthZ };
  }
  return { x: FROZEN_CAVE.mouthX, z: FROZEN_CAVE.mouthZ };
}

function getBridgeSteeringTarget(
  pos: THREE.Vector3,
  target: THREE.Vector3
): { x: number; z: number } {
  const posZone = getSteeringZone(pos.x, pos.z);
  const targetZone = getSteeringZone(target.x, target.z);

  if (posZone === targetZone) {
    return { x: target.x, z: target.z };
  }

  const posIsCastle =
    posZone === "castleLower" || posZone === "castleRamp" || posZone === "castleUpper";
  const targetIsCastle =
    targetZone === "castleLower" || targetZone === "castleRamp" || targetZone === "castleUpper";
  const targetIsFrozen = targetZone === "frozen" || targetZone === "frozenBridge";
  const targetIsDino = targetZone === "dino" || targetZone === "dinoBridge";
  const targetIsMelody = targetZone === "melody" || targetZone === "melodyBridge";

  // 0a. Frozen Land -> Crystal Ice Bridge / Green Land / Castle / Dinosaur Land
  if (posZone === "frozen") {
    if (Math.abs(pos.z - FROZEN_BRIDGE_CENTER_Z) > 1.65) {
      return {
        x: FROZEN_BRIDGE_WEST_X - 0.5,
        z: THREE.MathUtils.clamp(
          pos.z,
          FROZEN_BRIDGE_CENTER_Z - 1.35,
          FROZEN_BRIDGE_CENTER_Z + 1.35
        ),
      };
    }
    return {
      x: targetZone === "frozenBridge" ? target.x : FROZEN_BRIDGE_EAST_X + 0.8,
      z: THREE.MathUtils.clamp(
        target.z,
        FROZEN_BRIDGE_CENTER_Z - 1.5,
        FROZEN_BRIDGE_CENTER_Z + 1.5
      ),
    };
  }

  // 0b. On Crystal Ice Bridge -> Frozen Land OR Green Land / Castle / Dinosaur Land
  if (posZone === "frozenBridge") {
    if (targetZone === "frozen") {
      return {
        x: Math.min(target.x, FROZEN_BRIDGE_WEST_X - 0.6),
        z: THREE.MathUtils.clamp(
          target.z,
          FROZEN_BRIDGE_CENTER_Z - 1.5,
          FROZEN_BRIDGE_CENTER_Z + 1.5
        ),
      };
    }
    return {
      x: Math.max(target.x, FROZEN_BRIDGE_EAST_X + 0.8),
      z: THREE.MathUtils.clamp(
        target.z,
        FROZEN_BRIDGE_CENTER_Z - 1.5,
        FROZEN_BRIDGE_CENTER_Z + 1.5
      ),
    };
  }

  // 0c. Dinosaur Land -> Dino Log Bridge / Green Land / Castle / Frozen Land
  if (posZone === "dino") {
    if (Math.abs(pos.z - DINO_BRIDGE_CENTER_Z) > 1.65) {
      return {
        x: DINO_BRIDGE_EAST_X + 0.5,
        z: THREE.MathUtils.clamp(
          pos.z,
          DINO_BRIDGE_CENTER_Z - 1.35,
          DINO_BRIDGE_CENTER_Z + 1.35
        ),
      };
    }
    return {
      x: targetZone === "dinoBridge" ? target.x : DINO_BRIDGE_WEST_X - 0.8,
      z: THREE.MathUtils.clamp(
        target.z,
        DINO_BRIDGE_CENTER_Z - 1.5,
        DINO_BRIDGE_CENTER_Z + 1.5
      ),
    };
  }

  // 0d. On Dino Log Bridge -> Dinosaur Land OR Green Land / Castle / Frozen Land
  if (posZone === "dinoBridge") {
    if (targetZone === "dino") {
      return {
        x: Math.max(target.x, DINO_BRIDGE_EAST_X + 0.6),
        z: THREE.MathUtils.clamp(
          target.z,
          DINO_BRIDGE_CENTER_Z - 1.5,
          DINO_BRIDGE_CENTER_Z + 1.5
        ),
      };
    }
    return {
      x: Math.min(target.x, DINO_BRIDGE_WEST_X - 0.8),
      z: THREE.MathUtils.clamp(
        target.z,
        DINO_BRIDGE_CENTER_Z - 1.5,
        DINO_BRIDGE_CENTER_Z + 1.5
      ),
    };
  }

  // 0e. My Melody & Kuromi Land -> Pastel Ribbon Bridge / Green Land / Castle / Frozen / Dino
  if (posZone === "melody") {
    if (Math.abs(pos.x) > 1.7) {
      return {
        x: THREE.MathUtils.clamp(pos.x, -1.35, 1.35),
        z: MELODY_BRIDGE_SOUTH_Z + 0.5,
      };
    }
    return {
      x: THREE.MathUtils.clamp(target.x, -1.5, 1.5),
      z: targetZone === "melodyBridge" ? target.z : MELODY_BRIDGE_NORTH_Z - 0.8,
    };
  }

  // 0f. On Pastel Ribbon Bridge -> My Melody & Kuromi Land OR Green Land / Castle / Frozen / Dino
  if (posZone === "melodyBridge") {
    if (targetZone === "melody") {
      return {
        x: THREE.MathUtils.clamp(target.x, -1.5, 1.5),
        z: Math.max(target.z, MELODY_BRIDGE_SOUTH_Z + 0.6),
      };
    }
    return {
      x: THREE.MathUtils.clamp(target.x, -1.5, 1.5),
      z: Math.min(target.z, MELODY_BRIDGE_NORTH_Z - 0.8),
    };
  }

  // 1. Grass -> Frozen Land OR Dinosaur Land OR My Melody & Kuromi Land OR Royal Bridge / Castle
  if (posZone === "grass") {
    if (targetIsMelody) {
      if (Math.abs(pos.x) > 1.7) {
        return {
          x: THREE.MathUtils.clamp(pos.x, -1.35, 1.35),
          z: MELODY_BRIDGE_NORTH_Z - 0.4,
        };
      }
      return {
        x: THREE.MathUtils.clamp(target.x, -1.5, 1.5),
        z: targetZone === "melody" ? MELODY_BRIDGE_SOUTH_Z + 0.6 : target.z,
      };
    }

    if (targetIsFrozen) {
      if (Math.abs(pos.z - FROZEN_BRIDGE_CENTER_Z) > 1.65) {
        return {
          x: FROZEN_BRIDGE_EAST_X + 0.8,
          z: THREE.MathUtils.clamp(
            pos.z,
            FROZEN_BRIDGE_CENTER_Z - 1.35,
            FROZEN_BRIDGE_CENTER_Z + 1.35
          ),
        };
      }
      return {
        x: targetZone === "frozen" ? FROZEN_BRIDGE_WEST_X - 0.6 : target.x,
        z: THREE.MathUtils.clamp(
          target.z,
          FROZEN_BRIDGE_CENTER_Z - 1.5,
          FROZEN_BRIDGE_CENTER_Z + 1.5
        ),
      };
    }

    if (targetIsDino) {
      if (Math.abs(pos.z - DINO_BRIDGE_CENTER_Z) > 1.65) {
        return {
          x: DINO_BRIDGE_WEST_X - 0.8,
          z: THREE.MathUtils.clamp(
            pos.z,
            DINO_BRIDGE_CENTER_Z - 1.35,
            DINO_BRIDGE_CENTER_Z + 1.35
          ),
        };
      }
      return {
        x: targetZone === "dino" ? DINO_BRIDGE_EAST_X + 0.6 : target.x,
        z: THREE.MathUtils.clamp(
          target.z,
          DINO_BRIDGE_CENTER_Z - 1.5,
          DINO_BRIDGE_CENTER_Z + 1.5
        ),
      };
    }

    if (Math.abs(pos.x) > 1.7) {
      return { x: THREE.MathUtils.clamp(pos.x, -1.35, 1.35), z: BRIDGE_SOUTH_Z + 0.4 };
    }
    return {
      x: THREE.MathUtils.clamp(target.x, -1.5, 1.5),
      z: targetIsCastle ? BRIDGE_NORTH_Z - 0.5 : target.z,
    };
  }

  // 2. On Royal Bridge heading into Grass / Frozen Land / Dinosaur Land or Castle
  if (posZone === "bridge") {
    if (targetIsCastle) {
      return {
        x: THREE.MathUtils.clamp(target.x, -1.5, 1.5),
        z: Math.min(target.z, BRIDGE_NORTH_Z - 0.6),
      };
    }
    return {
      x: THREE.MathUtils.clamp(target.x, -1.5, 1.5),
      z: Math.max(target.z, BRIDGE_SOUTH_Z + 0.6),
    };
  }

  // 3. Upper Castle Terrace -> Ramp / Lower Courtyard / Bridge / Grass / Frozen / Dino
  if (posZone === "castleUpper") {
    if (Math.abs(pos.x) > 1.75) {
      return { x: THREE.MathUtils.clamp(pos.x, -1.25, 1.25), z: UPPER_CASTLE_Z - 0.8 };
    }
    return {
      x: THREE.MathUtils.clamp(target.x, -1.4, 1.4),
      z: targetZone === "castleRamp" ? target.z : CASTLE_RAMP.startZ + 0.8,
    };
  }

  // 4. On the Sloped Royal Ramp
  if (posZone === "castleRamp") {
    if (targetZone === "castleUpper") {
      return {
        x: THREE.MathUtils.clamp(target.x, -1.4, 1.4),
        z: Math.min(target.z, UPPER_CASTLE_Z - 0.8),
      };
    }
    return {
      x: THREE.MathUtils.clamp(target.x, -1.4, 1.4),
      z: Math.max(target.z, CASTLE_RAMP.startZ + 0.8),
    };
  }

  // 5. Lower Castle Courtyard -> Upper Terrace / Ramp OR back out to Bridge / Grass / Frozen / Dino
  if (posIsCastle) {
    if (targetZone === "castleUpper" || targetZone === "castleRamp") {
      // Off to the side: line up in front of the ramp first. (Already lined up: walk straight on up;
      // sending a unicorn at the ramp foot back to the line-up point made it trot in place there.)
      if (Math.abs(pos.x) > 1.75) {
        return { x: THREE.MathUtils.clamp(pos.x, -1.25, 1.25), z: CASTLE_RAMP.startZ + 1.0 };
      }
      return {
        x: THREE.MathUtils.clamp(target.x, -1.4, 1.4),
        z: targetZone === "castleUpper" ? UPPER_CASTLE_Z - 0.8 : target.z,
      };
    }

    // Heading south toward bridge / grass / frozen land / dinosaur land / melody & kuromi land.
    // First line up on the carpet a little inside the gate, well clear of the gatehouse towers
    // (their collision circles reach z ≈ -27.0), so a unicorn coming from the far side of the
    // wide courtyard doesn't get wedged between a gate tower and the south wall.
    if (Math.abs(pos.x) > 1.7) {
      return { x: THREE.MathUtils.clamp(pos.x, -1.35, 1.35), z: BRIDGE_NORTH_Z - 2.8 };
    }
    return {
      x: THREE.MathUtils.clamp(target.x, -1.5, 1.5),
      z:
        targetZone === "grass" || targetIsFrozen || targetIsDino || targetIsMelody
          ? BRIDGE_SOUTH_Z + 0.5
          : target.z,
    };
  }

  return { x: target.x, z: target.z };
}

export function getRampHeightAt(x: number, z: number): number | null {
  if (
    x >= CASTLE_RAMP.minX &&
    x <= CASTLE_RAMP.maxX &&
    z <= CASTLE_RAMP.startZ &&
    z >= CASTLE_RAMP.endZ
  ) {
    const t = THREE.MathUtils.clamp(
      (CASTLE_RAMP.startZ - z) / (CASTLE_RAMP.startZ - CASTLE_RAMP.endZ),
      0,
      1
    );
    return CASTLE_RAMP.startY + t * (CASTLE_RAMP.endY - CASTLE_RAMP.startY);
  }
  return null;
}

export function getTerraceTopAt(x: number, z: number, pad = 0): number {
  let highest = 0;
  for (const ter of RAISED_TERRACES) {
    if (
      x >= ter.x - ter.halfW - pad &&
      x <= ter.x + ter.halfW + pad &&
      z >= ter.z - ter.halfD - pad &&
      z <= ter.z + ter.halfD + pad
    ) {
      if (ter.topY > highest) highest = ter.topY;
    }
  }
  return highest;
}

/**
 * Exact visual surface height at (x, z) across the entire kingdom (used for TargetRing3D).
 */
export function getSurfaceHeightAt(x: number, z: number): number {
  const rampY = getRampHeightAt(x, z);
  if (rampY !== null) return rampY;
  if (z <= UPPER_CASTLE_Z) return UPPER_CASTLE_Y;
  return getTerraceTopAt(x, z);
}

export function getWalkableFloorHeight(x: number, z: number, currentY: number): number {
  const rampY = getRampHeightAt(x, z);
  if (rampY !== null && currentY >= rampY - 0.55) {
    return rampY;
  }

  if (z <= UPPER_CASTLE_Z && currentY >= UPPER_CASTLE_Y - 0.45) {
    return UPPER_CASTLE_Y;
  }

  let floorY = 0;
  for (const ter of RAISED_TERRACES) {
    const inside =
      x >= ter.x - ter.halfW + 0.12 &&
      x <= ter.x + ter.halfW - 0.12 &&
      z >= ter.z - ter.halfD + 0.12 &&
      z <= ter.z + ter.halfD - 0.12;
    if (inside && currentY >= ter.topY - 0.22 && ter.topY > floorY) {
      floorY = ter.topY;
    }
  }
  return floorY;
}

export function pushOutOfCircle(
  pos: THREE.Vector3,
  cx: number,
  cz: number,
  minDist: number
): boolean {
  const dx = pos.x - cx;
  const dz = pos.z - cz;
  const distSq = dx * dx + dz * dz;
  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq);
    if (dist > 0.0001) {
      pos.x = cx + (dx / dist) * minDist;
      pos.z = cz + (dz / dist) * minDist;
    } else {
      pos.z = cz + minDist;
    }
    return true;
  }
  return false;
}

/** Seen from (x, z), a capsule acts like a circle centred on its segment's nearest point (written into `out`). */
export function capsuleCircleAt(
  c: CapsuleObstacle,
  x: number,
  z: number,
  out: CircleObstacle = { x: 0, z: 0, r: 0 }
): CircleObstacle {
  const sx = c.bx - c.ax;
  const sz = c.bz - c.az;
  const lenSq = sx * sx + sz * sz;
  const t = lenSq > 1e-9 ? THREE.MathUtils.clamp(((x - c.ax) * sx + (z - c.az) * sz) / lenSq, 0, 1) : 0;
  out.x = c.ax + sx * t;
  out.z = c.az + sz * t;
  out.r = c.r;
  return out;
}
const capsuleScratch: CircleObstacle = { x: 0, z: 0, r: 0 };

/** Moves a point out of every circular / capsule obstacle (to the unicorn's standing distance). */
export function pushPointOutOfCircleObstacles(x: number, z: number): { x: number; z: number } {
  const p = new THREE.Vector3(x, 0, z);
  for (const obs of CIRCLE_OBSTACLES) {
    pushOutOfCircle(p, obs.x, obs.z, obs.r + UNICORN_RADIUS);
  }
  for (const cap of CAPSULE_OBSTACLES) {
    const c = capsuleCircleAt(cap, p.x, p.z, capsuleScratch);
    pushOutOfCircle(p, c.x, c.z, c.r + UNICORN_RADIUS);
  }
  // Frozen Land's rock walls (cliff & ice cave) back onto the island's west edge, so a tap on one goes to its
  // nearest east, north or south side (never west, off the island). Two passes, since the walls touch each other.
  for (let pass = 0; pass < 2; pass++) {
    for (const b of FROZEN_ROCK_BOXES) {
      const r = UNICORN_RADIUS;
      if (p.x <= b.minX - r || p.x >= b.maxX + r || p.z <= b.minZ - r || p.z >= b.maxZ + r) continue;
      const east = b.maxX + r - p.x;
      const north = p.z - (b.minZ - r);
      const south = b.maxZ + r - p.z;
      if (east <= north && east <= south) p.x = b.maxX + r;
      else if (north <= south) p.z = b.minZ - r;
      else p.z = b.maxZ + r;
    }
  }
  return { x: p.x, z: p.z };
}

/**
 * Adjusts a desired movement step (dx, dz) so the unicorn slides around circular
 * obstacles instead of pushing straight into them: the inward component is removed and
 * only the tangential one is kept. A (nearly) head-on step gets a tangential nudge so it
 * picks a side and walks around the obstacle rather than stalling in front of it.
 */
export function slideStepAroundCircles(
  pos: THREE.Vector3,
  dx: number,
  dz: number
): { dx: number; dz: number } {
  const origLen = Math.hypot(dx, dz);
  if (origLen < 1e-6) return { dx, dz };

  // Circles first, then each capsule as the circle on its segment nearest the unicorn (its surface normal there)
  const nearCapsule: CircleObstacle = { x: 0, z: 0, r: 0 };
  const obstacles: Iterable<CircleObstacle> = CAPSULE_OBSTACLES.length
    ? (function* () {
        yield* CIRCLE_OBSTACLES;
        for (const cap of CAPSULE_OBSTACLES) {
          // Skip capsules the step doesn't reach; otherwise slide along the surface facing the unicorn
          const ahead = capsuleCircleAt(cap, pos.x + dx, pos.z + dz, nearCapsule);
          const reach = ahead.r + UNICORN_RADIUS;
          if ((pos.x + dx - ahead.x) ** 2 + (pos.z + dz - ahead.z) ** 2 >= reach * reach) continue;
          yield capsuleCircleAt(cap, pos.x, pos.z, nearCapsule);
        }
      })()
    : CIRCLE_OBSTACLES;

  for (const obs of obstacles) {
    const minDist = obs.r + UNICORN_RADIUS;
    const nx0 = pos.x + dx - obs.x;
    const nz0 = pos.z + dz - obs.z;
    if (nx0 * nx0 + nz0 * nz0 >= minDist * minDist) continue;

    const ox = pos.x - obs.x;
    const oz = pos.z - obs.z;
    const od = Math.hypot(ox, oz);
    if (od < 1e-4) continue;
    const nx = ox / od;
    const nz = oz / od;

    const inward = dx * nx + dz * nz;
    if (inward >= 0) continue;

    // Keep only the tangential component
    let tx = dx - inward * nx;
    let tz = dz - inward * nz;
    const tLen = Math.hypot(tx, tz);
    const minTangent = origLen * 0.6;
    if (tLen < minTangent) {
      if (tLen > 1e-4) {
        tx = (tx / tLen) * minTangent;
        tz = (tz / tLen) * minTangent;
      } else {
        // Exactly head-on: pick a side deterministically
        tx = -nz * minTangent;
        tz = nx * minTangent;
      }
    }
    dx = tx;
    dz = tz;
  }

  return { dx, dz };
}

export function pushOutOfBox(pos: THREE.Vector3, box: BoxObstacle, radius: number): boolean {
  const closestX = THREE.MathUtils.clamp(pos.x, box.minX, box.maxX);
  const closestZ = THREE.MathUtils.clamp(pos.z, box.minZ, box.maxZ);
  const dx = pos.x - closestX;
  const dz = pos.z - closestZ;
  const distSq = dx * dx + dz * dz;

  if (distSq >= radius * radius) return false;

  if (distSq > 0.00001) {
    const dist = Math.sqrt(distSq);
    pos.x = closestX + (dx / dist) * radius;
    pos.z = closestZ + (dz / dist) * radius;
  } else {
    // Unicorn center is inside the box; push out along the shortest axis
    const dLeft = Math.abs(pos.x - box.minX);
    const dRight = Math.abs(box.maxX - pos.x);
    const dFront = Math.abs(box.maxZ - pos.z);
    const dBack = Math.abs(pos.z - box.minZ);
    const minEdge = Math.min(dLeft, dRight, dFront, dBack);
    if (minEdge === dLeft) pos.x = box.minX - radius;
    else if (minEdge === dRight) pos.x = box.maxX + radius;
    else if (minEdge === dFront) pos.z = box.maxZ + radius;
    else pos.z = box.minZ - radius;
  }
  return true;
}

export function resolvePlayerCollisions(
  pos: THREE.Vector3,
  targetPos: THREE.Vector3 | null,
  isGrounded: boolean
): CollisionResolutionResult {
  // Check if unicorn is walking up to a raised grass terrace
  let hitTerraceWall = false;
  let shouldAutoHopTerrace = false;

  for (const ter of RAISED_TERRACES) {
    if (pos.y < ter.topY - 0.16) {
      const box: BoxObstacle = {
        minX: ter.x - ter.halfW,
        maxX: ter.x + ter.halfW,
        minZ: ter.z - ter.halfD,
        maxZ: ter.z + ter.halfD,
      };
      const hit = pushOutOfBox(pos, box, UNICORN_RADIUS);
      if (hit) {
        hitTerraceWall = true;
        // Auto-hop onto the raised terrace if the player clicked on top of it
        const wantsThisTerrace = targetPos !== null && targetPos.y >= ter.topY - 0.05;
        if (wantsThisTerrace && isGrounded) {
          shouldAutoHopTerrace = true;
        }
      }
    }
  }

  // Two-level castle elevation walls & railings
  if (pos.y < UPPER_CASTLE_Y - 0.35) {
    // On lower courtyard: block walking into the upper terrace cliff walls outside the ramp
    for (const cliff of UPPER_CASTLE_CLIFF_BOXES) {
      pushOutOfBox(pos, cliff, UNICORN_RADIUS);
    }
  } else {
    // On upper terrace: block clipping through the left/right front overlook balcony railings
    for (const rail of UPPER_CASTLE_BALCONY_RAILS) {
      pushOutOfBox(pos, rail, UNICORN_RADIUS);
    }
  }

  // Sloped ramp side railings (block walking into ramp sides from below & keep unicorn on ramp)
  for (const rail of CASTLE_RAMP_SIDE_RAILS) {
    pushOutOfBox(pos, rail, UNICORN_RADIUS);
  }

  // South castle walls on either side of the gatehouse
  for (const wall of CASTLE_WALL_BOXES) {
    pushOutOfBox(pos, wall, UNICORN_RADIUS);
  }

  // Frozen Land rock: the waterfall cliff and the Ice Cave walls
  for (const rock of FROZEN_ROCK_BOXES) {
    pushOutOfBox(pos, rock, UNICORN_RADIUS);
  }

  // Solid circle collisions with fountain, castle towers, throne, trees, lamps, lollipops, crystals, bunnies & gifts
  for (const obs of CIRCLE_OBSTACLES) {
    pushOutOfCircle(pos, obs.x, obs.z, obs.r + UNICORN_RADIUS);
  }
  // Long rounded obstacles (Triceratops, sitting dinos, fossil plinth)
  for (const cap of CAPSULE_OBSTACLES) {
    const c = capsuleCircleAt(cap, pos.x, pos.z, capsuleScratch);
    pushOutOfCircle(pos, c.x, c.z, c.r + UNICORN_RADIUS);
  }

  // Keep cleanly within the union of the 3 connected walkable zones (grass, bridge, castle)
  const clamped = clampToWalkableZones(pos.x, pos.z);
  pos.x = clamped.x;
  pos.z = clamped.z;

  return { hitTerraceWall, shouldAutoHopTerrace };
}
