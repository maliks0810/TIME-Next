import type { BenchKey, EntityRef } from "../data/types";

/**
 * Resolve any comparison entity to a weight map (securityId → weight %).
 *
 * This is the heart of the v2 redesign: portfolio / composite / index / model
 * all collapse to "a set of weights", so the roll-up engine treats every
 * comparator identically (see docs/architecture-v2.md §6). No attribution math.
 *
 * `asOf` is part of the contract but not yet consumed — the mock weights are
 * currently as-of-invariant. Per-date resolution (needed for self@date "drift")
 * is a data-layer seam gated on the metric-semantics decision (open question Q1).
 */
export interface ResolveCtx {
  portWeights: (id: string) => Map<string, number>;
  benchWeights: (key: BenchKey) => Map<string, number>;
  aumOf: (id: string) => number;
  modelWeights: (id: string) => Map<string, number>;
}

/**
 * Deterministic as-of drift. The mock has no real history, so we synthesise it:
 * at the anchor month (latest data) weights are unchanged; earlier dates perturb
 * each security's weight by a stable per-security amount that grows with distance,
 * then renormalise. This makes "same portfolio at two dates" show real positioning
 * drift while leaving the current (anchor-date) numbers exactly as before.
 */
const DRIFT_ANCHOR = "2026-06"; // YYYY-MM of the latest seeded month
function monthsBack(asOf: string): number {
  const ym = asOf.slice(0, 7);
  if (ym === DRIFT_ANCHOR) return 0;
  const [ay, am] = DRIFT_ANCHOR.split("-").map(Number);
  const [y, m] = ym.split("-").map(Number);
  return (ay - y) * 12 + (am - m);
}
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619;
  return (h >>> 0) / 4294967295; // 0..1
}
function applyAsOfDrift(weights: Map<string, number>, asOf: string): Map<string, number> {
  const back = monthsBack(asOf);
  if (back <= 0) return weights; // anchor (or future) → unchanged
  const out = new Map<string, number>();
  let total = 0;
  for (const [sec, w] of weights) {
    // ±(up to ~ back*3.5%) deterministic per-security perturbation
    const f = 1 + Math.sin(hash(sec) * 6.2831) * Math.min(0.6, back * 0.035);
    const nw = Math.max(0, w * f);
    out.set(sec, nw);
    total += nw;
  }
  if (total <= 0) return weights;
  for (const [sec, v] of out) out.set(sec, +((v / total) * 100).toFixed(3));
  return out;
}

/** AUM-weighted blend of several portfolios: wᵢ = Σ(aumₚ·wₚᵢ) / Σaumₚ. */
function blend(ids: string[], ctx: ResolveCtx): Map<string, number> {
  const acc = new Map<string, number>();
  let totalAum = 0;
  for (const id of ids) {
    const aum = ctx.aumOf(id);
    if (aum <= 0) continue;
    totalAum += aum;
    for (const [sec, w] of ctx.portWeights(id)) {
      acc.set(sec, (acc.get(sec) ?? 0) + aum * w);
    }
  }
  if (totalAum <= 0) return new Map();
  for (const [sec, v] of acc) acc.set(sec, +(v / totalAum).toFixed(4));
  return acc;
}

/** Resolve an entity (as-of a date) to its weight map, with synthetic as-of drift. */
export function resolveWeights(entity: EntityRef, asOf: string, ctx: ResolveCtx): Map<string, number> {
  let base: Map<string, number>;
  switch (entity.kind) {
    case "portfolio":
      base = ctx.portWeights(entity.id);
      break;
    case "index":
      base = ctx.benchWeights(entity.key);
      break;
    case "model":
      base = ctx.modelWeights(entity.id);
      break;
    case "composite": // group → AUM-weighted blend of members
      base = blend(entity.ids, ctx);
      break;
  }
  return applyAsOfDrift(base, asOf);
}
