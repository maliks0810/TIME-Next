import { SECTORS } from "../data/universe";
import type { Security, BreakdownLevel, EngineContext, Rule, RuleGroup } from "../data/types";

/** Classifier output for a single security within a breakdown level. */
export interface ClassResult {
  key: string;
  label: string;
  color?: string | null;
  order: number;
  unmatched?: boolean;
}

export const OPS: Record<string, (x: number, a: number, b?: number) => boolean> = {
  "≤": (x, a) => x <= a,
  "<": (x, a) => x < a,
  "≥": (x, a) => x >= a,
  ">": (x, a) => x > a,
  "=": (x, a) => x == a,
  between: (x, a, b) => x >= a && x <= (b as number),
};

/** Numeric attribute accessor — "weight" resolves against the active portfolio. */
export function secNum(s: Security, attr: string, ctx: EngineContext): number {
  if (attr === "weight") return ctx.portWeight(s);
  return (s as unknown as Record<string, number>)[attr];
}

const CAT_ATTRS = ["sector", "region", "industry", "gicsGroup", "currency"];

function evalRule(s: Security, r: Rule, ctx: EngineContext): boolean {
  if (CAT_ATTRS.includes(r.attr)) {
    return String((s as unknown as Record<string, unknown>)[r.attr]) === String(r.val);
  }
  const x = secNum(s, r.attr, ctx);
  const op = OPS[r.op];
  return op ? op(x, +r.val) : false;
}

function evalGroup(s: Security, g: RuleGroup, ctx: EngineContext): boolean {
  if (!g.rules.length) return false;
  let acc = evalRule(s, g.rules[0], ctx);
  for (let i = 1; i < g.rules.length; i++) {
    const j = g.rules[i - 1].join || "AND";
    const r = evalRule(s, g.rules[i], ctx);
    acc = j === "OR" ? acc || r : acc && r;
  }
  return acc;
}

/**
 * Build a per-security classifier for one breakdown level.
 * `secs` is the sibling set this level operates on (needed for N-tile ranking).
 */
export function makeClassifier(
  level: BreakdownLevel,
  secs: Security[],
  ctx: EngineContext,
): (s: Security) => ClassResult {
  if (level.cls === "attribute") {
    const f = level.config.field;
    return (s) => {
      const v = (s as unknown as Record<string, string>)[f] || "Unclassified";
      return { key: v, label: v, color: f === "sector" ? SECTORS[v]?.c : null, order: 0 };
    };
  }
  if (level.cls === "band") {
    const { attr, bands } = level.config;
    return (s) => {
      const x = secNum(s, attr, ctx);
      for (let i = 0; i < bands.length; i++) {
        const b = bands[i];
        if (OPS[b.op](x, +b.val, b.val2 !== undefined ? +b.val2 : undefined))
          return { key: b.label, label: b.label, color: b.color, order: i };
      }
      return { key: "Unclassified", label: "Unclassified", order: 999, unmatched: true };
    };
  }
  if (level.cls === "ntile") {
    const { attr, n, dir } = level.config;
    const arr = [...secs].sort((a, b) =>
      dir === "desc" ? secNum(b, attr, ctx) - secNum(a, attr, ctx) : secNum(a, attr, ctx) - secNum(b, attr, ctx),
    );
    const rank = new Map<string, number>();
    arr.forEach((s, i) => rank.set(s.id, i));
    const size = arr.length || 1;
    const pal = ["#1b3a8c", "#2f6bff", "#5b9bff", "#93c0ff", "#c9def9", "#e8f1fd", "#f0f5fc", "#2f6bff", "#5b9bff", "#93c0ff"];
    const nm = ({ 4: "Quartile", 5: "Quintile", 10: "Decile" } as Record<number, string>)[n] || "Bucket";
    return (s) => {
      let b = Math.floor((rank.get(s.id) as number) / (size / n));
      if (b >= n) b = n - 1;
      const lbl = `${nm[0]}${b + 1} · ${nm} ${b + 1}`;
      return { key: lbl, label: lbl, color: pal[b % pal.length], order: b };
    };
  }
  if (level.cls === "conditional") {
    const groups = level.config.groups;
    return (s) => {
      for (let i = 0; i < groups.length; i++) {
        if (evalGroup(s, groups[i], ctx))
          return { key: groups[i].name, label: groups[i].name, color: groups[i].color, order: i };
      }
      return { key: "Unclassified", label: "Unclassified", order: 999, unmatched: true };
    };
  }
  return () => ({ key: "All", label: "All", order: 0 });
}
