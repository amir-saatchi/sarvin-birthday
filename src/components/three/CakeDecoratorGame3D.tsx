"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles, ContactShadows, Float, Instances, Instance } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { Palette, Droplets, Sparkles as SparklesIcon, Crown, Wand2, PartyPopper } from "lucide-react";
import {
  CuteUnicorn3D,
  KawaiiBunnyFriend3D,
  KawaiiGiftBox3D,
  ExtrudedStar3D,
  ExtrudedHeart3D,
  FluffyCloud3D,
  RainbowArch3D,
} from "./MagicalDecor3D";
import { playPopSound, playSparkleSound, playVictoryFanfare } from "@/lib/soundEffects";
import { t } from "@/config/translate";

interface CakeTheme {
  id: string;
  bottom: string;
  top: string;
  swatch: string;
  isRainbow?: boolean;
}

const CAKE_THEMES: CakeTheme[] = [
  { id: "strawberry", bottom: "#ff9ec9", top: "#d8b4fe", swatch: "linear-gradient(135deg,#ff9ec9,#d8b4fe)" },
  { id: "sky", bottom: "#7dd3fc", top: "#fbcfe8", swatch: "linear-gradient(135deg,#7dd3fc,#fbcfe8)" },
  { id: "kuromi", bottom: "#c084fc", top: "#f5d0fe", swatch: "linear-gradient(135deg,#a855f7,#f5d0fe)" },
  { id: "lemon", bottom: "#fde047", top: "#ff9ec9", swatch: "linear-gradient(135deg,#fde047,#ff9ec9)" },
  { id: "mint", bottom: "#6ee7b7", top: "#c084fc", swatch: "linear-gradient(135deg,#6ee7b7,#c084fc)" },
  {
    id: "rainbow",
    bottom: "#ff7ab6",
    top: "#7dd3fc",
    swatch: "linear-gradient(135deg,#ff6eb4,#fde047,#6ee7b7,#7dd3fc,#c084fc)",
    isRainbow: true,
  },
];

const DRIP_COLORS = [
  { id: "cream", color: "#fff5fa" },
  { id: "pink", color: "#ff6eb4" },
  { id: "chocolate", color: "#78350f" },
  { id: "lavender", color: "#c084fc" },
  { id: "gold", color: "#fde047" },
  { id: "sky", color: "#38bdf8" },
];

type TopperId = "unicorn" | "pinkBunny" | "purpleBunny" | "star" | "gift";
type TabId = "frosting" | "drip" | "toppings" | "topper";

interface ToppingsState {
  strawberries: boolean;
  macarons: boolean;
  sprinkles: boolean;
  hearts: boolean;
  candles: boolean;
}

const SPRINKLE_COLORS = ["#ff6eb4", "#fde047", "#7dd3fc", "#c084fc", "#6ee7b7"];
const MACARON_COLORS = ["#ff7ab6", "#7dd3fc", "#fde047", "#c084fc", "#6ee7b7", "#fda4af"];
const CANDLE_COLORS = ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"];

function MiniCandle({ position, color }: { position: [number, number, number]; color: string }) {
  const flameRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!flameRef.current) return;
    const s = 1 + Math.sin(state.clock.elapsedTime * 13 + position[0] * 4) * 0.14;
    flameRef.current.scale.set(1, s, 1);
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.48, 14]} />
        <meshPhysicalMaterial color={color} roughness={0.22} clearcoat={0.6} />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.58, 0]}>
        <coneGeometry args={[0.07, 0.2, 14]} />
        <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function CustomCake3D({
  theme,
  dripColor,
  toppings,
  topper,
  partyMode,
}: {
  theme: CakeTheme;
  dripColor: string;
  toppings: ToppingsState;
  topper: TopperId;
  partyMode: boolean;
}) {
  const { viewport } = useThree();
  const isNarrow = viewport.width < 5.2;
  const cakeRef = useRef<THREE.Group>(null);

  const bottomDrips = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        return {
          x: Math.cos(angle) * 1.47,
          z: Math.sin(angle) * 1.47,
          len: 0.18 + ((i * 7) % 5) * 0.055,
        };
      }),
    []
  );

  const topDrips = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2 + 0.15;
        return {
          x: Math.cos(angle) * 1.02,
          z: Math.sin(angle) * 1.02,
          len: 0.14 + ((i * 5) % 4) * 0.05,
        };
      }),
    []
  );

  const sprinkles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const angle = (i / 30) * Math.PI * 2 + 0.12;
        const onTop = i % 3 === 0;
        const r = onTop ? 1.04 : 1.49;
        const y = onTop ? 0.55 + (i % 3) * 0.16 : -0.22 + (i % 4) * 0.13;
        return {
          pos: [Math.cos(angle) * r, y, Math.sin(angle) * r] as [number, number, number],
          rot: [0.4 * i, angle, 0.3 * i] as [number, number, number],
          color: SPRINKLE_COLORS[i % SPRINKLE_COLORS.length],
        };
      }),
    []
  );

  const ring6 = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return { a, x: Math.cos(a), z: Math.sin(a) };
      }),
    []
  );

  const candleRing = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return [Math.cos(a) * 0.72, 1.08, Math.sin(a) * 0.72] as [number, number, number];
      }),
    []
  );

  useFrame((state, delta) => {
    if (!cakeRef.current) return;
    if (partyMode) {
      cakeRef.current.rotation.y += delta * 1.6;
    } else {
      cakeRef.current.rotation.y += delta * 0.25;
    }
    cakeRef.current.position.y = -0.35 + (partyMode ? Math.abs(Math.sin(state.clock.elapsedTime * 6)) * 0.14 : 0);
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#fff5fa", "#e9d5ff", 0.65]} />
      <directionalLight position={[4, 8, 5]} intensity={1.25} color="#fff7ed" />
      <pointLight position={[-3, 3, 2]} intensity={0.65} color="#f472b6" />
      <pointLight position={[3, 2.5, 2]} intensity={0.6} color="#c084fc" />

      <RainbowArch3D position={[0, -0.7, -4.2]} scale={isNarrow ? 0.95 : 1.25} />
      <FluffyCloud3D position={[isNarrow ? -2.2 : -3.4, 1.5, -3]} scale={0.75} tint="#ffffff" />
      <FluffyCloud3D position={[isNarrow ? 2.2 : 3.4, 1.3, -2.8]} scale={0.78} tint="#fff0f7" />

      <group ref={cakeRef} position={[0, -0.35, 0]} scale={isNarrow ? 0.78 : 0.96}>
        {/* Golden Pedestal Stand */}
        <mesh position={[0, -0.52, 0]}>
          <cylinderGeometry args={[1.88, 1.66, 0.15, 42]} />
          <meshPhysicalMaterial color="#fde68a" metalness={0.45} roughness={0.2} clearcoat={0.6} />
        </mesh>
        <mesh position={[0, -0.78, 0]}>
          <cylinderGeometry args={[0.42, 0.72, 0.42, 28]} />
          <meshPhysicalMaterial color="#fbbf24" metalness={0.45} roughness={0.22} clearcoat={0.5} />
        </mesh>

        {/* Bottom Tier (either solid theme or 3-band rainbow!) */}
        {theme.isRainbow ? (
          <>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[1.48, 1.5, 0.29, 40]} />
              <meshPhysicalMaterial color="#ff7ab6" roughness={0.28} clearcoat={0.3} />
            </mesh>
            <mesh position={[0, -0.02, 0]}>
              <cylinderGeometry args={[1.46, 1.48, 0.29, 40]} />
              <meshPhysicalMaterial color="#fde047" roughness={0.28} clearcoat={0.3} />
            </mesh>
            <mesh position={[0, 0.26, 0]}>
              <cylinderGeometry args={[1.45, 1.46, 0.29, 40]} />
              <meshPhysicalMaterial color="#6ee7b7" roughness={0.28} clearcoat={0.3} />
            </mesh>
          </>
        ) : (
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[1.45, 1.5, 0.86, 40]} />
            <meshPhysicalMaterial color={theme.bottom} roughness={0.3} clearcoat={0.28} />
          </mesh>
        )}

        {/* Bottom Icing Cap + Drips */}
        <mesh position={[0, 0.41, 0]}>
          <cylinderGeometry args={[1.49, 1.49, 0.1, 40]} />
          <meshPhysicalMaterial color={dripColor} roughness={0.22} clearcoat={0.55} />
        </mesh>
        <Instances limit={bottomDrips.length} range={bottomDrips.length} frustumCulled={false}>
          <cylinderGeometry args={[0.075, 0.068, 1, 10]} />
          <meshPhysicalMaterial color={dripColor} roughness={0.22} clearcoat={0.55} />
          {bottomDrips.map((d, idx) => (
            <Instance key={`bd-${idx}`} position={[d.x, 0.36 - d.len / 2, d.z]} scale={[1, d.len, 1]} />
          ))}
        </Instances>
        <Instances limit={bottomDrips.length} range={bottomDrips.length} frustumCulled={false}>
          <sphereGeometry args={[0.068, 10, 10]} />
          <meshPhysicalMaterial color={dripColor} roughness={0.22} clearcoat={0.55} />
          {bottomDrips.map((d, idx) => (
            <Instance key={`bds-${idx}`} position={[d.x, 0.36 - d.len, d.z]} />
          ))}
        </Instances>

        {/* Top Tier */}
        {theme.isRainbow ? (
          <>
            <mesh position={[0, 0.58, 0]}>
              <cylinderGeometry args={[1.02, 1.04, 0.34, 40]} />
              <meshPhysicalMaterial color="#7dd3fc" roughness={0.28} clearcoat={0.3} />
            </mesh>
            <mesh position={[0, 0.91, 0]}>
              <cylinderGeometry args={[1.0, 1.02, 0.34, 40]} />
              <meshPhysicalMaterial color="#c084fc" roughness={0.28} clearcoat={0.3} />
            </mesh>
          </>
        ) : (
          <mesh position={[0, 0.74, 0]}>
            <cylinderGeometry args={[1.0, 1.04, 0.68, 40]} />
            <meshPhysicalMaterial color={theme.top} roughness={0.28} clearcoat={0.28} />
          </mesh>
        )}

        {/* Top Icing Cap + Drips */}
        <mesh position={[0, 1.08, 0]}>
          <cylinderGeometry args={[1.04, 1.04, 0.1, 40]} />
          <meshPhysicalMaterial color={dripColor} roughness={0.22} clearcoat={0.55} />
        </mesh>
        <Instances limit={topDrips.length} range={topDrips.length} frustumCulled={false}>
          <cylinderGeometry args={[0.062, 0.056, 1, 10]} />
          <meshPhysicalMaterial color={dripColor} roughness={0.22} clearcoat={0.55} />
          {topDrips.map((d, idx) => (
            <Instance key={`td-${idx}`} position={[d.x, 1.04 - d.len / 2, d.z]} scale={[1, d.len, 1]} />
          ))}
        </Instances>
        <Instances limit={topDrips.length} range={topDrips.length} frustumCulled={false}>
          <sphereGeometry args={[0.056, 10, 10]} />
          <meshPhysicalMaterial color={dripColor} roughness={0.22} clearcoat={0.55} />
          {topDrips.map((d, idx) => (
            <Instance key={`tds-${idx}`} position={[d.x, 1.04 - d.len, d.z]} />
          ))}
        </Instances>

        {/* Topping 1: Strawberries */}
        {toppings.strawberries &&
          ring6.map((p, i) => (
            <group key={`str-${i}`} position={[p.x * 1.24, 0.56, p.z * 1.24]}>
              <mesh rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.12, 0.24, 14]} />
                <meshPhysicalMaterial color="#fb7185" roughness={0.2} clearcoat={0.7} />
              </mesh>
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.11, 0.03, 0.05, 7]} />
                <meshStandardMaterial color="#4ade80" roughness={0.4} />
              </mesh>
            </group>
          ))}

        {/* Topping 2: Pastel Macarons */}
        {toppings.macarons &&
          ring6.map((p, i) => {
            const a = p.a + Math.PI / 6;
            const col = MACARON_COLORS[i % MACARON_COLORS.length];
            return (
              <group
                key={`mac-${i}`}
                position={[Math.cos(a) * 1.24, 0.55, Math.sin(a) * 1.24]}
                rotation={[0.15, -a, 0.15]}
              >
                <mesh position={[0, 0.055, 0]} scale={[1, 0.55, 1]}>
                  <sphereGeometry args={[0.14, 14, 14]} />
                  <meshPhysicalMaterial color={col} roughness={0.24} clearcoat={0.5} />
                </mesh>
                <mesh>
                  <cylinderGeometry args={[0.13, 0.13, 0.055, 14]} />
                  <meshStandardMaterial color="#fffaf5" roughness={0.4} />
                </mesh>
                <mesh position={[0, -0.055, 0]} scale={[1, 0.55, 1]}>
                  <sphereGeometry args={[0.14, 14, 14]} />
                  <meshPhysicalMaterial color={col} roughness={0.24} clearcoat={0.5} />
                </mesh>
              </group>
            );
          })}

        {/* Topping 3: Colorful 3D Sprinkles */}
        {toppings.sprinkles && (
          <Instances limit={sprinkles.length} range={sprinkles.length} frustumCulled={false}>
            <capsuleGeometry args={[0.024, 0.065, 4, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.25} />
            {sprinkles.map((s, idx) => (
              <Instance key={`sp-${idx}`} position={s.pos} rotation={s.rot} color={s.color} />
            ))}
          </Instances>
        )}

        {/* Topping 4: 3D Hearts around top rim */}
        {toppings.hearts &&
          ring6.map((p, i) => (
            <group
              key={`hrt-${i}`}
              position={[p.x * 1.06, 0.78, p.z * 1.06]}
              rotation={[0, -p.a + Math.PI / 2, 0]}
            >
              <ExtrudedHeart3D
                scale={0.34}
                color={i % 2 === 0 ? "#ff6eb4" : "#c084fc"}
              />
            </group>
          ))}

        {/* Topping 5: 5 Glowing Birthday Candles */}
        {toppings.candles &&
          candleRing.map((pos, idx) => (
            <MiniCandle key={`c-${idx}`} position={pos} color={CANDLE_COLORS[idx]} />
          ))}

        {/* Center Cake Topper! */}
        {topper === "unicorn" && (
          <CuteUnicorn3D position={[0, 1.24, 0]} scale={0.58} celebrating={partyMode} />
        )}
        {topper === "pinkBunny" && (
          <KawaiiBunnyFriend3D variant="pink" position={[0, 1.12, 0]} scale={0.85} />
        )}
        {topper === "purpleBunny" && (
          <KawaiiBunnyFriend3D variant="purple" position={[0, 1.12, 0]} scale={0.85} />
        )}
        {topper === "star" && (
          <Float speed={2.5} floatIntensity={0.2}>
            <ExtrudedStar3D position={[0, 1.62, 0]} scale={1.15} spin />
          </Float>
        )}
        {topper === "gift" && (
          <KawaiiGiftBox3D
            position={[0, 1.12, 0]}
            scale={0.95}
            boxColor="#ff85c0"
            ribbonColor="#fde047"
          />
        )}
      </group>

      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.3}
        scale={9}
        blur={2.4}
        far={3.5}
        // A soft blurred shadow looks the same at 256px; halves the per-frame shadow pass on phones
        resolution={256}
        color="#7e22ce"
      />
      <Sparkles count={45} scale={[6, 4.5, 4]} size={4} speed={0.45} color="#fef08a" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3.6}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

export function CakeDecoratorGame3D() {
  const [activeTab, setActiveTab] = useState<TabId>("frosting");
  const [themeId, setThemeId] = useState<string>("strawberry");
  const [dripColor, setDripColor] = useState<string>("#fff5fa");
  const [toppings, setToppings] = useState<ToppingsState>({
    strawberries: true,
    macarons: true,
    sprinkles: true,
    hearts: false,
    candles: true,
  });
  const [topper, setTopper] = useState<TopperId>("unicorn");
  const [partyMode, setPartyMode] = useState(false);
  const partyTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (partyTimerRef.current !== null) window.clearTimeout(partyTimerRef.current);
    },
    []
  );

  const currentTheme = CAKE_THEMES.find((c) => c.id === themeId) ?? CAKE_THEMES[0];

  const toggleTopping = (key: keyof ToppingsState) => {
    playPopSound(1.1);
    setToppings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSurprise = () => {
    playSparkleSound();
    const randTheme = CAKE_THEMES[Math.floor(Math.random() * CAKE_THEMES.length)];
    const randDrip = DRIP_COLORS[Math.floor(Math.random() * DRIP_COLORS.length)];
    const toppers: TopperId[] = ["unicorn", "pinkBunny", "purpleBunny", "star", "gift"];
    const randTopper = toppers[Math.floor(Math.random() * toppers.length)];
    setThemeId(randTheme.id);
    setDripColor(randDrip.color);
    setTopper(randTopper);
    setToppings({
      strawberries: Math.random() > 0.35,
      macarons: Math.random() > 0.35,
      sprinkles: Math.random() > 0.25,
      hearts: Math.random() > 0.45,
      candles: Math.random() > 0.3,
    });
  };

  const handleParty = () => {
    playVictoryFanfare();
    setPartyMode(true);
    confetti({
      particleCount: 130,
      spread: 95,
      origin: { y: 0.55 },
      colors: ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"],
    });
    // Tapping party again restarts the dance, so an older timer can't cut the new one short
    if (partyTimerRef.current !== null) window.clearTimeout(partyTimerRef.current);
    partyTimerRef.current = window.setTimeout(() => {
      partyTimerRef.current = null;
      setPartyMode(false);
    }, 3200);
  };

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "frosting", label: t.cakeStudio.tabFrosting, icon: Palette },
    { id: "drip", label: t.cakeStudio.tabDrip, icon: Droplets },
    { id: "toppings", label: t.cakeStudio.tabToppings, icon: SparklesIcon },
    { id: "topper", label: t.cakeStudio.tabTopper, icon: Crown },
  ];

  return (
    <div className="game-stage-root w-full">
      {/* 3D Interactive Cake Viewport */}
      <div className="game-stage-canvas relative mb-3 h-[46dvh] min-h-[290px] max-h-[460px] w-full touch-none overflow-hidden rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-sky-200/80 via-pink-100/80 to-purple-200/85 shadow-2xl shadow-purple-300/40 sm:mb-4 sm:h-[450px] sm:rounded-[2rem]">
        <Canvas camera={{ position: [0, 2.0, 5.7], fov: 44 }} dpr={[1, 1.5]}>
          <CustomCake3D
            theme={currentTheme}
            dripColor={dripColor}
            toppings={toppings}
            topper={topper}
            partyMode={partyMode}
          />
        </Canvas>

        {/* Top quick-action pills: Surprise & Party */}
        <div className="absolute top-3 right-3 left-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
          <button
            type="button"
            onClick={handleSurprise}
            className="font-display pointer-events-auto inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border-2 border-white bg-white/90 px-3.5 py-1.5 text-xs font-bold text-purple-800 shadow-md transition hover:scale-105 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
          >
            <Wand2 className="h-4 w-4 text-purple-500" />
            {t.cakeStudio.surpriseBtn}
          </button>

          <button
            type="button"
            onClick={handleParty}
            className="font-display pointer-events-auto inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md ring-2 ring-white transition hover:scale-105 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
          >
            <PartyPopper className="h-4 w-4" />
            {t.cakeStudio.partyBtn}
          </button>
        </div>
      </div>

      {/* Kid-Friendly Decorator Palette */}
      <div className="kawaii-card rounded-[1.75rem] p-3 sm:rounded-[2rem] sm:p-4">
        {/* Category Tabs */}
        <div className="mb-3 grid grid-cols-4 gap-1.5 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playPopSound(1.2);
                  setActiveTab(tab.id);
                }}
                className={`font-display flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-bold transition sm:flex-row sm:gap-1.5 sm:py-2.5 sm:text-sm ${
                  active
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                    : "bg-pink-50/90 text-purple-800 hover:bg-pink-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Cake Frosting Color Swatches */}
        {activeTab === "frosting" && (
          <div className="flex flex-wrap items-center justify-center gap-3 py-1">
            {CAKE_THEMES.map((c) => {
              const selected = themeId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    playPopSound(1);
                    setThemeId(c.id);
                  }}
                  aria-label={c.id}
                  style={{ background: c.swatch }}
                  className={`h-12 w-12 cursor-pointer rounded-full border-4 transition sm:h-14 sm:w-14 ${
                    selected
                      ? "scale-110 border-purple-700 shadow-lg ring-4 ring-pink-300/70"
                      : "border-white shadow hover:scale-105"
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Tab 2: Icing Drip Color Swatches */}
        {activeTab === "drip" && (
          <div className="flex flex-wrap items-center justify-center gap-3 py-1">
            {DRIP_COLORS.map((d) => {
              const selected = dripColor === d.color;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    playPopSound(1.08);
                    setDripColor(d.color);
                  }}
                  aria-label={d.id}
                  style={{ backgroundColor: d.color }}
                  className={`h-12 w-12 cursor-pointer rounded-full border-4 transition sm:h-14 sm:w-14 ${
                    selected
                      ? "scale-110 border-purple-700 shadow-lg ring-4 ring-pink-300/70"
                      : "border-white shadow hover:scale-105"
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Tab 3: Mix-and-Match Toppings */}
        {activeTab === "toppings" && (
          <div className="flex flex-wrap items-center justify-center gap-2 py-1">
            {(
              [
                ["strawberries", t.cakeStudio.toppings.strawberries, "🍓"],
                ["macarons", t.cakeStudio.toppings.macarons, "🧁"],
                ["sprinkles", t.cakeStudio.toppings.sprinkles, "✨"],
                ["hearts", t.cakeStudio.toppings.hearts, "💖"],
                ["candles", t.cakeStudio.toppings.candles, "🕯️"],
              ] as [keyof ToppingsState, string, string][]
            ).map(([key, label, emoji]) => {
              const on = toppings[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleTopping(key)}
                  className={`font-display inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-xs font-bold transition active:scale-95 sm:px-4 sm:text-sm ${
                    on
                      ? "border-pink-400 bg-pink-100 text-pink-700 shadow-sm"
                      : "border-purple-100 bg-white/80 text-purple-700/75 hover:bg-purple-50"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 4: Cake Topper Selector */}
        {activeTab === "topper" && (
          <div className="flex flex-wrap items-center justify-center gap-2 py-1">
            {(
              [
                ["unicorn", t.cakeStudio.toppers.unicorn, "🦄"],
                ["pinkBunny", t.cakeStudio.toppers.pinkBunny, "🎀"],
                ["purpleBunny", t.cakeStudio.toppers.purpleBunny, "💜"],
                ["star", t.cakeStudio.toppers.star, "⭐"],
                ["gift", t.cakeStudio.toppers.gift, "🎁"],
              ] as [TopperId, string, string][]
            ).map(([id, label, emoji]) => {
              const selected = topper === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    playSparkleSound();
                    setTopper(id);
                  }}
                  className={`font-display inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-xs font-bold transition active:scale-95 sm:px-4 sm:text-sm ${
                    selected
                      ? "border-purple-500 bg-purple-100 text-purple-900 shadow-sm"
                      : "border-purple-100 bg-white/80 text-purple-700/80 hover:bg-purple-50"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
