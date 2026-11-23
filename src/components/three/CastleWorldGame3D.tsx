"use client";

import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import confetti from "canvas-confetti";
import { Heart, RotateCcw, Star, Trophy } from "lucide-react";
import { playPopSound, playSparkleSound, playVictoryFanfare } from "@/lib/soundEffects";
import { t } from "@/config/translate";
import { CastleWorldScene } from "./castle-world/CastleWorldScene";
import { HEART_TRAIL, STAR_SPOTS } from "./castle-world/worldData";

export function CastleWorldGame3D() {
  const [collectedStars, setCollectedStars] = useState<boolean[]>(() =>
    Array(STAR_SPOTS.length).fill(false)
  );
  const [collectedHearts, setCollectedHearts] = useState<boolean[]>(() =>
    Array(HEART_TRAIL.length).fill(false)
  );
  const [won, setWon] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const starsFound = collectedStars.filter(Boolean).length;
  const heartsFound = collectedHearts.filter(Boolean).length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 3200);
  };

  const handleCollectStar = (idx: number) => {
    setCollectedStars((prev) => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      playSparkleSound();

      if (next.every(Boolean)) {
        setWon(true);
        playVictoryFanfare();
        confetti({
          particleCount: 180,
          spread: 115,
          origin: { y: 0.5 },
          colors: ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"],
        });
      }
      return next;
    });
  };

  const handleCollectHeart = (idx: number) => {
    setCollectedHearts((prev) => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      playPopSound(1.2);
      return next;
    });
  };

  const handleRestart = () => {
    setCollectedStars(Array(STAR_SPOTS.length).fill(false));
    setCollectedHearts(Array(HEART_TRAIL.length).fill(false));
    setWon(false);
    setToastMsg(null);
  };

  return (
    <div className="game-stage-root w-full">
      {/* Compact HUD */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-white/90 bg-white/85 px-3 py-2 shadow-md backdrop-blur sm:mb-4 sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 sm:px-4 sm:py-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500 sm:h-5 sm:w-5" />
            <span className="font-display text-sm font-bold text-purple-900 sm:text-lg">
              {t.castleWorld.starsLabel(starsFound, STAR_SPOTS.length)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 sm:px-4 sm:py-1.5">
            <Heart className="h-4 w-4 fill-pink-500 text-pink-500 sm:h-5 sm:w-5" />
            <span className="font-display text-sm font-bold text-purple-900 sm:text-lg">
              {t.castleWorld.heartsLabel(heartsFound)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="font-display inline-flex cursor-pointer items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 transition hover:bg-purple-100 active:scale-95 sm:px-3.5 sm:py-2 sm:text-sm"
        >
          <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {t.castleWorld.restart}
        </button>
      </div>

      {/* 3D Open World Exploration Canvas */}
      <div className="game-stage-canvas relative h-[60dvh] min-h-[360px] max-h-[580px] w-full touch-none overflow-hidden rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-purple-500/85 via-fuchsia-300/80 to-sky-200/90 shadow-2xl shadow-purple-300/40 sm:h-[540px] sm:rounded-[2rem]">
        <Canvas camera={{ position: [0, 8.2, 22.0], fov: 46 }} dpr={[1, 2]}>
          <CastleWorldScene
            collectedStars={collectedStars}
            collectedHearts={collectedHearts}
            won={won}
            onCollectStar={handleCollectStar}
            onCollectHeart={handleCollectHeart}
            onTriggerMessage={showToast}
          />
        </Canvas>

        {/* Kawaii Friend / Castle / Fountain Speech Toast */}
        {toastMsg && !won && (
          <div className="pointer-events-none absolute top-3 left-1/2 z-20 w-[90%] max-w-md -translate-x-1/2 text-center">
            <div className="font-display inline-block rounded-full border-2 border-white bg-white/92 px-4 py-2 text-xs font-bold text-purple-900 shadow-lg backdrop-blur sm:text-sm">
              {toastMsg}
            </div>
          </div>
        )}

        {/* All 7 Stars Win Celebration */}
        {won && (
          <div className="absolute inset-x-3 top-6 z-20 flex flex-col items-center text-center sm:inset-x-4 sm:top-8">
            <div className="kawaii-card max-w-sm rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                <Trophy className="h-4 w-4 text-amber-500" />
                {t.castleWorld.winBadge}
              </div>
              <h2 className="font-display mb-2 text-2xl font-bold text-purple-900 sm:text-3xl">
                {t.castleWorld.winTitle}
              </h2>
              <p className="mb-4 text-sm font-bold text-purple-700">
                {t.castleWorld.winMessage}
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="font-display inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2.5 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                {t.castleWorld.playAgain}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
