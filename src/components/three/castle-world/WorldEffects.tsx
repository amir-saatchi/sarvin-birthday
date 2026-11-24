"use client";

import { useState } from "react";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

// A gentle bloom: only the brightest bits (glowing crystals, lamps, stars, heart coins) get a soft
// halo, while the pastel grass and walls stay crisp. The composer turns the renderer's own tone mapping
// off, so the same ACES tone mapping R3F uses by default is applied last to keep the colours unchanged.
//
// Mounted only after <WorldWarmup> is done: the composer draws on its own, so it would otherwise draw
// the world before its shaders are ready.
//
// Off on phones and tablets: there the world flickered to solid black every few frames with it on. On
// some mobile GPUs a single pixel comes out NaN, and the bloom's mipmap blur spreads it down to its
// smallest level, so every pixel gets NaN added and turns black. The extra full-screen passes also cost
// the most on those GPUs. Without it R3F draws as before, with the same tone mapping, just no halos.
// `?fx=1` / `?fx=0` in the address forces it on or off, to compare on a device.

function effectsWanted() {
  if (typeof window === "undefined") return false;
  const fx = new URLSearchParams(window.location.search).get("fx");
  if (fx === "1") return true;
  if (fx === "0") return false;
  return !window.matchMedia("(pointer: coarse)").matches;
}

export function WorldEffects() {
  const [enabled] = useState(effectsWanted);
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={1.0} luminanceSmoothing={0.3} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
