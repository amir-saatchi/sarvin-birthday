import type {
  BoxObstacle,
  BunnyFriendSpot,
  ButterflySpot,
  CircleObstacle,
  CloudSpot,
  FenceSpot,
  FlowerSpot,
  GiftSpot,
  LollipopSpot,
  RaisedTerrace,
  SkyMiniIslandSpot,
  TreeSpot,
  Vec2,
  Vec3,
  WalkableRamp,
  WalkableZone,
} from "./types";

// Expanded multi-zone open castle kingdom!
// 9 seamlessly connected walkable zones: Main Grass Island <-> Royal Bridge <-> Royal Castle, Crystal Ice Bridge <-> Frozen Land, Dino Log Bridge <-> Dinosaur Land, & Pastel Ribbon Bridge <-> My Melody & Kuromi Land
export const WALKABLE_ZONES: WalkableZone[] = [
  { id: "grass", minX: -18.6, maxX: 18.6, minZ: -15.8, maxZ: 18.8 },
  { id: "bridge", minX: -2.0, maxX: 2.0, minZ: -25.4, maxZ: -15.8 },
  { id: "castle", minX: -12.6, maxX: 12.6, minZ: -55.8, maxZ: -25.2 },
  { id: "frozenBridge", minX: -28.2, maxX: -18.4, minZ: 0.0, maxZ: 4.0 },
  { id: "frozen", minX: -53.8, maxX: -28.0, minZ: -11.4, maxZ: 15.4 },
  { id: "dinoBridge", minX: 18.4, maxX: 28.2, minZ: 0.0, maxZ: 4.0 },
  { id: "dino", minX: 28.0, maxX: 53.8, minZ: -11.4, maxZ: 15.4 },
  { id: "melodyBridge", minX: -2.0, maxX: 2.0, minZ: 18.4, maxZ: 29.2 },
  { id: "melody", minX: -13.4, maxX: 13.4, minZ: 29.0, maxZ: 54.8 },
];

export const BRIDGE_SOUTH_Z = -16.2;
export const BRIDGE_NORTH_Z = -25.2;

export const FROZEN_BRIDGE_EAST_X = -19.2;
export const FROZEN_BRIDGE_WEST_X = -27.8;
export const FROZEN_BRIDGE_CENTER_Z = 2.0;

export const DINO_BRIDGE_WEST_X = 19.2;
export const DINO_BRIDGE_EAST_X = 27.8;
export const DINO_BRIDGE_CENTER_Z = 2.0;

export const MELODY_BRIDGE_NORTH_Z = 19.2;
export const MELODY_BRIDGE_SOUTH_Z = 28.8;

// Two-level Royal Castle Platform elevation & sloped ramp geometry
export const UPPER_CASTLE_Z = -42.5;
export const UPPER_CASTLE_Y = 2.6;

export const CASTLE_RAMP: WalkableRamp = {
  minX: -2.6,
  maxX: 2.6,
  startZ: -36.5,
  endZ: -42.5,
  startY: 0,
  endY: UPPER_CASTLE_Y,
};

// Front cliff walls (block lower courtyard walking under the upper level outside the ramp)
export const UPPER_CASTLE_CLIFF_BOXES: BoxObstacle[] = [
  { minX: -15.0, maxX: -2.65, minZ: -58.5, maxZ: UPPER_CASTLE_Z },
  { minX: 2.65, maxX: 15.0, minZ: -58.5, maxZ: UPPER_CASTLE_Z },
];

// Upper balcony front railings (keep unicorn from clipping through the overlook railings)
export const UPPER_CASTLE_BALCONY_RAILS: BoxObstacle[] = [
  { minX: -15.0, maxX: -2.75, minZ: -42.95, maxZ: -42.45 },
  { minX: 2.75, maxX: 15.0, minZ: -42.95, maxZ: -42.45 },
];

// Ramp side railings (act as solid side walls from lower courtyard & handrails on the ramp)
export const CASTLE_RAMP_SIDE_RAILS: BoxObstacle[] = [
  { minX: -2.85, maxX: -2.55, minZ: CASTLE_RAMP.endZ, maxZ: CASTLE_RAMP.startZ },
  { minX: 2.55, maxX: 2.85, minZ: CASTLE_RAMP.endZ, maxZ: CASTLE_RAMP.startZ },
];

export const UNICORN_RADIUS = 0.62;
export const PLAYER_START_POS: Vec3 = [0, 0, 12.2];

// Kept empty (no corner terraces on the main grass island) while preserving extensibility in physics/terrain
export const RAISED_TERRACES: RaisedTerrace[] = [];

export const SKY_MINI_ISLANDS: SkyMiniIslandSpot[] = [
  // Frozen Land glacier mini-islands (West)
  { pos: [-58, -1.5, -18], size: 5.5, treeColor: "#7dd3fc", theme: "frozen" },
  { pos: [-56, -2.0, 20], size: 4.5, treeColor: "#c4b5fd", theme: "frozen" },
  // Dinosaur Land tropical jungle mini-islands (East)
  { pos: [58, -1.2, -18], size: 5.5, treeColor: "#22c55e", theme: "dino" },
  { pos: [56, -1.8, 20], size: 4.5, treeColor: "#16a34a", theme: "dino" },
  // Royal Castle marble & lavender mini-islands (North)
  { pos: [-24, -1.2, -34], size: 5.0, treeColor: "#7dd3fc", theme: "castle" },
  { pos: [24, -1.4, -34], size: 5.0, treeColor: "#fde047", theme: "castle" },
  { pos: [-24, 1.2, -52], size: 5.0, treeColor: "#ff85c0", theme: "castle" },
  { pos: [24, 1.0, -52], size: 5.0, treeColor: "#c084fc", theme: "castle" },
  // My Melody & Kuromi Land pastel candy mini-islands (South)
  { pos: [-24, -1.4, 44], size: 5.0, treeColor: "#ff85c0", theme: "melody" },
  { pos: [24, -1.4, 44], size: 5.0, treeColor: "#c084fc", theme: "melody" },
];

// Winding pastel stepping stones connecting all zones
export const STEPPING_STONES: Vec2[] = [
  // South Archway to Fountain
  [0, 19.8], [0, 18.2], [0, 16.4], [0, 14.5], [0, 12.6], [0, 10.7], [0, 8.8], [0, 6.9],
  // Fountain to Royal Carpet
  [0, 0.4], [0, -1.6], [0, -3.6], [0, -5.6],
  // West to Melody's Garden & Ice Archway
  [-2.8, 3.6], [-4.8, 3.4], [-6.8, 3.1], [-8.8, 2.7], [-10.8, 2.3],
  [-13.4, 2.1], [-15.6, 2.0], [-17.8, 2.0],
  // East to Kuromi's Plaza & Jungle Archway
  [2.8, 3.6], [4.8, 3.4], [6.8, 3.1], [8.8, 2.7], [10.8, 2.3],
  [13.4, 2.1], [15.6, 2.0], [17.8, 2.0],
];

export const LILY_PAD_SPOTS: Vec3[] = [
  [-1.3, 0.04, 0.8],
  [1.4, 0.04, -0.9],
  [-0.4, 0.04, -1.6],
  [1.2, 0.04, 1.4],
];

export const FENCE_SPOTS: FenceSpot[] = [
  // South edge (z = 19.6): left & right segments closing SW/SE corners while opening x ∈ [-3.1, 3.1] for the Melody & Kuromi Archway & Pastel Ribbon Bridge
  { pos: [-11.3, 0, 19.6], count: 15 },
  { pos: [11.3, 0, 19.6], count: 15 },
  // West edge (x = -19.4): split into NW & SW segments closing corners while opening z ∈ [-1.2, 5.5] for the Ice Archway & Crystal Ice Bridge
  { pos: [-19.4, 0, -8.8], rotation: [0, Math.PI / 2, 0], count: 14 },
  { pos: [-19.4, 0, 12.55], rotation: [0, Math.PI / 2, 0], count: 13 },
  // East edge (x = +19.4): split into NE & SE segments closing corners while opening z ∈ [-1.2, 5.5] for the Jungle Archway & Dino Log Bridge
  { pos: [19.4, 0, -8.8], rotation: [0, Math.PI / 2, 0], count: 14 },
  { pos: [19.4, 0, 12.55], rotation: [0, Math.PI / 2, 0], count: 13 },
  // North edge (z = -16.4): left & right segments closing NW/NE corners while leaving the Rainbow Arch & Royal Bridge open
  { pos: [-11.3, 0, -16.4], count: 15 },
  { pos: [11.3, 0, -16.4], count: 15 },
];

export const LAMP_SPOTS: Vec3[] = [
  // Main island royal avenue
  [-3.0, 0, -6.5],
  [3.0, 0, -6.5],
  [-3.0, 0, -1.2],
  [3.0, 0, -1.2],
  // Lower Royal Castle Courtyard lamps
  [-3.6, 0, -29.5],
  [3.6, 0, -29.5],
  [-3.6, 0, -35.2],
  [3.6, 0, -35.2],
  // Upper Royal Castle Terrace lamps (y = 2.6)
  [-3.8, UPPER_CASTLE_Y, -45.5],
  [3.8, UPPER_CASTLE_Y, -45.5],
  [-3.8, UPPER_CASTLE_Y, -51.5],
  [3.8, UPPER_CASTLE_Y, -51.5],
];

export const LOLLIPOP_SPOTS: LollipopSpot[] = [
  { pos: [-13.5, 0, 11.2], color: "#ff6eb4", scale: 1.25 },
  { pos: [-10.2, 0, 13.8], color: "#7dd3fc", scale: 1.1 },
  { pos: [-9.2, 0, 10.2], color: "#c084fc", scale: 1.15 },
  { pos: [-13.0, 0, 13.8], color: "#fde047", scale: 1.0 },
];

export const CRYSTAL_SPOTS: Vec3[] = [
  [14.2, 0, 1.0],
  [13.2, 0, 4.2],
  [10.5, 0, -2.0],
];

export const GIFT_SPOTS: GiftSpot[] = [
  // Main island avenue & Kuromi's Plaza
  { pos: [-3.6, 0, -10.8], scale: 1.2, boxColor: "#ff85c0", ribbonColor: "#fde047" },
  { pos: [3.6, 0, -10.8], scale: 1.2, boxColor: "#c084fc", ribbonColor: "#ff85c0" },
  { pos: [12.8, 0, 0.2], scale: 1.05, boxColor: "#7dd3fc", ribbonColor: "#fde047" },
  { pos: [13.8, 0, 2.8], scale: 0.95, boxColor: "#ff85c0", ribbonColor: "#ffffff" },
  // Lower Royal Castle Courtyard gifts
  { pos: [-8.5, 0, -30.5], scale: 1.15, boxColor: "#ff85c0", ribbonColor: "#fde047" },
  { pos: [8.5, 0, -30.5], scale: 1.15, boxColor: "#7dd3fc", ribbonColor: "#ff85c0" },
  // Upper Royal Castle Terrace gifts (y = 2.6)
  { pos: [-7.8, UPPER_CASTLE_Y, -51.8], scale: 1.1, boxColor: "#c084fc", ribbonColor: "#fde047" },
  { pos: [7.8, UPPER_CASTLE_Y, -51.8], scale: 1.1, boxColor: "#fde047", ribbonColor: "#ff6eb4" },
  { pos: [-9.5, UPPER_CASTLE_Y, -46.2], scale: 1.0, boxColor: "#ff85c0", ribbonColor: "#ffffff" },
  { pos: [9.5, UPPER_CASTLE_Y, -46.2], scale: 1.0, boxColor: "#7dd3fc", ribbonColor: "#fde047" },
];

export const STAR_SPOTS: Vec3[] = [
  [0, 3.7, -49.2],      // 1. Upper Royal Castle Terrace Throne Star (y = 2.6 + 1.1)
  [-12.8, 1.1, 1.5],    // 2. Melody's Enchanted Flower Garden
  [9.5, 1.1, 0.5],      // 3. Kuromi's Magic Crystal & Gift Plaza (west edge, open ground; 12.8,1.5 was boxed in)
  [-11.5, 1.1, 11.8],   // 4. Giant Lollipop & Candy Forest
  [11.8, 1.1, 11.5],    // 5. Shimmering Fairy Pond
  [-8.5, 1.1, -7.8],    // 6. Northwest Castle Lookout
  [8.5, 1.1, -7.8],     // 7. Northeast Castle Lookout
  [-45.8, 1.1, 2.0],    // 8. Frozen Land Ice Palace Gazebo Star
  [47.2, 1.1, 2.0],     // 9. Dinosaur Land Tropical Jungle Star
  [0, 1.1, 46.8],       // 10. My Melody & Kuromi Land Friendship Monument Star
];

export const HEART_TRAIL: Vec3[] = [
  // Grand central avenue from south meadow to rainbow bridge
  [0, 0.72, 13.5], [0, 0.72, 11.0], [0, 0.72, 8.5],
  [0, 0.72, -1.0], [0, 0.72, -3.6], [0, 0.72, -6.2],
  [0, 0.72, -11.5], [0, 0.72, -14.2],
  // Royal Bridge sparkling heart trail
  [0, 0.72, -18.5], [0, 0.72, -21.0], [0, 0.72, -23.5],
  // Lower Royal Castle Courtyard heart trail
  [0, 0.72, -28.0], [0, 0.72, -31.5],
  [-5.5, 0.72, -33.0], [5.5, 0.72, -33.0],
  // Sloped Royal Ramp ascending heart trail
  [0, 1.37, -38.0], [0, 2.02, -39.5], [0, 2.67, -41.0],
  // Upper Royal Castle Terrace & Balcony heart trail (y = 2.6 + 0.72 = 3.32)
  [0, 3.32, -45.5],
  [-6.5, 3.32, -45.5], [6.5, 3.32, -45.5],
  [-8.5, 3.32, -50.0], [8.5, 3.32, -50.0],
  // West branch to Melody's Flower Garden
  [-3.2, 0.72, 4.0], [-6.2, 0.72, 3.4], [-9.2, 0.72, 2.5],
  // East branch to Kuromi's Crystal Plaza
  [3.2, 0.72, 4.0], [6.2, 0.72, 3.4], [9.2, 0.72, 2.5],
  // Southwest branch to Candy Forest
  [-4.5, 0.72, 9.2], [-7.5, 0.72, 10.5], [-10.2, 0.72, 9.2],
  // Southeast branch to Fairy Pond
  [4.5, 0.72, 9.2], [7.5, 0.72, 10.5], [10.2, 0.72, 8.5],
  // North grass wings
  [-4.5, 0.72, -8.2], [-6.5, 0.72, -6.2],
  [4.5, 0.72, -8.2], [6.5, 0.72, -6.2],
  // Outer scenic loops
  [-13.5, 0.72, 6.2], [13.5, 0.72, 6.2],
  [-3.2, 0.72, 14.5], [3.2, 0.72, 14.5],
  // Crystal Ice Bridge sparkling heart trail
  [-21.2, 0.72, 2.0], [-23.75, 0.72, 2.0], [-26.3, 0.72, 2.0],
  // Frozen Land avenue toward Ice Palace Gazebo
  [-31.5, 0.72, 2.0], [-36.5, 0.72, 2.0], [-41.5, 0.72, 2.0],
  // Frozen Skating Pond ring
  [-39.5, 0.72, 4.8], [-42.2, 0.72, 7.5], [-39.5, 0.72, 10.2], [-36.8, 0.72, 7.5],
  // Frozen Land northern snowy glade
  [-37.0, 0.72, -5.2], [-44.0, 0.72, -6.0],
  // Dino Log Bridge sparkling heart trail
  [21.2, 0.72, 2.0], [23.75, 0.72, 2.0], [26.3, 0.72, 2.0],
  // Dinosaur Land jungle avenue toward the 9th Star
  [31.5, 0.72, 2.0], [36.5, 0.72, 2.0], [41.5, 0.72, 2.0],
  // Jungle Oasis Lagoon ring
  [39.5, 0.72, 4.6], [36.0, 0.72, 8.2], [39.5, 0.72, 11.8], [43.0, 0.72, 8.2],
  // Near Dino Nest & northern jungle glade
  [46.5, 0.72, 5.5], [39.0, 0.72, -5.5], [44.5, 0.72, -6.2],
  // Pastel Ribbon Bridge sparkling heart trail
  [0, 0.72, 22.2], [0, 0.72, 24.75], [0, 0.72, 27.3],
  // My Melody & Kuromi Land central friendship promenade
  [0, 0.72, 31.5], [0, 0.72, 35.5], [0, 0.72, 39.5], [0, 0.72, 43.2],
  // My Melody's Strawberry-Pink Wing (West)
  [-4.2, 0.72, 32.5], [-8.8, 0.72, 35.5], [-4.0, 0.72, 42.5], [-4.5, 0.72, 47.5],
  // Kuromi's Lavender Starlight Wing (East)
  [4.2, 0.72, 32.5], [8.8, 0.72, 35.5], [4.0, 0.72, 42.5], [4.5, 0.72, 47.5],
];

export const BOUNCE_MUSHROOMS: Vec3[] = [
  [-5.2, 0, 7.2],
  [5.2, 0, 7.2],
  [-6.8, 0, -2.5],
  [6.8, 0, -2.5],
  [-13.2, 0, 7.8],
  [13.2, 0, 7.5],
];

export const TREE_SPOTS: TreeSpot[] = [
  { pos: [-16.5, 0, -10.5], color: "#ff85c0", scale: 1.35 },
  { pos: [16.5, 0, -10.5], color: "#c084fc", scale: 1.35 },
  { pos: [-16.8, 0, -2.5], color: "#fbcfe8", scale: 1.2 },
  { pos: [16.8, 0, -2.5], color: "#7dd3fc", scale: 1.2 },
  { pos: [-16.2, 0, 6.2], color: "#a7f3d0", scale: 1.25 },
  { pos: [16.2, 0, 6.2], color: "#ff85c0", scale: 1.25 },
  { pos: [-15.5, 0, 14.8], color: "#fde047", scale: 1.2 },
  { pos: [15.5, 0, 14.8], color: "#c084fc", scale: 1.2 },
  { pos: [-9.2, 0, -12.0], color: "#fde047", scale: 1.15 },
  { pos: [9.2, 0, -12.0], color: "#fbcfe8", scale: 1.15 },
  { pos: [-6.0, 0, 15.8], color: "#ff85c0", scale: 1.1 },
  { pos: [6.0, 0, 15.8], color: "#7dd3fc", scale: 1.1 },
];

export const FLOWER_SPOTS: FlowerSpot[] = [
  // Main grass island flowers
  { pos: [-10.5, 0, 0.5], color: "#ff6eb4" },
  { pos: [-11.8, 0, 3.6], color: "#fde047" },
  { pos: [-14.2, 0, 2.4], color: "#c084fc" },
  { pos: [-13.6, 0, -0.8], color: "#ff85c0" },
  { pos: [-9.5, 0, 4.2], color: "#7dd3fc" },
  { pos: [-4.2, 0, 12.2], color: "#ff6eb4" },
  { pos: [4.2, 0, 12.2], color: "#fde047" },
  { pos: [-5.5, 0, -9.8], color: "#ff85c0" },
  { pos: [5.5, 0, -9.8], color: "#c084fc" },
  { pos: [-14.8, 0, 10.5], color: "#fde047" },
  // Lower Royal Castle Courtyard flower planters
  { pos: [-10.2, 0, -28.0], color: "#ff6eb4" },
  { pos: [10.2, 0, -28.0], color: "#c084fc" },
  { pos: [-10.2, 0, -39.0], color: "#fde047" },
  { pos: [10.2, 0, -39.0], color: "#7dd3fc" },
  // Upper Royal Castle Terrace flower planters (y = 2.6)
  { pos: [-10.5, UPPER_CASTLE_Y, -45.2], color: "#ff6eb4" },
  { pos: [10.5, UPPER_CASTLE_Y, -45.2], color: "#c084fc" },
  { pos: [-10.5, UPPER_CASTLE_Y, -54.0], color: "#fde047" },
  { pos: [10.5, UPPER_CASTLE_Y, -54.0], color: "#7dd3fc" },
];

export const BUTTERFLY_SPOTS: ButterflySpot[] = [
  { center: [-11.5, 2.0, 2.2], color: "#ff85c0", speed: 1.1 },
  { center: [11.5, 2.2, 11.4], color: "#7dd3fc", speed: 0.95 },
  { center: [0, 2.8, 3.6], color: "#fde047", speed: 1.25 },
  { center: [0, 2.5, -33.0], color: "#f472b6", speed: 1.05 },
  { center: [0, 5.2, -48.5], color: "#fde047", speed: 1.15 },
];

export const BUNNY_FRIENDS: BunnyFriendSpot[] = [
  { variant: "pink", pos: [-11.5, 0.05, 2.2], rotation: [0, 0.75, 0], scale: 1.45 },
  { variant: "purple", pos: [11.5, 0.05, 2.2], rotation: [0, -0.75, 0], scale: 1.45 },
];

export const CLOUD_SPOTS: CloudSpot[] = [
  { pos: [-14, 7.5, -16], scale: 2.3, tint: "#ffffff" },
  { pos: [14, 7.2, -16], scale: 2.4, tint: "#fff0f7" },
  { pos: [-16, 8.8, -36], scale: 2.5, tint: "#fff0f7" },
  { pos: [16, 8.5, -36], scale: 2.5, tint: "#f3e8ff" },
  { pos: [-15, 11.2, -55], scale: 2.6, tint: "#ffffff" },
  { pos: [15, 11.0, -55], scale: 2.6, tint: "#fff0f7" },
  { pos: [0, 12.6, -63], scale: 3.0, tint: "#ffffff" },
];

// Castle Platform structural obstacles (gatehouse towers, corner towers, upper throne gazebo)
export const CASTLE_STRUCTURAL_OBSTACLES: CircleObstacle[] = [
  // Grand Gatehouse flanking towers (wide open archway in between x ∈ [-2.8, 2.8])
  { x: -4.2, z: -25.0, r: 1.42 },
  { x: 4.2, z: -25.0, r: 1.42 },
  // Lower South Corner Towers
  { x: -13.8, z: -25.0, r: 1.55 },
  { x: 13.8, z: -25.0, r: 1.55 },
  // Mid-Terrace Step-Up Corner Towers
  { x: -13.8, z: -42.5, r: 1.45 },
  { x: 13.8, z: -42.5, r: 1.45 },
  // Upper North Corner Towers
  { x: -13.8, z: -57.5, r: 1.65 },
  { x: 13.8, z: -57.5, r: 1.65 },
  // Royal Princess Throne & Birthday Star Gazebo on the Upper Terrace
  { x: 0, z: -53.2, r: 2.15 },
];

// Frozen Land (West Island: x ∈ [-55.5, -27.5], z ∈ [-13.0, 17.0])
export const FROZEN_GAZEBO_POS: Vec3 = [-49.5, 0, 2.0];
export const FROZEN_SNOWMAN_POS: Vec3 = [-34.2, 0, 7.2];
export const FROZEN_OLAF_POS: Vec3 = [-39.2, 0, -3.2];
export const FROZEN_SKATING_POND_POS: Vec3 = [-39.5, 0.015, 7.5];

export const FROZEN_PINE_SPOTS: TreeSpot[] = [
  { pos: [-31.5, 0, -8.8], color: "#7dd3fc", scale: 1.25 },
  { pos: [-38.5, 0, -9.8], color: "#c4b5fd", scale: 1.35 },
  { pos: [-46.5, 0, -9.2], color: "#a5f3fc", scale: 1.3 },
  { pos: [-52.2, 0, -6.5], color: "#bae6fd", scale: 1.2 },
  { pos: [-52.2, 0, 10.5], color: "#ddd6fe", scale: 1.3 },
  { pos: [-46.8, 0, 13.6], color: "#99f6e4", scale: 1.2 },
  { pos: [-32.0, 0, 13.5], color: "#7dd3fc", scale: 1.25 },
  { pos: [-43.0, 0, -4.5], color: "#bae6fd", scale: 1.05 },
];

export const FROZEN_LANTERN_SPOTS: Vec3[] = [
  [-29.5, 0, -0.6],
  [-29.5, 0, 4.6],
  [-36.5, 0, -0.8],
  [-36.5, 0, 4.8],
  [-44.2, 0, -1.2],
  [-44.2, 0, 5.2],
];

export const FROZEN_CRYSTAL_SPOTS: Vec3[] = [
  [-33.5, 0, -4.5],
  [-48.5, 0, -4.2],
  [-49.0, 0, 7.5],
  [-35.0, 0, 12.2],
];

// Dinosaur Land (East Island: x ∈ [27.5, 55.5], z ∈ [-13.0, 17.0])
export const DINO_BRONTO_POS: Vec3 = [43.2, 0, -2.8];
export const DINO_TRIKE_POS: Vec3 = [34.5, 0, 7.6];
export const DINO_STEGO_POS: Vec3 = [36.2, 0, -5.2];
export const DINO_VOLCANO_POS: Vec3 = [50.0, 0, -6.5];
export const DINO_NEST_POS: Vec3 = [46.5, 0, 8.5];
export const DINO_LAGOON_POS: Vec3 = [39.5, 0.015, 8.2];

export const DINO_PALM_SPOTS: TreeSpot[] = [
  { pos: [31.5, 0, -9.2], color: "#22c55e", scale: 1.25 },
  { pos: [39.0, 0, -10.2], color: "#16a34a", scale: 1.32 },
  { pos: [43.2, 0, -9.6], color: "#22c55e", scale: 1.12 },
  { pos: [52.6, 0, 1.8], color: "#22c55e", scale: 1.25 },
  { pos: [52.2, 0, 11.4], color: "#16a34a", scale: 1.3 },
  { pos: [45.5, 0, 13.8], color: "#22c55e", scale: 1.18 },
  { pos: [31.6, 0, 13.4], color: "#16a34a", scale: 1.22 },
];

export const DINO_LANTERN_SPOTS: Vec3[] = [
  [29.5, 0, -0.6],
  [29.5, 0, 4.6],
  [36.5, 0, -0.8],
  [36.5, 0, 4.8],
  [44.0, 0, -0.8],
  [44.0, 0, 4.8],
];

export const DINO_FLOWER_SPOTS: FlowerSpot[] = [
  { pos: [32.8, 0, -3.5], color: "#ff6eb4" },
  { pos: [34.2, 0, 11.2], color: "#fde047" },
  { pos: [43.8, 0, 11.8], color: "#fb7185" },
  { pos: [49.2, 0, 5.2], color: "#fde047" },
  { pos: [47.8, 0, -1.8], color: "#ff6eb4" },
  { pos: [41.0, 0, -6.8], color: "#f97316" },
];

// My Melody & Kuromi Land (South Island: x ∈ [-15.0, 15.0], z ∈ [28.5, 56.5])
export const MELODY_COTTAGE_POS: Vec3 = [-8.8, 0, 42.5];
export const MELODY_TEA_TABLE_POS: Vec3 = [-5.6, 0, 36.2];
export const KUROMI_STAGE_POS: Vec3 = [8.8, 0, 42.5];
export const KUROMI_CANDY_CART_POS: Vec3 = [5.6, 0, 36.2];
export const FRIENDSHIP_MONUMENT_POS: Vec3 = [0, 0, 51.2];
export const MELODY_HOST_POS: Vec3 = [-7.0, 0.05, 47.5];
export const KUROMI_HOST_POS: Vec3 = [7.0, 0.05, 47.5];

export const MELODY_TREE_SPOTS: TreeSpot[] = [
  { pos: [-12.2, 0, 32.0], color: "#ff85c0", scale: 1.22 },
  { pos: [12.2, 0, 32.0], color: "#c084fc", scale: 1.22 },
  { pos: [-12.4, 0, 52.8], color: "#fbcfe8", scale: 1.28 },
  { pos: [12.4, 0, 52.8], color: "#a855f7", scale: 1.28 },
  { pos: [-5.6, 0, 53.4], color: "#ff6eb4", scale: 1.12 },
  { pos: [5.6, 0, 53.4], color: "#d8b4fe", scale: 1.12 },
];

export const MELODY_LOLLIPOP_SPOTS: LollipopSpot[] = [
  { pos: [-11.8, 0, 37.2], color: "#ff6eb4", scale: 1.18 },
  { pos: [11.8, 0, 37.2], color: "#c084fc", scale: 1.18 },
  { pos: [-11.8, 0, 48.2], color: "#fde047", scale: 1.12 },
  { pos: [11.8, 0, 48.2], color: "#f472b6", scale: 1.12 },
];

export const MELODY_LAMP_SPOTS: Vec3[] = [
  [-3.0, 0, 30.8],
  [3.0, 0, 30.8],
  [-3.0, 0, 39.2],
  [3.0, 0, 39.2],
  [-3.6, 0, 48.2],
  [3.6, 0, 48.2],
];

export const MELODY_GIFT_SPOTS: GiftSpot[] = [
  { pos: [-3.2, 0, 52.2], scale: 1.15, boxColor: "#ff85c0", ribbonColor: "#fde047" },
  { pos: [3.2, 0, 52.2], scale: 1.15, boxColor: "#c084fc", ribbonColor: "#ff6eb4" },
  { pos: [-9.2, 0, 48.6], scale: 1.05, boxColor: "#fbcfe8", ribbonColor: "#ff6eb4" },
  { pos: [9.2, 0, 48.6], scale: 1.05, boxColor: "#d8b4fe", ribbonColor: "#fde047" },
];

export const CIRCLE_OBSTACLES: CircleObstacle[] = [
  // Central Wishing Fountain
  { x: 0, z: 3.6, r: 1.72 },
  // Castle Platform towers & Royal Throne Gazebo
  ...CASTLE_STRUCTURAL_OBSTACLES,
  // All Pastel Trees (trunk + low canopy clearance)
  ...TREE_SPOTS.map((tr) => ({ x: tr.pos[0], z: tr.pos[2], r: 0.36 * tr.scale })),
  // Royal Lamp Posts (main avenue + lower courtyard + upper terrace)
  ...LAMP_SPOTS.map(([x, , z]) => ({ x, z, r: 0.32 })),
  // Giant Lollipops
  ...LOLLIPOP_SPOTS.map((l) => ({ x: l.pos[0], z: l.pos[2], r: 0.28 * l.scale })),
  // Glowing Crystal Clusters
  ...CRYSTAL_SPOTS.map(([x, , z]) => ({ x, z, r: 0.72 })),
  // Kawaii Bunny Friends (stop politely right in front of them)
  ...BUNNY_FRIENDS.map((b) => ({ x: b.pos[0], z: b.pos[2], r: 0.82 })),
  // Gift Boxes (main island + lower courtyard + upper terrace)
  ...GIFT_SPOTS.map((g) => ({ x: g.pos[0], z: g.pos[2], r: 0.48 * g.scale })),
  // Frozen Land: Ice Palace Gazebo
  { x: FROZEN_GAZEBO_POS[0], z: FROZEN_GAZEBO_POS[2], r: 2.45 },
  // Frozen Land: Kawaii Snowman
  { x: FROZEN_SNOWMAN_POS[0], z: FROZEN_SNOWMAN_POS[2], r: 0.85 },
  // Frozen Land: Olaf
  { x: FROZEN_OLAF_POS[0], z: FROZEN_OLAF_POS[2], r: 0.8 },
  // Frozen Land: Snow-Dusted Pine Trees
  ...FROZEN_PINE_SPOTS.map((tr) => ({ x: tr.pos[0], z: tr.pos[2], r: 0.46 * tr.scale })),
  // Frozen Land: Ice Lanterns
  ...FROZEN_LANTERN_SPOTS.map(([x, , z]) => ({ x, z, r: 0.32 })),
  // Frozen Land: Icy Crystal Clusters
  ...FROZEN_CRYSTAL_SPOTS.map(([x, , z]) => ({ x, z, r: 0.72 })),
  // Dinosaur Land: Friendly Dinosaurs
  { x: DINO_BRONTO_POS[0], z: DINO_BRONTO_POS[2], r: 1.35 },
  { x: DINO_TRIKE_POS[0], z: DINO_TRIKE_POS[2], r: 1.05 },
  { x: DINO_STEGO_POS[0], z: DINO_STEGO_POS[2], r: 1.05 },
  // Dinosaur Land: Friendly Bubble Volcano & Dino Egg Nest
  { x: DINO_VOLCANO_POS[0], z: DINO_VOLCANO_POS[2], r: 2.65 },
  { x: DINO_NEST_POS[0], z: DINO_NEST_POS[2], r: 1.35 },
  // Dinosaur Land: Tropical Palm Trees
  ...DINO_PALM_SPOTS.map((tr) => ({ x: tr.pos[0], z: tr.pos[2], r: 0.42 * tr.scale })),
  // Dinosaur Land: Jungle Lanterns
  ...DINO_LANTERN_SPOTS.map(([x, , z]) => ({ x, z, r: 0.32 })),
  // My Melody & Kuromi Land: Cottage, Stage, Tea Table, Candy Cart & Friendship Monument
  { x: MELODY_COTTAGE_POS[0], z: MELODY_COTTAGE_POS[2], r: 2.55 },
  { x: MELODY_TEA_TABLE_POS[0], z: MELODY_TEA_TABLE_POS[2], r: 1.42 },
  { x: KUROMI_STAGE_POS[0], z: KUROMI_STAGE_POS[2], r: 2.55 },
  { x: KUROMI_CANDY_CART_POS[0], z: KUROMI_CANDY_CART_POS[2], r: 1.42 },
  { x: FRIENDSHIP_MONUMENT_POS[0], z: FRIENDSHIP_MONUMENT_POS[2], r: 2.45 },
  // My Melody & Kuromi Land: Bunny Hosts
  { x: MELODY_HOST_POS[0], z: MELODY_HOST_POS[2], r: 0.82 },
  { x: KUROMI_HOST_POS[0], z: KUROMI_HOST_POS[2], r: 0.82 },
  // My Melody & Kuromi Land: Pastel Trees, Giant Lollipops, Lamps & Gifts
  ...MELODY_TREE_SPOTS.map((tr) => ({ x: tr.pos[0], z: tr.pos[2], r: 0.36 * tr.scale })),
  ...MELODY_LOLLIPOP_SPOTS.map((l) => ({ x: l.pos[0], z: l.pos[2], r: 0.28 * l.scale })),
  ...MELODY_LAMP_SPOTS.map(([x, , z]) => ({ x, z, r: 0.32 })),
  ...MELODY_GIFT_SPOTS.map((g) => ({ x: g.pos[0], z: g.pos[2], r: 0.48 * g.scale })),
];
