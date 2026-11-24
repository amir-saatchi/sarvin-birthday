"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import confetti from "canvas-confetti";
import { Heart, RotateCcw, Star, Trophy } from "lucide-react";
import { playPopSound, playSparkleSound, playVictoryFanfare } from "@/lib/soundEffects";
import { t } from "@/config/translate";
import { CastleMusic, castleZoneAt } from "@/lib/castleMusic";
import { useBirthdayAudio } from "../audio/AudioProvider";
import { playerWorldPos } from "./castle-world/playerTracker";
import { CastleWorldScene } from "./castle-world/CastleWorldScene";
import { WorldWarmup } from "./castle-world/WorldWarmup";
import { HEART_TRAIL, STAR_SPOTS } from "./castle-world/worldData";

export function CastleWorldGame3D() {
  const [collectedStars, setCollectedStars] = useState<boolean[]>(() =>
    Array(STAR_SPOTS.length).fill(false)
  );
  const [collectedHearts, setCollectedHearts] = useState<boolean[]>(() =>
    Array(HEART_TRAIL.length).fill(false)
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  // Bumped on restart so the scene (and the unicorn's position refs) remounts from the start spot
  const [round, setRound] = useState(0);
  // False until the world's shaders are compiled: the canvas draws nothing until then
  const [worldReady, setWorldReady] = useState(false);
  const toastTimerRef = useRef<number | null>(null);
  // Synchronous guards so a collect fired repeatedly (every frame, StrictMode) is handled once
  const starsSeenRef = useRef<boolean[]>(Array(STAR_SPOTS.length).fill(false));
  const heartsSeenRef = useRef<boolean[]>(Array(HEART_TRAIL.length).fill(false));

  const starsFound = collectedStars.filter(Boolean).length;
  const heartsFound = collectedHearts.filter(Boolean).length;
  const won = starsFound === STAR_SPOTS.length;
  const oneStarLeft = starsFound === STAR_SPOTS.length - 1;

  // Background music: an original chiptune theme re-arranged per land, replacing the site music while
  // the game is open. Plays unless the player paused or muted the site music.
  const { isPlaying, isMuted, hasEntered, setGameMusic } = useBirthdayAudio();
  const musicOn = !isMuted && (isPlaying || !hasEntered);
  const musicRef = useRef<CastleMusic | null>(null);

  useEffect(() => {
    setGameMusic(t.castleWorld.musicTitle);
    return () => setGameMusic(null);
  }, [setGameMusic]);

  useEffect(() => {
    if (!musicOn) return;
    const music = new CastleMusic();
    music.start(castleZoneAt(playerWorldPos.x, playerWorldPos.z));
    musicRef.current = music;
    const zoneTimer = window.setInterval(
      () => music.setZone(castleZoneAt(playerWorldPos.x, playerWorldPos.z)),
      300
    );
    return () => {
      window.clearInterval(zoneTimer);
      music.stop();
      musicRef.current = null;
    };
  }, [musicOn]);

  useEffect(() => {
    musicRef.current?.setUrgent(oneStarLeft);
  }, [oneStarLeft, musicOn]);

  const clearToastTimer = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  };

  useEffect(() => clearToastTimer, []);

  // Win celebration: fires once per round, when the last star is collected
  useEffect(() => {
    if (!won) return;
    playVictoryFanfare();
    musicRef.current?.restartAfter(2.6);
    confetti({
      particleCount: 180,
      spread: 115,
      origin: { y: 0.5 },
      colors: ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"],
    });
  }, [won]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    clearToastTimer();
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 3200);
  };

  const handleCollectStar = (idx: number) => {
    if (starsSeenRef.current[idx]) return;
    starsSeenRef.current[idx] = true;
    playSparkleSound();
    setCollectedStars((prev) => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  const handleCollectHeart = (idx: number) => {
    if (heartsSeenRef.current[idx]) return;
    heartsSeenRef.current[idx] = true;
    playPopSound(1.2);
    setCollectedHearts((prev) => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  const handleRestart = () => {
    starsSeenRef.current = Array(STAR_SPOTS.length).fill(false);
    heartsSeenRef.current = Array(HEART_TRAIL.length).fill(false);
    setCollectedStars(Array(STAR_SPOTS.length).fill(false));
    setCollectedHearts(Array(HEART_TRAIL.length).fill(false));
    setToastMsg(null);
    clearToastTimer();
    setRound((r) => r + 1);
  };

  return (
    <div className="game-stage-root game-stage-immersive w-full">
      {/* Compact HUD (floats over the canvas in fullscreen) */}
      <div className="game-stage-hud mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-white/90 bg-white/85 px-3 py-2 shadow-md backdrop-blur sm:mb-4 sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-3">
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
        <Canvas camera={{ position: [0, 8.2, 22.0], fov: 46 }} dpr={[1, 1.5]}>
          <CastleWorldScene
            key={round}
            collectedStars={collectedStars}
            collectedHearts={collectedHearts}
            won={won}
            onCollectStar={handleCollectStar}
            onCollectHeart={handleCollectHeart}
            onTriggerMessage={showToast}
          />
          <WorldWarmup onReady={() => setWorldReady(true)} />
        </Canvas>

        {!worldReady && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-purple-400 via-pink-200 to-emerald-200">
            <div className="font-display animate-pulse text-lg font-bold text-purple-900 sm:text-xl">
              {t.castleWorld.loading}
            </div>
          </div>
        )}

        {/* Kawaii Friend / Castle / Fountain Speech Toast */}
        {toastMsg && !won && (
          <div className="game-stage-top-overlay pointer-events-none absolute top-3 left-1/2 z-20 w-[90%] max-w-md -translate-x-1/2 text-center">
            <div className="font-display inline-block rounded-full border-2 border-white bg-white/92 px-4 py-2 text-xs font-bold text-purple-900 shadow-lg backdrop-blur sm:text-sm">
              {toastMsg}
            </div>
          </div>
        )}

        {/* All 7 Stars Win Celebration */}
        {/* Compact banner at the top and the button at the bottom, so the celebrating pony stays visible */}
        {won && (
          <>
            <div className="game-stage-top-overlay pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-center text-center">
              <div className="kawaii-card max-w-sm rounded-2xl px-4 py-2.5">
                <h2 className="font-display flex items-center justify-center gap-1.5 text-lg font-bold text-purple-900 sm:text-xl">
                  <Trophy className="h-5 w-5 shrink-0 text-amber-500" />
                  {t.castleWorld.winTitle}
                </h2>
                <p className="mt-0.5 text-[11px] leading-snug font-bold text-purple-700 sm:text-xs">
                  {t.castleWorld.winMessage}
                </p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center">
              <button
                type="button"
                onClick={handleRestart}
                className="font-display inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-white bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                {t.castleWorld.playAgain}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
