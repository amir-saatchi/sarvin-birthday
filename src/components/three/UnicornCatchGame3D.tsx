"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { ChevronLeft, ChevronRight, Crown, RotateCcw, Sparkles as SparklesIcon } from "lucide-react";
import {
  RainbowArch3D,
  FluffyCloud3D,
  CuteUnicorn3D,
  FairyCastle3D,
  ExtrudedStar3D,
} from "./MagicalDecor3D";
import { playPopSound, playSparkleSound, playVictoryFanfare } from "@/lib/soundEffects";
import { t } from "@/config/translate";

const TARGET_TREATS = 15;
// Only two treats in the air at once, so she has to chase each one
const TREAT_SLOTS = 2;
// Widest spawn spread (normalized -1..1)
const SPAWN_SPREAD = 0.86;
// How far outside the catch radius (world units) a new treat must land, so standing still never wins
const SPAWN_MARGIN = 0.35;

type TreatKind = "cupcake" | "star" | "strawberry" | "gem" | "macaron";

interface FallingTreat {
  id: number;
  xNorm: number; // -1 to 1 normalized so treats always fall within the visible viewport
  y: number;
  speed: number;
  kind: TreatKind;
}

const TREAT_KINDS: TreatKind[] = ["cupcake", "star", "strawberry", "gem", "macaron"];

// Random x that keeps at least minGap (normalized) clear of the unicorn at avoidNorm. Tries a few
// random spots and falls back to the farthest one, so it always returns something on screen.
function pickTreatX(avoidNorm: number, minGap: number) {
  let best = 0;
  let bestGap = -1;
  for (let i = 0; i < 8; i++) {
    const x = (Math.random() * 2 - 1) * SPAWN_SPREAD;
    const gap = Math.abs(x - avoidNorm);
    if (gap >= minGap) return x;
    if (gap > bestGap) {
      bestGap = gap;
      best = x;
    }
  }
  return best;
}

function spawnTreat(id: number, startY: number, avoidNorm: number, minGap: number): FallingTreat {
  return {
    id,
    xNorm: pickTreatX(avoidNorm, minGap),
    y: startY + Math.random() * 1.8,
    speed: 2.55 + Math.random() * 1.0,
    kind: TREAT_KINDS[Math.floor(Math.random() * TREAT_KINDS.length)],
  };
}

const CUPCAKE_SPRINKLES: { pos: [number, number, number]; rot: [number, number, number]; color: string }[] = [
  { pos: [0.22, 0.12, 0.14], rot: [0.4, 0.2, 0.8], color: "#fde047" },
  { pos: [-0.21, 0.14, 0.14], rot: [0.6, 0.8, 0.2], color: "#7dd3fc" },
  { pos: [0.06, 0.15, 0.25], rot: [0.2, 0.5, 1.1], color: "#c084fc" },
  { pos: [-0.08, 0.11, -0.24], rot: [0.9, 0.3, 0.4], color: "#6ee7b7" },
  { pos: [0.2, 0.13, -0.15], rot: [0.3, 1.0, 0.5], color: "#ffffff" },
  { pos: [-0.22, 0.12, -0.1], rot: [0.7, 0.4, 0.9], color: "#fde047" },
];

const STRAWBERRY_SEEDS: [number, number, number][] = [
  [0.16, 0.08, 0.14],
  [-0.16, 0.08, 0.14],
  [0, 0.06, 0.21],
  [0.12, -0.06, 0.11],
  [-0.12, -0.06, 0.11],
  [0, -0.08, 0.15],
  [0.16, 0.08, -0.14],
  [-0.16, 0.08, -0.14],
  [0, 0.06, -0.21],
  [0.1, -0.07, -0.12],
  [-0.1, -0.07, -0.12],
];

function TreatMesh3D({ kind }: { kind: TreatKind }) {
  if (kind === "cupcake") {
    return (
      <group scale={1.12}>
        {/* Fluted golden cupcake liner + scalloped collar */}
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.25, 0.17, 0.28, 14]} />
          <meshPhysicalMaterial color="#fde047" roughness={0.32} clearcoat={0.35} />
        </mesh>
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.035, 10, 20]} />
          <meshStandardMaterial color="#fef08a" roughness={0.35} />
        </mesh>
        {/* 3-tier whipped strawberry & cream frosting swirl */}
        <mesh position={[0, 0.07, 0]} scale={[1.08, 0.72, 1.08]}>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshPhysicalMaterial color="#ff7ab6" roughness={0.2} clearcoat={0.65} />
        </mesh>
        <mesh position={[0, 0.2, 0]} scale={[0.92, 0.75, 0.92]}>
          <sphereGeometry args={[0.2, 18, 18]} />
          <meshPhysicalMaterial color="#fbcfe8" roughness={0.2} clearcoat={0.65} />
        </mesh>
        <mesh position={[0, 0.31, 0]}>
          <coneGeometry args={[0.12, 0.14, 16]} />
          <meshPhysicalMaterial color="#fff5fa" roughness={0.22} clearcoat={0.6} />
        </mesh>
        {/* Colorful 3D sprinkles */}
        {CUPCAKE_SPRINKLES.map((s, i) => (
          <mesh key={i} position={s.pos} rotation={s.rot}>
            <capsuleGeometry args={[0.018, 0.048, 4, 8]} />
            <meshStandardMaterial color={s.color} roughness={0.25} />
          </mesh>
        ))}
        {/* Glossy red cherry + green stem */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshPhysicalMaterial color="#f43f5e" roughness={0.1} clearcoat={1} />
        </mesh>
        <mesh position={[0.03, 0.5, 0]} rotation={[0, 0, -0.35]}>
          <cylinderGeometry args={[0.012, 0.012, 0.13, 6]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      </group>
    );
  }

  if (kind === "strawberry") {
    return (
      <group scale={1.12}>
        {/* Plump glossy berry body */}
        <mesh position={[0, 0.08, 0]} scale={[1, 0.88, 1]}>
          <sphereGeometry args={[0.23, 20, 20]} />
          <meshPhysicalMaterial color="#fb4b6a" roughness={0.16} clearcoat={0.85} />
        </mesh>
        <mesh position={[0, -0.07, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.215, 0.32, 20]} />
          <meshPhysicalMaterial color="#fb4b6a" roughness={0.16} clearcoat={0.85} />
        </mesh>
        {/* Tiny golden strawberry seeds */}
        {STRAWBERRY_SEEDS.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color="#fef08a" roughness={0.35} />
          </mesh>
        ))}
        {/* 5-leaf green calyx crown + stem */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={`leaf-${i}`}
              position={[Math.cos(a) * 0.11, 0.25, Math.sin(a) * 0.11]}
              rotation={[0.35 * Math.sin(a), -a, -0.35 * Math.cos(a)]}
              scale={[1.4, 0.3, 0.7]}
            >
              <sphereGeometry args={[0.09, 10, 10]} />
              <meshStandardMaterial color="#22c55e" roughness={0.4} />
            </mesh>
          );
        })}
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.022, 0.028, 0.14, 8]} />
          <meshStandardMaterial color="#16a34a" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  if (kind === "macaron") {
    return (
      <group rotation={[0.3, 0, 0.2]} scale={1.15}>
        {/* Top glossy cookie shell + ruffled macaron foot */}
        <mesh position={[0, 0.11, 0]} scale={[1, 0.52, 1]}>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshPhysicalMaterial color="#7dd3fc" roughness={0.18} clearcoat={0.75} />
        </mesh>
        <mesh position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.24, 0.032, 10, 22]} />
          <meshStandardMaterial color="#bae6fd" roughness={0.45} />
        </mesh>
        {/* Creamy pink buttercream filling */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.1, 20]} />
          <meshPhysicalMaterial color="#ffe4f3" roughness={0.3} clearcoat={0.3} />
        </mesh>
        {/* Bottom ruffled foot + cookie shell */}
        <mesh position={[0, -0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.24, 0.032, 10, 22]} />
          <meshStandardMaterial color="#bae6fd" roughness={0.45} />
        </mesh>
        <mesh position={[0, -0.11, 0]} scale={[1, 0.52, 1]}>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshPhysicalMaterial color="#7dd3fc" roughness={0.18} clearcoat={0.75} />
        </mesh>
        {/* Cute golden sugar pearl on top */}
        <mesh position={[0, 0.24, 0]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#fde047" metalness={0.5} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (kind === "gem") {
    // Sprinkled Frosted Strawberry Donut!
    return (
      <group rotation={[0.45, 0, 0.2]} scale={1.12}>
        {/* Golden baked dough ring */}
        <mesh>
          <torusGeometry args={[0.24, 0.125, 18, 28]} />
          <meshPhysicalMaterial color="#f59e0b" roughness={0.42} clearcoat={0.15} />
        </mesh>
        {/* Glossy strawberry-pink icing glaze on top */}
        <mesh position={[0, 0, 0.035]}>
          <torusGeometry args={[0.24, 0.105, 16, 28]} />
          <meshPhysicalMaterial color="#ff6eb4" roughness={0.15} clearcoat={0.9} />
        </mesh>
        {/* Colorful sprinkles on the donut glaze */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          const colors = ["#fde047", "#7dd3fc", "#ffffff", "#c084fc", "#6ee7b7", "#fde047"];
          return (
            <mesh
              key={`ds-${i}`}
              position={[Math.cos(a) * 0.24, Math.sin(a) * 0.24, 0.13]}
              rotation={[0.2, 0.3, a + 0.5]}
            >
              <capsuleGeometry args={[0.02, 0.055, 4, 8]} />
              <meshStandardMaterial color={colors[i]} roughness={0.25} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // Glowing Golden Fairy Star
  return (
    <group scale={1.1}>
      <ExtrudedStar3D scale={0.98} color="#fde047" emissive="#f59e0b" emissiveIntensity={0.55} />
    </group>
  );
}

function CatcherWorld({
  targetNormXRef,
  won,
  progress,
  onCatch,
}: {
  targetNormXRef: React.MutableRefObject<number>; // normalized -1 to 1
  won: boolean;
  progress: number; // 0..1 share of the target caught, used to ramp the fall speed
  onCatch: (kind: TreatKind) => void;
}) {
  const { viewport } = useThree();
  const isNarrow = viewport.width < 6.0;
  const playLimitX = Math.max(1.25, Math.min(3.1, viewport.width / 2 - 0.65));
  const unicornScale = isNarrow ? 0.68 : 0.85;
  const treatScale = isNarrow ? 0.86 : 1;
  const catchRadiusX = isNarrow ? 0.85 : 1.05;
  // Normalized gap that puts a new treat outside the catch radius (plus a margin)
  const spawnGap = (catchRadiusX + SPAWN_MARGIN) / playLimitX;

  const unicornGroupRef = useRef<THREE.Group>(null);
  const unicornXRef = useRef(0);
  const treatRefs = useRef<(THREE.Group | null)[]>([]);
  // Positions, speeds and kinds live in a ref and are updated per frame. Every slot keeps one
  // mesh of each kind mounted and only toggles which one is visible, so a respawn never causes a
  // React re-render or rebuilds geometry mid-game.
  const [initialTreats] = useState<FallingTreat[]>(() =>
    Array.from({ length: TREAT_SLOTS }, (_, i) => spawnTreat(i + 1, 3.4 + i * 3.2, 0, spawnGap))
  );
  const treatsDataRef = useRef<FallingTreat[]>(initialTreats);
  const wasWonRef = useRef(false);
  const catchAtRef = useRef(-1);

  const respawnTreat = (treat: FallingTreat) => {
    // Land away from where the unicorn is now, so she has to move for the next one
    const respawned = spawnTreat(treat.id, 3.8, unicornXRef.current / playLimitX, spawnGap);
    treat.xNorm = respawned.xNorm;
    treat.y = respawned.y;
    treat.speed = respawned.speed;
    treat.kind = respawned.kind;
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    const targetX = THREE.MathUtils.clamp(targetNormXRef.current, -1, 1) * playLimitX;
    unicornXRef.current = THREE.MathUtils.lerp(unicornXRef.current, targetX, Math.min(1, dt * 10));

    if (unicornGroupRef.current) {
      unicornGroupRef.current.position.x = unicornXRef.current;
      const vel = targetX - unicornXRef.current;
      unicornGroupRef.current.rotation.z = THREE.MathUtils.clamp(-vel * 0.14, -0.22, 0.22);
      // Happy little hop each time a treat is caught
      const hopT = catchAtRef.current < 0 ? 1 : (state.clock.elapsedTime - catchAtRef.current) / 0.32;
      unicornGroupRef.current.position.y = -1.9 + (hopT < 1 ? Math.sin(hopT * Math.PI) * 0.28 : 0);
    }

    if (won) {
      wasWonRef.current = true;
      return;
    }
    if (wasWonRef.current) {
      // Restart after a win: fresh treats (the slot meshes remount and pick up the new kinds)
      wasWonRef.current = false;
      treatsDataRef.current = Array.from({ length: TREAT_SLOTS }, (_, i) =>
        spawnTreat(i + 1, 3.4 + i * 3.2, unicornXRef.current / playLimitX, spawnGap)
      );
    }

    // Start gentle and speed up a little as she gets closer to the crown
    const speedMul = 0.75 + Math.min(1, progress) * 0.3;
    treatsDataRef.current.forEach((treat, idx) => {
      treat.y -= treat.speed * speedMul * dt;
      const worldX = treat.xNorm * playLimitX;
      const slot = treatRefs.current[idx];

      const dx = Math.abs(worldX - unicornXRef.current);
      const dy = Math.abs(treat.y - -1.45);
      if (dx < catchRadiusX && dy < 0.95) {
        onCatch(treat.kind);
        catchAtRef.current = state.clock.elapsedTime;
        respawnTreat(treat);
      } else if (treat.y < -3.3) {
        respawnTreat(treat);
      }

      if (slot) {
        slot.position.set(worldX, treat.y, 0);
        slot.rotation.y = state.clock.elapsedTime * 2 + idx;
        const kinds = slot.children;
        for (let k = 0; k < kinds.length; k++) kinds[k].visible = TREAT_KINDS[k] === treat.kind;
      }
    });
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#fff5fa", "#e9d5ff", 0.6]} />
      <directionalLight position={[4, 7, 5]} intensity={1.2} />
      <pointLight position={[-3, 3, 2]} intensity={0.6} color="#f472b6" />

      <FairyCastle3D position={[0, -1.5, -5.8]} scale={isNarrow ? 0.58 : 0.85} />
      <RainbowArch3D position={[0, -1.5, -4.2]} scale={isNarrow ? 1.0 : 1.5} />
      <FluffyCloud3D
        position={[-playLimitX * 1.15, 2.2, -3]}
        scale={isNarrow ? 0.68 : 0.95}
        tint="#ffffff"
      />
      <FluffyCloud3D
        position={[playLimitX * 1.15, 1.9, -2.8]}
        scale={isNarrow ? 0.72 : 1.0}
        tint="#fff0f7"
      />

      {/* Unicorn riding a fluffy pastel cloud */}
      <group ref={unicornGroupRef} position={[0, -1.9, 0]}>
        <FluffyCloud3D
          position={[0, -0.32, 0]}
          scale={isNarrow ? 0.76 : 0.95}
          speed={0.4}
          tint="#ffffff"
        />
        <CuteUnicorn3D position={[0, 0.05, 0]} scale={unicornScale} celebrating={won} />
      </group>

      {/* Falling 3D treats */}
      {!won &&
        Array.from({ length: TREAT_SLOTS }, (_, idx) => (
          <group
            key={idx}
            ref={(el) => {
              treatRefs.current[idx] = el;
            }}
            // Parked above the view until the first frame positions it (avoids a flash at the origin)
            position={[0, 10, 0]}
            scale={treatScale}
          >
            {/* One child per kind, in TREAT_KINDS order; useFrame shows only the slot's current kind */}
            {TREAT_KINDS.map((kind) => (
              <group key={kind}>
                <TreatMesh3D kind={kind} />
              </group>
            ))}
          </group>
        ))}

      <Sparkles count={40} scale={[playLimitX * 2.4, 6, 4]} size={4} speed={0.4} color="#fef08a" />
    </>
  );
}

// Big arrow button: a tap nudges the unicorn, and holding keeps it gliding until the finger lifts
function HoldArrowButton({
  dir,
  targetNormXRef,
  ariaLabel,
  children,
}: {
  dir: -1 | 1;
  targetNormXRef: React.MutableRefObject<number>;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const holdTimerRef = useRef<number | null>(null);

  const stopHold = () => {
    if (holdTimerRef.current !== null) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // The button unmounts on a win or when leaving the page, when no pointer-up arrives
  useEffect(
    () => () => {
      if (holdTimerRef.current !== null) window.clearInterval(holdTimerRef.current);
    },
    []
  );

  const nudge = (amount: number) => {
    targetNormXRef.current = Math.max(-1, Math.min(1, targetNormXRef.current + dir * amount));
  };

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        // Keep the arena's drag-to-follow handler from jumping the unicorn to the button
        e.stopPropagation();
        stopHold();
        nudge(0.22);
        holdTimerRef.current = window.setInterval(() => nudge(0.07), 70);
      }}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={() => stopHold()}
      onPointerLeave={() => stopHold()}
      onPointerCancel={() => stopHold()}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={ariaLabel}
      className="pointer-events-auto flex h-14 w-14 cursor-pointer touch-none items-center justify-center rounded-full border-2 border-white bg-white/80 text-purple-800 shadow-lg backdrop-blur transition select-none hover:scale-105 active:scale-95"
    >
      {children}
    </button>
  );
}

export function UnicornCatchGame3D() {
  const [caught, setCaught] = useState(0);
  const won = caught >= TARGET_TREATS;
  // Running count kept in a ref so two catches in one frame can't both pass the target
  const caughtRef = useRef(0);
  const targetNormXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        targetNormXRef.current = Math.max(-1, targetNormXRef.current - 0.24);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        targetNormXRef.current = Math.min(1, targetNormXRef.current + 0.24);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Win celebration fires once per round, when the count reaches the target
  useEffect(() => {
    if (!won) return;
    playVictoryFanfare();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.55 },
      colors: ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"],
    });
  }, [won]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    targetNormXRef.current = Math.max(-1, Math.min(1, normX));
  };

  const handleCatch = (kind: TreatKind) => {
    if (caughtRef.current >= TARGET_TREATS) return;
    caughtRef.current += 1;

    if (kind === "star" || kind === "gem") {
      playSparkleSound();
    } else {
      playPopSound(1.15);
    }

    setCaught(caughtRef.current);
  };

  const handleRestart = () => {
    caughtRef.current = 0;
    setCaught(0);
    targetNormXRef.current = 0;
  };


  const pct = Math.min(100, Math.round((caught / TARGET_TREATS) * 100));

  return (
    <div className="game-stage-root w-full">
      {/* Compact mobile-friendly HUD */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-white/90 bg-white/85 px-3 py-2 shadow-md backdrop-blur sm:mb-4 sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-3">
        <div className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 sm:gap-2 sm:px-4 sm:py-1.5">
          <SparklesIcon className="h-4 w-4 text-pink-500 sm:h-5 sm:w-5" />
          <span className="font-display text-sm font-bold text-purple-900 sm:text-lg">
            {t.unicornGame.treatsLabel(caught, TARGET_TREATS)}
          </span>
        </div>

        <div className="order-3 flex w-full items-center gap-2 sm:order-none sm:max-w-xs sm:flex-1">
          <div className="h-3 w-full overflow-hidden rounded-full bg-purple-100 p-0.5 sm:h-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-sky-400 transition-all duration-300"
              style={{ width: `${Math.max(6, pct)}%` }}
            />
          </div>
          <Crown className={`h-4 w-4 sm:h-5 sm:w-5 ${won ? "fill-amber-400 text-amber-500" : "text-purple-300"}`} />
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="font-display inline-flex cursor-pointer items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 transition hover:bg-purple-100 active:scale-95 sm:px-3.5 sm:py-2 sm:text-sm"
        >
          <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {t.unicornGame.restart}
        </button>
      </div>

      {/* 3D Play Arena sized to fit inside a single mobile screen */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        className="game-stage-canvas relative h-[58dvh] min-h-[340px] max-h-[540px] w-full touch-none overflow-hidden rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-indigo-200/80 via-pink-100/80 to-purple-200/85 shadow-2xl shadow-purple-300/40 sm:h-[520px] sm:rounded-[2rem]"
      >
        <Canvas camera={{ position: [0, 0.2, 7.2], fov: 48 }} dpr={[1, 1.5]}>
          <CatcherWorld
            targetNormXRef={targetNormXRef}
            won={won}
            progress={caught / TARGET_TREATS}
            onCatch={handleCatch}
          />
        </Canvas>

        {/* Big touch buttons for little fingers (dir="ltr" keeps Left on left & Right on right) */}
        {!won && (
          <div
            dir="ltr"
            className="pointer-events-none absolute inset-x-2.5 top-1/2 flex -translate-y-1/2 items-center justify-between sm:inset-x-3"
          >
            <HoldArrowButton
              dir={-1}
              targetNormXRef={targetNormXRef}
              ariaLabel={t.unicornGame.moveLeftAria}
            >
              <ChevronLeft className="h-8 w-8" />
            </HoldArrowButton>
            <HoldArrowButton
              dir={1}
              targetNormXRef={targetNormXRef}
              ariaLabel={t.unicornGame.moveRightAria}
            >
              <ChevronRight className="h-8 w-8" />
            </HoldArrowButton>
          </div>
        )}

        {/* Win Celebration Overlay */}
        {won && (
          // Small card pinned to the top, so the dancing unicorn below stays in view
          <div className="absolute inset-x-3 top-3 z-20 flex flex-col items-center text-center sm:inset-x-4 sm:top-4">
            <div className="kawaii-card max-w-xs rounded-[1.5rem] px-4 py-3 sm:px-5">
              <h2 className="font-display mb-1 inline-flex items-center gap-1.5 text-xl font-bold text-purple-900 sm:text-2xl">
                <Crown className="h-5 w-5 shrink-0 fill-amber-400 text-amber-500" />
                {t.unicornGame.winTitle}
              </h2>
              <p className="mb-2.5 text-sm font-bold text-purple-700">
                {t.unicornGame.winMessage(TARGET_TREATS)}
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="font-display inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                {t.unicornGame.playAgain}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
