"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Vec3 } from "../types";

// Prop batching: a prop made of many primitives (a palm, a flower, a lamp post…) is merged once
// into a single geometry with its colours, roughness, gloss and glow baked into vertex attributes.
// Every copy of that prop is then drawn by one InstancedMesh with one shared material, so a land
// full of flowers costs one draw call instead of one per petal.
//
// Per copy you can set position, rotation, scale and two colour slots ("tint" / "tint2"): parts
// whose colour is a slot take the copy's colour (times the part's `shade`), the rest keep their own.

export type TintSlot = "tint" | "tint2";

export type PropPart = {
  geo: THREE.BufferGeometry;
  matrix: THREE.Matrix4;
  color: string | TintSlot | THREE.Color;
  shade: number;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  emissive: string | THREE.Color | null;
  emissiveIntensity: number;
  /** Gentle scale pulse around the part's own origin (0 = none), e.g. 0.08 for a glowing orb */
  pulse: number;
  /** Spin around the part's own vertical axis, in radians per second (0 = none) */
  spin: number;
  /** Whole-copy float up and down, in world units (0 = none), like drei's <Float> */
  bob: number;
  /** Extra glow in the copy's own colour (for slot-coloured parts), e.g. 0.35 */
  glowTint: number;
};

type Transform = { pos?: Vec3; rot?: Vec3; scale?: number | Vec3 };

export type PartOptions = Transform & {
  color: string | TintSlot;
  shade?: number;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  emissive?: string;
  emissiveIntensity?: number;
  pulse?: number;
  spin?: number;
  bob?: number;
  glowTint?: number;
};

function toMatrix({ pos, rot, scale }: Transform) {
  const s = scale === undefined ? [1, 1, 1] : typeof scale === "number" ? [scale, scale, scale] : scale;
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...(pos ?? [0, 0, 0])),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot ?? [0, 0, 0]))),
    new THREE.Vector3(s[0], s[1], s[2])
  );
}

/** One primitive of a prop, placed like a `<mesh position rotation scale>` inside the prop. */
export function part(geo: THREE.BufferGeometry, opts: PartOptions): PropPart {
  return {
    geo,
    matrix: toMatrix(opts),
    color: opts.color,
    shade: opts.shade ?? 1,
    roughness: opts.roughness ?? 0.5,
    metalness: opts.metalness ?? 0,
    clearcoat: opts.clearcoat ?? 0,
    clearcoatRoughness: 0.08,
    emissive: opts.emissive ?? null,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    pulse: opts.pulse ?? 0,
    spin: opts.spin ?? 0,
    bob: opts.bob ?? 0,
    glowTint: opts.glowTint ?? 0,
  };
}

/** Wraps parts in a transform, like a `<group position rotation scale>` around them. */
export function group(t: Transform, parts: PropPart[]): PropPart[] {
  const m = toMatrix(t);
  return parts.map((p) => ({ ...p, matrix: m.clone().multiply(p.matrix) }));
}

export type PropRecipe = { geometry: () => THREE.BufferGeometry };

/** Declares a prop. `make` runs once, on first use, and its merged geometry is shared by every batch. */
export function defineProp(make: () => PropPart[]): PropRecipe {
  let cached: THREE.BufferGeometry | null = null;
  return {
    geometry: () => {
      if (!cached) cached = bakeParts(make());
      return cached;
    },
  };
}

/** Merges parts into one geometry with their look baked into vertex attributes (see getPropMaterial). */
export function bakeParts(parts: PropPart[]) {
  // mergeGeometries needs all-indexed or all-non-indexed parts; a non-indexed part in a mixed set
  // gets a plain 0..n-1 index rather than un-indexing everything else
  const anyIndexed = parts.some((p) => p.geo.index);
  const c = new THREE.Color();
  const center = new THREE.Vector3();
  const geos = parts.map((p) => {
    const src = p.geo;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", src.getAttribute("position").clone());
    g.setAttribute("normal", src.getAttribute("normal").clone());
    const n = g.getAttribute("position").count;
    if (src.index) g.setIndex(src.index.clone());
    else if (anyIndexed) {
      const seq = new Uint32Array(n);
      for (let i = 0; i < n; i++) seq[i] = i;
      g.setIndex(new THREE.BufferAttribute(seq, 1));
    }
    g.applyMatrix4(p.matrix);
    // A mirrored transform flips the triangles' winding, so flip it back to keep them front-facing
    if (p.matrix.determinant() < 0) flipWinding(g);

    const isSlot = p.color === "tint" || p.color === "tint2";
    if (isSlot) c.setRGB(p.shade, p.shade, p.shade);
    else c.set(p.color as string | THREE.Color).multiplyScalar(p.shade);
    const slot = p.color === "tint" ? 1 : p.color === "tint2" ? 2 : 0;
    const emissive = new THREE.Color(0, 0, 0);
    if (p.emissive) emissive.set(p.emissive).multiplyScalar(p.emissiveIntensity);
    center.setFromMatrixPosition(p.matrix);

    const color = repeated(n, [c.r, c.g, c.b]);
    const aSlot = repeated(n, [slot]);
    const aPbr = repeated(n, [p.roughness, p.metalness, p.clearcoat, p.clearcoatRoughness]);
    const aEmissive = repeated(n, [emissive.r, emissive.g, emissive.b]);
    // w > 0: pulse amount, w < 0: spin speed
    const aPulse = repeated(n, [center.x, center.y, center.z, p.spin ? -Math.abs(p.spin) : p.pulse]);
    const aMisc = repeated(n, [p.bob, p.glowTint]);
    g.setAttribute("color", new THREE.BufferAttribute(color, 3));
    g.setAttribute("aSlot", new THREE.BufferAttribute(aSlot, 1));
    g.setAttribute("aPbr", new THREE.BufferAttribute(aPbr, 4));
    g.setAttribute("aEmissive", new THREE.BufferAttribute(aEmissive, 3));
    g.setAttribute("aPulse", new THREE.BufferAttribute(aPulse, 4));
    g.setAttribute("aMisc", new THREE.BufferAttribute(aMisc, 2));
    return g;
  });
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  if (!merged) throw new Error("PropBatch: could not merge prop parts");
  merged.computeBoundingSphere();
  return merged;
}

/** One value tuple repeated for each of `n` vertices */
function repeated(n: number, values: number[]) {
  const k = values.length;
  const out = new Float32Array(n * k);
  for (let i = 0; i < out.length; i += k) for (let j = 0; j < k; j++) out[i + j] = values[j];
  return out;
}

function flipWinding(g: THREE.BufferGeometry) {
  if (g.index) {
    const idx = g.index;
    for (let i = 0; i + 2 < idx.count; i += 3) {
      const b = idx.getX(i + 1);
      idx.setX(i + 1, idx.getX(i + 2));
      idx.setX(i + 2, b);
    }
    return;
  }
  for (const name of ["position", "normal"]) {
    const a = g.getAttribute(name) as THREE.BufferAttribute;
    for (let i = 0; i + 2 < a.count; i += 3) {
      const x = a.getX(i + 1);
      const y = a.getY(i + 1);
      const z = a.getZ(i + 1);
      a.setXYZ(i + 1, a.getX(i + 2), a.getY(i + 2), a.getZ(i + 2));
      a.setXYZ(i + 2, x, y, z);
    }
  }
}

// One material for every batched prop; the per-part look comes from the baked vertex attributes.
const propTime = { value: 0 };
let sharedMaterial: THREE.MeshPhysicalMaterial | null = null;

export function getPropMaterial() {
  if (sharedMaterial) return sharedMaterial;
  const m = new THREE.MeshPhysicalMaterial({ vertexColors: true, clearcoat: 1, clearcoatRoughness: 0.08 });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uPropTime = propTime;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        attribute float aSlot;
        attribute vec4 aPbr;
        attribute vec3 aEmissive;
        attribute vec4 aPulse;
        attribute vec2 aMisc;
        attribute vec3 iTint1;
        attribute vec3 iTint2;
        uniform float uPropTime;
        varying vec4 vPbr;
        varying vec3 vEmissive;`
      )
      .replace(
        "#include <color_vertex>",
        `vColor = vec4(color, 1.0);
        if (aSlot > 1.5) vColor.rgb *= iTint2;
        else if (aSlot > 0.5) vColor.rgb *= iTint1;
        vPbr = aPbr;
        vEmissive = aEmissive + vColor.rgb * aMisc.y;`
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
        #ifdef USE_INSTANCING
        float propPhase = instanceMatrix[3][0] + instanceMatrix[3][2];
        mat2 propSpin = mat2(1.0, 0.0, 0.0, 1.0);
        if (aPulse.w < 0.0) {
          float a = uPropTime * -aPulse.w + propPhase;
          propSpin = mat2(cos(a), sin(a), -sin(a), cos(a));
          objectNormal.xz = propSpin * objectNormal.xz;
        }
        #endif`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
        if (aPulse.w > 0.0) {
          float k = 1.0 + aPulse.w * sin(uPropTime * 3.2 + propPhase);
          transformed = aPulse.xyz + (transformed - aPulse.xyz) * k;
        } else if (aPulse.w < 0.0) {
          transformed.xz = aPulse.xz + propSpin * (transformed.xz - aPulse.xz);
        }
        transformed.y += aMisc.x * sin(uPropTime * 0.75 + propPhase * 1.7);
        #endif`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec4 vPbr;\nvarying vec3 vEmissive;")
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = vPbr.x;")
      .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nmetalnessFactor = vPbr.y;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance = vEmissive;")
      .replace(
        "#include <lights_physical_fragment>",
        `#include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
        material.clearcoat = vPbr.z;
        material.clearcoatRoughness = min(max(vPbr.w, 0.045) + geometryRoughness, 1.0);
        #endif`
      );
  };
  sharedMaterial = m;
  return m;
}

export type PropPlacement = {
  pos: Vec3;
  /** Full rotation; `rotY` is a shortcut for the common yaw-only case */
  rot?: Vec3;
  rotY?: number;
  scale?: number | Vec3;
  tint?: string;
  tint2?: string;
};

/** Draws every copy of one prop with a single draw call. */
export function PropBatch({
  recipe,
  items,
  hidden,
}: {
  recipe: PropRecipe;
  items: PropPlacement[];
  /** Copies to hide (e.g. collected), by index; only the transforms are rewritten when it changes */
  hidden?: boolean[];
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const material = getPropMaterial();

  const geometry = useMemo(() => {
    const base = recipe.geometry();
    const g = new THREE.BufferGeometry();
    for (const [name, attr] of Object.entries(base.attributes)) g.setAttribute(name, attr);
    if (base.index) g.setIndex(base.index);
    const t1 = new Float32Array(items.length * 3);
    const t2 = new Float32Array(items.length * 3);
    const c = new THREE.Color();
    items.forEach((it, i) => {
      c.set(it.tint ?? "#ffffff");
      t1.set([c.r, c.g, c.b], i * 3);
      c.set(it.tint2 ?? it.tint ?? "#ffffff");
      t2.set([c.r, c.g, c.b], i * 3);
    });
    g.setAttribute("iTint1", new THREE.InstancedBufferAttribute(t1, 3));
    g.setAttribute("iTint2", new THREE.InstancedBufferAttribute(t2, 3));
    g.boundingSphere = base.boundingSphere ? base.boundingSphere.clone() : null;
    return g;
  }, [recipe, items]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const e = new THREE.Euler();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    items.forEach((it, i) => {
      if (it.rot) e.set(...it.rot);
      else e.set(0, it.rotY ?? 0, 0);
      q.setFromEuler(e);
      const sc = hidden?.[i] ? 0 : (it.scale ?? 1);
      if (typeof sc === "number") s.setScalar(sc);
      else s.set(sc[0], sc[1], sc[2]);
      m.compose(p.set(...it.pos), q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, geometry, hidden]);

  useFrame((state) => {
    propTime.value = state.clock.elapsedTime;
  });

  if (items.length === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} />;
}
