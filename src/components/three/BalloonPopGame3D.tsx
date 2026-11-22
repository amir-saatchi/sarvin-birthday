"use client";

import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { RotateCcw, Star, Trophy } from "lucide-react";
import {
  RainbowArch3D,
  FluffyCloud3D,
  FairyCastle3D,
  ExtrudedStar3D,
  ExtrudedHeart3D,
  KawaiiBunnyFriend3D,
} from "./MagicalDecor3D";
import { playPopSound, playSparkleSound, playVictoryFanfare } from "@/lib/soundEffects";
import { t, formatNumber } from "@/config/translate";

const BALLOON_COLORS = [
  "#ff6eb4", // Melody pink
  "#c084fc", // Kuromi lavender
  "#7dd3fc", // Sky pastel
  "#f9a8d4", // Soft rose
  "#a78bfa", // Fairy purple
  "#6ee7b7", // Mint pastel
];

interface BalloonData {
  id: number;
  xNorm: number; // -1 to 1 normalized horizontal lane so it always fits any screen width
  y: number;
  z: number;
  speed: number;
  swayOffset: number;
  color: string;
  shape: "round" | "heart" | "star";
  isStar: boolean;
}

interface BurstData {
  id: number;
  position: [number, number, number];
  color: string;
  createdAt: number;
}

function createBalloon(id: number, startRandomY: boolean): BalloonData {
  const roll = Math.random();
  const shape: "round" | "heart" | "star" =
    roll < 0.22 ? "star" : roll < 0.52 ? "heart" : "round";
  const isStar = shape === "star";
  return {
    id,
    xNorm: (Math.random() - 0.5) * 1.75, // stays within [-0.875, +0.875] of safe visible width
    y: startRandomY ? (Math.random() - 0.5) * 4.2 : -3.9 - Math.random() * 1.6,
    z: (Math.random() - 0.5) * 1.2,
    speed: 0.72 + Math.random() * 0.6,
    swayOffset: Math.random() * Math.PI * 2,
    color: isStar
      ? "#fbbf24"
      : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    shape,
    isStar,
  };
}

function PopBurst3D({ burst }: { burst: BurstData }) {
  const groupRef = useRef<THREE.Group>(null);
  const dirs = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return [Math.cos(angle), Math.sin(angle), (Math.random() - 0.5) * 0.6];
      }),
    []
  );

  useFrame(() => {
    if (!groupRef.current) return;
    const age = (performance.now() - burst.createdAt) / 480;
    const clamped = Math.min(age, 1);
    groupRef.current.children.forEach((child, i) => {
      const [dx, dy, dz] = dirs[i];
      child.position.set(dx * clamped * 1.15, dy * clamped * 1.15, dz * clamped * 1.15);
      const s = Math.max(0.01, 1 - clamped);
      child.scale.setScalar(s);
    });
  });

  return (
    <group ref={groupRef} position={burst.position}>
      {dirs.map((_, idx) => (
        <mesh key={idx}>
          <octahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? burst.color : "#fef08a"}
            emissive={burst.color}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function FloatingBalloon3D({
  data,
  halfWidth,
  balloonScale,
  onPop,
}: {
  data: BalloonData;
  halfWidth: number;
  balloonScale: number;
  onPop: (id: number, pos: [number, number, number], color: string, isStar: boolean) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef({ xNorm: data.xNorm, y: data.y, z: data.z });

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    posRef.current.y += data.speed * dt;
    if (posRef.current.y > 4.2) {
      posRef.current.y = -4.0;
      posRef.current.xNorm = (Math.random() - 0.5) * 1.75;
    }
    const baseX = posRef.current.xNorm * halfWidth;
    const swayAmt = Math.min(0.32, halfWidth * 0.14);
    const swayX = THREE.MathUtils.clamp(
      baseX + Math.sin(state.clock.elapsedTime * 1.5 + data.swayOffset) * swayAmt,
      -halfWidth,
      halfWidth
    );
    groupRef.current.position.set(swayX, posRef.current.y, posRef.current.z);
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.8 + data.swayOffset) * 0.1;
    if (data.isStar) {
      groupRef.current.rotation.y += dt * 1.6;
    }
  });

  const handleTap = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const currentPos: [number, number, number] = groupRef.current
      ? [
          groupRef.current.position.x,
          groupRef.current.position.y,
          groupRef.current.position.z,
        ]
      : [posRef.current.xNorm * halfWidth, posRef.current.y, posRef.current.z];
    onPop(data.id, currentPos, data.color, data.isStar);
  };

  return (
    <group
      ref={groupRef}
      position={[data.xNorm * halfWidth, data.y, data.z]}
      scale={balloonScale}
      onPointerDown={handleTap}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* Generous invisible hitbox for 5-year-old tapping */}
      <mesh visible={false}>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshBasicMaterial />
      </mesh>

      {data.shape === "star" ? (
        <ExtrudedStar3D scale={1.35} color="#fde047" emissive="#f59e0b" emissiveIntensity={0.55} />
      ) : data.shape === "heart" ? (
        <group>
          <ExtrudedHeart3D scale={1.15} color={data.color} emissive={data.color} emissiveIntensity={0.18} />
          {/* Balloon string */}
          <mesh position={[0, -0.92, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.85, 6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ) : (
        <group>
          {/* Glossy toy-vinyl balloon body */}
          <mesh scale={[0.92, 1.12, 0.92]}>
            <sphereGeometry args={[0.52, 26, 26]} />
            <meshPhysicalMaterial
              color={data.color}
              roughness={0.12}
              metalness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>
          {/* Cute glossy highlight dot */}
          <mesh position={[-0.19, 0.23, 0.34]} scale={[0.7, 1.1, 0.5]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
          </mesh>
          {/* Balloon knot + tiny satin ribbon collar */}
          <mesh position={[0, -0.6, 0]}>
            <coneGeometry args={[0.09, 0.14, 12]} />
            <meshPhysicalMaterial color={data.color} roughness={0.25} clearcoat={0.6} />
          </mesh>
          <mesh position={[0, -0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.06, 0.02, 8, 16]} />
            <meshStandardMaterial color="#fde047" />
          </mesh>
          {/* Balloon string */}
          <mesh position={[0, -1.06, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.82, 6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function BalloonWorld({
  balloons,
  bursts,
  onPop,
}: {
  balloons: BalloonData[];
  bursts: BurstData[];
  onPop: (id: number, pos: [number, number, number], color: string, isStar: boolean) => void;
}) {
  const { viewport } = useThree();
  const isNarrow = viewport.width < 6.2;
  const balloonScale = isNarrow ? 0.84 : 1;
  const halfWidth = Math.max(1.35, Math.min(3.5, viewport.width / 2 - 0.65));
  const rainbowScale = isNarrow ? 1.05 : 1.5;

  return (
    <>
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#fff5fa", "#e9d5ff", 0.6]} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} />
      <pointLight position={[-4, 2, 3]} intensity={0.7} color="#f472b6" />

      <FairyCastle3D position={[0, -1.5, -5.8]} scale={isNarrow ? 0.6 : 0.88} />
      <RainbowArch3D position={[0, -1.5, -4]} scale={rainbowScale} />
      <FluffyCloud3D
        position={[-halfWidth * 1.15, 2.2, -3]}
        scale={isNarrow ? 0.72 : 1.0}
        tint="#ffffff"
      />
      <FluffyCloud3D
        position={[halfWidth * 1.15, 1.8, -2.8]}
        scale={isNarrow ? 0.76 : 1.1}
        tint="#fff0f7"
      />
      <FluffyCloud3D position={[0, -2.65, -2.2]} scale={isNarrow ? 0.9 : 1.15} tint="#f3e8ff" />
      <KawaiiBunnyFriend3D
        variant="pink"
        position={[isNarrow ? -0.35 : -0.45, -1.98, -1.45]}
        rotation={[0, 0.2, 0]}
        scale={isNarrow ? 0.58 : 0.72}
      />
      <KawaiiBunnyFriend3D
        variant="purple"
        position={[isNarrow ? 0.35 : 0.45, -1.98, -1.45]}
        rotation={[0, -0.2, 0]}
        scale={isNarrow ? 0.58 : 0.72}
      />

      {balloons.map((b) => (
        <FloatingBalloon3D
          key={b.id}
          data={b}
          halfWidth={halfWidth}
          balloonScale={balloonScale}
          onPop={onPop}
        />
      ))}

      {bursts.map((burst) => (
        <PopBurst3D key={burst.id} burst={burst} />
      ))}

      <Sparkles count={40} scale={[halfWidth * 2.4, 6, 4]} size={4} speed={0.4} color="#fef08a" />
    </>
  );
}

export function BalloonPopGame3D() {
  const nextIdRef = useRef(20);
  const [score, setScore] = useState(0);
  const [crowns, setCrowns] = useState(0);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [balloons, setBalloons] = useState<BalloonData[]>(() =>
    Array.from({ length: 9 }, (_, i) => createBalloon(i + 1, true))
  );
  const [bursts, setBursts] = useState<BurstData[]>([]);

  const handlePop = (
    id: number,
    pos: [number, number, number],
    color: string,
    isStar: boolean
  ) => {
    if (isStar) {
      playSparkleSound();
    } else {
      playPopSound(0.9 + Math.random() * 0.35);
    }

    const burstId = Date.now() + Math.random();
    setBursts((prev) => [
      ...prev.slice(-6),
      { id: burstId, position: pos, color, createdAt: performance.now() },
    ]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 520);

    nextIdRef.current += 1;
    const freshId = nextIdRef.current;
    setBalloons((prev) =>
      prev.map((b) => (b.id === id ? createBalloon(freshId, false) : b))
    );

    const points = isStar ? 2 : 1;
    setScore((prevScore) => {
      const nextScore = prevScore + points;
      const prevLevel = Math.floor(prevScore / 10);
      const nextLevel = Math.floor(nextScore / 10);
      if (nextLevel > prevLevel) {
        setCrowns(nextLevel);
        playVictoryFanfare();
        confetti({
          particleCount: 110,
          spread: 90,
          origin: { y: 0.55 },
          colors: ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"],
        });
        setCelebrationMsg(t.balloonGame.celebration(nextLevel));
        window.setTimeout(() => setCelebrationMsg(null), 2600);
      }
      return nextScore;
    });
  };

  const handleReset = () => {
    setScore(0);
    setCrowns(0);
    setCelebrationMsg(null);
    setBalloons(Array.from({ length: 9 }, (_, i) => createBalloon(i + 1, true)));
  };

  const progressInLevel = (score % 10) * 10;

  return (
    <div className="w-full">
      {/* Compact mobile-friendly HUD */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-white/90 bg-white/85 px-3 py-2 shadow-md backdrop-blur sm:mb-4 sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 sm:px-4 sm:py-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500 sm:h-5 sm:w-5" />
            <span className="font-display text-base font-bold text-purple-900 sm:text-xl">
              {formatNumber(score)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 sm:px-4 sm:py-1.5">
            <Trophy className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
            <span className="font-display text-sm font-bold text-purple-900 sm:text-lg">
              {formatNumber(crowns)}{" "}
              {crowns === 1 ? t.balloonGame.crownSingular : t.balloonGame.crownPlural}
            </span>
          </div>
        </div>

        {/* Rainbow Progress Meter */}
        <div className="order-3 flex w-full items-center gap-2 sm:order-none sm:max-w-xs sm:flex-1">
          <div className="h-3 w-full overflow-hidden rounded-full bg-pink-100 p-0.5 sm:h-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.max(8, progressInLevel)}%` }}
            />
          </div>
          <span className="font-display text-xs font-bold text-purple-700">
            {formatNumber(score % 10)}/{formatNumber(10)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="font-display inline-flex cursor-pointer items-center gap-1 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-600 transition hover:bg-pink-100 active:scale-95 sm:px-3.5 sm:py-2 sm:text-sm"
        >
          <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {t.balloonGame.restart}
        </button>
      </div>

      {/* 3D Canvas sized to fit cleanly inside a single mobile screen */}
      <div className="relative h-[58dvh] min-h-[340px] max-h-[540px] w-full touch-none overflow-hidden rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-sky-300/80 via-pink-200/75 to-purple-200/85 shadow-2xl shadow-purple-300/40 sm:h-[520px] sm:rounded-[2rem]">
        <Canvas camera={{ position: [0, 0, 7.2], fov: 50 }} dpr={[1, 2]}>
          <BalloonWorld balloons={balloons} bursts={bursts} onPop={handlePop} />
        </Canvas>

        {/* Celebration Toast */}
        {celebrationMsg && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 w-[88%] max-w-md -translate-x-1/2 -translate-y-1/2">
            <div className="font-display animate-bounce rounded-full border-4 border-white bg-gradient-to-r from-pink-500 via-amber-400 to-purple-500 px-5 py-2.5 text-center text-base font-bold text-white shadow-2xl sm:px-7 sm:py-3 sm:text-2xl">
              {celebrationMsg}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
