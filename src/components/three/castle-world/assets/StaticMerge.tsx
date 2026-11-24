"use client";

import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { bakeParts, getPropMaterial, type PropPart } from "./PropBatch";

// Static merging: the world is written as ordinary JSX meshes (a tower is a cylinder, a cone and a
// ring of merlons…), which costs one draw call per mesh. <StaticMerge> watches the meshes inside it,
// and once a mesh has stayed exactly the same for a moment it is baked, with its colour, roughness,
// gloss and glow, into one merged mesh per ground cell (drawn with PropBatch's shared material).
//
// - Animated groups keep animating: every node's local transform is watched, and the still meshes
//   under a moving group (a carousel, a swaying neck, a bobbing egg) are merged into one copy that
//   is attached to that group and so rides along with it. A mesh that moves itself, or whose colour
//   changes, is drawn on its own for good.
// - Anything that starts moving, changes, appears or disappears later is noticed on the next check
//   and its merged copy is rebuilt.
// - Merged originals stay in the scene on a hidden layer that the camera skips but R3F's raycaster
//   still sees, so ground clicks and other handlers keep working on them.
// - Only plain opaque standard/physical materials without textures are merged; glass, water,
//   double-sided, textured, skinned and instanced meshes are left to draw as before.
// - A group that only moves now and then (e.g. turns when the player comes near) should carry
//   `userData={{ mergeAnchor: true }}`: it is treated as moving from the start, so it never forces a
//   rebuild mid-game. `userData={{ noMerge: true }}` keeps a whole subtree out of merging.

/** Layer the camera never draws but R3F's raycaster checks: for meshes kept only for clicks */
export const RAYCAST_ONLY_LAYER = 31;
const HIDDEN_LAYER = RAYCAST_ONLY_LAYER;
/** Frames between checks */
const CHECK_EVERY = 12;
/** A mesh must look the same for this many checks in a row before it is merged */
const STABLE_CHECKS = 4;
/** Dirty cells rebuilt per frame, so a batch of new merges doesn't cause one long frame */
const CELLS_PER_FRAME = 2;

const TEXTURE_SLOTS = [
  "map",
  "lightMap",
  "aoMap",
  "emissiveMap",
  "bumpMap",
  "normalMap",
  "displacementMap",
  "roughnessMap",
  "metalnessMap",
  "alphaMap",
  "envMap",
  "clearcoatMap",
  "clearcoatRoughnessMap",
  "clearcoatNormalMap",
  "sheenColorMap",
  "sheenRoughnessMap",
  "transmissionMap",
  "thicknessMap",
  "iridescenceMap",
  "iridescenceThicknessMap",
  "specularIntensityMap",
  "specularColorMap",
  "anisotropyMap",
] as const;

type MergeableMaterial = THREE.MeshStandardMaterial & Partial<THREE.MeshPhysicalMaterial>;

function mergeableMaterial(m: THREE.Material | THREE.Material[]): m is MergeableMaterial {
  if (Array.isArray(m)) return false;
  const isStd = m.constructor === THREE.MeshStandardMaterial;
  const isPhys = m.constructor === THREE.MeshPhysicalMaterial;
  if (!isStd && !isPhys) return false;
  const s = m as MergeableMaterial;
  const rec = s as unknown as Record<string, unknown>;
  if (TEXTURE_SLOTS.some((k) => rec[k])) return false;
  if (
    s.transparent ||
    s.opacity !== 1 ||
    s.side !== THREE.FrontSide ||
    s.vertexColors ||
    s.wireframe ||
    s.flatShading ||
    s.alphaTest !== 0 ||
    s.alphaHash ||
    s.polygonOffset ||
    !s.toneMapped ||
    !s.fog ||
    !s.depthTest ||
    !s.depthWrite ||
    !s.colorWrite ||
    !s.visible ||
    s.blending !== THREE.NormalBlending ||
    s.envMapIntensity !== 1 ||
    s.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile
  )
    return false;
  if (isPhys) {
    const p = s as THREE.MeshPhysicalMaterial;
    if (
      p.transmission > 0 ||
      p.sheen > 0 ||
      p.iridescence > 0 ||
      p.anisotropy > 0 ||
      p.dispersion > 0 ||
      p.ior !== 1.5 ||
      p.specularIntensity !== 1 ||
      p.specularColor.getHex() !== 0xffffff
    )
      return false;
  }
  return true;
}

type R3FObject = THREE.Object3D & { __r3f?: { props?: Record<string, unknown> } };

function mergeableMesh(o: THREE.Object3D): o is THREE.Mesh {
  const mesh = o as THREE.Mesh & THREE.InstancedMesh & THREE.SkinnedMesh & THREE.BatchedMesh;
  if (!mesh.isMesh || mesh.isInstancedMesh || mesh.isSkinnedMesh || mesh.isBatchedMesh) return false;
  // A JSX `visible` prop means React toggles it: leave it alone
  if ((o as R3FObject).__r3f?.props && "visible" in (o as R3FObject).__r3f!.props!) return false;
  if (o.renderOrder !== 0 || o.onBeforeRender !== THREE.Object3D.prototype.onBeforeRender) return false;
  const g = mesh.geometry;
  if (!g || (g as THREE.InstancedBufferGeometry).isInstancedBufferGeometry) return false;
  if (!g.getAttribute("position") || !g.getAttribute("normal")) return false;
  // (geometry groups only matter for multi-material meshes, which are skipped below)
  if (Object.keys(g.morphAttributes).length > 0) return false;
  if (g.drawRange.start !== 0 || g.drawRange.count !== Infinity) return false;
  return mergeableMaterial(mesh.material);
}

/** How a mesh looks (its placement is tracked per node), so a later change can be spotted */
function lookSnapshot(mesh: THREE.Mesh, out: number[]) {
  const m = mesh.material as MergeableMaterial;
  out.length = 0;
  out.push(m.color.r, m.color.g, m.color.b, m.emissive.r, m.emissive.g, m.emissive.b, m.emissiveIntensity);
  out.push(m.roughness, m.metalness, m.clearcoat ?? 0, m.clearcoatRoughness ?? 0);
  return out;
}

function sameNumbers(a: ArrayLike<number>, b: ArrayLike<number>) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

type Entry = {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  look: number[];
  /** Nearest moving ancestor (or the StaticMerge root): the merged copy is attached to it */
  anchor: THREE.Object3D;
  stable: number;
  /** Times its look changed while being watched */
  changes: number;
  /** Merge group it is in, or null while it is still being watched */
  cell: string | null;
  layerMask: number;
};

type Cell = { anchor: THREE.Object3D; entries: Set<Entry>; mesh: THREE.InstancedMesh | null };

type NodeWatch = { matrix: Float64Array; changes: number; seenAt: number };

const noRaycast = () => {};
const scratchLook: number[] = [];

class MergeState {
  entries = new Map<THREE.Mesh, Entry>();
  cells = new Map<string, Cell>();
  /** Groups waiting for a rebuild because meshes joined them */
  dirty = new Set<string>();
  /** Local transform of every node, to tell moving groups from still ones */
  nodes = new Map<THREE.Object3D, NodeWatch>();
  /** Nodes that moved after being placed: their children merge into a copy that rides along with them */
  moving = new WeakSet<THREE.Object3D>();
  /** Meshes whose look changes: drawn on their own for good */
  changing = new WeakSet<THREE.Mesh>();
  frame = 0;
  checks = 0;

  constructor(
    private content: THREE.Group,
    private holder: THREE.Group,
    private cellSize: number
  ) {
    // Reachable from the scene graph for debugging and perf checks
    holder.userData.staticMerge = this;
  }

  tick() {
    if (this.frame++ % CHECK_EVERY === 0) this.check();
    let budget = CELLS_PER_FRAME;
    for (const key of this.dirty) {
      if (budget-- <= 0) break;
      this.rebuild(key);
    }
  }

  /** Takes a mesh out of its merged group and shows the original again */
  private release(e: Entry, urgent: Set<string>) {
    if (e.cell !== null) {
      this.cells.get(e.cell)?.entries.delete(e);
      urgent.add(e.cell);
      e.cell = null;
    }
    e.mesh.layers.mask = e.layerMask;
  }

  /** Records a node's local transform; true once it has moved after its first placement */
  private watchNode(o: THREE.Object3D) {
    if (this.moving.has(o) || o.userData.mergeAnchor) return true;
    const w = this.nodes.get(o);
    if (!w) {
      this.nodes.set(o, { matrix: Float64Array.from(o.matrix.elements), changes: 0, seenAt: this.checks });
      return false;
    }
    w.seenAt = this.checks;
    if (sameNumbers(w.matrix, o.matrix.elements)) return false;
    w.matrix.set(o.matrix.elements);
    // One change is allowed: a new node's matrix is only composed on its first render
    if (++w.changes < 2) return false;
    this.moving.add(o);
    this.nodes.delete(o);
    return true;
  }

  private check() {
    this.checks++;
    const seen = new Set<THREE.Mesh>();
    const urgent = new Set<string>();
    const visit = (o: THREE.Object3D, anchor: THREE.Object3D) => {
      if (o.userData.noMerge) return;
      if (o !== this.content && this.watchNode(o)) anchor = o;
      if (anchor !== o && mergeableMesh(o) && !this.changing.has(o)) {
        seen.add(o);
        this.watchMesh(o, anchor, urgent);
      }
      for (const child of o.children) if (child.visible) visit(child, anchor);
    };
    visit(this.content, this.content);

    // Unmounted, hidden, moving or no longer mergeable since the last check
    for (const [mesh, e] of this.entries) {
      if (seen.has(mesh)) continue;
      this.release(e, urgent);
      this.entries.delete(mesh);
    }
    for (const [node, w] of this.nodes) if (w.seenAt !== this.checks) this.nodes.delete(node);
    // Rebuild groups that lost a mesh right away, so nothing stale stays drawn
    for (const key of urgent) this.rebuild(key);
  }

  private watchMesh(o: THREE.Mesh, anchor: THREE.Object3D, urgent: Set<string>) {
    const look = lookSnapshot(o, scratchLook);
    const e = this.entries.get(o);
    if (!e) {
      this.entries.set(o, {
        mesh: o,
        geometry: o.geometry,
        material: o.material as THREE.Material,
        look: [...look],
        anchor,
        stable: 0,
        changes: 0,
        cell: null,
        layerMask: o.layers.mask,
      });
      return;
    }
    if (e.anchor !== anchor) {
      // Something between it and its old anchor started moving: merge it again under the new one
      this.release(e, urgent);
      e.anchor = anchor;
      e.stable = 0;
      return;
    }
    if (
      !sameNumbers(e.look, look) ||
      e.geometry !== o.geometry ||
      e.material !== o.material ||
      (e.cell === null && o.layers.mask !== e.layerMask)
    ) {
      if (e.cell === null && e.changes === 0) {
        e.changes = 1;
        e.stable = 0;
        e.look = [...look];
        e.geometry = o.geometry;
        e.material = o.material as THREE.Material;
      } else {
        // Its colour or shape changes: draw it on its own from now on
        this.changing.add(o);
        this.release(e, urgent);
        this.entries.delete(o);
      }
      return;
    }
    if (e.cell === null && ++e.stable >= STABLE_CHECKS) {
      const key = anchor === this.content ? this.cellKey(o) : `node ${anchor.id}`;
      let cell = this.cells.get(key);
      if (!cell) this.cells.set(key, (cell = { anchor, entries: new Set(), mesh: null }));
      cell.entries.add(e);
      e.cell = key;
      this.dirty.add(key);
    }
  }

  private cellKey(mesh: THREE.Mesh) {
    const g = mesh.geometry;
    if (!g.boundingSphere) g.computeBoundingSphere();
    const c = g.boundingSphere!.center.clone().applyMatrix4(mesh.matrixWorld);
    this.content.worldToLocal(c);
    return `${Math.floor(c.x / this.cellSize)},${Math.floor(c.z / this.cellSize)}`;
  }

  private rebuild(key: string) {
    this.dirty.delete(key);
    const cell = this.cells.get(key);
    if (!cell) return;
    const old = cell.mesh;
    cell.mesh = null;
    if (old) {
      old.removeFromParent();
      old.geometry.dispose();
    }
    const atRoot = cell.anchor === this.content;
    // A moving group with a single mergeable mesh gains nothing from merging
    if (cell.entries.size < (atRoot ? 1 : 2)) {
      for (const e of cell.entries) e.mesh.layers.mask = e.layerMask;
      if (cell.entries.size === 0) this.cells.delete(key);
      return;
    }

    cell.anchor.updateWorldMatrix(true, false);
    const toLocal = new THREE.Matrix4().copy(cell.anchor.matrixWorld).invert();
    const parts: PropPart[] = [];
    for (const e of cell.entries) {
      const m = e.mesh.material as MergeableMaterial;
      e.mesh.updateWorldMatrix(true, false);
      parts.push({
        geo: e.mesh.geometry,
        matrix: toLocal.clone().multiply(e.mesh.matrixWorld),
        color: m.color,
        shade: 1,
        roughness: m.roughness,
        metalness: m.metalness,
        clearcoat: m.clearcoat ?? 0,
        clearcoatRoughness: m.clearcoatRoughness ?? 0,
        emissive: m.emissive,
        emissiveIntensity: m.emissiveIntensity,
        pulse: 0,
        spin: 0,
        bob: 0,
        glowTint: 0,
      });
    }
    const geo = bakeParts(parts);
    const white = new Float32Array([1, 1, 1]);
    geo.setAttribute("iTint1", new THREE.InstancedBufferAttribute(white, 3));
    geo.setAttribute("iTint2", new THREE.InstancedBufferAttribute(white, 3));
    const mesh = new THREE.InstancedMesh(geo, getPropMaterial(), 1);
    mesh.setMatrixAt(0, new THREE.Matrix4());
    mesh.computeBoundingSphere();
    mesh.raycast = noRaycast;
    mesh.name = `static-merge ${key}`;
    // Root cells live in the holder; a moving group's copy rides along as its child
    (atRoot ? this.holder : cell.anchor).add(mesh);
    cell.mesh = mesh;
    // The merged copy now draws these: keep the originals only for raycasting
    for (const e of cell.entries) e.mesh.layers.set(HIDDEN_LAYER);
  }

  dispose() {
    for (const cell of this.cells.values()) {
      if (!cell.mesh) continue;
      cell.mesh.removeFromParent();
      cell.mesh.geometry.dispose();
    }
    for (const e of this.entries.values()) e.mesh.layers.mask = e.layerMask;
    this.cells.clear();
    this.entries.clear();
    this.nodes.clear();
    this.dirty.clear();
  }
}

/** Lets R3F's pointer raycaster see meshes on RAYCAST_ONLY_LAYER */
export function useRaycastOnlyLayer() {
  const raycaster = useThree((s) => s.raycaster);
  useEffect(() => {
    raycaster.layers.enable(RAYCAST_ONLY_LAYER);
  }, [raycaster]);
}

/**
 * Merges the static meshes inside it into a few draw calls (see the notes at the top). While
 * `activeRef.current` is false (a far-away land, see Land.tsx) it stops watching.
 */
export function StaticMerge({
  children,
  cellSize = 16,
  activeRef,
}: {
  children: React.ReactNode;
  cellSize?: number;
  activeRef?: { current: boolean };
}) {
  const contentRef = useRef<THREE.Group>(null);
  const holderRef = useRef<THREE.Group>(null);
  const mergeRef = useRef<MergeState | null>(null);

  // Hidden originals still answer clicks
  useRaycastOnlyLayer();

  useEffect(() => {
    if (!contentRef.current || !holderRef.current) return;
    const merge = new MergeState(contentRef.current, holderRef.current, cellSize);
    mergeRef.current = merge;
    return () => {
      merge.dispose();
      mergeRef.current = null;
    };
  }, [cellSize]);

  useFrame(() => {
    if (activeRef && !activeRef.current) return;
    mergeRef.current?.tick();
  });

  return (
    <>
      <group ref={contentRef}>{children}</group>
      <group ref={holderRef} />
    </>
  );
}
