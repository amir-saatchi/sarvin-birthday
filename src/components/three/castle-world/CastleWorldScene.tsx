"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { ExtrudedHeart3D, ExtrudedStar3D } from "../MagicalDecor3D";
import { playPopSound, playSparkleSound } from "@/lib/soundEffects";
import { t } from "@/config/translate";
import { TargetRing3D, UnicornPlayer3D } from "./assets";
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

// true: the camera swings round behind the unicorn as she turns. false: fixed north-facing camera.
const CAMERA_FOLLOWS_FACING = true;

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
  const camera = useThree((s) => s.camera);
  // CSS pixels of the canvas (not world units), so phones actually get the wider camera framing
  const canvasWidth = useThree((s) => s.size.width);
  const isNarrow = canvasWidth < 640;

  const playerGroupRef = useRef<THREE.Group>(null);
  const playerPosRef = useRef(new THREE.Vector3(...PLAYER_START_POS));
  const playerYawRef = useRef(Math.PI);
  // Yaw the chase camera looks along (starts behind the unicorn, facing the castle)
  const camYawRef = useRef(Math.PI);
  const camTargetRef = useRef(new THREE.Vector3());
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
    const keys = keysRef.current;
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return (
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)
      );
    };
    // Match physical keys (e.code) so WASD also works on the Persian keyboard layout
    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
      keys[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      // Always release, even if focus moved to a button meanwhile, so keys never stick
      keys[e.code] = false;
    };
    const releaseAll = () => {
      for (const k of Object.keys(keys)) keys[k] = false;
    };
    const onVisibility = () => {
      if (document.hidden) releaseAll();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Stable identity (refs and module imports only) so the memoized terrain isn't redrawn on every pickup
  const handleGroundClick = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    // A tap on the fountain/tree/tower lands inside its collision circle: move the target to the
    // obstacle's edge so the unicorn can actually arrive instead of circling it forever.
    const outside = pushPointOutOfCircleObstacles(e.point.x, e.point.z);
    const clamped = clampToWalkableZones(outside.x, outside.z);
    const surfaceY = getSurfaceHeightAt(clamped.x, clamped.z);
    targetPosRef.current = new THREE.Vector3(clamped.x, surfaceY, clamped.z);
    blockedTimerRef.current = 0;
    playPopSound(1.25);
  }, []);

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
    const keys = keysRef.current;
    if (keys["ArrowLeft"] || keys["KeyA"]) kx -= 1;
    if (keys["ArrowRight"] || keys["KeyD"]) kx += 1;
    if (keys["ArrowUp"] || keys["KeyW"]) kz -= 1;
    if (keys["ArrowDown"] || keys["KeyS"]) kz += 1;

    const currentFloorY = getWalkableFloorHeight(pos.x, pos.z, pos.y);
    const isGrounded = pos.y <= currentFloorY + 0.04 && jumpVelRef.current <= 0;

    // Optional keyboard Spacebar jump
    if (keys["Space"] && isGrounded) {
      jumpVelRef.current = 6.8;
      playPopSound(1.35);
    }

    if (kx !== 0 || kz !== 0) {
      targetPosRef.current = null;
      blockedTimerRef.current = 0;
      const len = Math.hypot(kx, kz);
      // Keys are camera-relative: Up = away from the camera, Left/Right = screen left/right
      const cy = camYawRef.current;
      const fwdX = Math.sin(cy);
      const fwdZ = Math.cos(cy);
      const rightX = -Math.cos(cy);
      const rightZ = Math.sin(cy);
      const ix = kx / len;
      const iz = -kz / len;
      const vx = (fwdX * iz + rightX * ix) * speed * dt;
      const vz = (fwdZ * iz + rightZ * ix) * speed * dt;
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

    // Smooth 3rd-person chase camera: sits behind the unicorn and slowly swings round to follow its facing.
    // It only follows while she's moving and not heading back toward the camera (|turn| < ~110°), so walking
    // toward the screen doesn't whip the camera 180° around.
    if (CAMERA_FOLLOWS_FACING && moved) {
      const turn = Math.atan2(
        Math.sin(playerYawRef.current - camYawRef.current),
        Math.cos(playerYawRef.current - camYawRef.current)
      );
      if (Math.abs(turn) < 1.9) camYawRef.current += turn * (1 - Math.exp(-2.2 * dt));
    }
    const camYaw = camYawRef.current;
    const fx = Math.sin(camYaw);
    const fz = Math.cos(camYaw);
    const camOffsetY = isNarrow ? 4.8 : 4.2;
    const camBack = isNarrow ? 6.8 : 5.8;
    camTargetRef.current.set(pos.x - fx * camBack, camOffsetY + pos.y * 0.9, pos.z - fz * camBack);
    camera.position.lerp(camTargetRef.current, Math.min(1, dt * 4.5));
    camera.lookAt(pos.x + fx * 1.8, 0.8 + pos.y * 0.9, pos.z + fz * 1.8);
  });

  return (
    <>
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#f5d0fe", "#86efac", 0.72]} />
      <directionalLight position={[14, 22, 14]} intensity={1.25} color="#fff7ed" />

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
        <UnicornPlayer3D celebrating={won} />
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
