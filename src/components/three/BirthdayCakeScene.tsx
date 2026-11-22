"use client";

import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles, Float } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { RotateCcw, Sparkles as SparklesIcon } from "lucide-react";
import { RainbowArch3D, FluffyCloud3D, CuteUnicorn3D } from "./MagicalDecor3D";
import { playCandleBlowSound, playVictoryFanfare } from "@/lib/soundEffects";
import { BIRTHDAY_CONFIG } from "@/config/birthday";

const CANDLE_COLORS = ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"];

function Candle3D({
  position,
  color,
  isLit,
  onBlow,
}: {
  position: [number, number, number];
  color: string;
  isLit: boolean;
  onBlow: () => void;
}) {
  const flameRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!flameRef.current || !isLit) return;
    const t = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(t * 14 + position[0] * 5) * 0.14;
    flameRef.current.scale.set(
      hovered ? 1.25 : 1,
      (hovered ? 1.35 : 1.1) * flicker,
      hovered ? 1.25 : 1
    );
    flameRef.current.rotation.z = Math.sin(t * 9 + position[2] * 4) * 0.1;
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (isLit) onBlow();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = isLit ? "pointer" : "auto";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Invisible slightly larger hit cylinder so a 5-year-old can easily tap candles */}
      <mesh position={[0, 0.42, 0]} visible={false}>
        <cylinderGeometry args={[0.24, 0.24, 0.9, 10]} />
        <meshBasicMaterial />
      </mesh>

      {/* Candle body */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.075, 0.08, 0.56, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>

      {/* White stripe ring */}
      <mesh position={[0, 0.28, 0]}>
        <torusGeometry args={[0.08, 0.015, 10, 20]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Wick */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
        <meshStandardMaterial color="#3b1d5e" />
      </mesh>

      {/* Glowing flame */}
      {isLit && (
        <group position={[0, 0.72, 0]}>
          <mesh ref={flameRef}>
            <coneGeometry args={[0.085, 0.24, 16]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={2.2}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.075, 14, 14]} />
            <meshStandardMaterial
              color="#fb923c"
              emissive="#f97316"
              emissiveIntensity={1.6}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

function CakeModel({
  litCandles,
  onBlowCandle,
}: {
  litCandles: boolean[];
  onBlowCandle: (index: number) => void;
}) {
  const cakeGroupRef = useRef<THREE.Group>(null);
  const allBlown = litCandles.every((c) => !c);

  const pearlPositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr.push([Math.cos(angle) * 1.48, -0.34, Math.sin(angle) * 1.48]);
    }
    return arr;
  }, []);

  const topPearlPositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr.push([Math.cos(angle) * 1.02, 0.42, Math.sin(angle) * 1.02]);
    }
    return arr;
  }, []);

  const candlePositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      arr.push([Math.cos(angle) * 0.58, 1.05, Math.sin(angle) * 0.58]);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!cakeGroupRef.current) return;
    cakeGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.18;
  });

  return (
    <group ref={cakeGroupRef} position={[0, -0.35, 0]}>
      {/* Golden Princess Plate */}
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[1.85, 1.65, 0.16, 40]} />
        <meshStandardMaterial color="#fde68a" metalness={0.35} roughness={0.25} />
      </mesh>

      {/* Bottom Cake Tier — Strawberry Pink */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[1.45, 1.5, 0.86, 36]} />
        <meshStandardMaterial color="#ff9ec9" roughness={0.38} />
      </mesh>

      {/* Bottom Tier Creamy Icing Top */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.48, 1.48, 0.1, 36]} />
        <meshStandardMaterial color="#fff5fa" roughness={0.3} />
      </mesh>

      {/* Pearl Piping Bottom */}
      {pearlPositions.map((pos, idx) => (
        <mesh key={`p1-${idx}`} position={pos}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
      ))}

      {/* Top Cake Tier — Dreamy Kuromi Lavender */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[1.0, 1.04, 0.68, 36]} />
        <meshStandardMaterial color="#d8b4fe" roughness={0.35} />
      </mesh>

      {/* Top Tier Frosting Cap */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[1.03, 1.03, 0.1, 36]} />
        <meshStandardMaterial color="#ffe4f3" roughness={0.3} />
      </mesh>

      {/* Pearl Piping Top */}
      {topPearlPositions.map((pos, idx) => (
        <mesh key={`p2-${idx}`} position={pos}>
          <sphereGeometry args={[0.085, 14, 14]} />
          <meshStandardMaterial color="#ff85c0" roughness={0.25} />
        </mesh>
      ))}

      {/* Center Golden Star "5" Topper */}
      <Float speed={2.5} floatIntensity={0.25} rotationIntensity={0.2}>
        <mesh position={[0, 1.46, 0]}>
          <octahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.4}
            roughness={0.2}
            emissive="#f59e0b"
            emissiveIntensity={allBlown ? 0.8 : 0.25}
          />
        </mesh>
      </Float>

      {/* 5 Interactive Candles */}
      {candlePositions.map((pos, idx) => (
        <Candle3D
          key={idx}
          position={pos}
          color={CANDLE_COLORS[idx]}
          isLit={litCandles[idx]}
          onBlow={() => onBlowCandle(idx)}
        />
      ))}
    </group>
  );
}

function CakeStage({
  litCandles,
  litCount,
  allBlown,
  onBlowCandle,
}: {
  litCandles: boolean[];
  litCount: number;
  allBlown: boolean;
  onBlowCandle: (index: number) => void;
}) {
  const { viewport } = useThree();
  const isNarrow = viewport.width < 5.4;

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 5]} intensity={1.1} color="#fff7ed" />
      <pointLight position={[-3, 3, 2]} intensity={0.7} color="#f472b6" />
      <pointLight position={[3, 2, 2]} intensity={0.6} color="#c084fc" />
      {litCount > 0 && (
        <pointLight
          position={[0, 1.8, 0.5]}
          intensity={0.45 + litCount * 0.22}
          color="#fde047"
        />
      )}

      <RainbowArch3D position={[0, -0.8, -3.5]} scale={isNarrow ? 0.92 : 1.15} />
      <FluffyCloud3D position={[isNarrow ? -2.2 : -3.3, 1.4, -2.5]} scale={isNarrow ? 0.65 : 0.85} tint="#ffffff" />
      <FluffyCloud3D position={[isNarrow ? 2.2 : 3.3, 1.2, -2.2]} scale={isNarrow ? 0.68 : 0.9} tint="#fff0f7" />
      <FluffyCloud3D position={[isNarrow ? -1.8 : -2.6, -1.2, -1.8]} scale={isNarrow ? 0.55 : 0.7} tint="#f3e8ff" />

      <CuteUnicorn3D
        position={isNarrow ? [-1.45, -0.95, -1.1] : [-2.35, -0.75, -0.2]}
        rotation={[0, 0.55, 0]}
        scale={isNarrow ? 0.62 : 0.85}
        celebrating={allBlown}
      />

      <group scale={isNarrow ? 0.82 : 1}>
        <CakeModel litCandles={litCandles} onBlowCandle={onBlowCandle} />
      </group>

      <Sparkles
        count={50}
        scale={[isNarrow ? 4.5 : 7, 4.5, 4]}
        size={4}
        speed={0.45}
        color="#fef08a"
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.15}
      />
    </>
  );
}

export function BirthdayCakeScene() {
  const [litCandles, setLitCandles] = useState<boolean[]>([true, true, true, true, true]);
  const litCount = litCandles.filter(Boolean).length;
  const allBlown = litCount === 0;

  const handleBlowCandle = (index: number) => {
    setLitCandles((prev) => {
      if (!prev[index]) return prev;
      const next = [...prev];
      next[index] = false;
      playCandleBlowSound();

      if (next.every((c) => !c)) {
        playVictoryFanfare();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"],
        });
      }
      return next;
    });
  };

  const handleRelight = () => {
    setLitCandles([true, true, true, true, true]);
  };

  return (
    <div className="relative w-full">
      <div className="relative h-[380px] w-full overflow-hidden rounded-[2rem] border-4 border-white/90 bg-gradient-to-b from-sky-200/80 via-pink-100/75 to-purple-200/80 shadow-2xl shadow-purple-300/40 sm:h-[460px]">
        <Canvas
          camera={{ position: [0, 2.2, 5.8], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <CakeStage
            litCandles={litCandles}
            litCount={litCount}
            allBlown={allBlown}
            onBlowCandle={handleBlowCandle}
          />
        </Canvas>

        {/* Top floating pill instruction */}
        <div className="pointer-events-none absolute top-3 left-1/2 z-10 w-[92%] max-w-md -translate-x-1/2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-white/90 bg-white/85 px-4 py-1.5 text-xs font-bold text-purple-900 shadow-md backdrop-blur sm:text-sm">
            <SparklesIcon className="h-4 w-4 shrink-0 text-pink-500" />
            <span>
              {allBlown
                ? BIRTHDAY_CONFIG.wishCelebration
                : `${BIRTHDAY_CONFIG.wishPrompt} (${BIRTHDAY_CONFIG.candlesLeft(litCount)})`}
            </span>
          </div>
        </div>

        {/* Relight button once all 5 candles are blown */}
        {allBlown && (
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <button
              type="button"
              onClick={handleRelight}
              className="font-display inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2.5 text-base font-bold text-white shadow-lg ring-2 ring-white transition hover:scale-105 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              {BIRTHDAY_CONFIG.relightCandles}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
