"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { MUSIC_TRACKS } from "@/config/music";
import { t } from "@/config/translate";
import { installAudioUnlock } from "@/lib/soundEffects";

interface AudioContextValue {
  isPlaying: boolean;
  isMuted: boolean;
  hasEntered: boolean;
  trackTitle: string;
  hasMultipleTracks: boolean;
  startExperience: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  nextTrack: () => void;
  /** A game playing its own music: the site music pauses and the player shows this title (null = done). */
  setGameMusic: (title: string | null) => void;
}

const BirthdayAudioContext = createContext<AudioContextValue | null>(null);

// Gentle Happy Birthday music-box melody [frequencyHz, durationSeconds]
const HAPPY_BIRTHDAY_MELODY: [number, number][] = [
  // Happy birthday to you
  [392.0, 0.32], [392.0, 0.22], [440.0, 0.52], [392.0, 0.52], [523.25, 0.52], [493.88, 0.95],
  // Happy birthday to you
  [392.0, 0.32], [392.0, 0.22], [440.0, 0.52], [392.0, 0.52], [587.33, 0.52], [523.25, 0.95],
  // Happy birthday dear Sarvin
  [392.0, 0.32], [392.0, 0.22], [783.99, 0.52], [659.25, 0.52], [523.25, 0.52], [493.88, 0.52], [440.0, 0.85],
  // Happy birthday to you
  [698.46, 0.32], [698.46, 0.22], [659.25, 0.52], [523.25, 0.52], [587.33, 0.52], [523.25, 1.15],
  // Pause before looping
  [0, 0.9],
];

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [useFallbackSynth, setUseFallbackSynth] = useState(MUSIC_TRACKS.length === 0);
  const [gameMusicTitle, setGameMusic] = useState<string | null>(null);
  const gameMusicActive = gameMusicTitle !== null;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<number | null>(null);
  const noteIdxRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isMutedRef = useRef(false);

  // Unlock the shared sound-effect AudioContext on the first tap/key (needed on iOS Safari)
  useEffect(() => {
    installAudioUnlock();
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const stopSynth = useCallback(() => {
    if (synthTimerRef.current !== null) {
      window.clearTimeout(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  }, []);

  const playSynthNote = useCallback(() => {
    if (!isPlayingRef.current) return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!synthCtxRef.current) {
      synthCtxRef.current = new AudioCtx();
    }
    const ctx = synthCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const [freq, dur] = HAPPY_BIRTHDAY_MELODY[noteIdxRef.current];
    noteIdxRef.current = (noteIdxRef.current + 1) % HAPPY_BIRTHDAY_MELODY.length;

    if (freq > 0 && !isMutedRef.current) {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const gain = ctx.createGain();
      const harmonicGain = ctx.createGain();

      // Dreamy celesta / music-box timbre
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      harmonic.type = "triangle";
      harmonic.frequency.setValueAtTime(freq * 2, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(dur * 1.15, 0.35));

      harmonicGain.gain.setValueAtTime(0.001, now);
      harmonicGain.gain.linearRampToValueAtTime(0.028, now + 0.015);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(dur * 0.7, 0.2));

      osc.connect(gain);
      harmonic.connect(harmonicGain);
      gain.connect(ctx.destination);
      harmonicGain.connect(ctx.destination);

      osc.start(now);
      harmonic.start(now);
      osc.stop(now + Math.max(dur * 1.2, 0.38));
      harmonic.stop(now + Math.max(dur * 0.75, 0.22));
    }

    synthTimerRef.current = window.setTimeout(playSynthNote, dur * 1000);
  }, []);

  // Manage MP3 or Synth playback when state changes
  useEffect(() => {
    if (!isPlaying || gameMusicActive) {
      stopSynth();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    if (useFallbackSynth || MUSIC_TRACKS.length === 0) {
      stopSynth();
      playSynthNote();
      return () => stopSynth();
    }

    const track = MUSIC_TRACKS[trackIndex % MUSIC_TRACKS.length];
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.55;
      audioRef.current.loop = MUSIC_TRACKS.length === 1;
    }

    const audio = audioRef.current;
    audio.muted = isMutedRef.current;
    if (!audio.src.endsWith(track.src)) {
      audio.src = track.src;
    }

    const handleEnded = () => {
      if (MUSIC_TRACKS.length > 1) {
        setTrackIndex((prev) => (prev + 1) % MUSIC_TRACKS.length);
      }
    };

    const handleError = () => {
      // Gracefully fall back to music box if MP3 file hasn't been added yet
      setUseFallbackSynth(true);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    audio.play().catch(() => {
      setUseFallbackSynth(true);
    });

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [isPlaying, gameMusicActive, trackIndex, useFallbackSynth, playSynthNote, stopSynth]);

  useEffect(() => {
    return () => {
      stopSynth();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [stopSynth]);

  const startExperience = useCallback(() => {
    setHasEntered(true);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setHasEntered(true);
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    if (MUSIC_TRACKS.length > 1) {
      setTrackIndex((prev) => (prev + 1) % MUSIC_TRACKS.length);
    }
  }, []);

  const trackTitle =
    gameMusicTitle ??
    (!useFallbackSynth && MUSIC_TRACKS.length > 0
      ? MUSIC_TRACKS[trackIndex % MUSIC_TRACKS.length].title
      : t.audio.fallbackTrackTitle);

  return (
    <BirthdayAudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        hasEntered,
        trackTitle,
        hasMultipleTracks: !gameMusicActive && !useFallbackSynth && MUSIC_TRACKS.length > 1,
        startExperience,
        togglePlay,
        toggleMute,
        nextTrack,
        setGameMusic,
      }}
    >
      {children}
    </BirthdayAudioContext.Provider>
  );
}

export function useBirthdayAudio() {
  const ctx = useContext(BirthdayAudioContext);
  if (!ctx) {
    throw new Error("useBirthdayAudio must be used within AudioProvider");
  }
  return ctx;
}
