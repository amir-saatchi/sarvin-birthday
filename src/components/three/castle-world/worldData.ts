import type {
  BoxObstacle,
  ButterflySpot,
  CapsuleObstacle,
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
  { id: "castle", minX: -22.0, maxX: 22.0, minZ: -69.6, maxZ: -25.2 },
  // Mirror of the dino side: the bridge zone runs a little onto Frozen Land so its west end meets the frozen zone,
  // which stops a unicorn-radius inside the ice fences (east fence x = -28.1, west x = -66.9, north z = -20.4, south z = 24.4)
  { id: "frozenBridge", minX: -28.8, maxX: -18.4, minZ: 0.0, maxZ: 4.0 },
  { id: "frozen", minX: -66.2, maxX: -28.75, minZ: -19.7, maxZ: 23.7 },
  // The bridge zone runs a little onto the island so its east end meets the dino zone, which stops a
  // unicorn-radius inside the bamboo fences (west fence x = 28.1, east x = 66.9, north z = -20.4, south z = 24.4)
  { id: "dinoBridge", minX: 18.4, maxX: 28.8, minZ: 0.0, maxZ: 4.0 },
  { id: "dino", minX: 28.75, maxX: 66.2, minZ: -19.7, maxZ: 23.7 },
  { id: "melodyBridge", minX: -2.0, maxX: 2.0, minZ: 18.4, maxZ: 29.2 },
  // My Melody & Kuromi Land: stops a unicorn-radius inside the ribbon fences (x = ±21.4, south z = 71.9)
  { id: "melody", minX: -20.4, maxX: 20.4, minZ: 29.0, maxZ: 70.9 },
];

export const BRIDGE_SOUTH_Z = -16.2;
export const BRIDGE_NORTH_Z = -25.2;

export const FROZEN_BRIDGE_EAST_X = -19.2;
// Where tap-to-move steering stops treating the player as "on the bridge" (just east of the frozen zone, x -28.75)
export const FROZEN_BRIDGE_WEST_X = -28.7;
export const FROZEN_BRIDGE_CENTER_Z = 2.0;

export const DINO_BRIDGE_WEST_X = 19.2;
// Where tap-to-move steering stops treating the player as "on the bridge" (just west of the dino zone, x 28.75)
export const DINO_BRIDGE_EAST_X = 28.7;
export const DINO_BRIDGE_CENTER_Z = 2.0;

export const MELODY_BRIDGE_NORTH_Z = 19.2;
export const MELODY_BRIDGE_SOUTH_Z = 28.8;

// Two-level Royal Castle Platform elevation & sloped ramp geometry
export const UPPER_CASTLE_Z = -42.5;
export const UPPER_CASTLE_Y = 2.6;

// Grand Royal Castle footprint: perimeter walls sit on x = ±CASTLE_WALL_X and z = CASTLE_NORTH_WALL_Z,
// the deck reaches out to ±CASTLE_DECK_HALF_W (walkable zone stops a unicorn-radius inside the walls)
export const CASTLE_WALL_X = 23.2;
export const CASTLE_NORTH_WALL_Z = -70.8;
export const CASTLE_DECK_HALF_W = 24.5;
export const CASTLE_DECK_NORTH_Z = -72.0;

// Castle attractions: lower courtyard (y = 0) and upper terrace (y = 2.6)
export const CASTLE_ROSE_GARDEN_POS: Vec3 = [-15.5, 0, -33.5];
export const CASTLE_CAROUSEL_POS: Vec3 = [15.5, 0, -33.5];
export const CASTLE_CAKE_POS: Vec3 = [0, UPPER_CASTLE_Y, -51.0];
export const CASTLE_CROWN_POS: Vec3 = [-14.5, UPPER_CASTLE_Y, -56.5];
export const CASTLE_SWAN_POND_POS: Vec3 = [14.5, UPPER_CASTLE_Y, -56.5];
export const CASTLE_THRONE_POS: Vec3 = [0, UPPER_CASTLE_Y, -63.8];

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
  { minX: -CASTLE_DECK_HALF_W, maxX: -2.65, minZ: CASTLE_DECK_NORTH_Z, maxZ: UPPER_CASTLE_Z },
  { minX: 2.65, maxX: CASTLE_DECK_HALF_W, minZ: CASTLE_DECK_NORTH_Z, maxZ: UPPER_CASTLE_Z },
];

// Upper balcony front railings (keep unicorn from clipping through the overlook railings)
export const UPPER_CASTLE_BALCONY_RAILS: BoxObstacle[] = [
  { minX: -CASTLE_DECK_HALF_W, maxX: -2.75, minZ: -42.95, maxZ: -42.45 },
  { minX: 2.75, maxX: CASTLE_DECK_HALF_W, minZ: -42.95, maxZ: -42.45 },
];

// South castle walls between the gatehouse towers and the corner towers (keep the unicorn out of the stone)
export const CASTLE_WALL_BOXES: BoxObstacle[] = [
  { minX: -21.8, maxX: -5.45, minZ: -25.45, maxZ: -24.55 },
  { minX: 5.45, maxX: 21.8, minZ: -25.45, maxZ: -24.55 },
];

// Ramp side railings (act as solid side walls from lower courtyard & handrails on the ramp)
export const CASTLE_RAMP_SIDE_RAILS: BoxObstacle[] = [
  { minX: -2.85, maxX: -2.55, minZ: CASTLE_RAMP.endZ, maxZ: CASTLE_RAMP.startZ },
  { minX: 2.55, maxX: 2.85, minZ: CASTLE_RAMP.endZ, maxZ: CASTLE_RAMP.startZ },
];

export const UNICORN_RADIUS = 0.62;
export const PLAYER_START_POS: Vec3 = [0, 0, 12.2];

// Frozen Land spiral Ice Slide: a helter-skelter chute winding round an ice tower in the north-west corner.
// It sits up here because the heart trail places hearts along the chute. Angles follow x = cx + r·cos a,
// z = cz + r·sin a, and the chute winds down with increasing a.
export const FROZEN_SLIDE_POS: Vec3 = [-60.0, 0, -13.2];
export const FROZEN_SLIDE_TOWER_R = 1.3;
export const FROZEN_SLIDE_TOP_Y = 4.6;
// Radius of the chute's centre line, and of the half-pipe itself (so the outer lip reaches 2.6)
export const FROZEN_SLIDE_SPIRAL_R = 2.0;
export const FROZEN_SLIDE_PIPE_R = 0.6;
// Collision footprint of tower + spiral
export const FROZEN_SLIDE_COLLIDE_R = 2.65;
const FROZEN_SLIDE_START_A = (46 * Math.PI) / 180;
// 1⅔ turns: each pass is ~2.7 above the one below, so the unicorn fits under the chute as she rides
const FROZEN_SLIDE_TURN = (600 * Math.PI) / 180;
const FROZEN_SLIDE_START_Y = FROZEN_SLIDE_TOP_Y - 0.05;
const FROZEN_SLIDE_END_Y = 0.06;
export const FROZEN_SLIDE_RUNOUT = 1.4;

/** Point on the chute's centre line (the bottom of the half-pipe) at fraction f: 0 = top, 1 = foot of the spiral. */
export function frozenSlideChutePoint(f: number): Vec3 {
  const a = FROZEN_SLIDE_START_A + FROZEN_SLIDE_TURN * f;
  return [
    FROZEN_SLIDE_POS[0] + Math.cos(a) * FROZEN_SLIDE_SPIRAL_R,
    FROZEN_SLIDE_START_Y + (FROZEN_SLIDE_END_Y - FROZEN_SLIDE_START_Y) * f,
    FROZEN_SLIDE_POS[2] + Math.sin(a) * FROZEN_SLIDE_SPIRAL_R,
  ];
}
// The chute leaves the spiral along its tangent (east-south-east, back toward the middle of Frozen Land)
const FROZEN_SLIDE_END_A = FROZEN_SLIDE_START_A + FROZEN_SLIDE_TURN;
export const FROZEN_SLIDE_EXIT_DIR: Vec2 = [-Math.sin(FROZEN_SLIDE_END_A), Math.cos(FROZEN_SLIDE_END_A)];
const FROZEN_SLIDE_FOOT = frozenSlideChutePoint(1);
/** Chute centre line: the spiral sampled finely, then the straight run-out. */
export const FROZEN_SLIDE_CHUTE: Vec3[] = [
  ...Array.from({ length: 97 }, (_, i) => frozenSlideChutePoint(i / 96)),
  ...[0.7, FROZEN_SLIDE_RUNOUT].map(
    (d): Vec3 => [
      FROZEN_SLIDE_FOOT[0] + FROZEN_SLIDE_EXIT_DIR[0] * d,
      FROZEN_SLIDE_END_Y,
      FROZEN_SLIDE_FOOT[2] + FROZEN_SLIDE_EXIT_DIR[1] * d,
    ]
  ),
];
// Where a ride sets the unicorn down: on along the run-out, just outside the slide's collision circle
export const FROZEN_SLIDE_EXIT: Vec3 = [
  FROZEN_SLIDE_FOOT[0] + FROZEN_SLIDE_EXIT_DIR[0] * 2.75,
  0,
  FROZEN_SLIDE_FOOT[2] + FROZEN_SLIDE_EXIT_DIR[1] * 2.75,
];
// Glowing snowflake lift pad beside the tower (where the chute is at its highest): step on it to float up & ride
export const FROZEN_SLIDE_PAD: Vec3 = [
  FROZEN_SLIDE_POS[0] + Math.cos(Math.PI / 3) * 3.4,
  0,
  FROZEN_SLIDE_POS[2] + Math.sin(Math.PI / 3) * 3.4,
];
export const FROZEN_SLIDE_PAD_TRIGGER_R = 0.8;

// My Melody's Ferris Wheel (south-west of Melody & Kuromi Land). It stands in the x-y plane facing north, toward the
// bridge, and turns all the time. Gondola k sits at angle k·2π/N + SPIN·t (t = the R3F clock), at
// x = cx + R·cos a, y = HUB_Y + R·sin a; the bottom is a = -π/2. It sits up here because the heart trail
// places hearts along the ride.
export const MELODY_WHEEL_POS: Vec3 = [-12.6, 0, 63.6];
export const MELODY_WHEEL_HUB_Y = 6.6;
export const MELODY_WHEEL_R = 5.0;
export const MELODY_WHEEL_GONDOLAS = 8;
export const MELODY_WHEEL_SPIN = 0.72;
// Gondola floor below its hanging point (the unicorn stands on it)
export const MELODY_WHEEL_SEAT_DROP = 1.45;
// Base, A-frame legs & the low gondolas: a capsule along x
export const MELODY_WHEEL_CAPSULE: CapsuleObstacle = {
  ax: MELODY_WHEEL_POS[0] - 2.6,
  az: MELODY_WHEEL_POS[2],
  bx: MELODY_WHEEL_POS[0] + 2.6,
  bz: MELODY_WHEEL_POS[2],
  r: 1.75,
};
// Glowing heart boarding pad in front of the bottom gondola, and where the ride sets her down again
export const MELODY_WHEEL_PAD: Vec3 = [MELODY_WHEEL_POS[0], 0, MELODY_WHEEL_POS[2] - 2.75];
export const MELODY_WHEEL_PAD_TRIGGER_R = 0.8;
export const MELODY_WHEEL_EXIT: Vec3 = [MELODY_WHEEL_POS[0], 0, MELODY_WHEEL_POS[2] - 4.65];
export function melodyWheelAngle(k: number, t: number): number {
  return (k / MELODY_WHEEL_GONDOLAS) * Math.PI * 2 + MELODY_WHEEL_SPIN * t;
}
/** Where the unicorn stands in a gondola hanging at wheel angle a. */
export function melodyWheelSeat(a: number): Vec3 {
  return [
    MELODY_WHEEL_POS[0] + Math.cos(a) * MELODY_WHEEL_R,
    MELODY_WHEEL_HUB_Y + Math.sin(a) * MELODY_WHEEL_R - MELODY_WHEEL_SEAT_DROP,
    MELODY_WHEEL_POS[2],
  ];
}

// Kept empty (no corner terraces on the main grass island) while preserving extensibility in physics/terrain
export const RAISED_TERRACES: RaisedTerrace[] = [];

export const SKY_MINI_ISLANDS: SkyMiniIslandSpot[] = [
  // Frozen Land glacier mini-islands (West, past the island's west edge at x = -67.5)
  { pos: [-75, -1.5, -12], size: 5.5, treeColor: "#7dd3fc", theme: "frozen" },
  { pos: [-74, -2.0, 18], size: 4.5, treeColor: "#c4b5fd", theme: "frozen" },
  // Dinosaur Land tropical jungle mini-islands (East, past the island's east edge at x = 67.5)
  { pos: [75, -1.2, -12], size: 5.5, treeColor: "#22c55e", theme: "dino" },
  { pos: [74, -1.8, 18], size: 4.5, treeColor: "#16a34a", theme: "dino" },
  // Royal Castle marble & lavender mini-islands (North, just outside the grand castle walls)
  { pos: [-33, -1.2, -32], size: 5.0, treeColor: "#7dd3fc", theme: "castle" },
  { pos: [33, -1.4, -32], size: 5.0, treeColor: "#fde047", theme: "castle" },
  { pos: [-33, 1.2, -60], size: 5.0, treeColor: "#ff85c0", theme: "castle" },
  { pos: [33, 1.0, -60], size: 5.0, treeColor: "#c084fc", theme: "castle" },
  // My Melody & Kuromi Land pastel candy mini-islands (South, past the island's x = ±22 edges and z = 72.5)
  { pos: [-31, -1.4, 42], size: 5.0, treeColor: "#ff85c0", theme: "melody" },
  { pos: [31, -1.4, 42], size: 5.0, treeColor: "#c084fc", theme: "melody" },
  { pos: [-30, -0.6, 64], size: 4.5, treeColor: "#fbcfe8", theme: "melody" },
  { pos: [30, -0.6, 64], size: 4.5, treeColor: "#d8b4fe", theme: "melody" },
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
  // Upper Royal Castle Terrace lamps (y = 2.6): top of the ramp, the throne walk & the back gardens
  [-3.0, UPPER_CASTLE_Y, -45.2],
  [3.0, UPPER_CASTLE_Y, -45.2],
  [-3.0, UPPER_CASTLE_Y, -57.2],
  [3.0, UPPER_CASTLE_Y, -57.2],
  [-9.0, UPPER_CASTLE_Y, -64.5],
  [9.0, UPPER_CASTLE_Y, -64.5],
];

export const LOLLIPOP_SPOTS: LollipopSpot[] = [
  { pos: [-13.5, 0, 11.2], color: "#ff6eb4", scale: 1.25 },
  { pos: [-10.2, 0, 13.8], color: "#7dd3fc", scale: 1.1 },
  { pos: [-9.2, 0, 10.2], color: "#c084fc", scale: 1.15 },
  { pos: [-13.0, 0, 13.8], color: "#fde047", scale: 1.0 },
];

export const CRYSTAL_SPOTS: Vec3[] = [
  [14.0, 0, -2.2],
  [13.2, 0, 4.2],
  [10.5, 0, -2.0],
];

export const GIFT_SPOTS: GiftSpot[] = [
  // Main island avenue & the east garden (kept clear of the stepping stones to Dino Land)
  { pos: [-3.6, 0, -10.8], scale: 1.2, boxColor: "#ff85c0", ribbonColor: "#fde047" },
  { pos: [3.6, 0, -10.8], scale: 1.2, boxColor: "#c084fc", ribbonColor: "#ff85c0" },
  { pos: [12.8, 0, 0.2], scale: 1.05, boxColor: "#7dd3fc", ribbonColor: "#fde047" },
  { pos: [12.4, 0, -2.0], scale: 0.95, boxColor: "#ff85c0", ribbonColor: "#ffffff" },
  // Lower Royal Castle Courtyard gifts
  { pos: [-8.5, 0, -30.5], scale: 1.15, boxColor: "#ff85c0", ribbonColor: "#fde047" },
  { pos: [8.5, 0, -30.5], scale: 1.15, boxColor: "#7dd3fc", ribbonColor: "#ff85c0" },
  // Upper Royal Castle Terrace gifts (y = 2.6)
  { pos: [-8.0, UPPER_CASTLE_Y, -46.0], scale: 1.0, boxColor: "#ff85c0", ribbonColor: "#ffffff" },
  { pos: [8.0, UPPER_CASTLE_Y, -46.0], scale: 1.0, boxColor: "#7dd3fc", ribbonColor: "#fde047" },
  { pos: [-19.5, UPPER_CASTLE_Y, -62.0], scale: 1.1, boxColor: "#c084fc", ribbonColor: "#fde047" },
  { pos: [19.5, UPPER_CASTLE_Y, -62.0], scale: 1.1, boxColor: "#fde047", ribbonColor: "#ff6eb4" },
];

export const STAR_SPOTS: Vec3[] = [
  [0, 3.7, -60.0],      // 1. Upper Royal Castle Terrace Throne Star (y = 2.6 + 1.1), in front of the throne
  [-12.8, 1.1, 1.5],    // 2. Melody's Enchanted Flower Garden
  [9.5, 1.1, 0.5],      // 3. Kuromi's Magic Crystal & Gift Plaza (west edge, open ground; 12.8,1.5 was boxed in)
  [-63.8, 1.1, 6.0],    // 4. Frozen Land Ice Cave (deep inside the glittering cave; was the garden's Candy Forest)
  [11.8, 1.1, 11.5],    // 5. Shimmering Fairy Pond
  [-15.5, 1.1, -33.5],  // 6. Castle Heart Rose Garden (lower courtyard, west)
  [14.5, 3.7, -61.2],   // 7. Castle Swan Pond (upper terrace, east, behind the pond)
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
  // West path into the Heart Rose Garden, then around the heart-shaped rose bed
  [-9.5, 0.72, -33.5],
  [-17.6, 0.72, -33.5], [-13.4, 0.72, -33.5], [-15.5, 0.72, -31.3], [-15.5, 0.72, -35.7],
  // East path to the Pony Carousel, then around it
  [9.5, 0.72, -33.5],
  [15.5, 0.72, -29.6], [19.4, 0.72, -33.5], [15.5, 0.72, -37.4], [11.6, 0.72, -33.5],
  // Sloped Royal Ramp ascending heart trail
  [0, 1.37, -38.0], [0, 2.02, -39.5], [0, 2.67, -41.0],
  // Upper Royal Castle Terrace heart trail (y = 2.6 + 0.72 = 3.32)
  [0, 3.32, -45.2],
  // Ring around the giant Birthday Cake
  [3.3, 3.32, -51.0], [1.65, 3.32, -53.86], [-1.65, 3.32, -53.86],
  [-3.3, 3.32, -51.0], [-1.65, 3.32, -48.14], [1.65, 3.32, -48.14],
  // Royal walk from the cake to the throne
  [0, 3.32, -57.0],
  // West wing: path to the Royal Crown, then around it
  [-6.0, 3.32, -46.5], [-9.5, 3.32, -50.0],
  [-14.5, 3.32, -53.9], [-17.1, 3.32, -56.5], [-11.9, 3.32, -56.5],
  // East wing: path to the Swan Pond, then around it
  [6.0, 3.32, -46.5], [9.5, 3.32, -50.0],
  [14.5, 3.32, -52.9], [18.1, 3.32, -56.5], [10.9, 3.32, -56.5],
  // Back gardens behind the throne
  [-13.0, 3.32, -65.5], [13.0, 3.32, -65.5],
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
  // Frozen Land avenue toward Ice Palace Gazebo, then on past it to the frozen waterfall & ice cave
  [-31.5, 0.72, 2.0], [-36.5, 0.72, 2.0], [-41.5, 0.72, 2.0],
  [-53.4, 0.72, 2.0], [-57.2, 0.72, 2.0],
  // Frozen Land northern snowy glade (by Olaf)
  [-37.0, 0.72, -5.2], [-44.0, 0.72, -6.0],
  // Big skating pond: a ring on the ice and one in the middle
  [-37.8, 0.72, 14.0], [-39.4, 0.72, 16.77], [-42.6, 0.72, 16.77],
  [-44.2, 0.72, 14.0], [-42.6, 0.72, 11.23], [-39.4, 0.72, 11.23], [-41.0, 0.72, 14.0],
  // Frozen waterfall: path from the avenue, then round the frozen plunge pool
  [-57.8, 0.72, -1.8], [-59.4, 0.72, -4.8], [-61.4, 0.72, -3.0], [-61.4, 0.72, -6.6],
  // Ice cave mouth & the giant footprints to the snow monster's den
  [-61.6, 0.72, 6.0], [-64.6, 0.72, 7.4], [-59.4, 0.72, 10.6], [-55.4, 0.72, 12.8],
  // Snow-bunny pine grove (south-west)
  [-54.4, 0.72, 17.0], [-60.8, 0.72, 17.6], [-57.6, 0.72, 22.4],
  // Igloo village plaza, the penguin family & the lane behind the igloos
  [-36.2, 0.72, -9.4], [-41.0, 0.72, -9.6], [-38.6, 0.72, -18.9], [-42.4, 0.72, -18.6], [-29.8, 0.72, -11.0],
  // Ice slide: up to the lift pad, three hearts you can only catch riding the spiral, and one at the run-out
  [-56.4, 0.72, -8.6],
  ...[0.3, 0.55, 0.8].map((f): Vec3 => {
    const [x, y, z] = frozenSlideChutePoint(f);
    return [x, y + 0.72, z];
  }),
  [-54.6, 0.72, -13.4],
  // Quiet corners: north meadow behind the slide & south-east by the snowman
  [-51.0, 0.72, -13.6], [-31.8, 0.72, 19.6], [-30.8, 0.72, 7.8],
  // Dino Log Bridge sparkling heart trail
  [21.2, 0.72, 2.0], [23.75, 0.72, 2.0], [26.3, 0.72, 2.0],
  // Dinosaur Land jungle avenue toward the 9th Star
  [31.5, 0.72, 2.0], [36.5, 0.72, 2.0], [41.5, 0.72, 2.0],
  // Jungle Oasis Lagoon ring
  [39.5, 0.72, 4.6], [36.0, 0.72, 8.2], [39.5, 0.72, 11.8], [43.0, 0.72, 8.2],
  // Near Dino Nest & northern jungle glade
  [46.5, 0.72, 5.5], [39.0, 0.72, -5.5], [44.5, 0.72, -6.2],
  // Footprint trail north to the Triceratops Meadow, then around the Triceratops
  [33.2, 0.72, -4.6], [34.4, 0.72, -8.6], [36.4, 0.72, -12.4],
  [35.8, 0.72, -16.2], [38.2, 0.72, -18.8], [43.4, 0.72, -16.0], [43.0, 0.72, -12.4],
  // Avenue extension east to Big Blue's picnic
  [50.6, 0.72, 2.0], [54.0, 0.72, 2.0], [57.6, 0.72, 2.0], [60.2, 0.72, -0.8], [60.0, 0.72, 4.4],
  [57.2, 0.72, 7.4], [59.4, 0.72, 10.2], [61.8, 0.72, 9.0],
  // Footprint trail past the volcano to the Fossil Dig, then around the skeleton
  [52.6, 0.72, -2.4], [54.9, 0.72, -6.0], [56.4, 0.72, -9.8],
  [55.4, 0.72, -14.6], [59.5, 0.72, -11.8], [63.6, 0.72, -14.6], [59.5, 0.72, -17.6],
  // Lagoon -> Bouncy Egg Playground, floating above the eggs, then on to Baby Pink
  [44.0, 0.72, 15.0], [45.6, 0.72, 20.2], [49.6, 0.72, 20.2],
  [43.6, 2.6, 19.2], [47.6, 2.6, 21.0], [51.6, 2.6, 19.2],
  [55.6, 0.72, 19.6], [58.4, 0.72, 15.8], [62.4, 0.72, 20.6],
  // Fern Grove (south-west)
  [33.0, 0.72, 16.4], [35.4, 0.72, 20.2], [32.0, 0.72, 23.0], [38.6, 0.72, 19.6],
  // Pastel Ribbon Bridge sparkling heart trail
  [0, 0.72, 22.2], [0, 0.72, 24.75], [0, 0.72, 27.3],
  // My Melody & Kuromi Land central friendship promenade
  [0, 0.72, 31.5], [0, 0.72, 35.5], [0, 0.72, 39.5], [0, 0.72, 43.2],
  // My Melody's Strawberry-Pink Wing (West)
  [-4.2, 0.72, 32.5], [-8.8, 0.72, 35.5], [-4.0, 0.72, 42.5], [-4.5, 0.72, 47.5],
  // Kuromi's Lavender Starlight Wing (East)
  [4.2, 0.72, 32.5], [8.8, 0.72, 35.5], [4.0, 0.72, 42.5], [4.5, 0.72, 47.5],
  // Melody & Kuromi expansion: path west to the Strawberry Garden, then round its bed
  [-8.0, 0.72, 39.2],
  [-16.4, 0.72, 32.7], [-20.0, 0.72, 36.4], [-16.4, 0.72, 40.1], [-12.8, 0.72, 36.4],
  // Path east to Kuromi's Moon Swing, then round it
  [8.0, 0.72, 39.2],
  [16.4, 0.72, 32.7], [20.0, 0.72, 36.4], [16.4, 0.72, 40.1], [12.8, 0.72, 36.4],
  // Floating over the jelly bounce pads (west) & the star trampolines (east)
  [-15.4, 2.6, 45.4], [-18.2, 2.6, 48.0], [-15.4, 2.6, 50.6],
  [15.4, 2.6, 45.4], [18.2, 2.6, 48.0], [15.4, 2.6, 50.6],
  // Round the Friendship Monument & on south to the Teacup Twirl, then round the teacups
  [-3.7, 0.72, 51.2], [3.7, 0.72, 51.2], [0, 0.72, 55.0], [0, 0.72, 58.6],
  [-4.3, 0.72, 63.6], [4.3, 0.72, 63.6], [0, 0.72, 68.0],
  // Ferris wheel: path to the heart pad, behind the wheel, and three you can only catch riding it (top half)
  [-8.4, 0.72, 60.6], [-12.6, 0.72, 68.4],
  ...[Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((a): Vec3 => {
    const [x, y, z] = melodyWheelSeat(a);
    return [x, y + 0.72, z];
  }),
  // Kuromi's Starry Skate Rink: a ring on the rink and one in the middle
  [13.0, 0.72, 60.2], [15.8, 0.72, 63.0], [13.0, 0.72, 65.8], [10.2, 0.72, 63.0], [13.0, 0.72, 63.0],
  // Quiet corners: wing edges & the south fence
  [-19.0, 0.72, 42.6], [19.0, 0.72, 42.6], [-18.6, 0.72, 68.6], [18.6, 0.72, 68.6],
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
  { pos: [-18.5, UPPER_CASTLE_Y, -50.0], color: "#fde047" },
  { pos: [18.5, UPPER_CASTLE_Y, -50.0], color: "#7dd3fc" },
  { pos: [-10.5, UPPER_CASTLE_Y, -66.0], color: "#c084fc" },
  { pos: [10.5, UPPER_CASTLE_Y, -66.0], color: "#ff6eb4" },
];

export const BUTTERFLY_SPOTS: ButterflySpot[] = [
  { center: [-11.5, 2.0, 2.2], color: "#ff85c0", speed: 1.1 },
  { center: [11.5, 2.2, 11.4], color: "#7dd3fc", speed: 0.95 },
  { center: [0, 2.8, 3.6], color: "#fde047", speed: 1.25 },
  { center: [0, 2.5, -33.0], color: "#f472b6", speed: 1.05 },
  { center: [0, 6.4, -51.0], color: "#fde047", speed: 1.15 },
  { center: [-15.5, 2.2, -33.5], color: "#ff85c0", speed: 0.9 },
  { center: [14.5, 4.6, -56.5], color: "#7dd3fc", speed: 1.0 },
  // Dinosaur Land: Fern Grove & Fossil Dig
  { center: [34.6, 2.3, 19.8], color: "#fde047", speed: 1.0 },
  { center: [59.5, 2.6, -13.2], color: "#7dd3fc", speed: 0.9 },
];

export const CLOUD_SPOTS: CloudSpot[] = [
  { pos: [-14, 7.5, -16], scale: 2.3, tint: "#ffffff" },
  { pos: [14, 7.2, -16], scale: 2.4, tint: "#fff0f7" },
  { pos: [-28, 9.0, -36], scale: 2.5, tint: "#fff0f7" },
  { pos: [28, 8.8, -36], scale: 2.5, tint: "#f3e8ff" },
  { pos: [-29, 11.2, -60], scale: 2.6, tint: "#ffffff" },
  { pos: [29, 11.0, -60], scale: 2.6, tint: "#fff0f7" },
  { pos: [0, 15.5, -82], scale: 3.0, tint: "#ffffff" },
];

// Castle pastel trees (lower courtyard corners + upper terrace) and round rose-garden topiaries
export const CASTLE_TREE_SPOTS: TreeSpot[] = [
  { pos: [-20.4, 0, -27.6], color: "#ff85c0", scale: 1.15 },
  { pos: [20.4, 0, -27.6], color: "#c084fc", scale: 1.15 },
  { pos: [-20.4, 0, -40.4], color: "#fde047", scale: 1.1 },
  { pos: [20.4, 0, -40.4], color: "#7dd3fc", scale: 1.1 },
  { pos: [-19.8, UPPER_CASTLE_Y, -46.0], color: "#fbcfe8", scale: 1.2 },
  { pos: [19.8, UPPER_CASTLE_Y, -46.0], color: "#a7f3d0", scale: 1.2 },
  { pos: [-19.8, UPPER_CASTLE_Y, -66.8], color: "#c084fc", scale: 1.25 },
  { pos: [19.8, UPPER_CASTLE_Y, -66.8], color: "#ff85c0", scale: 1.25 },
  { pos: [-10.0, UPPER_CASTLE_Y, -68.2], color: "#7dd3fc", scale: 1.1 },
  { pos: [10.0, UPPER_CASTLE_Y, -68.2], color: "#fde047", scale: 1.1 },
];

export const CASTLE_TOPIARY_SPOTS: TreeSpot[] = [
  { pos: [-19.1, 0, -29.9], color: "#4ade80", scale: 1.0 },
  { pos: [-11.9, 0, -29.9], color: "#34d399", scale: 1.0 },
  { pos: [-19.1, 0, -37.1], color: "#34d399", scale: 1.0 },
  { pos: [-11.9, 0, -37.1], color: "#4ade80", scale: 1.0 },
];

// Castle Platform structural obstacles (towers, spires, attractions, throne gazebo)
export const CASTLE_STRUCTURAL_OBSTACLES: CircleObstacle[] = [
  // Grand Gatehouse flanking towers (wide open archway in between x ∈ [-2.8, 2.8])
  { x: -4.2, z: -25.0, r: 1.42 },
  { x: 4.2, z: -25.0, r: 1.42 },
  // Lower South Corner Towers
  { x: -CASTLE_WALL_X, z: -25.0, r: 1.55 },
  { x: CASTLE_WALL_X, z: -25.0, r: 1.55 },
  // Mid-Terrace Step-Up Corner Towers
  { x: -CASTLE_WALL_X, z: UPPER_CASTLE_Z, r: 1.45 },
  { x: CASTLE_WALL_X, z: UPPER_CASTLE_Z, r: 1.45 },
  // Upper side-wall watchtowers
  { x: -CASTLE_WALL_X, z: -56.5, r: 1.35 },
  { x: CASTLE_WALL_X, z: -56.5, r: 1.35 },
  // Upper North Corner Towers
  { x: -CASTLE_WALL_X, z: CASTLE_NORTH_WALL_Z, r: 1.65 },
  { x: CASTLE_WALL_X, z: CASTLE_NORTH_WALL_Z, r: 1.65 },
  // Grand royal spires along the north wall
  { x: -6.2, z: -70.4, r: 1.8 },
  { x: 6.2, z: -70.4, r: 1.8 },
  { x: -14.5, z: -70.6, r: 1.4 },
  { x: 14.5, z: -70.6, r: 1.4 },
  // Royal Princess Throne & Birthday Star Gazebo on the Upper Terrace
  { x: CASTLE_THRONE_POS[0], z: CASTLE_THRONE_POS[2], r: 2.15 },
  // Pony Carousel, giant Birthday Cake, Royal Crown pedestal & Swan Pond
  { x: CASTLE_CAROUSEL_POS[0], z: CASTLE_CAROUSEL_POS[2], r: 2.75 },
  { x: CASTLE_CAKE_POS[0], z: CASTLE_CAKE_POS[2], r: 1.85 },
  { x: CASTLE_CROWN_POS[0], z: CASTLE_CROWN_POS[2], r: 1.35 },
  { x: CASTLE_SWAN_POND_POS[0], z: CASTLE_SWAN_POND_POS[2], r: 2.7 },
  // Castle trees & rose-garden topiaries
  ...CASTLE_TREE_SPOTS.map((tr) => ({ x: tr.pos[0], z: tr.pos[2], r: 0.36 * tr.scale })),
  ...CASTLE_TOPIARY_SPOTS.map((tp) => ({ x: tp.pos[0], z: tp.pos[2], r: 0.55 * tp.scale })),
];

// Frozen Land (West Island: x ∈ [-67.5, -27.5], z ∈ [-21.0, 25.0], centred on [-47.5, 0, 2.0])
// The original snowfield (bridge avenue, Olaf, the Ice Palace Gazebo) sits in its east half; the expansion adds the
// Igloo Village with the penguin family (north-east), the spiral Ice Slide (north-west, see FROZEN_SLIDE_* above),
// the Frozen Waterfall and the Ice Cave with the snow monster's den (west), the big skating pond (south) and the
// snow-bunny pine grove (south-west).
export const FROZEN_ISLAND = { minX: -67.5, maxX: -27.5, minZ: -21.0, maxZ: 25.0 } as const;
export const FROZEN_GAZEBO_POS: Vec3 = [-49.5, 0, 2.0];
export const FROZEN_SNOWMAN_POS: Vec3 = [-33.6, 0, 11.2];
export const FROZEN_OLAF_POS: Vec3 = [-39.2, 0, -3.2];
// Big walkable skating pond: on the ice the unicorn glides (no trotting) a little faster, with skating penguins
export const FROZEN_SKATING_POND_POS: Vec3 = [-41.0, 0.015, 14.0];
export const FROZEN_SKATING_POND_R = 5.6;
export const FROZEN_SKATE_SPEED = 1.3;
// Penguins skating loops on the pond (decorative movers; they swerve round the unicorn)
export const FROZEN_SKATERS: { r: number; speed: number; phase: number; scarf: string }[] = [
  { r: 3.7, speed: 0.55, phase: 0, scarf: "#ff6eb4" },
  { r: 3.7, speed: 0.55, phase: Math.PI, scarf: "#7dd3fc" },
  { r: 2.1, speed: -0.8, phase: 1.2, scarf: "#fde047" },
  { r: 4.6, speed: -0.42, phase: 2.4, scarf: "#c084fc" },
];

// Frozen Waterfall: a snowy cliff on the west edge, its falls frozen mid-air above a walkable ice pool
export const FROZEN_WATERFALL_POS: Vec3 = [-64.0, 0, -4.8];
export const FROZEN_WATERFALL_POOL_POS: Vec3 = [-61.4, 0.015, -4.8];
export const FROZEN_WATERFALL_POOL_R = 2.5;

// Ice Cave: rocky walls with a glittering arch over the mouth, which faces east. Its open interior is the box below;
// tap-to-move steers through the mouth point when going in or out.
export const FROZEN_CAVE = { minX: -65.6, maxX: -61.0, minZ: 3.5, maxZ: 8.5, mouthX: -59.6, mouthZ: 6.0 } as const;
// Solid rock: the waterfall cliff (running on into the cave's north wall) and the cave's north, south & back walls
export const FROZEN_ROCK_BOXES: BoxObstacle[] = [
  { minX: -67.5, maxX: -64.0, minZ: -9.0, maxZ: 2.3 },
  { minX: -67.5, maxX: FROZEN_CAVE.maxX, minZ: 2.3, maxZ: FROZEN_CAVE.minZ },
  { minX: -67.5, maxX: FROZEN_CAVE.maxX, minZ: FROZEN_CAVE.maxZ, maxZ: 9.7 },
  { minX: -67.5, maxX: FROZEN_CAVE.minX, minZ: FROZEN_CAVE.minZ, maxZ: FROZEN_CAVE.maxZ },
];
// Snow monster's den beside the cave, home of Marshmallow, a friendly giant. Giant footprints lead to it from the
// cave mouth.
export const FROZEN_SNOW_DEN_POS: Vec3 = [-58.2, 0, 13.4];
export const FROZEN_SNOW_DEN_R = 2.4;
export const FROZEN_DEN_FOOTPRINTS: Vec2[] = [[-59.9, 7.6], [-59.4, 9.0], [-58.6, 10.4]];
export const FROZEN_MARSHMALLOW_HEIGHT = 3.6;
// Faces north-east, toward the avenue where Sarvin comes from (0 = +z)
export const FROZEN_MARSHMALLOW_YAW = 2.36;
// Its arms span 1.64x its height and its body is 0.85x as deep, so it stands on a capsule along the arms
export const FROZEN_MARSHMALLOW_CAPSULE: CapsuleObstacle = (() => {
  const half = 1.55;
  const ux = Math.cos(FROZEN_MARSHMALLOW_YAW) * half;
  const uz = -Math.sin(FROZEN_MARSHMALLOW_YAW) * half;
  const [x, , z] = FROZEN_SNOW_DEN_POS;
  return { ax: x - ux, az: z - uz, bx: x + ux, bz: z + uz, r: 1.35 };
})();

// Igloo Village round a little plaza; doorYaw is the way the entrance tunnel faces (0 = +z, south)
export type IglooSpot = { pos: Vec3; r: number; doorYaw: number };
export const FROZEN_IGLOOS: IglooSpot[] = [
  { pos: [-38.6, 0, -14.8], r: 2.3, doorYaw: 0 },
  { pos: [-46.0, 0, -14.6], r: 1.6, doorYaw: Math.PI / 2 },
  { pos: [-32.2, 0, -14.2], r: 1.6, doorYaw: -Math.PI / 2 },
];
/**
 * Entrance tunnel of an igloo: half-cylinder of radius 0.32r reaching out to 1.14r from the dome's centre. It is short
 * enough that the dome's collision circle alone covers it (a separate tunnel circle made a corner she could get stuck in).
 */
export function iglooTunnel(ig: IglooSpot) {
  const radius = 0.32 * ig.r;
  const reach = 1.14 * ig.r;
  const dx = Math.sin(ig.doorYaw);
  const dz = Math.cos(ig.doorYaw);
  return { radius, reach, dx, dz, cx: ig.pos[0] + dx * (reach - radius), cz: ig.pos[2] + dz * (reach - radius) };
}
// Penguin family (mum, dad & a baby) by the plaza
export const FROZEN_PENGUIN_FAMILY_POS: Vec3 = [-43.4, 0, -9.8];

// Snow bunnies hopping round a carrot patch in the south-west pine grove
export const FROZEN_CARROT_PATCH_POS: Vec3 = [-57.6, 0, 19.6];
export const FROZEN_BUNNY_RING_R = 1.9;
export const FROZEN_BUNNY_SPOTS: Vec3[] = [20, 110, 200, 290].map((deg): Vec3 => {
  const a = (deg * Math.PI) / 180;
  return [
    FROZEN_CARROT_PATCH_POS[0] + Math.cos(a) * FROZEN_BUNNY_RING_R,
    0,
    FROZEN_CARROT_PATCH_POS[2] + Math.sin(a) * FROZEN_BUNNY_RING_R,
  ];
});

export const FROZEN_PINE_SPOTS: TreeSpot[] = [
  { pos: [-30.4, 0, -9.0], color: "#7dd3fc", scale: 1.25 },
  { pos: [-52.4, 0, -6.8], color: "#bae6fd", scale: 1.2 },
  { pos: [-52.4, 0, 10.6], color: "#ddd6fe", scale: 1.3 },
  { pos: [-43.0, 0, -4.6], color: "#bae6fd", scale: 1.05 },
  { pos: [-49.4, 0, -9.6], color: "#c4b5fd", scale: 1.3 },
  { pos: [-30.4, 0, -18.4], color: "#a5f3fc", scale: 1.25 },
  { pos: [-35.0, 0, -18.8], color: "#7dd3fc", scale: 1.1 },
  { pos: [-51.4, 0, -18.6], color: "#99f6e4", scale: 1.3 },
  { pos: [-65.0, 0, -18.6], color: "#bae6fd", scale: 1.2 },
  { pos: [-64.6, 0, 16.6], color: "#ddd6fe", scale: 1.25 },
  { pos: [-61.6, 0, 22.2], color: "#7dd3fc", scale: 1.3 },
  { pos: [-64.8, 0, 22.4], color: "#c4b5fd", scale: 1.1 },
  { pos: [-52.0, 0, 19.0], color: "#a5f3fc", scale: 1.15 },
  { pos: [-49.6, 0, 22.6], color: "#99f6e4", scale: 1.25 },
  { pos: [-30.6, 0, 22.4], color: "#bae6fd", scale: 1.2 },
  { pos: [-31.0, 0, 17.0], color: "#7dd3fc", scale: 1.1 },
  { pos: [-35.6, 0, 22.8], color: "#ddd6fe", scale: 1.15 },
  { pos: [-44.6, 0, -18.8], color: "#c4b5fd", scale: 1.1 },
];

// Smaller pieces from the same winter pack (instanced): rocks, snowdrifts, a stump, bushes & little snowy trees.
// Every one of them is solid; FROZEN_PROP_RADIUS is its footprint at scale 1.
export type WinterPropKind = "rock1" | "rock2" | "snowdrift1" | "snowdrift2" | "stump" | "bush" | "tree_small_snow";
export const FROZEN_PROP_RADIUS: Record<WinterPropKind, number> = {
  rock1: 0.44,
  rock2: 0.62,
  snowdrift1: 0.5,
  snowdrift2: 0.62,
  stump: 0.42,
  bush: 0.6,
  tree_small_snow: 0.42,
};
export const FROZEN_PROP_SPOTS: { kind: WinterPropKind; pos: Vec3; scale: number; rotY: number }[] = [
  // Boulders flanking the waterfall pool, by the cave and the den's sitting rock
  { kind: "rock2", pos: [-63.6, 0, -8.0], scale: 1.0, rotY: 0.6 },
  { kind: "rock1", pos: [-63.7, 0, -0.6], scale: 1.1, rotY: 2.1 },
  { kind: "rock2", pos: [-66.0, 0, 12.6], scale: 1.2, rotY: 4.0 },
  { kind: "rock1", pos: [-60.9, 0, 16.2], scale: 1.3, rotY: 1.2 },
  // Snowdrifts banked against the fences
  { kind: "snowdrift2", pos: [-41.0, 0, 24.1], scale: 1.0, rotY: 1.57 },
  { kind: "snowdrift1", pos: [-56.0, 0, -20.1], scale: 1.0, rotY: 1.57 },
  { kind: "snowdrift1", pos: [-28.9, 0, 20.6], scale: 1.0, rotY: 0.4 },
  { kind: "snowdrift2", pos: [-66.2, 0, -16.0], scale: 0.9, rotY: 0 },
  // Grove stump, bushes & little snowy trees
  { kind: "stump", pos: [-53.6, 0, 15.2], scale: 1.0, rotY: 0.3 },
  { kind: "bush", pos: [-34.4, 0, -7.6], scale: 0.9, rotY: 0.8 },
  { kind: "bush", pos: [-47.0, 0, 21.6], scale: 1.0, rotY: 2.2 },
  { kind: "tree_small_snow", pos: [-62.4, 0, -19.0], scale: 1.1, rotY: 0.5 },
  { kind: "tree_small_snow", pos: [-44.0, 0, 21.6], scale: 1.15, rotY: 1.9 },
  { kind: "tree_small_snow", pos: [-35.0, 0, 6.4], scale: 1.1, rotY: 3.1 },
  { kind: "tree_small_snow", pos: [-55.6, 0, -6.4], scale: 1.05, rotY: 4.4 },
];
// Log benches by the skating pond (GLB log, long axis along local x; collision is a capsule along it)
export const FROZEN_LOG_SPOTS: { pos: Vec3; rotY: number; scale: number }[] = [
  { pos: [-33.4, 0, 16.2], rotY: Math.PI / 2, scale: 1.0 },
  { pos: [-48.4, 0, 14.4], rotY: Math.PI / 2, scale: 1.0 },
];
const FROZEN_LOG_HALF = 0.44;
const FROZEN_LOG_R = 0.3;

export const FROZEN_LANTERN_SPOTS: Vec3[] = [
  // Bridge mouth pair (stand clear of the east fence so the unicorn can still walk along it)
  [-30.6, 0, -0.7],
  [-30.6, 0, 4.7],
  [-36.5, 0, -0.8],
  [-36.5, 0, 4.8],
  [-44.2, 0, -1.2],
  [-44.2, 0, 5.2],
  // Avenue past the gazebo, the pond, the igloo village & the slide
  [-54.6, 0, -0.9],
  [-54.6, 0, 4.9],
  [-46.4, 0, 9.0],
  [-35.0, 0, -11.6],
  [-55.4, 0, -10.2],
];

export const FROZEN_CRYSTAL_SPOTS: Vec3[] = [
  [-33.5, 0, -4.5],
  [-48.5, 0, -4.2],
  [-49.0, 0, 7.5],
  [-41.2, 0, -6.8],
  [-30.6, 0, 10.2],
];

// Collision footprints of the Frozen Land expansion (the rock walls are FROZEN_ROCK_BOXES)
export const FROZEN_EXPANSION_OBSTACLES: CircleObstacle[] = [
  { x: FROZEN_SLIDE_POS[0], z: FROZEN_SLIDE_POS[2], r: FROZEN_SLIDE_COLLIDE_R },
  ...FROZEN_IGLOOS.map((ig) => ({ x: ig.pos[0], z: ig.pos[2], r: ig.r * 1.02 })),
  { x: FROZEN_PENGUIN_FAMILY_POS[0], z: FROZEN_PENGUIN_FAMILY_POS[2], r: 1.05 },
  // Carrot patch & its ring of bunnies as one round blob (separate circles left gaps too narrow to pass but deep
  // enough to get wedged in)
  { x: FROZEN_CARROT_PATCH_POS[0], z: FROZEN_CARROT_PATCH_POS[2], r: FROZEN_BUNNY_RING_R + 0.4 },
  // Rounded ends on the rock walls' outer corners (cave mouth & the waterfall cliff), so she slides round them
  { x: FROZEN_CAVE.maxX - 0.6, z: 2.9, r: 0.85 },
  { x: FROZEN_CAVE.maxX - 0.6, z: 9.1, r: 0.85 },
  { x: -64.6, z: -8.4, r: 0.85 },
  ...FROZEN_PROP_SPOTS.map((p) => ({ x: p.pos[0], z: p.pos[2], r: FROZEN_PROP_RADIUS[p.kind] * p.scale })),
];
export const FROZEN_LOG_CAPSULES: CapsuleObstacle[] = FROZEN_LOG_SPOTS.map((l) => {
  const ux = Math.cos(l.rotY) * FROZEN_LOG_HALF * l.scale;
  const uz = -Math.sin(l.rotY) * FROZEN_LOG_HALF * l.scale;
  return { ax: l.pos[0] - ux, az: l.pos[2] - uz, bx: l.pos[0] + ux, bz: l.pos[2] + uz, r: FROZEN_LOG_R * l.scale };
});

// Dinosaur Land (East Island: x ∈ [27.5, 67.5], z ∈ [-21.0, 25.0], centred on [47.5, 0, 2.0])
// The original jungle (bridge avenue, Hera, lagoon, volcano, nest) sits in its west half; the expansion adds the
// Triceratops Meadow (north), the Fossil Dig (north-east), Big Blue's picnic at the end of the avenue (east),
// the Bouncy Egg Playground with Baby Pink (south-east) and the Fern Grove (south-west).
export const DINO_ISLAND = { minX: 27.5, maxX: 67.5, minZ: -21.0, maxZ: 25.0 } as const;
export const DINO_BRONTO_POS: Vec3 = [43.2, 0, -2.8];
// Facing direction of the long-neck; her head and tail get their own collision circles along it
export const DINO_BRONTO_YAW = -0.75;
export const DINO_TRIKE_POS: Vec3 = [34.5, 0, 7.6];
export const DINO_STEGO_POS: Vec3 = [36.2, 0, -5.2];
export const DINO_VOLCANO_POS: Vec3 = [50.0, 0, -6.5];
export const DINO_NEST_POS: Vec3 = [46.5, 0, 8.5];
export const DINO_LAGOON_POS: Vec3 = [39.5, 0.015, 8.2];

// Sculpted pastel Triceratops (GLB) grazing in the north meadow. It is ~2 heights long, so it gets a chain of
// collision circles along its facing (see DINO_TRICERATOPS_CIRCLES)
export const DINO_TRICERATOPS_POS: Vec3 = [39.5, 0, -15.2];
export const DINO_TRICERATOPS_YAW = 0.35;
export const DINO_TRICERATOPS_HEIGHT = 2.3;
// Big Blue, the chubby sitting dino, at the east end of the jungle avenue looking back along it
export const DINO_BIG_BLUE_POS: Vec3 = [62.8, 0, 2.0];
export const DINO_BIG_BLUE_YAW = -Math.PI / 2;
export const DINO_BIG_BLUE_HEIGHT = 2.6;
// Baby Pink, the same sitting dino in pink and a lot smaller, watching the bouncy eggs
export const DINO_BABY_PINK_POS: Vec3 = [59.0, 0, 18.6];
export const DINO_BABY_PINK_YAW = -2.25;
export const DINO_BABY_PINK_HEIGHT = 1.55;
// Fossil Dig: sandy pit with a friendly dino skeleton on a long stone plinth (plinth runs along x)
export const DINO_FOSSIL_PIT_POS: Vec3 = [59.0, 0, -13.6];
export const DINO_SKELETON_POS: Vec3 = [59.5, 0, -14.6];
// Picnic blanket with a fruit basket & tiny cake beside Big Blue
export const DINO_PICNIC_POS: Vec3 = [59.4, 0, 7.4];

// Bouncy egg trampolines in the south playground (walk onto one to bounce, like the pink mushrooms)
export const DINO_BOUNCE_EGGS: Vec3[] = [
  [43.6, 0, 19.2],
  [47.6, 0, 21.0],
  [51.6, 0, 19.2],
];

// Giant prehistoric ferns & spotted mushrooms of the south-west Fern Grove (solid)
export const DINO_FERN_SPOTS: TreeSpot[] = [
  { pos: [30.6, 0, 18.2], color: "#4ade80", scale: 1.15 },
  { pos: [34.2, 0, 22.4], color: "#22c55e", scale: 1.25 },
  { pos: [37.6, 0, 17.2], color: "#86efac", scale: 1.0 },
  { pos: [31.0, 0, 21.0], color: "#16a34a", scale: 1.1 },
  { pos: [39.2, 0, 21.8], color: "#4ade80", scale: 1.05 },
  { pos: [41.4, 0, -18.4], color: "#22c55e", scale: 1.05 },
  { pos: [35.0, 0, -18.6], color: "#4ade80", scale: 1.15 },
];
export const DINO_MUSHROOM_SPOTS: FlowerSpot[] = [
  { pos: [33.4, 0, 19.6], color: "#fb7185" },
  { pos: [36.4, 0, 19.8], color: "#c084fc" },
  { pos: [40.0, 0, 15.4], color: "#fbbf24" },
];

// Three-toed dino footprints leading from the avenue to each new corner (decals, walkable)
export const DINO_FOOTPRINT_TRAILS: Vec2[][] = [
  // Avenue -> Triceratops Meadow
  [[32.6, -1.6], [33.0, -3.6], [33.4, -5.6], [34.0, -7.6], [34.9, -9.5], [35.9, -11.3]],
  // Star clearing -> Fossil Dig (east of the volcano)
  [[51.0, -0.6], [52.6, -2.2], [53.9, -4.0], [54.9, -5.9], [55.7, -7.9], [56.3, -9.8]],
  // Lagoon -> Bouncy Egg Playground
  [[43.2, 12.6], [44.0, 14.4], [44.8, 16.2]],
  // Egg Playground -> Baby Pink
  [[53.8, 19.6], [55.6, 19.0]],
];

export const DINO_PALM_SPOTS: TreeSpot[] = [
  { pos: [31.5, 0, -9.2], color: "#22c55e", scale: 1.25 },
  { pos: [39.0, 0, -10.2], color: "#16a34a", scale: 1.32 },
  { pos: [43.2, 0, -9.6], color: "#22c55e", scale: 1.12 },
  { pos: [55.2, 0, 11.2], color: "#22c55e", scale: 1.25 },
  { pos: [52.2, 0, 11.4], color: "#16a34a", scale: 1.3 },
  { pos: [45.5, 0, 13.8], color: "#22c55e", scale: 1.18 },
  { pos: [31.6, 0, 13.4], color: "#16a34a", scale: 1.22 },
  // Expansion: outer ring of palms along the new fences
  { pos: [30.2, 0, -18.6], color: "#16a34a", scale: 1.2 },
  { pos: [47.6, 0, -18.4], color: "#22c55e", scale: 1.28 },
  { pos: [65.2, 0, -18.4], color: "#16a34a", scale: 1.22 },
  { pos: [65.4, 0, -7.0], color: "#22c55e", scale: 1.3 },
  { pos: [65.4, 0, 10.4], color: "#16a34a", scale: 1.18 },
  { pos: [65.2, 0, 22.6], color: "#22c55e", scale: 1.25 },
  { pos: [55.4, 0, 22.8], color: "#16a34a", scale: 1.15 },
  { pos: [52.4, 0, -12.6], color: "#22c55e", scale: 1.1 },
];

export const DINO_LANTERN_SPOTS: Vec3[] = [
  // Bridge mouth pair (stand clear of the west fence so the unicorn can still walk along it)
  [30.6, 0, -0.7],
  [30.6, 0, 4.7],
  [36.5, 0, -0.8],
  [36.5, 0, 4.8],
  [44.0, 0, -0.8],
  [44.0, 0, 4.8],
  // Avenue extension to Big Blue
  [50.8, 0, 4.8],
  [56.8, 0, -0.8],
  [56.8, 0, 4.8],
  // Fossil Dig & Egg Playground corners
  [54.2, 0, -16.6],
  [41.8, 0, 22.8],
];

export const DINO_FLOWER_SPOTS: FlowerSpot[] = [
  { pos: [32.8, 0, -3.5], color: "#ff6eb4" },
  { pos: [34.2, 0, 11.2], color: "#fde047" },
  { pos: [43.8, 0, 11.8], color: "#fb7185" },
  { pos: [49.2, 0, 5.2], color: "#fde047" },
  { pos: [47.8, 0, -1.8], color: "#ff6eb4" },
  { pos: [41.0, 0, -6.8], color: "#f97316" },
  // Expansion
  { pos: [44.6, 0, -14.2], color: "#fde047" },
  { pos: [33.8, 0, -14.6], color: "#ff6eb4" },
  { pos: [62.4, 0, -2.6], color: "#fb7185" },
  { pos: [62.6, 0, 6.6], color: "#fde047" },
  { pos: [62.0, 0, 16.2], color: "#ff6eb4" },
  { pos: [49.4, 0, 16.4], color: "#c084fc" },
  { pos: [60.6, 0, -8.6], color: "#f97316" },
];

// Collision footprints of the long things: one capsule (a segment along the facing, plus a radius) each.
// A capsule has no dents between parts, so tap-to-move slides smoothly round it (a chain of circles can trap it).
function capsuleAlong(pos: Vec3, yaw: number, back: number, front: number, r: number): CapsuleObstacle {
  const fx = Math.sin(yaw);
  const fz = Math.cos(yaw);
  return { ax: pos[0] + fx * back, az: pos[2] + fz * back, bx: pos[0] + fx * front, bz: pos[2] + fz * front, r };
}
// Triceratops (height 2.3): beak/horn tip ~2.33 ahead, tail tip ~2.33 behind, ~1.8 wide at the frill
export const DINO_TRICERATOPS_CAPSULE = capsuleAlong(DINO_TRICERATOPS_POS, DINO_TRICERATOPS_YAW, -1.5, 1.45, 0.92);
// Sitting dino at height h: ~0.7h wide, round body a little ahead of centre, tail out to ~0.55h behind
const sittingDinoCapsule = (pos: Vec3, yaw: number, h: number) => capsuleAlong(pos, yaw, -0.2 * h, 0.1 * h, 0.36 * h);
export const DINO_BIG_BLUE_CAPSULE = sittingDinoCapsule(DINO_BIG_BLUE_POS, DINO_BIG_BLUE_YAW, DINO_BIG_BLUE_HEIGHT);
export const DINO_BABY_PINK_CAPSULE = sittingDinoCapsule(DINO_BABY_PINK_POS, DINO_BABY_PINK_YAW, DINO_BABY_PINK_HEIGHT);
// Fossil skeleton on a rounded stone plinth running along x (3.2 between the round ends, 0.85 radius)
export const DINO_SKELETON_PLINTH_HALF = 1.6;
export const DINO_SKELETON_PLINTH_R = 0.85;
export const DINO_SKELETON_CAPSULE: CapsuleObstacle = {
  ax: DINO_SKELETON_POS[0] - DINO_SKELETON_PLINTH_HALF,
  az: DINO_SKELETON_POS[2],
  bx: DINO_SKELETON_POS[0] + DINO_SKELETON_PLINTH_HALF,
  bz: DINO_SKELETON_POS[2],
  r: DINO_SKELETON_PLINTH_R,
};

export const CAPSULE_OBSTACLES: CapsuleObstacle[] = [
  ...FROZEN_LOG_CAPSULES,
  FROZEN_MARSHMALLOW_CAPSULE,
  DINO_TRICERATOPS_CAPSULE,
  DINO_BIG_BLUE_CAPSULE,
  DINO_BABY_PINK_CAPSULE,
  DINO_SKELETON_CAPSULE,
  MELODY_WHEEL_CAPSULE,
];

// My Melody & Kuromi Land (South Island: x ∈ [-22.0, 22.0], z ∈ [28.5, 72.5], centred on [0, 0, 50.5])
// The original plaza (cottage, tea table, stage, candy cart, monument) sits in its north middle; the expansion adds
// the Strawberry Garden & jelly bounce pads (west wing), Kuromi's Moon Swing & star trampolines (east wing), and the
// Ferris Wheel, Teacup Twirl & Kuromi's Starry Skate Rink along the south.
export const MELODY_ISLAND = { minX: -22.0, maxX: 22.0, minZ: 28.5, maxZ: 72.5 } as const;
export const MELODY_STRAWBERRY_GARDEN_POS: Vec3 = [-16.4, 0, 36.4];
export const MELODY_STRAWBERRY_GARDEN_R = 2.4;
export const KUROMI_MOON_SWING_POS: Vec3 = [16.4, 0, 36.4];
export const MELODY_TEACUPS_POS: Vec3 = [0, 0, 63.6];
export const MELODY_TEACUPS_R = 3.1;
// Walkable glossy rink: on it the unicorn glides like on Frozen Land's pond, with two little skaters
export const KUROMI_RINK_POS: Vec3 = [13.0, 0, 63.0];
export const KUROMI_RINK_R = 4.4;
// Squishy pads: walk onto one to bounce, like the pink mushrooms
export const MELODY_JELLY_PADS: Vec3[] = [
  [-15.4, 0, 45.4],
  [-18.2, 0, 48.0],
  [-15.4, 0, 50.6],
];
export const KUROMI_STAR_PADS: Vec3[] = [
  [15.4, 0, 45.4],
  [18.2, 0, 48.0],
  [15.4, 0, 50.6],
];
// Candy stepping stones from the promenade to each new corner (decals, walkable)
export const MELODY_PATH_STONES: Vec2[] = [
  // Round the Friendship Monument, then on south to the teacups
  [-2.9, 48.6], [-3.75, 51.2], [-2.9, 53.8], [2.9, 48.6], [3.75, 51.2], [2.9, 53.8], [0, 56.4], [0, 58.6],
  // West to the Strawberry Garden & the jelly pads
  [-7.4, 39.0], [-9.8, 39.1], [-12.2, 39.8], [-14.2, 40.6], [-14.4, 43.0],
  // East to the Moon Swing & the star trampolines
  [7.4, 39.0], [9.8, 39.1], [12.2, 39.8], [14.2, 40.6], [14.4, 43.0],
  // South-west to the Ferris Wheel's heart pad, south-east to the skate rink
  [-2.6, 58.9], [-5.0, 59.9], [-7.4, 60.5], [-9.9, 60.8],
  [2.6, 58.9], [5.0, 59.8], [7.3, 60.4],
];
export const MELODY_FLOWER_SPOTS: FlowerSpot[] = [
  { pos: [-19.6, 0, 44.2], color: "#ff6eb4" },
  { pos: [-13.2, 0, 33.0], color: "#fde047" },
  { pos: [-19.4, 0, 52.6], color: "#fda4af" },
  { pos: [-16.4, 0, 69.4], color: "#ff85c0" },
  { pos: [-4.6, 0, 67.2], color: "#fde047" },
  { pos: [-8.2, 0, 66.6], color: "#f9a8d4" },
  { pos: [19.6, 0, 44.2], color: "#c084fc" },
  { pos: [13.2, 0, 33.0], color: "#fde047" },
  { pos: [19.4, 0, 52.6], color: "#d8b4fe" },
  { pos: [16.4, 0, 69.4], color: "#a855f7" },
  { pos: [4.6, 0, 67.2], color: "#fde047" },
  { pos: [8.2, 0, 66.6], color: "#e9d5ff" },
];
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
  // Expansion: corners and the south fence
  { pos: [-19.6, 0, 30.6], color: "#fda4af", scale: 1.15 },
  { pos: [19.6, 0, 30.6], color: "#e9d5ff", scale: 1.15 },
  { pos: [-19.4, 0, 56.2], color: "#ff85c0", scale: 1.25 },
  { pos: [19.4, 0, 56.2], color: "#c084fc", scale: 1.25 },
  { pos: [-19.4, 0, 69.8], color: "#fbcfe8", scale: 1.2 },
  { pos: [19.4, 0, 69.8], color: "#a855f7", scale: 1.2 },
  { pos: [-6.4, 0, 69.6], color: "#ff6eb4", scale: 1.1 },
  { pos: [6.4, 0, 69.6], color: "#d8b4fe", scale: 1.1 },
];

export const MELODY_LOLLIPOP_SPOTS: LollipopSpot[] = [
  { pos: [-11.8, 0, 37.2], color: "#ff6eb4", scale: 1.18 },
  { pos: [11.8, 0, 37.2], color: "#c084fc", scale: 1.18 },
  { pos: [-11.8, 0, 48.2], color: "#fde047", scale: 1.12 },
  { pos: [11.8, 0, 48.2], color: "#f472b6", scale: 1.12 },
  { pos: [-9.6, 0, 56.8], color: "#7dd3fc", scale: 1.15 },
  { pos: [9.6, 0, 56.8], color: "#fde047", scale: 1.15 },
  { pos: [-2.8, 0, 69.8], color: "#f472b6", scale: 1.05 },
  { pos: [2.8, 0, 69.8], color: "#c084fc", scale: 1.05 },
];

export const MELODY_LAMP_SPOTS: Vec3[] = [
  [-3.0, 0, 30.8],
  [3.0, 0, 30.8],
  [-3.0, 0, 39.2],
  [3.0, 0, 39.2],
  [-5.0, 0, 49.6],
  [5.0, 0, 49.6],
  [-2.8, 0, 57.4],
  [2.8, 0, 57.4],
  [-17.0, 0, 42.6],
  [17.0, 0, 42.6],
];

export const MELODY_GIFT_SPOTS: GiftSpot[] = [
  { pos: [-4.6, 0, 55.6], scale: 1.15, boxColor: "#ff85c0", ribbonColor: "#fde047" },
  { pos: [4.6, 0, 55.6], scale: 1.15, boxColor: "#c084fc", ribbonColor: "#ff6eb4" },
  { pos: [-9.8, 0, 49.4], scale: 1.05, boxColor: "#fbcfe8", ribbonColor: "#ff6eb4" },
  { pos: [9.8, 0, 49.4], scale: 1.05, boxColor: "#d8b4fe", ribbonColor: "#fde047" },
  { pos: [-16.6, 0, 30.4], scale: 1.0, boxColor: "#fde047", ribbonColor: "#ff6eb4" },
  { pos: [16.6, 0, 30.4], scale: 1.0, boxColor: "#7dd3fc", ribbonColor: "#c084fc" },
  { pos: [-10.2, 0, 68.8], scale: 1.05, boxColor: "#ff85c0", ribbonColor: "#ffffff" },
  { pos: [10.2, 0, 68.8], scale: 1.05, boxColor: "#c084fc", ribbonColor: "#fde047" },
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
  // Frozen Land expansion: Ice Slide tower, igloos, penguin family, snow bunnies, rocks, drifts & little trees
  ...FROZEN_EXPANSION_OBSTACLES,
  // Dinosaur Land: Friendly Dinosaurs
  { x: DINO_BRONTO_POS[0], z: DINO_BRONTO_POS[2], r: 1.35 },
  ...[1.55, -1.55].map((d) => ({
    x: DINO_BRONTO_POS[0] + Math.sin(DINO_BRONTO_YAW) * d,
    z: DINO_BRONTO_POS[2] + Math.cos(DINO_BRONTO_YAW) * d,
    r: 0.9,
  })),
  { x: DINO_TRIKE_POS[0], z: DINO_TRIKE_POS[2], r: 1.05 },
  { x: DINO_STEGO_POS[0], z: DINO_STEGO_POS[2], r: 1.05 },
  // Dinosaur Land: Friendly Bubble Volcano & Dino Egg Nest
  { x: DINO_VOLCANO_POS[0], z: DINO_VOLCANO_POS[2], r: 2.65 },
  { x: DINO_NEST_POS[0], z: DINO_NEST_POS[2], r: 1.35 },
  // Dinosaur Land: Tropical Palm Trees
  ...DINO_PALM_SPOTS.map((tr) => ({ x: tr.pos[0], z: tr.pos[2], r: 0.42 * tr.scale })),
  // Dinosaur Land: Jungle Lanterns
  ...DINO_LANTERN_SPOTS.map(([x, , z]) => ({ x, z, r: 0.32 })),
  // Dinosaur Land expansion (the Triceratops, Big Blue, Baby Pink & the fossil plinth are CAPSULE_OBSTACLES):
  // picnic basket & cake in the middle of the blanket
  { x: DINO_PICNIC_POS[0], z: DINO_PICNIC_POS[2], r: 0.55 },
  // Giant ferns & spotted mushrooms
  ...DINO_FERN_SPOTS.map((f) => ({ x: f.pos[0], z: f.pos[2], r: 0.5 * f.scale })),
  ...DINO_MUSHROOM_SPOTS.map((m) => ({ x: m.pos[0], z: m.pos[2], r: 0.42 })),
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
  // My Melody & Kuromi Land expansion (the Ferris Wheel is MELODY_WHEEL_CAPSULE): Strawberry Garden bed,
  // Kuromi's Moon Swing & the Teacup Twirl turntable
  { x: MELODY_STRAWBERRY_GARDEN_POS[0], z: MELODY_STRAWBERRY_GARDEN_POS[2], r: MELODY_STRAWBERRY_GARDEN_R + 0.1 },
  { x: KUROMI_MOON_SWING_POS[0], z: KUROMI_MOON_SWING_POS[2], r: 2.1 },
  { x: MELODY_TEACUPS_POS[0], z: MELODY_TEACUPS_POS[2], r: MELODY_TEACUPS_R },
];
