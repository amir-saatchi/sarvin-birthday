import * as THREE from "three";
import {
  FROZEN_SLIDE_CHUTE,
  FROZEN_SLIDE_EXIT,
  FROZEN_SLIDE_PAD,
  FROZEN_SLIDE_POS,
  FROZEN_SLIDE_TOP_Y,
} from "./worldData";

// A ride on the Frozen Land Ice Slide, as a function of time:
//   lift  - float straight up from the snowflake pad (clear of the chute's outer lip)
//   glide - drift in over the railing and land on the tower's top platform
//   step  - walk onto the top of the chute
//   slide - whoosh down the spiral, speeding up as she goes
//   coast - glide off the run-out and stop on the snow
const LIFT_Y = FROZEN_SLIDE_TOP_Y + 1.1;
const T_LIFT = 0.85;
const T_GLIDE = 0.6;
const T_STEP = 0.35;
const T_SLIDE = 2.6;
const T_COAST = 0.45;
export const SLIDE_RIDE_DURATION = T_LIFT + T_GLIDE + T_STEP + T_SLIDE + T_COAST;

// Cumulative arc length along the chute polyline
const chuteLen: number[] = [0];
for (let i = 1; i < FROZEN_SLIDE_CHUTE.length; i++) {
  const [ax, ay, az] = FROZEN_SLIDE_CHUTE[i - 1];
  const [bx, by, bz] = FROZEN_SLIDE_CHUTE[i];
  chuteLen.push(chuteLen[i - 1] + Math.hypot(bx - ax, by - ay, bz - az));
}
const CHUTE_TOTAL = chuteLen[chuteLen.length - 1];

function chuteAt(dist: number, out: THREE.Vector3) {
  let i = 1;
  while (i < chuteLen.length - 1 && chuteLen[i] < dist) i++;
  const t = THREE.MathUtils.clamp((dist - chuteLen[i - 1]) / (chuteLen[i] - chuteLen[i - 1] || 1), 0, 1);
  const a = FROZEN_SLIDE_CHUTE[i - 1];
  const b = FROZEN_SLIDE_CHUTE[i];
  return out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const tmpA = new THREE.Vector3();

/**
 * Writes the unicorn's position `elapsed` seconds into a slide ride into `out`.
 * Returns the facing yaw to use, or null to keep the current one. Ride is over once elapsed >= SLIDE_RIDE_DURATION.
 */
export function slideRidePose(elapsed: number, out: THREE.Vector3): number | null {
  let t = elapsed;
  const [px, , pz] = FROZEN_SLIDE_PAD;
  const [cx, , cz] = FROZEN_SLIDE_POS;
  if (t < T_LIFT) {
    out.set(px, LIFT_Y * smooth(t / T_LIFT), pz);
    return Math.atan2(cx - px, cz - pz);
  }
  t -= T_LIFT;
  if (t < T_GLIDE) {
    const u = smooth(t / T_GLIDE);
    out.set(px + (cx - px) * u, LIFT_Y + (FROZEN_SLIDE_TOP_Y - LIFT_Y) * u + Math.sin(u * Math.PI) * 0.35, pz + (cz - pz) * u);
    return Math.atan2(cx - px, cz - pz);
  }
  t -= T_GLIDE;
  const start = FROZEN_SLIDE_CHUTE[0];
  if (t < T_STEP) {
    const u = smooth(t / T_STEP);
    out.set(cx + (start[0] - cx) * u, FROZEN_SLIDE_TOP_Y + (start[1] - FROZEN_SLIDE_TOP_Y) * u, cz + (start[2] - cz) * u);
    return Math.atan2(start[0] - cx, start[2] - cz);
  }
  t -= T_STEP;
  if (t < T_SLIDE) {
    // Starts gently, then speeds up (distance grows with u^1.6)
    const u = t / T_SLIDE;
    const d = CHUTE_TOTAL * Math.pow(u, 1.6);
    chuteAt(d, out);
    chuteAt(Math.min(CHUTE_TOTAL, d + 0.3), tmpA);
    return Math.atan2(tmpA.x - out.x, tmpA.z - out.z);
  }
  t -= T_SLIDE;
  const end = FROZEN_SLIDE_CHUTE[FROZEN_SLIDE_CHUTE.length - 1];
  const u = 1 - Math.pow(1 - Math.min(1, t / T_COAST), 2);
  out.set(
    end[0] + (FROZEN_SLIDE_EXIT[0] - end[0]) * u,
    end[1] * (1 - u),
    end[2] + (FROZEN_SLIDE_EXIT[2] - end[2]) * u
  );
  return Math.atan2(FROZEN_SLIDE_EXIT[0] - end[0], FROZEN_SLIDE_EXIT[2] - end[2]);
}
