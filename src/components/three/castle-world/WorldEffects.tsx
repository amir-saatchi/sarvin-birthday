"use client";

import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

// A gentle bloom: only the brightest bits (glowing crystals, lamps, stars, heart coins) get a soft
// halo, while the pastel grass and walls stay crisp. The composer turns the renderer's own tone mapping
// off, so the same ACES tone mapping R3F uses by default is applied last to keep the colours unchanged.
//
// Mounted only after <WorldWarmup> is done: the composer draws on its own, so it would otherwise draw
// the world before its shaders are ready.
export function WorldEffects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={1.0} luminanceSmoothing={0.3} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
