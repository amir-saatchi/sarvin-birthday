"use client";

import React, { useEffect, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import {
  CuteUnicorn3D,
  ExtrudedHeart3D,
  ExtrudedStar3D,
} from "../MagicalDecor3D";
import { playPopSound, playSparkleSound } from "@/lib/soundEffects";
import { t } from "@/config/translate";
import { TargetRing3D } from "./assets";
import { CastleWorldTerrain } from "./CastleWorldTerrain";
import {
  clampToWalkableZones,
  getCrossZoneSteeringTarget,
  getSurfaceHeightAt,
  getWalkableFloorHeight,
  pushPointOutOfCircleObstacles,
  resolvePlayerCollisions,
  slideStepAroundCircles,
} from "./physics";
import {
  BOUNCE_MUSHROOMS,
  DINO_BRONTO_POS,
  FROZEN_OLAF_POS,
  FROZEN_SNOWMAN_POS,
  HEART_TRAIL,
  KUROMI_HOST_POS,
  MELODY_HOST_POS,
  PLAYER_START_POS,
  STAR_SPOTS,
} from "./worldData";
import { playerWorldPos } from "./playerTracker";

export type CastleWorldSceneProps = {
  collectedStars: boolean[];
  collectedHearts: boolean[];
  won: boolean;
  onCollectStar: (idx: number) => void;
  onCollectHeart: (idx: number) => void;
  onTriggerMessage: (msg: string) => void;
};

export function CastleWorldScene({
  collectedStars,
  collectedHearts,
  won,
  onCollectStar,
  onCollectHeart,
  onTriggerMessage,
}: CastleWorldSceneProps) {
  const { viewport, camera } = useThree();
  const isNarrow = viewport.width < 6.0;

  const playerGroupRef = useRef<THREE.Group>(null);
  const playerPosRef = useRef(new THREE.Vector3(...PLAYER_START_POS));
  const playerYawRef = useRef(Math.PI);
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  const jumpVelRef = useRef(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastBounceRef = useRef(0);
  const lastFriendMsgRef = useRef<Record<string, number>>({});
  const activeGreetingZoneRef = useRef<string | null>(null);
  const inFrozenLandRef = useRef(false);
  const inDinoLandRef = useRef(false);
  const inMelodyLandRef = useRef(false);
  const blockedTimerRef = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        keysRef.current["space"] = true;
        return;
      }
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        keysRef.current["space"] = false;
        return;
      }
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const handleGroundClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    // A tap on the fountain/tree/tower lands inside its collision circle: move the target to the
    // obstacle's edge so the unicorn can actually arrive instead of circling it forever.
    const outside = pushPointOutOfCircleObstacles(e.point.x, e.point.z);
    const clamped = clampToWalkableZones(outside.x, outside.z);
    const surfaceY = getSurfaceHeightAt(clamped.x, clamped.z);
    targetPosRef.current = new THREE.Vector3(clamped.x, surfaceY, clamped.z);
    blockedTimerRef.current = 0;
    playPopSound(1.25);
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const pos = playerPosRef.current;
    playerWorldPos.copy(pos);
    const prevX = pos.x;
    const prevZ = pos.z;
    const speed = 6.8;
    let moved = false;
    // Distance the tap-to-move steering asked for this frame (frame-rate independent blocked check)
    let expectedMove = 0;

    let kx = 0;
    let kz = 0;
    if (keysRef.current["arrowleft"] || keysRef.current["a"]) kx -= 1;
    if (keysRef.current["arrowright"] || keysRef.current["d"]) kx += 1;
    if (keysRef.current["arrowup"] || keysRef.current["w"]) kz -= 1;
    if (keysRef.current["arrowdown"] || keysRef.current["s"]) kz += 1;

    const currentFloorY = getWalkableFloorHeight(pos.x, pos.z, pos.y);
    const isGrounded = pos.y <= currentFloorY + 0.04 && jumpVelRef.current <= 0;

    // Optional keyboard Spacebar jump
    if (keysRef.current["space"] && isGrounded) {
      jumpVelRef.current = 6.8;
      playPopSound(1.35);
    }

    if (kx !== 0 || kz !== 0) {
      targetPosRef.current = null;
      blockedTimerRef.current = 0;
      const len = Math.hypot(kx, kz);
      const vx = (kx / len) * speed * dt;
      const vz = (kz / len) * speed * dt;
      const clamped = clampToWalkableZones(pos.x + vx, pos.z + vz);
      pos.x = clamped.x;
      pos.z = clamped.z;
      const desiredYaw = Math.atan2(vx, vz);
      let diff = desiredYaw - playerYawRef.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      playerYawRef.current += diff * Math.min(1, dt * 10);
      moved = true;
    } else if (targetPosRef.current) {
      const distToFinal = Math.hypot(
        targetPosRef.current.x - pos.x,
        targetPosRef.current.z - pos.z
      );
      if (distToFinal > 0.22) {
        const steer = getCrossZoneSteeringTarget(pos, targetPosRef.current);
        const dx = steer.x - pos.x;
        const dz = steer.z - pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.01) {
          const step = Math.min(dist, speed * dt);
          expectedMove = step;
          // Slide around circular obstacles (fountain, towers, trees…) instead of pushing into them
          const slid = slideStepAroundCircles(pos, (dx / dist) * step, (dz / dist) * step);
          pos.x += slid.dx;
          pos.z += slid.dz;
          const desiredYaw = Math.atan2(dx, dz);
          let diff = desiredYaw - playerYawRef.current;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          playerYawRef.current += diff * Math.min(1, dt * 10);
          moved = true;
        }
      } else {
        targetPosRef.current = null;
        blockedTimerRef.current = 0;
      }
    }

    const { hitTerraceWall, shouldAutoHopTerrace } = resolvePlayerCollisions(
      pos,
      targetPosRef.current,
      isGrounded
    );

    if (shouldAutoHopTerrace) {
      jumpVelRef.current = 6.9;
      playPopSound(1.35);
    }

    // If click-to-move is blocked against a solid obstacle, stop cleanly instead of trotting in place
    if (targetPosRef.current && moved && expectedMove > 0) {
      const actualMove = Math.hypot(pos.x - prevX, pos.z - prevZ);
      // Compare against the expected travel for this frame (speed * dt), not a fixed distance,
      // so the check behaves the same at 30, 60 or 120 Hz.
      if (actualMove < expectedMove * 0.2 && !hitTerraceWall && jumpVelRef.current <= 0) {
        blockedTimerRef.current += dt;
        if (blockedTimerRef.current > 0.16) {
          targetPosRef.current = null;
          blockedTimerRef.current = 0;
        }
      } else {
        blockedTimerRef.current = 0;
      }
    }

    // Vertical physics: smooth ramp ascent/descent, gravity, landing on raised terraces/upper castle
    const floorAfterMove = getWalkableFloorHeight(pos.x, pos.z, pos.y);
    if (jumpVelRef.current > 0 || pos.y > floorAfterMove + 0.18) {
      pos.y += jumpVelRef.current * dt;
      jumpVelRef.current -= 17 * dt;
      const landingFloor = getWalkableFloorHeight(pos.x, pos.z, pos.y);
      if (pos.y <= landingFloor) {
        pos.y = landingFloor;
        jumpVelRef.current = 0;
      }
    } else {
      pos.y = floorAfterMove;
      jumpVelRef.current = 0;
    }

    const now = performance.now();
    for (const [mx, , mz] of BOUNCE_MUSHROOMS) {
      if (
        Math.hypot(pos.x - mx, pos.z - mz) < 0.95 &&
        pos.y < 0.2 &&
        now - lastBounceRef.current > 650
      ) {
        jumpVelRef.current = 8.0;
        lastBounceRef.current = now;
        playSparkleSound();
      }
    }

    const onGroundNow = Math.abs(pos.y - floorAfterMove) < 0.04 && jumpVelRef.current === 0;
    if (playerGroupRef.current) {
      const trotHop =
        moved && onGroundNow ? Math.abs(Math.sin(state.clock.elapsedTime * 12)) * 0.22 : 0;
      playerGroupRef.current.position.set(pos.x, pos.y + trotHop + 0.16, pos.z);
      playerGroupRef.current.rotation.y = playerYawRef.current;
    }

    const fDist = Math.hypot(pos.x - 0, pos.z - 3.6);

    STAR_SPOTS.forEach(([sx, , sz], idx) => {
      if (!collectedStars[idx] && Math.hypot(pos.x - sx, pos.z - sz) < 1.35) {
        onCollectStar(idx);
      }
    });

    HEART_TRAIL.forEach(([hx, , hz], idx) => {
      if (!collectedHearts[idx] && Math.hypot(pos.x - hx, pos.z - hz) < 1.15) {
        onCollectHeart(idx);
      }
    });

    const triggerOnEnter = (key: string, msg: string) => {
      if (activeGreetingZoneRef.current === key) return;
      activeGreetingZoneRef.current = key;
      if (!lastFriendMsgRef.current[key] || now - lastFriendMsgRef.current[key] > 5500) {
        lastFriendMsgRef.current[key] = now;
        playSparkleSound();
        onTriggerMessage(msg);
      }
    };

    const snowmanDist = Math.hypot(
      pos.x - FROZEN_SNOWMAN_POS[0],
      pos.z - FROZEN_SNOWMAN_POS[2]
    );
    const olafDist = Math.hypot(
      pos.x - FROZEN_OLAF_POS[0],
      pos.z - FROZEN_OLAF_POS[2]
    );
    const brontoDist = Math.hypot(
      pos.x - DINO_BRONTO_POS[0],
      pos.z - DINO_BRONTO_POS[2]
    );
    const melodyHostDist = Math.hypot(
      pos.x - MELODY_HOST_POS[0],
      pos.z - MELODY_HOST_POS[2]
    );
    const kuromiHostDist = Math.hypot(
      pos.x - KUROMI_HOST_POS[0],
      pos.z - KUROMI_HOST_POS[2]
    );

    // One-time-on-entry Frozen Land welcome message (resets when returning east across the Ice Bridge)
    if (pos.x < -28.5 && !inFrozenLandRef.current) {
      inFrozenLandRef.current = true;
      triggerOnEnter("frozen", t.castleWorld.frozenLandMsg);
    } else if (pos.x > -24.0) {
      inFrozenLandRef.current = false;
    }

    // One-time-on-entry Dinosaur Land welcome message (resets when returning west across the Dino Log Bridge)
    if (pos.x > 28.5 && !inDinoLandRef.current) {
      inDinoLandRef.current = true;
      triggerOnEnter("dino", t.castleWorld.dinoLandMsg);
    } else if (pos.x < 24.0) {
      inDinoLandRef.current = false;
    }

    // One-time-on-entry My Melody & Kuromi Land welcome message (resets when returning north across the Pastel Ribbon Bridge)
    if (pos.z > 29.5 && !inMelodyLandRef.current) {
      inMelodyLandRef.current = true;
      triggerOnEnter("melodyLand", t.castleWorld.melodyLandMsg);
    } else if (pos.z < 25.0) {
      inMelodyLandRef.current = false;
    }

    if (melodyHostDist < 2.4) {
      triggerOnEnter("melodyHost", t.castleWorld.melodyHostMsg);
    } else if (kuromiHostDist < 2.4) {
      triggerOnEnter("kuromiHost", t.castleWorld.kuromiHostMsg);
    } else if (brontoDist < 2.8) {
      triggerOnEnter("bronto", t.castleWorld.brontoMsg);
    } else if (olafDist < 2.4) {
      triggerOnEnter("olaf", t.castleWorld.olafMsg);
    } else if (snowmanDist < 2.4) {
      triggerOnEnter("snowman", t.castleWorld.snowmanMsg);
    } else if (Math.hypot(pos.x - -11.5, pos.z - 2.2) < 2.2) {
      triggerOnEnter("pink", t.castleWorld.friendPinkMsg);
    } else if (Math.hypot(pos.x - 11.5, pos.z - 2.2) < 2.2) {
      triggerOnEnter("purple", t.castleWorld.friendPurpleMsg);
    } else if (pos.z < -26.0) {
      triggerOnEnter("castle", t.castleWorld.castleGateMsg);
    } else if (fDist < 2.6) {
      triggerOnEnter("fountain", t.castleWorld.fountainMsg);
    } else if (
      (activeGreetingZoneRef.current !== "frozen" || pos.x >= -28.5) &&
      (activeGreetingZoneRef.current !== "dino" || pos.x <= 28.5) &&
      (activeGreetingZoneRef.current !== "melodyLand" || pos.z <= 29.5)
    ) {
      activeGreetingZoneRef.current = null;
    }

    // Smooth 3rd-person elevated follow camera — tracks full X across Frozen Land, Green Land & future East worlds!
    const camOffsetY = isNarrow ? 9.2 : 7.8;
    const camOffsetZ = isNarrow ? 11.6 : 10.0;
    const desiredCamPos = new THREE.Vector3(
      pos.x,
      camOffsetY + pos.y * 0.9,
      pos.z + camOffsetZ
    );
    camera.position.lerp(desiredCamPos, Math.min(1, dt * 4.5));
    camera.lookAt(pos.x, 0.8 + pos.y * 0.9, pos.z - 1.8);
  });

  return (
    <>
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#f5d0fe", "#86efac", 0.72]} />
      <directionalLight position={[14, 22, 14]} intensity={1.25} color="#fff7ed" />
      <pointLight position={[0, 6, -16]} intensity={0.7} color="#f472b6" />
      <pointLight position={[0, 4, 3.6]} intensity={0.5} color="#7dd3fc" />
      <pointLight position={[0, 7, -33]} intensity={0.9} color="#f472b6" />
      <pointLight position={[0, 9.5, -50]} intensity={0.95} color="#fde047" />
      <pointLight position={[-41.5, 9.0, 2.0]} intensity={0.95} color="#bae6fd" />
      <pointLight position={[41.5, 9.0, 2.0]} intensity={0.95} color="#fde68a" />
      <pointLight position={[-7.5, 8.5, 42.5]} intensity={0.85} color="#f9a8d4" />
      <pointLight position={[7.5, 8.5, 42.5]} intensity={0.85} color="#d8b4fe" />

      <CastleWorldTerrain onGroundClick={handleGroundClick} />

      {/* 10 Collectible Magical Birthday Stars */}
      {STAR_SPOTS.map(
        (pos, idx) =>
          !collectedStars[idx] && (
            <group key={`star-${idx}`} position={pos}>
              <Float speed={2.6} rotationIntensity={0} floatIntensity={1} floatingRange={[-0.14, 0.14]}>
                <ExtrudedStar3D
                  position={[0, 0, 0]}
                  scale={1.38}
                  color="#fde047"
                  emissive="#f59e0b"
                  emissiveIntensity={0.68}
                  spin
                />
              </Float>
            </group>
          )
      )}

      {/* Collectible Heart Coin Trails */}
      {HEART_TRAIL.map(
        (pos, idx) =>
          !collectedHearts[idx] && (
            <group key={`heart-${idx}`} position={pos}>
              <Float speed={3} rotationIntensity={0} floatIntensity={1} floatingRange={[-0.1, 0.1]}>
                <ExtrudedHeart3D
                  position={[0, 0, 0]}
                  scale={0.64}
                  color={idx % 2 === 0 ? "#ff6eb4" : "#c084fc"}
                  emissive={idx % 2 === 0 ? "#ec4899" : "#a855f7"}
                  emissiveIntensity={0.35}
                />
              </Float>
            </group>
          )
      )}

      {/* Glowing click-to-move destination ring */}
      <TargetRing3D targetRef={targetPosRef} />

      {/* Playable Winged Unicorn! */}
      <group
        ref={playerGroupRef}
        position={[PLAYER_START_POS[0], PLAYER_START_POS[1] + 0.16, PLAYER_START_POS[2]]}
      >
        <CuteUnicorn3D scale={0.96} celebrating={won} />
      </group>

      <Sparkles count={95} scale={[36, 7, 34]} size={4.8} speed={0.4} color="#fef08a" />
      <Sparkles
        count={60}
        position={[0, 3.8, -42]}
        scale={[26, 8, 32]}
        size={4.8}
        speed={0.4}
        color="#fbcfe8"
      />
    </>
  );
}
