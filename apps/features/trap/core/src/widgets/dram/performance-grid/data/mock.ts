/** Deterministic PRNG — ported verbatim from the prototype so seeds reproduce exactly. */
export function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cheap deterministic hash used for synthetic custom-period returns. */
export function prand(x: number): number {
  const v = Math.sin(x) * 10000;
  return v - Math.floor(v);
}
