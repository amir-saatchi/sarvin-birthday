import * as THREE from "three";
import type { BoxObstacle, CollisionResolutionResult } from "./types";
import {
  BRIDGE_NORTH_Z,
  BRIDGE_SOUTH_Z,
  CASTLE_RAMP,
  CASTLE_RAMP_SIDE_RAILS,
  CIRCLE_OBSTACLES,
  DINO_BRIDGE_CENTER_Z,
  DINO_BRIDGE_EAST_X,
  DINO_BRIDGE_WEST_X,
  FROZEN_BRIDGE_CENTER_Z,
  FROZEN_BRIDGE_EAST_X,
  FROZEN_BRIDGE_WEST_X,
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
  if (x < FROZEN_BRIDGE_WEST_X) return "frozen";
  if (x <= FROZEN_BRIDGE_EAST_X) return "frozenBridge";
  if (x > DINO_BRIDGE_EAST_X) return "dino";
  if (x >= DINO_BRIDGE_WEST_X) return "dinoBridge";
  if (z > MELODY_BRIDGE_SOUTH_Z) return "melody";
  if (z >= MELODY_BRIDGE_NORTH_Z) return "melodyBridge";
  if (z > BRIDGE_SOUTH_Z) return "grass";
  if (z >= BRIDGE_NORTH_Z) return "bridge";
  if (z <= UPPER_CASTLE_Z) return "castleUpper";
  if (z <= CASTLE_RAMP.startZ && Math.abs(x) <= CASTLE_RAMP.maxX) return "castleRamp";
  return "castleLower";
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

/**
 * Guides click-to-move smoothly across the Royal Bridge (grass <-> castle),
 * the Sloped Royal Ramp (lower courtyard <-> upper castle terrace),
 * the Crystal Ice Bridge (grass <-> frozen land),
 * the Dino Log Bridge (grass <-> dinosaur land),
 * and the Pastel Ribbon Bridge (grass <-> My Melody & Kuromi Land).
 */
export function getCrossZoneSteeringTarget(
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
      if (Math.abs(pos.x) > 1.75 || pos.z < CASTLE_RAMP.startZ + 0.2) {
        return { x: THREE.MathUtils.clamp(pos.x, -1.25, 1.25), z: CASTLE_RAMP.startZ + 1.0 };
      }
      return {
        x: THREE.MathUtils.clamp(target.x, -1.4, 1.4),
        z: targetZone === "castleUpper" ? UPPER_CASTLE_Z - 0.8 : target.z,
      };
    }

    // Heading south toward bridge / grass / frozen land / dinosaur land / melody & kuromi land
    if (Math.abs(pos.x) > 1.7) {
      return { x: THREE.MathUtils.clamp(pos.x, -1.35, 1.35), z: BRIDGE_NORTH_Z - 0.4 };
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

  // Solid circle collisions with fountain, castle towers, throne, trees, lamps, lollipops, crystals, bunnies & gifts
  for (const obs of CIRCLE_OBSTACLES) {
    pushOutOfCircle(pos, obs.x, obs.z, obs.r + UNICORN_RADIUS);
  }

  // Keep cleanly within the union of the 3 connected walkable zones (grass, bridge, castle)
  const clamped = clampToWalkableZones(pos.x, pos.z);
  pos.x = clamped.x;
  pos.z = clamped.z;

  return { hitTerraceWall, shouldAutoHopTerrace };
}
