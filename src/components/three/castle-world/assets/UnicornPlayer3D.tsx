"use client";

import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { CuteUnicorn3D } from "../../MagicalDecor3D";

// Rigged winged unicorn (Draco + WebP GLB, ~28k tris / ~550 KB) with baked clips:
// "Walk" (loop built from the pack's 9 walk poses), "Idle" (happy face) and "Rear" (stands up, for the win)
const PLAYER_MODEL_URL = "/models/sunny.glb";
// Overall height incl. horn and wing tips, in world units
const PLAYER_HEIGHT = 1.9;
// The player group sits 0.16 above the floor; drop the hooves back onto it
const FEET_Y = -0.16;
// Ground speed (world units/s) at which the walk clip plays at normal speed
const WALK_REF_SPEED = 3.2;
// Materials whose texture alpha cuts out lashes, brows and hoof fluff (the exporter marks them opaque)
const CUTOUT_MATERIALS = ["Eyelashes", "Eyebrows", "HoovesAlpha", "Throat"];

function angleDelta(a: number, b: number) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

function damp(cur: number, target: number, lambda: number, dt: number) {
  return cur + (target - cur) * (1 - Math.exp(-lambda * dt));
}

// The baked clips don't key the wing roots, so the flap is applied on top of the rest pose each frame
type WingBone = { bone: THREE.Bone; axis: THREE.Vector3; rest: THREE.Quaternion; sign: number };

function PlayerModel3D({ celebrating }: { celebrating: boolean }) {
  const { scene, animations } = useGLTF(PLAYER_MODEL_URL);

  const rootRef = useRef<THREE.Group>(null);
  const poseRef = useRef<THREE.Group>(null);

  const { model, fit, offset, wings } = useMemo(() => {
    const clone = skeletonClone(scene);
    const bones: Record<string, THREE.Bone> = {};
    clone.traverse((o) => {
      if ((o as THREE.Bone).isBone) bones[o.name] = o as THREE.Bone;
      const mesh = o as THREE.SkinnedMesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const mat = m as THREE.MeshStandardMaterial;
        if (CUTOUT_MATERIALS.some((n) => mat.name.includes(n))) {
          mat.alphaTest = 0.5;
          mat.transparent = false;
        }
        mat.metalness = 0;
      }
    });
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Flap axis: the model's forward (Z) axis expressed in each wing root's parent frame
    const rootInv = clone.getWorldQuaternion(new THREE.Quaternion()).invert();
    const wingBone = (name: string, sign: number): WingBone | null => {
      const bone = bones[name];
      if (!bone?.parent) return null;
      const parentQ = bone.parent.getWorldQuaternion(new THREE.Quaternion()).premultiply(rootInv);
      return {
        bone,
        axis: new THREE.Vector3(0, 0, 1).applyQuaternion(parentQ.invert()),
        rest: bone.quaternion.clone(),
        sign,
      };
    };
    return {
      model: clone,
      fit: PLAYER_HEIGHT / Math.max(size.y, 0.001),
      offset: [-center.x, -box.min.y, -center.z] as [number, number, number],
      wings: [wingBone("Wing1_L", 1), wingBone("Wing1_R", -1)].filter(Boolean) as WingBone[],
    };
  }, [scene]);

  const { actions } = useAnimations(animations, model);

  useEffect(() => {
    for (const name of ["Idle", "Walk", "Rear"]) {
      const a = actions[name];
      if (!a) continue;
      a.reset().setEffectiveWeight(name === "Idle" ? 1 : 0).play();
    }
    return () => {
      for (const a of Object.values(actions)) a?.stop();
    };
  }, [actions]);

  // Motion state, derived from how the parent player group moves each frame
  const s = useRef({
    init: false,
    prev: new THREE.Vector3(),
    prevYaw: 0,
    move: 0, // 0 idle .. 1 full trot
    rear: 0,
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

    st.move = damp(st.move, Math.min(hSpeed / WALK_REF_SPEED, 1), 8, dt);
    st.rear = damp(st.rear, celebrating ? 1 : 0, 6, dt);
    const m = st.move * (1 - st.rear);
    // Big vertical speed = real jump/bounce
    const air = Math.abs(st.vy) > 3 ? THREE.MathUtils.clamp(st.vy / 7, -1, 1) : 0;

    // Blend the baked clips: idle <-> walk by ground speed, rear up when celebrating
    const walk = actions.Walk;
    if (walk) {
      walk.setEffectiveWeight(m);
      walk.setEffectiveTimeScale(THREE.MathUtils.clamp(hSpeed / WALK_REF_SPEED, 0.6, 2.2));
    }
    actions.Idle?.setEffectiveWeight((1 - st.move) * (1 - st.rear));
    actions.Rear?.setEffectiveWeight(st.rear);

    // Nose up when rising, nose down when falling; lean into turns
    st.pitch = damp(st.pitch, -air * 0.25, 10, dt);
    st.roll = damp(st.roll, THREE.MathUtils.clamp(-yawRate * 0.04, -0.18, 0.18) * m, 10, dt);
    pose.rotation.set(st.pitch, celebrating ? Math.sin(t * 3) * 0.25 : 0, st.roll);
    pose.position.y = celebrating ? Math.abs(Math.sin(t * 5)) * 0.12 : Math.sin(t * 2.4) * 0.02 * (1 - m);

    // Wings: soft flutter on the ground, bigger flaps in the air or when celebrating
    const a = Math.abs(air);
    const flapSpeed = celebrating ? 9 : 4 + m * 1.5 + a * 5;
    const flapAmp = celebrating ? 0.35 : 0.14 + m * 0.04 + a * 0.2;
    st.flapPhase += flapSpeed * dt;
    const flap = Math.sin(st.flapPhase) * flapAmp;
    for (const w of wings) {
      tmpQ.setFromAxisAngle(w.axis, flap * w.sign);
      w.bone.quaternion.copy(w.rest).premultiply(tmpQ);
    }
  });

  return (
    <group ref={rootRef} position={[0, FEET_Y, 0]}>
      <group ref={poseRef}>
        <group scale={fit}>
          <primitive object={model} position={offset} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(PLAYER_MODEL_URL);

/** Castle World player: rigged winged-unicorn model, with the primitive unicorn shown while it loads. */
export function UnicornPlayer3D({ celebrating = false }: { celebrating?: boolean }) {
  return (
    <Suspense fallback={<CuteUnicorn3D scale={0.96} celebrating={celebrating} />}>
      <PlayerModel3D celebrating={celebrating} />
    </Suspense>
  );
}
