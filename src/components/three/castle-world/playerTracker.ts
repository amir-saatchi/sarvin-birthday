import * as THREE from "three";

// Shared, mutable player position (updated every frame by CastleWorldScene), in layout coordinates:
// lands are drawn moved out from it (worldSpace.ts), so compare it with layout positions only
export const playerWorldPos = new THREE.Vector3(1e6, 0, 1e6);
