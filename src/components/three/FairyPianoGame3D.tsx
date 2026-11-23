"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { Music, Play, RotateCcw, Sparkles as SparklesIcon, Star, Trophy } from "lucide-react";
import {
  CuteUnicorn3D,
  KawaiiBunnyFriend3D,
  RainbowArch3D,
  FluffyCloud3D,
  ExtrudedStar3D,
  ExtrudedHeart3D,
} from "./MagicalDecor3D";
import { getAudioContext, playVictoryFanfare } from "@/lib/soundEffects";
import { formatNumber, t } from "@/config/translate";

interface PianoKeyDef {
  id: number;
  note: string;
  freq: number;
  color: string;
  bgClass: string;
  borderClass: string;
  shortcut: string;
}

// G4 -> G5 (8 notes that cover the ENTIRE Happy Birthday melody!)
const PIANO_KEYS: PianoKeyDef[] = [
  { id: 0, note: "G", freq: 392.0, color: "#ff5fa2", bgClass: "from-rose-400 to-pink-500", borderClass: "border-pink-300", shortcut: "1" },
  { id: 1, note: "A", freq: 440.0, color: "#fb923c", bgClass: "from-orange-300 to-amber-400", borderClass: "border-orange-200", shortcut: "2" },
  { id: 2, note: "B", freq: 493.88, color: "#fde047", bgClass: "from-yellow-300 to-amber-300", borderClass: "border-yellow-200", shortcut: "3" },
  { id: 3, note: "C", freq: 523.25, color: "#4ade80", bgClass: "from-emerald-300 to-green-400", borderClass: "border-emerald-200", shortcut: "4" },
  { id: 4, note: "D", freq: 587.33, color: "#38bdf8", bgClass: "from-sky-300 to-cyan-400", borderClass: "border-sky-200", shortcut: "5" },
  { id: 5, note: "E", freq: 659.25, color: "#818cf8", bgClass: "from-indigo-300 to-blue-400", borderClass: "border-indigo-200", shortcut: "6" },
  { id: 6, note: "F", freq: 698.46, color: "#c084fc", bgClass: "from-purple-300 to-violet-400", borderClass: "border-purple-200", shortcut: "7" },
  { id: 7, note: "G+", freq: 783.99, color: "#f472b6", bgClass: "from-fuchsia-400 to-pink-500", borderClass: "border-fuchsia-200", shortcut: "8" },
];

// Full Happy Birthday melody mapped to key indices 0..7 [keyIdx, demoDelayMs]
const HAPPY_BIRTHDAY_SEQUENCE: [number, number][] = [
  // Happy birthday to you
  [0, 340], [0, 240], [1, 520], [0, 520], [3, 520], [2, 900],
  // Happy birthday to you
  [0, 340], [0, 240], [1, 520], [0, 520], [4, 520], [3, 900],
  // Happy birthday dear Sarvin
  [0, 340], [0, 240], [7, 520], [5, 520], [3, 520], [2, 520], [1, 820],
  // Happy birthday to you
  [6, 340], [6, 240], [5, 520], [3, 520], [4, 520], [3, 900],
];

function playFairyNote(freq: number) {
  const pianoCtx = getAudioContext();
  if (!pianoCtx) return;

  const now = pianoCtx.currentTime;
  const osc = pianoCtx.createOscillator();
  const overtone = pianoCtx.createOscillator();
  const gain = pianoCtx.createGain();
  const overtoneGain = pianoCtx.createGain();

  // Warm dreamy fairy celesta / piano timbre
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, now);

  overtone.type = "sine";
  overtone.frequency.setValueAtTime(freq * 2, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

  overtoneGain.gain.setValueAtTime(0.001, now);
  overtoneGain.gain.linearRampToValueAtTime(0.08, now + 0.01);
  overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

  osc.connect(gain);
  overtone.connect(overtoneGain);
  gain.connect(pianoCtx.destination);
  overtoneGain.connect(pianoCtx.destination);

  osc.start(now);
  overtone.start(now);
  osc.stop(now + 0.88);
  overtone.stop(now + 0.45);
}

interface FloatingNoteBurst {
  id: number;
  x: number;
  color: string;
  isHeart: boolean;
  createdAt: number;
}

function RisingNote3D({ item }: { item: FloatingNoteBurst }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const age = (performance.now() - item.createdAt) / 1100;
    const clamped = Math.min(age, 1);
    ref.current.position.y = -0.3 + clamped * 3.1;
    ref.current.rotation.y = clamped * 4.5;
    const scale = Math.sin(clamped * Math.PI) * 0.95;
    ref.current.scale.setScalar(Math.max(0.01, scale));
  });

  return (
    <group ref={ref} position={[item.x, -0.3, 0.8]}>
      {item.isHeart ? (
        <ExtrudedHeart3D scale={0.62} color={item.color} emissive={item.color} emissiveIntensity={0.45} />
      ) : (
        <ExtrudedStar3D scale={0.78} color={item.color} emissive={item.color} emissiveIntensity={0.5} />
      )}
    </group>
  );
}

function ConcertStage3D({
  bouncePulse,
  celebrating,
  bursts,
}: {
  bouncePulse: number;
  celebrating: boolean;
  bursts: FloatingNoteBurst[];
}) {
  const { viewport } = useThree();
  const isNarrow = viewport.width < 5.6;
  const stageRef = useRef<THREE.Group>(null);
  const pulseTimeRef = useRef(0);

  useEffect(() => {
    if (bouncePulse > 0) {
      pulseTimeRef.current = performance.now();
    }
  }, [bouncePulse]);

  useFrame(() => {
    if (!stageRef.current) return;
    const elapsed = (performance.now() - pulseTimeRef.current) / 280;
    const hop = elapsed >= 0 && elapsed < 1 ? Math.sin(elapsed * Math.PI) * 0.35 : 0;
    stageRef.current.position.y = -0.75 + hop;
  });

  const spreadX = isNarrow ? 1.32 : 2.05;

  return (
    <>
      <ambientLight intensity={1.15} />
      <hemisphereLight args={["#fff5fa", "#e9d5ff", 0.65]} />
      <directionalLight position={[4, 7, 5]} intensity={1.2} />
      <pointLight position={[-3, 3, 2]} intensity={0.65} color="#f472b6" />
      <pointLight position={[3, 3, 2]} intensity={0.65} color="#7dd3fc" />

      <RainbowArch3D position={[0, -1.0, -3.5]} scale={isNarrow ? 0.95 : 1.3} />
      <FluffyCloud3D position={[-spreadX * 1.4, 1.3, -2.5]} scale={0.72} tint="#ffffff" />
      <FluffyCloud3D position={[spreadX * 1.4, 1.2, -2.4]} scale={0.76} tint="#fff0f7" />

      {/* Pastel Cloud Concert Stage */}
      <mesh position={[0, -1.18, 0]}>
        <cylinderGeometry args={[isNarrow ? 2.2 : 3.2, isNarrow ? 2.0 : 2.9, 0.38, 36]} />
        <meshPhysicalMaterial color="#fff1f7" roughness={0.28} clearcoat={0.45} />
      </mesh>
      <mesh position={[0, -0.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[isNarrow ? 2.2 : 3.2, 0.06, 12, 42]} />
        <meshStandardMaterial color="#fde047" metalness={0.5} roughness={0.22} />
      </mesh>

      {/* Bouncing Friends Trio! */}
      <group ref={stageRef} position={[0, -0.75, 0]}>
        <CuteUnicorn3D
          position={[0, 0, 0.1]}
          scale={isNarrow ? 0.68 : 0.85}
          celebrating={celebrating}
        />
        <KawaiiBunnyFriend3D
          variant="pink"
          position={[-spreadX, -0.04, 0.25]}
          rotation={[0, 0.35, 0]}
          scale={isNarrow ? 0.72 : 0.9}
        />
        <KawaiiBunnyFriend3D
          variant="purple"
          position={[spreadX, -0.04, 0.25]}
          rotation={[0, -0.35, 0]}
          scale={isNarrow ? 0.72 : 0.9}
        />
      </group>

      {bursts.map((b) => (
        <RisingNote3D key={b.id} item={b} />
      ))}

      <Sparkles count={45} scale={[6.5, 4, 3.5]} size={4} speed={0.45} color="#fef08a" />
    </>
  );
}

export function FairyPianoGame3D() {
  const [mode, setMode] = useState<"learn" | "free">("learn");
  const [step, setStep] = useState(0);
  const [won, setWon] = useState(false);
  const [activeKey, setActiveKey] = useState<number | null>(null);
  const [bouncePulse, setBouncePulse] = useState(0);
  const [bursts, setBursts] = useState<FloatingNoteBurst[]>([]);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  const demoTimersRef = useRef<number[]>([]);

  const stopDemo = useCallback(() => {
    demoTimersRef.current.forEach((id) => window.clearTimeout(id));
    demoTimersRef.current = [];
    setIsDemoPlaying(false);
  }, []);

  useEffect(() => () => stopDemo(), [stopDemo]);

  const triggerKeyVisualAndSound = useCallback((keyIdx: number) => {
    const def = PIANO_KEYS[keyIdx];
    if (!def) return;

    playFairyNote(def.freq);
    setActiveKey(keyIdx);
    setBouncePulse((p) => p + 1);
    window.setTimeout(() => {
      setActiveKey((curr) => (curr === keyIdx ? null : curr));
    }, 180);

    const xWorld = ((keyIdx - 3.5) / 3.5) * 2.2;
    const burstId = Date.now() + Math.random();
    setBursts((prev) => [
      ...prev.slice(-8),
      {
        id: burstId,
        x: xWorld,
        color: def.color,
        isHeart: keyIdx % 2 === 0,
        createdAt: performance.now(),
      },
    ]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 1150);
  }, []);

  const handlePressKey = useCallback(
    (keyIdx: number) => {
      if (isDemoPlaying) stopDemo();
      triggerKeyVisualAndSound(keyIdx);

      if (mode === "learn" && !won) {
        const expectedKey = HAPPY_BIRTHDAY_SEQUENCE[step]?.[0];
        if (keyIdx === expectedKey) {
          const nextStep = step + 1;
          if (nextStep >= HAPPY_BIRTHDAY_SEQUENCE.length) {
            setStep(nextStep);
            setWon(true);
            window.setTimeout(() => {
              playVictoryFanfare();
              confetti({
                particleCount: 160,
                spread: 110,
                origin: { y: 0.55 },
                colors: ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"],
              });
            }, 320);
          } else {
            setStep(nextStep);
          }
        }
      }
    },
    [isDemoPlaying, stopDemo, triggerKeyVisualAndSound, mode, won, step]
  );

  // Desktop keyboard shortcuts 1-8
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const idx = PIANO_KEYS.findIndex((k) => k.shortcut === e.key);
      if (idx !== -1) handlePressKey(idx);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePressKey]);

  const handlePlayDemo = () => {
    if (isDemoPlaying) {
      stopDemo();
      return;
    }
    setIsDemoPlaying(true);
    let elapsed = 0;
    HAPPY_BIRTHDAY_SEQUENCE.forEach(([keyIdx, dur], i) => {
      const tid = window.setTimeout(() => {
        triggerKeyVisualAndSound(keyIdx);
        if (i === HAPPY_BIRTHDAY_SEQUENCE.length - 1) {
          setIsDemoPlaying(false);
        }
      }, elapsed);
      demoTimersRef.current.push(tid);
      elapsed += dur;
    });
  };

  const handleResetLearn = () => {
    stopDemo();
    setStep(0);
    setWon(false);
  };

  const targetKeyIdx =
    mode === "learn" && !won && !isDemoPlaying
      ? HAPPY_BIRTHDAY_SEQUENCE[step]?.[0] ?? null
      : null;

  return (
    <div className="game-stage-root w-full">
      {/* 3D Dancing Concert Stage */}
      <div className="game-stage-canvas relative mb-3 h-[34dvh] min-h-[210px] max-h-[340px] w-full overflow-hidden rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-sky-200/80 via-pink-100/80 to-purple-200/85 shadow-2xl shadow-purple-300/40 sm:mb-4 sm:h-[330px] sm:rounded-[2rem]">
        <Canvas camera={{ position: [0, 1.3, 5.5], fov: 44 }} dpr={[1, 2]}>
          <ConcertStage3D bouncePulse={bouncePulse} celebrating={won} bursts={bursts} />
        </Canvas>

        {/* Win Celebration Overlay */}
        {won && (
          <div className="absolute inset-x-3 top-4 z-20 flex flex-col items-center text-center">
            <div className="kawaii-card max-w-sm rounded-[1.75rem] p-4 sm:p-5">
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                <Trophy className="h-4 w-4 text-amber-500" />
                {t.fairyPiano.winBadge}
              </div>
              <h2 className="font-display mb-1 text-xl font-bold text-purple-900 sm:text-2xl">
                {t.fairyPiano.winTitle}
              </h2>
              <p className="mb-3 text-xs font-bold text-purple-700 sm:text-sm">
                {t.fairyPiano.winMessage}
              </p>
              <button
                type="button"
                onClick={handleResetLearn}
                className="font-display inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                {t.fairyPiano.playAgain}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mode & Demo Controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-white/90 bg-white/85 px-3 py-2 shadow-md backdrop-blur sm:mb-4 sm:rounded-3xl sm:px-4 sm:py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              stopDemo();
              setMode("learn");
              setStep(0);
              setWon(false);
            }}
            className={`font-display inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
              mode === "learn"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow"
                : "bg-pink-50 text-purple-800 hover:bg-pink-100"
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            {t.fairyPiano.modeLearn}
          </button>

          <button
            type="button"
            onClick={() => {
              stopDemo();
              setMode("free");
              setWon(false);
            }}
            className={`font-display inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
              mode === "free"
                ? "bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100"
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            {t.fairyPiano.modeFree}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {mode === "learn" && (
            <span className="font-display rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 sm:text-sm">
              {t.fairyPiano.progressLabel(step, HAPPY_BIRTHDAY_SEQUENCE.length)}
            </span>
          )}

          <button
            type="button"
            onClick={handlePlayDemo}
            className={`font-display inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
              isDemoPlaying
                ? "bg-amber-400 text-purple-950 shadow"
                : "bg-purple-100 text-purple-800 hover:bg-purple-200"
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {t.fairyPiano.demoBtn}
          </button>
        </div>
      </div>

      {/* 8 Big Glossy Rainbow Piano Keys (LTR like a real piano!) */}
      <div
        dir="ltr"
        className="kawaii-card grid grid-cols-8 gap-1.5 rounded-[1.75rem] p-2.5 sm:gap-2.5 sm:rounded-[2rem] sm:p-4"
      >
        {PIANO_KEYS.map((k) => {
          const isPressed = activeKey === k.id;
          const isTarget = targetKeyIdx === k.id;
          return (
            <button
              key={k.id}
              type="button"
              onPointerDown={() => handlePressKey(k.id)}
              className={`relative flex h-36 cursor-pointer flex-col items-center justify-between rounded-2xl border-2 bg-gradient-to-b py-3 text-white shadow-md transition-transform select-none sm:h-44 sm:rounded-3xl sm:py-4 ${
                k.bgClass
              } ${k.borderClass} ${
                isPressed
                  ? "translate-y-1.5 scale-95 brightness-110 shadow-inner"
                  : "hover:-translate-y-0.5 active:translate-y-1.5"
              } ${isTarget ? "ring-4 ring-amber-300 brightness-105" : ""}`}
            >
              {/* Glossy top highlight */}
              <div className="h-2.5 w-4/5 rounded-full bg-white/40" />

              {/* Bouncing Golden Star prompt in Learn Mode */}
              {isTarget ? (
                <div className="flex h-8 w-8 animate-bounce items-center justify-center rounded-full bg-white shadow-md sm:h-10 sm:w-10">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-500 sm:h-6 sm:w-6" />
                </div>
              ) : (
                <SparklesIcon className="h-4 w-4 opacity-70 sm:h-5 sm:w-5" />
              )}

              {/* Key Number Badge */}
              <span className="font-display flex h-7 w-7 items-center justify-center rounded-full bg-white/30 text-xs font-extrabold text-white backdrop-blur sm:h-9 sm:w-9 sm:text-base">
                {formatNumber(k.id + 1)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
