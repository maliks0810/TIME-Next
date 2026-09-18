import { SECTORS } from "../data/universe";
import type { Security, BreakdownLevel, EngineContext, TreeNode, SortState, Agg } from "../data/types";
import { makeClassifier } from "./classify";
import { aggregate } from "./aggregate";

/**
 * Recursively group `secs` down the ordered breakdown `levels`, then Security leaves.
 * Applies each level's `unmatched` policy (bucket vs. exclude).
 */
export function buildTree(
  secs: Security[],
  levels: BreakdownLevel[],
  ctx: EngineContext,
  prefix = "",
): TreeNode[] {
  if (!levels.length) {
    return secs.map((s) => ({
      id: `${prefix}>sec:${s.id}`,
      leaf: true,
      sec: s,
      name: s.id,
      sub: s.name,
      color: SECTORS[s.sector]?.c,
      order: 0,
      agg: aggregate([s], ctx),
    }));
  }
  const [lv, ...rest] = levels;
  const cl = makeClassifier(lv, secs, ctx);
  const exclude =
    (lv.cls === "band" || lv.cls === "conditional") && lv.config.unmatched === "exclude";

  const groups = new Map<string, { meta: ReturnType<typeof cl>; list: Security[] }>();
  secs.forEach((s) => {
    const c = cl(s);
    if (c.unmatched && exclude) return;
    if (!groups.has(c.key)) groups.set(c.key, { meta: c, list: [] });
    groups.get(c.key)!.list.push(s);
  });

  return [...groups.values()].map((g) => {
    // Path-based id: each node's id embeds its full ancestor chain, so a group
    // name that recurs under different parents (e.g. a sector under two regions)
    // never collides. This drives React keys and the drill-down expanded set.
    const id = `${prefix}>${g.meta.key}`;
    return {
      id,
      leaf: false,
      name: g.meta.label,
      color: g.meta.color,
      order: g.meta.order,
      unclass: g.meta.key === "Unclassified",
      agg: aggregate(g.list, ctx),
      children: buildTree(g.list, rest, ctx, id),
      _list: g.list,
    };
  });
}

function sortVal(agg: TreeNode["agg"], col: string): number {
  if (!col) return 0;
  if (col.startsWith("s:")) {
    const k = col.slice(2) as keyof typeof agg;
    return (agg[k] as number) ?? 0;
  }
  const [, pr, mk] = col.split(":");
  return (agg.byPeriod[pr] as unknown as Record<string, number>)?.[mk] ?? 0;
}

/** Sort nodes in place (recursively) by the active column, else by natural order/weight. */
export function sortNodes(nodes: TreeNode[], sort: SortState): TreeNode[] {
  const { col, dir } = sort;
  nodes.sort((a, b) => {
    if (!col) {
      if (a.order !== b.order) return a.order - b.order;
      return b.agg.weight - a.agg.weight;
    }
    return (sortVal(a.agg, col) - sortVal(b.agg, col)) * dir;
  });
  nodes.forEach((n) => {
    if (n.children) sortNodes(n.children, sort);
  });
  return nodes;
}

/** Securities with any active weight (portfolio, or benchmark when shown). */
export function activeSecs(secs: Security[], ctx: EngineContext): Security[] {
  return secs.filter((s) => ctx.portWeight(s) > 0 || (ctx.showBench && ctx.benchWeight(s) > 0));
}

export interface GridModel {
  secs: Security[];
  tree: TreeNode[];
  total: Agg;
}

/** Full grid model: active securities → sorted breakdown tree + grand total. */
export function getModel(
  allSecs: Security[],
  levels: BreakdownLevel[],
  sort: SortState,
  ctx: EngineContext,
): GridModel {
  const secs = activeSecs(allSecs, ctx);
  const tree = sortNodes(buildTree(secs, levels, ctx), sort);
  return { secs, tree, total: aggregate(secs, ctx) };
}
