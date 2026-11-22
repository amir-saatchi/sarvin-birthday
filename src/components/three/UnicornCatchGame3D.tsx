"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { ChevronLeft, ChevronRight, Crown, RotateCcw, Sparkles as SparklesIcon } from "lucide-react";
import { RainbowArch3D, FluffyCloud3D, CuteUnicorn3D } from "./MagicalDecor3D";
import { playPopSound, playSparkleSound, playVictoryFanfare } from "@/lib/soundEffects";

const TARGET_TREATS = 15;
const PLAY_LIMIT_X = 3.1;

type TreatKind = "cupcake" | "star" | "strawberry" | "gem";

interface FallingTreat {
  id: number;
  x: number;
  y: number;
  speed: number;
  kind: TreatKind;
}

const TREAT_KINDS: TreatKind[] = ["cupcake", "star", "strawberry", "gem"];

function spawnTreat(id: number, startY = 4.2): FallingTreat {
  return {
    id,
    x: (Math.random() - 0.5) * (PLAY_LIMIT_X * 1.9),
    y: startY + Math.random() * 2.2,
    speed: 1.55 + Math.random() * 0.75,
    kind: TREAT_KINDS[Math.floor(Math.random() * TREAT_KINDS.length)],
  };
}

function TreatMesh3D({ kind }: { kind: TreatKind }) {
  if (kind === "cupcake") {
    return (
      <group>
        {/* Cupcake wrapper */}
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.24, 0.17, 0.28, 16]} />
          <meshStandardMaterial color="#fde047" roughness={0.4} />
        </mesh>
        {/* Pink frosting swirl */}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.26, 18, 18]} />
          <meshStandardMaterial color="#ff7ab6" roughness={0.3} />
        </mesh>
        {/* Cherry on top */}
        <mesh position={[0, 0.34, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (kind === "strawberry") {
    return (
      <group>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.24, 0.44, 16]} />
          <meshStandardMaterial color="#fb7185" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.22, 0.06, 0.1, 8]} />
          <meshStandardMaterial color="#4ade80" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  if (kind === "gem") {
    return (
      <mesh>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#a855f7"
          emissiveIntensity={0.35}
          metalness={0.3}
          roughness={0.15}
        />
      </mesh>
    );
  }

  // Golden fairy star
  return (
    <group>
      <mesh>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color="#fde047"
          emissive="#f59e0b"
          emissiveIntensity={0.45}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function CatcherWorld({
  targetXRef,
  won,
  onCatch,
}: {
  targetXRef: React.MutableRefObject<number>;
  won: boolean;
  onCatch: (kind: TreatKind) => void;
}) {
  const unicornGroupRef = useRef<THREE.Group>(null);
  const unicornXRef = useRef(0);
  const treatRefs = useRef<(THREE.Group | null)[]>([]);
  const treatsDataRef = useRef<FallingTreat[]>(
    Array.from({ length: 5 }, (_, i) => spawnTreat(i + 1, 3.2 + i * 1.45))
  );

  // Reset treats when replaying after a win
  useEffect(() => {
    if (!won) {
      treatsDataRef.current = Array.from({ length: 5 }, (_, i) =>
        spawnTreat(i + 1, 3.2 + i * 1.45)
      );
    }
  }, [won]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Smoothly glide unicorn toward target X
    const targetX = THREE.MathUtils.clamp(targetXRef.current, -PLAY_LIMIT_X, PLAY_LIMIT_X);
    unicornXRef.current = THREE.MathUtils.lerp(unicornXRef.current, targetX, Math.min(1, dt * 10));

    if (unicornGroupRef.current) {
      unicornGroupRef.current.position.x = unicornXRef.current;
      // Slight joyful tilt in direction of movement
      const vel = targetX - unicornXRef.current;
      unicornGroupRef.current.rotation.z = THREE.MathUtils.clamp(-vel * 0.14, -0.22, 0.22);
    }

    if (won) return;

    // Update falling treats & check catch distance
    treatsDataRef.current.forEach((treat, idx) => {
      treat.y -= treat.speed * dt;
      const mesh = treatRefs.current[idx];

      // Generous catch box around unicorn
      const dx = Math.abs(treat.x - unicornXRef.current);
      const dy = Math.abs(treat.y - -1.45);
      if (dx < 1.05 && dy < 0.95) {
        onCatch(treat.kind);
        const respawned = spawnTreat(treat.id, 3.9);
        treat.x = respawned.x;
        treat.y = respawned.y;
        treat.speed = respawned.speed;
      } else if (treat.y < -3.4) {
        const respawned = spawnTreat(treat.id, 3.9);
        treat.x = respawned.x;
        treat.y = respawned.y;
        treat.speed = respawned.speed;
      }

      if (mesh) {
        mesh.position.set(treat.x, treat.y, 0);
        mesh.rotation.y = state.clock.elapsedTime * 2 + idx;
      }
    });
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 7, 5]} intensity={1.1} />
      <pointLight position={[-3, 3, 2]} intensity={0.6} color="#f472b6" />

      <RainbowArch3D position={[0, -1.5, -4.2]} scale={1.55} />
      <FluffyCloud3D position={[-4, 2.3, -3]} scale={0.95} tint="#ffffff" />
      <FluffyCloud3D position={[4, 2.0, -2.8]} scale={1.0} tint="#fff0f7" />

      {/* Unicorn riding a fluffy pastel cloud */}
      <group ref={unicornGroupRef} position={[0, -1.95, 0]}>
        <FluffyCloud3D position={[0, -0.32, 0]} scale={0.95} speed={0.4} tint="#ffffff" />
        <CuteUnicorn3D position={[0, 0.05, 0]} scale={0.85} celebrating={won} />
      </group>

      {/* Falling 3D treats */}
      {!won &&
        treatsDataRef.current.map((treat, idx) => (
          <group
            key={treat.id}
            ref={(el) => {
              treatRefs.current[idx] = el;
            }}
            position={[treat.x, treat.y, 0]}
          >
            <TreatMesh3D kind={treat.kind} />
          </group>
        ))}

      <Sparkles count={45} scale={[9, 6, 4]} size={4} speed={0.4} color="#fef08a" />
    </>
  );
}

export function UnicornCatchGame3D() {
  const [caught, setCaught] = useState(0);
  const [won, setWon] = useState(false);
  const targetXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard support (Left/Right arrows or A/D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        targetXRef.current = Math.max(-PLAY_LIMIT_X, targetXRef.current - 0.65);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        targetXRef.current = Math.min(PLAY_LIMIT_X, targetXRef.current + 0.65);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    targetXRef.current = normX * PLAY_LIMIT_X;
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
    targetXRef.current = 0;
  };

  const nudgeLeft = () => {
    targetXRef.current = Math.max(-PLAY_LIMIT_X, targetXRef.current - 0.9);
  };

  const nudgeRight = () => {
    targetXRef.current = Math.min(PLAY_LIMIT_X, targetXRef.current + 0.9);
  };

  const pct = Math.min(100, Math.round((caught / TARGET_TREATS) * 100));

  return (
    <div className="w-full">
      {/* Kid-friendly HUD */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-white/90 bg-white/85 px-4 py-3 shadow-md backdrop-blur">
        <div className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5">
          <SparklesIcon className="h-5 w-5 text-pink-500" />
          <span className="font-display text-lg font-bold text-purple-900">
            Treats: {caught} / {TARGET_TREATS}
          </span>
        </div>

        <div className="flex min-w-[160px] flex-1 items-center gap-2 sm:max-w-xs">
          <div className="h-4 w-full overflow-hidden rounded-full bg-purple-100 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-sky-400 transition-all duration-300"
              style={{ width: `${Math.max(6, pct)}%` }}
            />
          </div>
          <Crown className={`h-5 w-5 ${won ? "fill-amber-400 text-amber-500" : "text-purple-300"}`} />
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="font-display inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-purple-50 px-3.5 py-2 text-sm font-bold text-purple-700 transition hover:bg-purple-100 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </button>
      </div>

      {/* 3D Play Arena */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        className="relative h-[470px] w-full touch-none overflow-hidden rounded-[2rem] border-4 border-white/90 bg-gradient-to-b from-indigo-200/80 via-pink-100/80 to-purple-200/85 shadow-2xl shadow-purple-300/40 sm:h-[540px]"
      >
        <Canvas camera={{ position: [0, 0.2, 7.2], fov: 48 }} dpr={[1, 2]}>
          <CatcherWorld targetXRef={targetXRef} won={won} onCatch={handleCatch} />
        </Canvas>

        {/* Big touch buttons for little fingers (positioned mid-height to never overlap bottom-right music bar) */}
        {!won && (
          <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center justify-between">
            <button
              type="button"
              onClick={nudgeLeft}
              aria-label="Move unicorn left"
              className="pointer-events-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white/80 text-purple-800 shadow-lg backdrop-blur transition hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              type="button"
              onClick={nudgeRight}
              aria-label="Move unicorn right"
              className="pointer-events-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white/80 text-purple-800 shadow-lg backdrop-blur transition hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>
        )}

        {/* Win Celebration Overlay */}
        {won && (
          <div className="absolute inset-x-4 top-8 z-20 flex flex-col items-center text-center">
            <div className="kawaii-card max-w-sm rounded-[2rem] p-6">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                <Crown className="h-4 w-4 fill-amber-400 text-amber-500" />
                PRINCESS UNICORN WINNER!
              </div>
              <h2 className="font-display mb-2 text-2xl font-bold text-purple-900 sm:text-3xl">
                Hooray, Sarvin!
              </h2>
              <p className="mb-4 text-sm font-bold text-purple-700">
                You caught all {TARGET_TREATS} magical birthday treats! Look at your dancing unicorn!
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="font-display inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2.5 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                Play Again!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
