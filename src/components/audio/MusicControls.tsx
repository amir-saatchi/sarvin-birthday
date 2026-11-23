"use client";

import React from "react";
import { Music, Pause, Play, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useBirthdayAudio } from "./AudioProvider";
import { t } from "@/config/translate";

export function MusicControls() {
  const { isPlaying, isMuted, trackTitle, hasMultipleTracks, togglePlay, toggleMute, nextTrack } =
    useBirthdayAudio();

  return (
    <div
      className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 rounded-full border-2 border-pink-300/80 bg-white/90 px-2.5 py-1.5 shadow-lg backdrop-blur-md sm:bottom-4 sm:right-4 sm:gap-2 sm:px-3 sm:py-2"
      aria-label={t.audio.controlsAriaLabel}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-sm">
        <Music className={`h-4 w-4 ${isPlaying && !isMuted ? "animate-bounce" : ""}`} />
      </div>

      <span className="hidden max-w-[140px] truncate text-xs font-bold text-purple-900 sm:inline">
        {trackTitle}
      </span>

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? t.audio.pauseAria : t.audio.playAria}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-pink-100 text-pink-600 transition hover:scale-105 hover:bg-pink-200 active:scale-95"
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
      </button>

      {hasMultipleTracks && (
        <button
          type="button"
          onClick={nextTrack}
          aria-label={t.audio.nextAria}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-purple-100 text-purple-700 transition hover:scale-105 hover:bg-purple-200 active:scale-95"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      )}

      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? t.audio.unmuteAria : t.audio.muteAria}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-purple-100 text-purple-700 transition hover:scale-105 hover:bg-purple-200 active:scale-95"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
