import * as THREE from "three";
import {
  MELODY_WHEEL_EXIT,
  MELODY_WHEEL_GONDOLAS,
  MELODY_WHEEL_PAD,
  MELODY_WHEEL_SPIN,
  melodyWheelAngle,
  melodyWheelSeat,
} from "./worldData";

// A ride on My Melody's Ferris Wheel, as a function of time. The wheel turns with the R3F clock, so the ride follows
// one gondola by clock time:
//   board - hop from the heart pad into the gondola at the bottom
//   ride  - one full turn in the gondola, facing the camera (catching the hearts at the top)
//   exit  - hop out over the pad and land in front of it
const T_BOARD = 0.9;
const T_RIDE = (Math.PI * 2) / MELODY_WHEEL_SPIN;
const T_EXIT = 0.9;
export const WHEEL_RIDE_DURATION = T_BOARD + T_RIDE + T_EXIT;

const BOTTOM = -Math.PI / 2;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** The gondola nearest the bottom of the wheel when a ride starting at clock time `clockT` climbs in. */
export function wheelGondolaToBoard(clockT: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let k = 0; k < MELODY_WHEEL_GONDOLAS; k++) {
    const a = melodyWheelAngle(k, clockT + T_BOARD);
    const d = Math.abs(Math.atan2(Math.sin(a - BOTTOM), Math.cos(a - BOTTOM)));
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  return best;
}

/**
 * Writes the unicorn's position `elapsed` seconds into a wheel ride (started at clock time `startClock`, riding
 * gondola `gondola`) into `out`. Returns the facing yaw. The ride is over once elapsed >= WHEEL_RIDE_DURATION.
 */
export function wheelRidePose(elapsed: number, startClock: number, gondola: number, out: THREE.Vector3): number {
  const [px, , pz] = MELODY_WHEEL_PAD;
  if (elapsed < T_BOARD) {
    const [sx, sy, sz] = melodyWheelSeat(melodyWheelAngle(gondola, startClock + elapsed));
    const u = smooth(elapsed / T_BOARD);
    out.set(px + (sx - px) * u, sy * u + Math.sin(u * Math.PI) * 0.9, pz + (sz - pz) * u);
    return Math.atan2(sx - px, sz - pz);
  }
  if (elapsed < T_BOARD + T_RIDE) {
    const [sx, sy, sz] = melodyWheelSeat(melodyWheelAngle(gondola, startClock + elapsed));
    out.set(sx, sy, sz);
    // Facing north, toward the camera and the bridge
    return Math.PI;
  }
  const [ex, ey, ez] = melodyWheelSeat(melodyWheelAngle(gondola, startClock + T_BOARD + T_RIDE));
  const [qx, , qz] = MELODY_WHEEL_EXIT;
  const u = smooth(Math.min(1, (elapsed - T_BOARD - T_RIDE) / T_EXIT));
  out.set(ex + (qx - ex) * u, ey * (1 - u) + Math.sin(u * Math.PI) * 0.8, ez + (qz - ez) * u);
  return Math.atan2(qx - ex, qz - ez);
}
