"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { warpToWorld } from "../worldSpace";

// Click marker ring on the grass where the player tapped
export function TargetRing3D({
  targetRef,
}: {
  targetRef: React.MutableRefObject<THREE.Vector3 | null>;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    if (!targetRef.current) {
      ringRef.current.visible = false;
      return;
    }
    ringRef.current.visible = true;
    // The target is in layout coordinates: draw it where that spot is drawn
    const [x, z] = warpToWorld(targetRef.current.x, targetRef.current.z);
    ringRef.current.position.set(x, targetRef.current.y + 0.06, z);
    const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 7) * 0.18;
    ringRef.current.scale.set(pulse, pulse, 1);
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.38, 0.6, 28]} />
      <meshBasicMaterial color="#fde047" transparent opacity={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}
