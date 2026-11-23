"use client";

import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { RotateCcw } from "lucide-react";
import {
  RainbowArch3D,
  FluffyCloud3D,
  CuteUnicorn3D,
  FairyCastle3D,
  KawaiiGiftBox3D,
  KawaiiBunnyFriend3D,
  MagicWand3D,
  ExtrudedStar3D,
  ExtrudedHeart3D,
} from "./MagicalDecor3D";
import { playCandleBlowSound, playVictoryFanfare } from "@/lib/soundEffects";
import { BIRTHDAY_CONFIG } from "@/config/birthday";

const CANDLE_COLORS = ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"];
const SPRINKLE_COLORS = ["#ff6eb4", "#fde047", "#7dd3fc", "#c084fc", "#6ee7b7"];

function MiniMacaron3D({
  position,
  color = "#ff85c0",
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  color?: string;
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.055, 0]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshPhysicalMaterial color={color} roughness={0.28} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.055, 14]} />
        <meshStandardMaterial color="#fffaf5" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.055, 0]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshPhysicalMaterial color={color} roughness={0.28} clearcoat={0.4} />
      </mesh>
    </group>
  );
}

function MiniStrawberry3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.11, 0.22, 14]} />
        <meshPhysicalMaterial color="#fb7185" roughness={0.25} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.1, 0.03, 0.05, 7]} />
        <meshStandardMaterial color="#4ade80" roughness={0.4} />
      </mesh>
    </group>
  );
}

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
  const flameRef = useRef<THREE.Group>(null);
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
      {/* Generous invisible hit cylinder for 5-year-old tapping */}
      <mesh position={[0, 0.44, 0]} visible={false}>
        <cylinderGeometry args={[0.25, 0.25, 0.92, 10]} />
        <meshBasicMaterial />
      </mesh>

      {/* Cute candle holder cup */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.11, 0.08, 0.07, 14]} />
        <meshStandardMaterial color="#fde047" metalness={0.45} roughness={0.25} />
      </mesh>

      {/* Glossy candle body */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.072, 0.078, 0.56, 16]} />
        <meshPhysicalMaterial color={color} roughness={0.22} clearcoat={0.6} />
      </mesh>

      {/* Twin decorative stripe rings */}
      {[0.2, 0.36, 0.5].map((ry) => (
        <mesh key={ry} position={[0, ry, 0]} rotation={[0.22, 0, 0]}>
          <torusGeometry args={[0.078, 0.014, 10, 20]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      ))}

      {/* Wick */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
        <meshStandardMaterial color="#3b1d5e" />
      </mesh>

      {/* Layered glowing flame */}
      {isLit && (
        <group ref={flameRef} position={[0, 0.74, 0]}>
          <mesh>
            <coneGeometry args={[0.09, 0.25, 16]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={2.1}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.082, 14, 14]} />
            <meshStandardMaterial
              color="#fb923c"
              emissive="#f97316"
              emissiveIntensity={1.6}
            />
          </mesh>
          {/* Bright inner core */}
          <mesh position={[0, -0.03, 0]}>
            <sphereGeometry args={[0.042, 10, 10]} />
            <meshBasicMaterial color="#ffffff" />
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
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr.push([Math.cos(angle) * 1.48, -0.34, Math.sin(angle) * 1.48]);
    }
    return arr;
  }, []);

  const topPearlPositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr.push([Math.cos(angle) * 1.03, 0.44, Math.sin(angle) * 1.03]);
    }
    return arr;
  }, []);

  // Melting cream frosting drips around both tiers
  const bottomDrips = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2;
      const len = 0.18 + ((i * 7) % 5) * 0.055;
      return {
        x: Math.cos(angle) * 1.47,
        z: Math.sin(angle) * 1.47,
        len,
      };
    });
  }, []);

  const topDrips = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + 0.15;
      const len = 0.14 + ((i * 5) % 4) * 0.05;
      return {
        x: Math.cos(angle) * 1.02,
        z: Math.sin(angle) * 1.02,
        len,
      };
    });
  }, []);

  // Colorful 3D sprinkles around bottom tier
  const sprinkles = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2 + 0.1;
      const y = -0.2 + ((i * 3) % 5) * 0.1;
      return {
        pos: [Math.cos(angle) * 1.49, y, Math.sin(angle) * 1.49] as [number, number, number],
        rot: [0.3 * i, angle, 0.5 * i] as [number, number, number],
        color: SPRINKLE_COLORS[i % SPRINKLE_COLORS.length],
      };
    });
  }, []);

  const candlePositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      arr.push([Math.cos(angle) * 0.58, 1.08, Math.sin(angle) * 0.58]);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!cakeGroupRef.current) return;
    cakeGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.2;
  });

  return (
    <group ref={cakeGroupRef} position={[0, -0.32, 0]}>
      {/* Golden Princess Pedestal Cake Stand */}
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[1.88, 1.66, 0.15, 42]} />
        <meshPhysicalMaterial color="#fde68a" metalness={0.45} roughness={0.2} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.42, 0.72, 0.42, 28]} />
        <meshPhysicalMaterial color="#fbbf24" metalness={0.45} roughness={0.22} clearcoat={0.5} />
      </mesh>

      {/* Bottom Cake Tier — Strawberry Pink */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[1.45, 1.5, 0.86, 40]} />
        <meshPhysicalMaterial color="#ff9ec9" roughness={0.32} clearcoat={0.25} />
      </mesh>

      {/* Bottom Tier Creamy Icing Top */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.49, 1.49, 0.11, 40]} />
        <meshPhysicalMaterial color="#fff5fa" roughness={0.24} clearcoat={0.5} />
      </mesh>

      {/* Bottom Melting Icing Drips */}
      {bottomDrips.map((d, idx) => (
        <group key={`bd-${idx}`} position={[d.x, 0.36 - d.len / 2, d.z]}>
          <mesh>
            <cylinderGeometry args={[0.075, 0.068, d.len, 12]} />
            <meshPhysicalMaterial color="#fff5fa" roughness={0.24} clearcoat={0.5} />
          </mesh>
          <mesh position={[0, -d.len / 2, 0]}>
            <sphereGeometry args={[0.068, 12, 12]} />
            <meshPhysicalMaterial color="#fff5fa" roughness={0.24} clearcoat={0.5} />
          </mesh>
        </group>
      ))}

      {/* Colorful 3D Sprinkles */}
      {sprinkles.map((s, idx) => (
        <mesh key={`sp-${idx}`} position={s.pos} rotation={s.rot}>
          <capsuleGeometry args={[0.022, 0.06, 4, 8]} />
          <meshStandardMaterial color={s.color} roughness={0.25} />
        </mesh>
      ))}

      {/* Pearl Piping Bottom */}
      {pearlPositions.map((pos, idx) => (
        <mesh key={`p1-${idx}`} position={pos}>
          <sphereGeometry args={[0.095, 14, 14]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.18} clearcoat={0.7} />
        </mesh>
      ))}

      {/* Cute Macarons & Strawberries sitting on the bottom ledge! */}
      <MiniMacaron3D position={[1.22, 0.54, 0.35]} color="#ff7ab6" rotation={[0.1, 0, -0.2]} />
      <MiniMacaron3D position={[-1.22, 0.54, 0.35]} color="#7dd3fc" rotation={[0.1, 0, 0.2]} />
      <MiniStrawberry3D position={[0.92, 0.55, 0.92]} />
      <MiniStrawberry3D position={[-0.92, 0.55, 0.92]} />
      <MiniMacaron3D position={[0, 0.54, 1.24]} color="#fde047" rotation={[0.2, 0, 0]} />

      {/* Top Cake Tier — Dreamy Kuromi Lavender */}
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[1.0, 1.04, 0.68, 40]} />
        <meshPhysicalMaterial color="#d8b4fe" roughness={0.3} clearcoat={0.25} />
      </mesh>

      {/* Top Tier Frosting Cap */}
      <mesh position={[0, 1.07, 0]}>
        <cylinderGeometry args={[1.04, 1.04, 0.1, 40]} />
        <meshPhysicalMaterial color="#ffe4f3" roughness={0.24} clearcoat={0.5} />
      </mesh>

      {/* Top Melting Icing Drips */}
      {topDrips.map((d, idx) => (
        <group key={`td-${idx}`} position={[d.x, 1.04 - d.len / 2, d.z]}>
          <mesh>
            <cylinderGeometry args={[0.062, 0.056, d.len, 10]} />
            <meshPhysicalMaterial color="#ffe4f3" roughness={0.24} clearcoat={0.5} />
          </mesh>
          <mesh position={[0, -d.len / 2, 0]}>
            <sphereGeometry args={[0.056, 10, 10]} />
            <meshPhysicalMaterial color="#ffe4f3" roughness={0.24} clearcoat={0.5} />
          </mesh>
        </group>
      ))}

      {/* Pearl Piping Top */}
      {topPearlPositions.map((pos, idx) => (
        <mesh key={`p2-${idx}`} position={pos}>
          <sphereGeometry args={[0.08, 14, 14]} />
          <meshPhysicalMaterial color="#ff85c0" roughness={0.2} clearcoat={0.7} />
        </mesh>
      ))}

      {/* Center Beveled 5-Pointed Golden Star Topper */}
      <Float speed={2.6} floatIntensity={0.22} rotationIntensity={0.25}>
        <ExtrudedStar3D
          position={[0, 1.56, 0]}
          scale={0.85}
          color="#fde047"
          emissive="#f59e0b"
          emissiveIntensity={allBlown ? 0.9 : 0.35}
          spin
        />
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
      {/* Studio pastel lighting for glossy toy-vinyl highlights */}
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#fff5fa", "#e9d5ff", 0.65]} />
      <directionalLight position={[4, 8, 5]} intensity={1.25} color="#fff7ed" />
      <directionalLight position={[-4, 5, 3]} intensity={0.55} color="#fbcfe8" />
      <pointLight position={[-3, 3, 2]} intensity={0.65} color="#f472b6" />
      <pointLight position={[3, 2.5, 2]} intensity={0.6} color="#c084fc" />
      {litCount > 0 && (
        <pointLight
          position={[0, 1.9, 0.6]}
          intensity={0.5 + litCount * 0.24}
          color="#fde047"
        />
      )}

      {/* Enchanted Princess Castle framed cleanly inside the Rainbow Arch */}
      <FairyCastle3D
        position={[0, isNarrow ? -0.15 : -0.22, -4.9]}
        scale={isNarrow ? 0.54 : 0.72}
      />
      <RainbowArch3D position={[0, -0.15, -3.7]} scale={isNarrow ? 1.04 : 1.28} />
      <FluffyCloud3D
        position={[isNarrow ? -2.1 : -3.5, 1.85, -2.6]}
        scale={isNarrow ? 0.58 : 0.82}
        tint="#ffffff"
      />
      <FluffyCloud3D
        position={[isNarrow ? 2.1 : 3.5, 1.65, -2.3]}
        scale={isNarrow ? 0.6 : 0.86}
        tint="#fff0f7"
      />

      {/* Winged Glossy Unicorn resting on the pastel stage */}
      <CuteUnicorn3D
        position={isNarrow ? [-1.18, -1.22, 1.15] : [-2.25, -1.2, 0.75]}
        rotation={[0, 0.55, 0]}
        scale={isNarrow ? 0.52 : 0.76}
        celebrating={allBlown}
      />

      {/* Kawaii Pink & Purple Bunny Friends resting on the stage */}
      <KawaiiBunnyFriend3D
        variant="pink"
        position={isNarrow ? [1.18, -1.26, 1.05] : [2.15, -1.24, 0.85]}
        rotation={[0, -0.45, 0]}
        scale={isNarrow ? 0.58 : 0.82}
      />
      {!isNarrow && (
        <KawaiiBunnyFriend3D
          variant="purple"
          position={[2.95, -1.24, -0.25]}
          rotation={[0, -0.65, 0]}
          scale={0.78}
        />
      )}

      {/* Wrapped 3D Birthday Gift Boxes resting on the stage */}
      <KawaiiGiftBox3D
        position={isNarrow ? [0.78, -1.31, 1.55] : [1.42, -1.31, 1.45]}
        rotation={[0, -0.3, 0]}
        scale={isNarrow ? 0.44 : 0.64}
        boxColor="#ff85c0"
        ribbonColor="#fde047"
      />
      <KawaiiGiftBox3D
        position={isNarrow ? [-0.62, -1.31, 1.62] : [-1.45, -1.31, 1.5]}
        rotation={[0, 0.4, 0]}
        scale={isNarrow ? 0.4 : 0.58}
        boxColor="#c084fc"
        ribbonColor="#ff85c0"
      />

      {/* Floating Fairy Wand & 3D Hearts */}
      <MagicWand3D
        position={isNarrow ? [1.32, 0.4, -0.4] : [2.5, 0.55, -0.4]}
        rotation={[0, -0.2, -0.38]}
        scale={isNarrow ? 0.56 : 0.75}
      />
      <Float speed={2.2} floatIntensity={0.35}>
        <ExtrudedHeart3D
          position={isNarrow ? [-1.32, 0.5, -0.3] : [-2.45, 0.75, -0.3]}
          scale={isNarrow ? 0.44 : 0.58}
          color="#ff6eb4"
        />
      </Float>

      {/* Center Deluxe 2-Tier Cake resting cleanly on the pastel stage */}
      <group position={isNarrow ? [0, -0.48, 0.25] : [0, -0.32, 0.35]} scale={isNarrow ? 0.64 : 0.78}>
        <CakeModel litCandles={litCandles} onBlowCandle={onBlowCandle} />
      </group>

      {/* Visible Pastel Round Stage Floor so grounded shadows always sit on a real surface */}
      <group position={[0, -1.46, 0.45]}>
        <mesh>
          <cylinderGeometry args={[isNarrow ? 2.5 : 3.9, isNarrow ? 2.7 : 4.15, 0.28, 48]} />
          <meshPhysicalMaterial color="#fff1f9" roughness={0.35} clearcoat={0.25} />
        </mesh>
        <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[isNarrow ? 2.5 : 3.9, 0.045, 12, 56]} />
          <meshStandardMaterial color="#fde68a" metalness={0.45} roughness={0.25} />
        </mesh>
      </group>

      {/* Tight ContactShadows strictly on top of the stage (far=1.6 avoids floating sky shadows) */}
      <ContactShadows
        position={[0, -1.31, 0.45]}
        opacity={0.32}
        scale={isNarrow ? 5.2 : 8.0}
        blur={2.0}
        far={1.6}
        color="#7e22ce"
      />

      <Sparkles
        count={55}
        scale={[isNarrow ? 4.8 : 7.5, 4.8, 4.5]}
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
      <div className="relative h-[400px] w-full overflow-hidden rounded-[2rem] border-4 border-white/90 bg-gradient-to-b from-sky-200/80 via-pink-100/75 to-purple-200/80 shadow-2xl shadow-purple-300/40 sm:h-[480px]">
        <Canvas
          camera={{ position: [0, 1.8, 6.4], fov: 44 }}
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

        {/* Subtle icon-only relight button once all 5 candles are blown out */}
        {allBlown && (
          <button
            type="button"
            onClick={handleRelight}
            aria-label={BIRTHDAY_CONFIG.relightCandles}
            className="absolute top-3 left-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg ring-2 ring-white transition hover:scale-105 active:scale-95"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
