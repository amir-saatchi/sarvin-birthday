"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CuteUnicorn3D } from "../../MagicalDecor3D";

// Sculpted unicorn (Draco + WebP GLB, ~26k tris / ~310 KB), decimated from the 236k-tri source in .asset/
const UNICORN_MODEL_URL = "/models/unicorn.glb";
// Overall height incl. horn, in world units (old primitive unicorn was ~1.5 tall at scale 0.96)
const UNICORN_HEIGHT = 1.8;
// The player group sits 0.16 above the floor; drop the hooves back onto it
const FEET_Y = -0.16;

function angleDelta(a: number, b: number) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

function damp(cur: number, target: number, lambda: number, dt: number) {
  return cur + (target - cur) * (1 - Math.exp(-lambda * dt));
}

const wingMain = (
  <meshPhysicalMaterial
    color="#fbcfe8"
    emissive="#f472b6"
    emissiveIntensity={0.2}
    roughness={0.15}
    clearcoat={0.9}
    transparent
    opacity={0.88}
  />
);
const wingSmall = (
  <meshPhysicalMaterial color="#e9d5ff" roughness={0.15} clearcoat={0.9} transparent opacity={0.85} />
);

function Wing({ side, wingRef }: { side: 1 | -1; wingRef: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={wingRef} position={[0.16 * side, 0, 0]}>
      <mesh position={[0.26 * side, 0.14, 0]} rotation={[0.15, 0, -0.4 * side]} scale={[1.35, 0.72, 0.18]}>
        <sphereGeometry args={[0.26, 16, 16]} />
        {wingMain}
      </mesh>
      <mesh position={[0.2 * side, -0.06, 0]} rotation={[0.1, 0, 0.2 * side]} scale={[1.0, 0.55, 0.16]}>
        <sphereGeometry args={[0.2, 14, 14]} />
        {wingSmall}
      </mesh>
    </group>
  );
}

function UnicornModel3D({ celebrating, wings }: { celebrating: boolean; wings: boolean }) {
  const { scene } = useGLTF(UNICORN_MODEL_URL);

  const rootRef = useRef<THREE.Group>(null);
  const poseRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);

  const { model, fit, offset } = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && "roughness" in mat) {
          mat.roughness = 0.55;
          mat.metalness = 0;
        }
      }
    });
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return {
      model: clone,
      fit: UNICORN_HEIGHT / Math.max(size.y, 0.001),
      offset: [-center.x, -box.min.y, -center.z] as [number, number, number],
    };
  }, [scene]);

  // Motion state, derived from how the parent player group moves each frame
  const s = useRef({
    init: false,
    prev: new THREE.Vector3(),
    prevYaw: 0,
    move: 0, // 0 idle .. 1 full trot
    pitch: 0,
    roll: 0,
    vy: 0,
    flapPhase: 0,
  });
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpQ = useMemo(() => new THREE.Quaternion(), []);
  const tmpE = useMemo(() => new THREE.Euler(0, 0, 0, "YXZ"), []);

  useFrame((state, delta) => {
    const root = rootRef.current;
    const pose = poseRef.current;
    if (!root || !pose || !root.parent) return;
    const dt = Math.max(Math.min(delta, 0.05), 1e-4);
    const t = state.clock.elapsedTime;
    const st = s.current;

    root.parent.getWorldPosition(tmpPos);
    root.parent.getWorldQuaternion(tmpQ);
    const yaw = tmpE.setFromQuaternion(tmpQ).y;
    if (!st.init) {
      st.prev.copy(tmpPos);
      st.prevYaw = yaw;
      st.init = true;
    }
    const hSpeed = Math.hypot(tmpPos.x - st.prev.x, tmpPos.z - st.prev.z) / dt;
    st.vy = damp(st.vy, (tmpPos.y - st.prev.y) / dt, 12, dt);
    const yawRate = angleDelta(yaw, st.prevYaw) / dt;
    st.prev.copy(tmpPos);
    st.prevYaw = yaw;

    st.move = damp(st.move, Math.min(hSpeed / 6.8, 1), 8, dt);
    const m = st.move;
    // Big vertical speed = real jump/bounce (the trot hop alone stays under ~2.6 u/s)
    const air = Math.abs(st.vy) > 3 ? THREE.MathUtils.clamp(st.vy / 7, -1, 1) : 0;

    // Lean forward while trotting, nose up when rising, nose down when falling
    const pitchTarget = m * 0.1 - air * 0.28 + Math.sin(t * 24) * 0.025 * m;
    // Lean into turns, plus a little side-to-side trot rock
    const rollTarget =
      THREE.MathUtils.clamp(-yawRate * 0.05, -0.22, 0.22) * m + Math.sin(t * 12) * 0.05 * m;
    st.pitch = damp(st.pitch, pitchTarget, 10, dt);
    st.roll = damp(st.roll, rollTarget, 10, dt);

    if (celebrating) {
      pose.position.y = Math.abs(Math.sin(t * 7)) * 0.45;
      pose.rotation.set(0, Math.sin(t * 4) * 0.45, Math.sin(t * 7) * 0.08);
      pose.scale.set(1, 1, 1);
    } else {
      // Gentle idle breathing bob that fades out while trotting
      pose.position.y = Math.sin(t * 2.4) * 0.05 * (1 - m);
      pose.rotation.set(st.pitch, 0, st.roll + Math.sin(t * 2) * 0.03 * (1 - m));
      const squash = 1 + Math.sin(t * 24) * 0.035 * m;
      pose.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    }

    // Wings rest and gently flutter on the ground; they only really flap in the air or when celebrating
    const a = Math.abs(air);
    const flapSpeed = celebrating ? 9 : 4 + m * 1.5 + a * 5;
    const flapAmp = celebrating ? 0.35 : 0.22 + m * 0.04 + a * 0.15;
    // Accumulate phase (not t * speed) so speed changes don't make the wings jitter
    st.flapPhase += flapSpeed * dt;
    const flap = Math.sin(st.flapPhase) * flapAmp;
    if (leftWingRef.current) leftWingRef.current.rotation.y = 0.35 - flap;
    if (rightWingRef.current) rightWingRef.current.rotation.y = -0.35 + flap;
  });

  return (
    <group ref={rootRef} position={[0, FEET_Y, 0]}>
      <group ref={poseRef}>
        <group scale={fit}>
          <primitive object={model} position={offset} />
        </group>
        {wings && (
          <group position={[0, UNICORN_HEIGHT * 0.5, -0.12]} rotation={[0.25, 0, 0]}>
            <Wing side={1} wingRef={leftWingRef} />
            <Wing side={-1} wingRef={rightWingRef} />
          </group>
        )}
      </group>
    </group>
  );
}

useGLTF.preload(UNICORN_MODEL_URL);

/** Castle World player: sculpted unicorn model, with the primitive unicorn shown while it loads. */
export function UnicornPlayer3D({
  celebrating = false,
  wings = true,
}: {
  celebrating?: boolean;
  wings?: boolean;
}) {
  return (
    <Suspense fallback={<CuteUnicorn3D scale={0.96} celebrating={celebrating} />}>
      <UnicornModel3D celebrating={celebrating} wings={wings} />
    </Suspense>
  );
}
