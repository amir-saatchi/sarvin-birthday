"use client";

import { createContext, useContext } from "react";
import { useFrame as useR3FFrame, type RenderCallback } from "@react-three/fiber";

/** True while the land around a component is near enough to animate (always true outside a land) */
export const LandActiveContext = createContext<{ current: boolean }>({ current: true });

/**
 * useFrame for the world's props: inside a <Land> the callback is skipped while that land is too far
 * away to see it move (see Land.tsx). Same signature as R3F's useFrame.
 */
export function useFrame(callback: RenderCallback, renderPriority?: number) {
  const active = useContext(LandActiveContext);
  useR3FFrame((state, delta, frame) => {
    if (active.current) callback(state, delta, frame);
  }, renderPriority);
}
