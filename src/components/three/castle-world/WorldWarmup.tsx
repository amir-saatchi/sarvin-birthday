"use client";

import { useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";

// The first frame of a big scene compiles every shader program on the spot, and the browser waits for
// each one to finish: about a second of frozen page. <WorldWarmup> holds back drawing until the world
// has mounted and its models have loaded, then compiles all the programs with the renderer's
// compileAsync, which lets the GPU driver compile them in the background (KHR_parallel_shader_compile)
// while the page stays responsive. Drawing starts once they are ready.

/** Never wait longer than this for models or shaders: draw anyway */
const MAX_WAIT_MS = 6000;
/** Frames to let React commit and Suspense fallbacks swap for the loaded models before compiling */
const SETTLE_FRAMES = 3;

/** While mounted, a positive-priority frame callback takes rendering over from R3F, and it draws nothing */
function HoldRender() {
  useFrame(() => {}, 1);
  return null;
}

export function WorldWarmup({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let settled = 0;
    const start = performance.now();
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      cancelAnimationFrame(raf);
      setReady(true);
      onReady();
    };
    const timeout = window.setTimeout(finish, MAX_WAIT_MS);

    const waitForModels = () => {
      if (cancelled) return;
      // Wait until no model is loading, then a few quiet frames so React has swapped them in
      settled = useProgress.getState().active ? 0 : settled + 1;
      if (settled < SETTLE_FRAMES && performance.now() - start < MAX_WAIT_MS) {
        raf = requestAnimationFrame(waitForModels);
        return;
      }
      // Reading every program's error log on first use waits on the driver; dev builds keep it for
      // readable shader errors
      if (process.env.NODE_ENV === "production") gl.debug.checkShaderErrors = false;
      scene.updateMatrixWorld();
      gl.compileAsync(scene, camera).then(finish, finish);
    };
    raf = requestAnimationFrame(waitForModels);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
    // Runs once per canvas; onReady is only called, never a reason to start over
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  return ready ? null : <HoldRender />;
}
