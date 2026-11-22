"use client";

import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { RotateCcw, Star, Trophy } from "lucide-react";
import { RainbowArch3D, FluffyCloud3D } from "./MagicalDecor3D";
import { playPopSound, playSparkleSound, playVictoryFanfare } from "@/lib/soundEffects";

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
  x: number;
  y: number;
  z: number;
  speed: number;
  swayOffset: number;
  color: string;
  isStar: boolean;
}

interface BurstData {
  id: number;
  position: [number, number, number];
  color: string;
  createdAt: number;
}

function createBalloon(id: number, startRandomY: boolean): BalloonData {
  const isStar = Math.random() < 0.22;
  return {
    id,
    x: (Math.random() - 0.5) * 6.4,
    y: startRandomY ? (Math.random() - 0.5) * 4.5 : -4.2 - Math.random() * 1.8,
    z: (Math.random() - 0.5) * 1.8,
    speed: 0.75 + Math.random() * 0.65,
    swayOffset: Math.random() * Math.PI * 2,
    color: isStar
      ? "#fbbf24"
      : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
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
      child.position.set(dx * clamped * 1.25, dy * clamped * 1.25, dz * clamped * 1.25);
      const s = Math.max(0.01, 1 - clamped);
      child.scale.setScalar(s);
    });
  });

  return (
    <group ref={groupRef} position={burst.position}>
      {dirs.map((_, idx) => (
        <mesh key={idx}>
          <octahedronGeometry args={[0.14, 0]} />
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
  onPop,
}: {
  data: BalloonData;
  onPop: (id: number, pos: [number, number, number], color: string, isStar: boolean) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef({ x: data.x, y: data.y, z: data.z });

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    posRef.current.y += data.speed * dt;
    if (posRef.current.y > 4.4) {
      posRef.current.y = -4.2;
      posRef.current.x = (Math.random() - 0.5) * 6.4;
    }
    const swayX = posRef.current.x + Math.sin(state.clock.elapsedTime * 1.5 + data.swayOffset) * 0.35;
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
      : [posRef.current.x, posRef.current.y, posRef.current.z];
    onPop(data.id, currentPos, data.color, data.isStar);
  };

  return (
    <group
      ref={groupRef}
      position={[data.x, data.y, data.z]}
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
        <sphereGeometry args={[0.85, 10, 10]} />
        <meshBasicMaterial />
      </mesh>

      {data.isStar ? (
        <group>
          <mesh>
            <octahedronGeometry args={[0.56, 0]} />
            <meshStandardMaterial
              color="#fde047"
              emissive="#f59e0b"
              emissiveIntensity={0.45}
              metalness={0.35}
              roughness={0.2}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
            <octahedronGeometry args={[0.52, 0]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fbbf24"
              emissiveIntensity={0.35}
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
        </group>
      ) : (
        <group>
          {/* Glossy balloon body */}
          <mesh scale={[0.92, 1.12, 0.92]}>
            <sphereGeometry args={[0.54, 24, 24]} />
            <meshStandardMaterial
              color={data.color}
              roughness={0.18}
              metalness={0.08}
            />
          </mesh>
          {/* Cute glossy highlight dot */}
          <mesh position={[-0.2, 0.24, 0.36]} scale={[0.7, 1.1, 0.5]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
          </mesh>
          {/* Balloon knot */}
          <mesh position={[0, -0.62, 0]}>
            <coneGeometry args={[0.09, 0.14, 12]} />
            <meshStandardMaterial color={data.color} roughness={0.3} />
          </mesh>
          {/* Balloon string */}
          <mesh position={[0, -1.08, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.85, 6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function BalloonPopGame3D() {
  const nextIdRef = useRef(20);
  const [score, setScore] = useState(0);
  const [crowns, setCrowns] = useState(0);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [balloons, setBalloons] = useState<BalloonData[]>(() =>
    Array.from({ length: 10 }, (_, i) => createBalloon(i + 1, true))
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
    setBursts((prev) => [...prev.slice(-6), { id: burstId, position: pos, color, createdAt: performance.now() }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 520);

    // Replace popped balloon with a fresh one at the bottom
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
        setCelebrationMsg(`Yay Sarvin! Rainbow Crown #${nextLevel}!`);
        window.setTimeout(() => setCelebrationMsg(null), 2600);
      }
      return nextScore;
    });
  };

  const handleReset = () => {
    setScore(0);
    setCrowns(0);
    setCelebrationMsg(null);
    setBalloons(Array.from({ length: 10 }, (_, i) => createBalloon(i + 1, true)));
  };

  const progressInLevel = (score % 10) * 10;

  return (
    <div className="w-full">
      {/* Kid-friendly HUD */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-white/90 bg-white/85 px-4 py-3 shadow-md backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
            <span className="font-display text-xl font-bold text-purple-900">{score}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5">
            <Trophy className="h-5 w-5 text-purple-600" />
            <span className="font-display text-lg font-bold text-purple-900">
              {crowns} {crowns === 1 ? "Crown" : "Crowns"}
            </span>
          </div>
        </div>

        {/* Rainbow Progress Meter to next Crown */}
        <div className="flex min-w-[160px] flex-1 items-center gap-2 sm:max-w-xs">
          <div className="h-4 w-full overflow-hidden rounded-full bg-pink-100 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.max(8, progressInLevel)}%` }}
            />
          </div>
          <span className="font-display text-xs font-bold text-purple-700">
            {score % 10}/10
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="font-display inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-pink-50 px-3.5 py-2 text-sm font-bold text-pink-600 transition hover:bg-pink-100 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="relative h-[470px] w-full touch-none overflow-hidden rounded-[2rem] border-4 border-white/90 bg-gradient-to-b from-sky-300/80 via-pink-200/75 to-purple-200/85 shadow-2xl shadow-purple-300/40 sm:h-[540px]">
        <Canvas camera={{ position: [0, 0, 7.2], fov: 50 }} dpr={[1, 2]}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[4, 6, 5]} intensity={1.1} />
          <pointLight position={[-4, 2, 3]} intensity={0.7} color="#f472b6" />

          <RainbowArch3D position={[0, -1.6, -4]} scale={1.55} />
          <FluffyCloud3D position={[-4.2, 2.2, -3]} scale={1.0} tint="#ffffff" />
          <FluffyCloud3D position={[4.1, 1.8, -2.8]} scale={1.1} tint="#fff0f7" />
          <FluffyCloud3D position={[0, -2.6, -2.2]} scale={1.2} tint="#f3e8ff" />

          {balloons.map((b) => (
            <FloatingBalloon3D key={b.id} data={b} onPop={handlePop} />
          ))}

          {bursts.map((burst) => (
            <PopBurst3D key={burst.id} burst={burst} />
          ))}

          <Sparkles count={45} scale={[9, 6, 4]} size={4} speed={0.4} color="#fef08a" />
        </Canvas>

        {/* Celebration Toast */}
        {celebrationMsg && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="font-display animate-bounce rounded-full border-4 border-white bg-gradient-to-r from-pink-500 via-amber-400 to-purple-500 px-7 py-3 text-center text-xl font-bold text-white shadow-2xl sm:text-2xl">
              {celebrationMsg}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
