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
  ExtrudedHeart3D,
} from "./MagicalDecor3D";
import { playPopSound, playSparkleSound, playVictoryFanfare } from "@/lib/soundEffects";
import { t } from "@/config/translate";

const TARGET_TREATS = 15;

type TreatKind = "cupcake" | "star" | "strawberry" | "gem" | "macaron";

interface FallingTreat {
  id: number;
  xNorm: number; // -1 to 1 normalized so treats always fall within the visible viewport
  y: number;
  speed: number;
  kind: TreatKind;
}

const TREAT_KINDS: TreatKind[] = ["cupcake", "star", "strawberry", "gem", "macaron"];

function spawnTreat(id: number, startY = 4.2): FallingTreat {
  return {
    id,
    xNorm: (Math.random() - 0.5) * 1.72,
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

  // Glowing Golden Fairy Star + tiny floating inner sparkle
  return (
    <group scale={1.1}>
      <ExtrudedStar3D scale={0.98} color="#fde047" emissive="#f59e0b" emissiveIntensity={0.55} />
      <ExtrudedHeart3D position={[0, 0, 0.11]} scale={0.28} color="#ff6eb4" />
    </group>
  );
}

function CatcherWorld({
  targetNormXRef,
  won,
  onCatch,
}: {
  targetNormXRef: React.MutableRefObject<number>; // normalized -1 to 1
  won: boolean;
  onCatch: (kind: TreatKind) => void;
}) {
  const { viewport } = useThree();
  const isNarrow = viewport.width < 6.0;
  const playLimitX = Math.max(1.25, Math.min(3.1, viewport.width / 2 - 0.65));
  const unicornScale = isNarrow ? 0.68 : 0.85;
  const treatScale = isNarrow ? 0.86 : 1;

  const unicornGroupRef = useRef<THREE.Group>(null);
  const unicornXRef = useRef(0);
  const treatRefs = useRef<(THREE.Group | null)[]>([]);
  const treatsDataRef = useRef<FallingTreat[]>(
    Array.from({ length: 3 }, (_, i) => spawnTreat(i + 1, 3.4 + i * 2.5))
  );

  useEffect(() => {
    if (!won) {
      treatsDataRef.current = Array.from({ length: 3 }, (_, i) =>
        spawnTreat(i + 1, 3.4 + i * 2.5)
      );
    }
  }, [won]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    const targetX = THREE.MathUtils.clamp(targetNormXRef.current, -1, 1) * playLimitX;
    unicornXRef.current = THREE.MathUtils.lerp(unicornXRef.current, targetX, Math.min(1, dt * 10));

    if (unicornGroupRef.current) {
      unicornGroupRef.current.position.x = unicornXRef.current;
      const vel = targetX - unicornXRef.current;
      unicornGroupRef.current.rotation.z = THREE.MathUtils.clamp(-vel * 0.14, -0.22, 0.22);
    }

    if (won) return;

    const catchRadiusX = isNarrow ? 0.85 : 1.05;
    treatsDataRef.current.forEach((treat, idx) => {
      treat.y -= treat.speed * dt;
      const worldX = treat.xNorm * playLimitX;
      const mesh = treatRefs.current[idx];

      const dx = Math.abs(worldX - unicornXRef.current);
      const dy = Math.abs(treat.y - -1.45);
      if (dx < catchRadiusX && dy < 0.95) {
        onCatch(treat.kind);
        const respawned = spawnTreat(treat.id, 3.8);
        treat.xNorm = respawned.xNorm;
        treat.y = respawned.y;
        treat.speed = respawned.speed;
      } else if (treat.y < -3.3) {
        const respawned = spawnTreat(treat.id, 3.8);
        treat.xNorm = respawned.xNorm;
        treat.y = respawned.y;
        treat.speed = respawned.speed;
      }

      if (mesh) {
        mesh.position.set(worldX, treat.y, 0);
        mesh.rotation.y = state.clock.elapsedTime * 2 + idx;
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
        treatsDataRef.current.map((treat, idx) => (
          <group
            key={treat.id}
            ref={(el) => {
              treatRefs.current[idx] = el;
            }}
            position={[treat.xNorm * playLimitX, treat.y, 0]}
            scale={treatScale}
          >
            <TreatMesh3D kind={treat.kind} />
          </group>
        ))}

      <Sparkles count={40} scale={[playLimitX * 2.4, 6, 4]} size={4} speed={0.4} color="#fef08a" />
    </>
  );
}

export function UnicornCatchGame3D() {
  const [caught, setCaught] = useState(0);
  const [won, setWon] = useState(false);
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

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    targetNormXRef.current = Math.max(-1, Math.min(1, normX));
  };

  const handleCatch = (kind: TreatKind) => {
    if (kind === "star" || kind === "gem") {
      playSparkleSound();
    } else {
      playPopSound(1.15);
    }

    setCaught((prev) => {
      const next = prev + 1;
      if (next >= TARGET_TREATS) {
        setWon(true);
        playVictoryFanfare();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.55 },
          colors: ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"],
        });
      }
      return next;
    });
  };

  const handleRestart = () => {
    setCaught(0);
    setWon(false);
    targetNormXRef.current = 0;
  };

  const nudgeLeft = () => {
    targetNormXRef.current = Math.max(-1, targetNormXRef.current - 0.32);
  };

  const nudgeRight = () => {
    targetNormXRef.current = Math.min(1, targetNormXRef.current + 0.32);
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
        <Canvas camera={{ position: [0, 0.2, 7.2], fov: 48 }} dpr={[1, 2]}>
          <CatcherWorld targetNormXRef={targetNormXRef} won={won} onCatch={handleCatch} />
        </Canvas>

        {/* Big touch buttons for little fingers (dir="ltr" keeps Left on left & Right on right) */}
        {!won && (
          <div
            dir="ltr"
            className="pointer-events-none absolute inset-x-2.5 top-1/2 flex -translate-y-1/2 items-center justify-between sm:inset-x-3"
          >
            <button
              type="button"
              onClick={nudgeLeft}
              aria-label={t.unicornGame.moveLeftAria}
              className="pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white/80 text-purple-800 shadow-lg backdrop-blur transition hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
            >
              <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
            <button
              type="button"
              onClick={nudgeRight}
              aria-label={t.unicornGame.moveRightAria}
              className="pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white/80 text-purple-800 shadow-lg backdrop-blur transition hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
            >
              <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
          </div>
        )}

        {/* Win Celebration Overlay */}
        {won && (
          <div className="absolute inset-x-3 top-6 z-20 flex flex-col items-center text-center sm:inset-x-4 sm:top-8">
            <div className="kawaii-card max-w-sm rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                <Crown className="h-4 w-4 fill-amber-400 text-amber-500" />
                {t.unicornGame.winBadge}
              </div>
              <h2 className="font-display mb-2 text-2xl font-bold text-purple-900 sm:text-3xl">
                {t.unicornGame.winTitle}
              </h2>
              <p className="mb-4 text-sm font-bold text-purple-700">
                {t.unicornGame.winMessage(TARGET_TREATS)}
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="font-display inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2.5 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
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
