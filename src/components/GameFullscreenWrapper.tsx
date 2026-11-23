"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Maximize2, Minimize2, Sparkles } from "lucide-react";
import { t } from "@/config/translate";

interface GameFullscreenWrapperProps {
  title: string;
  subtitle: string;
  tip: string;
  tipIconColor?: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}

export function GameFullscreenWrapper({
  title,
  subtitle,
  tip,
  tipIconColor = "text-pink-500",
  badge,
  children,
}: GameFullscreenWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Sync if user exits native fullscreen via browser ESC / gesture
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, exitFullscreen]);

  // Lock body scroll while in fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen]);

  // Clean up native fullscreen if navigating away
  useEffect(() => {
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      data-game-fullscreen={isFullscreen ? "true" : "false"}
      className={
        isFullscreen
          ? "fixed inset-0 z-40 flex h-[100dvh] w-screen flex-col bg-gradient-to-br from-pink-100 via-purple-100 to-sky-100 p-2 pb-[4.5rem] sm:p-4 sm:pb-20"
          : "mx-auto max-w-5xl px-3 pt-3 sm:px-6 sm:pt-5"
      }
    >
      {/* Normal-mode Header with Enter Fullscreen Button */}
      {!isFullscreen && (
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="shrink-0">{badge}</div>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold text-purple-900 sm:text-4xl">
                {title}
              </h1>
              <p className="hidden text-sm font-bold text-purple-700/85 sm:block">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={enterFullscreen}
            aria-label={t.nav.enterFullscreen}
            title={t.nav.enterFullscreen}
            className="font-display inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-2 border-white bg-white/90 px-3 py-2 text-xs font-bold text-purple-800 shadow-md transition hover:scale-105 hover:bg-pink-50 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
          >
            <Maximize2 className="h-4 w-4 text-pink-500" />
            <span className="hidden sm:inline">{t.nav.enterFullscreen}</span>
          </button>
        </div>
      )}

      {/* Game Content (expands to fill full viewport in fullscreen mode) */}
      <div className={isFullscreen ? "flex min-h-0 flex-1 flex-col" : "w-full"}>
        {children}
      </div>

      {/* Normal-mode Tip */}
      {!isFullscreen && (
        <div className="mt-3 flex items-center justify-center gap-2 text-center text-xs font-bold text-purple-800/75 sm:mt-4 sm:text-sm">
          <Sparkles className={`h-4 w-4 shrink-0 ${tipIconColor}`} />
          <span>{tip}</span>
        </div>
      )}

      {/* Fullscreen Footer Exit Icon (pairs cleanly with bottom-right MusicControls) */}
      {isFullscreen && (
        <button
          type="button"
          onClick={exitFullscreen}
          aria-label={t.nav.exitFullscreen}
          title={t.nav.exitFullscreen}
          className="fixed bottom-3 left-3 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-purple-300/90 bg-white/92 text-purple-800 shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-pink-50 active:scale-95 sm:bottom-4 sm:left-4 sm:h-[52px] sm:w-[52px]"
        >
          <Minimize2 className="h-5 w-5 text-pink-600 sm:h-6 sm:w-6" />
        </button>
      )}
    </div>
  );
}
