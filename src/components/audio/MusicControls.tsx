"use client";

import React from "react";
import { Music, Pause, Play, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useBirthdayAudio } from "./AudioProvider";

export function MusicControls() {
  const { isPlaying, isMuted, trackTitle, hasMultipleTracks, togglePlay, toggleMute, nextTrack } =
    useBirthdayAudio();

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border-2 border-pink-300/80 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md"
      aria-label="Birthday Music Controls"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-sm">
        <Music className={`h-4 w-4 ${isPlaying && !isMuted ? "animate-bounce" : ""}`} />
      </div>

      <span className="hidden max-w-[130px] truncate text-xs font-bold text-purple-900 sm:inline">
        {trackTitle}
      </span>

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-pink-100 text-pink-600 transition hover:scale-105 hover:bg-pink-200 active:scale-95"
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
      </button>

      {hasMultipleTracks && (
        <button
          type="button"
          onClick={nextTrack}
          aria-label="Next song"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-purple-100 text-purple-700 transition hover:scale-105 hover:bg-purple-200 active:scale-95"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      )}

      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute music" : "Mute music"}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-purple-100 text-purple-700 transition hover:scale-105 hover:bg-purple-200 active:scale-95"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
