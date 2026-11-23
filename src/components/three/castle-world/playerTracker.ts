import * as THREE from "three";

// Shared, mutable player world position (updated every frame by CastleWorldScene)
export const playerWorldPos = new THREE.Vector3(1e6, 0, 1e6);
