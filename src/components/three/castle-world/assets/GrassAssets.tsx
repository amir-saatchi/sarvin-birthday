"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "../types";

// Lawn look for the green lands: a generated, seamlessly tiling grass texture (soft light/dark
// patches, blade strokes, a few tiny flowers) on the deck's top face, plus instanced grass tufts
// that sway in the wind. Cheap: one 512px texture per base colour and one draw call per tuft field.

const TEX_SIZE = 512;
// World units covered by one texture tile
const TILE_WORLD = 7;

const textureCache = new Map<string, THREE.CanvasTexture>();

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function makeGrassCanvas(base: string): HTMLCanvasElement {
  const S = TEX_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S;
  const g = canvas.getContext("2d")!;
  const hsl = { h: 0, s: 0, l: 0 };
  new THREE.Color(base).getHSL(hsl);
  const shade = (dl: number, ds = 0, dh = 0, a = 1) =>
    `hsla(${((hsl.h + dh + 1) % 1) * 360}, ${clamp01(hsl.s + ds) * 100}%, ${clamp01(hsl.l + dl) * 100}%, ${a})`;
  const rand = mulberry32(7);

  // Draw at (x, y) and at the wrapped copies so the tile repeats without seams
  const wrapped = (x: number, y: number, r: number, draw: (x: number, y: number) => void) => {
    for (const dx of [-S, 0, S]) {
      for (const dy of [-S, 0, S]) {
        const px = x + dx;
        const py = y + dy;
        if (px > -r && px < S + r && py > -r && py < S + r) draw(px, py);
      }
    }
  };

  g.fillStyle = shade(0);
  g.fillRect(0, 0, S, S);

  // Soft sunny and shady patches
  for (let i = 0; i < 28; i++) {
    const x = rand() * S;
    const y = rand() * S;
    const r = 40 + rand() * 90;
    const light = rand() < 0.5;
    const inner = light ? shade(0.07, -0.03, -0.02, 0.4) : shade(-0.06, 0.04, 0.01, 0.32);
    const outer = light ? shade(0.07, -0.03, -0.02, 0) : shade(-0.06, 0.04, 0.01, 0);
    wrapped(x, y, r, (px, py) => {
      const grad = g.createRadialGradient(px, py, 0, px, py, r);
      grad.addColorStop(0, inner);
      grad.addColorStop(1, outer);
      g.fillStyle = grad;
      g.fillRect(px - r, py - r, r * 2, r * 2);
    });
  }

  // Grass blade strokes, seen from above
  g.lineCap = "round";
  for (let i = 0; i < 2600; i++) {
    const x = rand() * S;
    const y = rand() * S;
    const len = 5 + rand() * 8;
    const ang = rand() * Math.PI * 2;
    const bend = (rand() - 0.5) * 4;
    const dark = rand() < 0.55;
    g.strokeStyle = dark ? shade(-0.11, 0.05, 0.01, 0.42) : shade(0.1, -0.06, -0.025, 0.42);
    g.lineWidth = 1 + rand() * 0.9;
    const ex = Math.cos(ang) * len;
    const ey = Math.sin(ang) * len;
    wrapped(x, y, len, (px, py) => {
      g.beginPath();
      g.moveTo(px, py);
      g.quadraticCurveTo(px + ex * 0.5 - ey * 0.1 * bend, py + ey * 0.5 + ex * 0.1 * bend, px + ex, py + ey);
      g.stroke();
    });
  }

  // A few tiny flowers
  const petals = ["#ffffff", "#fde047", "#f9a8d4", "#ffffff"];
  for (let i = 0; i < 16; i++) {
    const x = rand() * S;
    const y = rand() * S;
    const color = petals[i % petals.length];
    wrapped(x, y, 6, (px, py) => {
      g.fillStyle = color;
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        g.beginPath();
        g.arc(px + Math.cos(a) * 2.2, py + Math.sin(a) * 2.2, 1.7, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = color === "#fde047" ? "#f97316" : "#fde047";
      g.beginPath();
      g.arc(px, py, 1.3, 0, Math.PI * 2);
      g.fill();
    });
  }

  return canvas;
}

function useGrassTexture(base: string, sizeX: number, sizeZ: number) {
  const tex = useMemo(() => {
    let shared = textureCache.get(base);
    if (!shared) {
      shared = new THREE.CanvasTexture(makeGrassCanvas(base));
      shared.wrapS = shared.wrapT = THREE.RepeatWrapping;
      shared.colorSpace = THREE.SRGBColorSpace;
      shared.anisotropy = 8;
      textureCache.set(base, shared);
    }
    // Clones share the image (one GPU upload); each only sets its own repeat
    const t = shared.clone();
    t.repeat.set(sizeX / TILE_WORLD, sizeZ / TILE_WORLD);
    t.needsUpdate = true;
    return t;
  }, [base, sizeX, sizeZ]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/** Grass-topped deck box: textured lawn on the top face, plain colour on the sides. */
export function GrassDeck3D({
  position,
  size,
  color,
  onPointerDown,
}: {
  position: Vec3;
  size: [number, number, number];
  color: string;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const [w, h, d] = size;
  const map = useGrassTexture(color, w, d);
  const materials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const top = new THREE.MeshStandardMaterial({ map, roughness: 0.78 });
    // BoxGeometry face order: +x, -x, +y (top), -y, +z, -z
    return [side, side, top, side, side, side];
  }, [color, map]);
  useEffect(
    () => () => {
      materials[0].dispose();
      materials[2].dispose();
    },
    [materials]
  );

  return (
    <mesh position={position} onPointerDown={onPointerDown} receiveShadow material={materials}>
      <boxGeometry args={[w, h, d]} />
    </mesh>
  );
}

// One tuft: five thin blades fanning out from a point, dark at the root, light at the tip
function makeTuftGeometry() {
  const blades = 5;
  const pos: number[] = [];
  const col: number[] = [];
  const root = new THREE.Color("#166534");
  const tip = new THREE.Color("#86efac");
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2 + i * 0.4;
    const lean = 0.07 + (i % 2) * 0.05;
    const hgt = 0.2 + (i % 3) * 0.05;
    const w = 0.035;
    const cx = Math.cos(a);
    const cz = Math.sin(a);
    // Base edge perpendicular to the lean direction, tip leaning outward
    pos.push(-cz * w, 0, cx * w, cz * w, 0, -cx * w, cx * lean, hgt, cz * lean);
    col.push(root.r, root.g, root.b, root.r, root.g, root.b, tip.r, tip.g, tip.b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}

type Circle = { x: number; z: number; r: number };

/**
 * Instanced grass tufts scattered over a rectangle, skipping anything in `keepClear`
 * (paths, obstacles, ponds). Deterministic, so every visit looks the same.
 */
export function GrassTufts3D({
  minX,
  maxX,
  minZ,
  maxZ,
  count,
  keepClear,
  seed = 1,
  y = 0,
}: {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  count: number;
  keepClear: Circle[];
  seed?: number;
  y?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => makeTuftGeometry(), []);
  // Shared wind clock; a ref so useFrame can tick it without touching memoised values
  const windTime = useRef({ value: 0 });

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide });
    // Wind: bend each blade by its height, with a phase that rolls across the field
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = windTime.current;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uTime;")
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          vec4 tuftOrigin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float sway = sin(uTime * 1.7 + tuftOrigin.x * 0.45 + tuftOrigin.z * 0.3);
          transformed.x += sway * position.y * 0.35;
          transformed.z += cos(uTime * 1.3 + tuftOrigin.x * 0.3) * position.y * 0.15;`
        );
    };
    return m;
  }, []);

  const items = useMemo(() => {
    const rand = mulberry32(seed);
    const out: { x: number; z: number; s: number; rot: number; tint: number }[] = [];
    let tries = 0;
    while (out.length < count && tries < count * 12) {
      tries++;
      const x = minX + rand() * (maxX - minX);
      const z = minZ + rand() * (maxZ - minZ);
      if (keepClear.some((c) => (x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r)) continue;
      out.push({ x, z, s: 0.75 + rand() * 0.7, rot: rand() * Math.PI * 2, tint: rand() });
    }
    return out;
  }, [minX, maxX, minZ, maxZ, count, keepClear, seed]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const c = new THREE.Color();
    items.forEach((it, i) => {
      q.setFromAxisAngle(up, it.rot);
      m.compose(new THREE.Vector3(it.x, y, it.z), q, new THREE.Vector3(it.s, it.s, it.s));
      mesh.setMatrixAt(i, m);
      // Slight per-tuft colour variation (multiplies the root-to-tip gradient)
      mesh.setColorAt(i, c.setHSL(0.3 + it.tint * 0.06, 0.55, 0.5 + it.tint * 0.15).lerp(new THREE.Color(1, 1, 1), 0.3));
    });
    mesh.count = items.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, y]);

  useFrame((state) => {
    windTime.current.value = state.clock.elapsedTime;
  });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, Math.max(count, 1)]}
      frustumCulled={false}
      raycast={() => null}
    />
  );
}
