export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

export type WalkableZoneId =
  | "grass"
  | "bridge"
  | "castle"
  | "frozenBridge"
  | "frozen"
  | "dinoBridge"
  | "dino"
  | "melodyBridge"
  | "melody";

export type WalkableZone = {
  id: WalkableZoneId;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type WalkableRamp = {
  minX: number;
  maxX: number;
  startZ: number;
  endZ: number;
  startY: number;
  endY: number;
};

export type RaisedTerrace = {
  x: number;
  y: number;
  z: number;
  halfW: number;
  halfD: number;
  topY: number;
};

export type CircleObstacle = {
  x: number;
  z: number;
  r: number;
};

export type BoxObstacle = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type SkyMiniIslandTheme = "grass" | "frozen" | "castle" | "dino" | "melody";

export type SkyMiniIslandSpot = {
  pos: Vec3;
  size: number;
  treeColor: string;
  theme: SkyMiniIslandTheme;
};

export type TreeSpot = {
  pos: Vec3;
  color: string;
  scale: number;
};

export type FlowerSpot = {
  pos: Vec3;
  color: string;
};

export type LollipopSpot = {
  pos: Vec3;
  color: string;
  scale: number;
};

export type GiftSpot = {
  pos: Vec3;
  scale: number;
  boxColor: string;
  ribbonColor: string;
};

export type ButterflySpot = {
  center: Vec3;
  color: string;
  speed: number;
};

export type BunnyFriendSpot = {
  variant: "pink" | "purple";
  pos: Vec3;
  rotation: Vec3;
  scale: number;
};

export type CloudSpot = {
  pos: Vec3;
  scale: number;
  tint: string;
};

export type FenceSpot = {
  pos: Vec3;
  rotation?: Vec3;
  count: number;
};

export type CollisionResolutionResult = {
  hitTerraceWall: boolean;
  shouldAutoHopTerrace: boolean;
};
