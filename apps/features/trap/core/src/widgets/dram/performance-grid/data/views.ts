import type { Group, SavedView } from "./types";

/**
 * Read-only view helpers, safe to import from both the store and UI.
 *
 * A group's views live in `g.views`. For back-compat, a legacy group that only
 * has the deprecated single `g.cfg` is presented as one synthetic "Default view"
 * (the store's `withViews` upgrades it to a real, persisted view on first mutate).
 */
export function groupViews(g: Group): SavedView[] {
  if (g.views && g.views.length) return g.views;
  if (g.cfg) return [{ id: "legacy", name: "Default view", cfg: g.cfg }];
  return [];
}

/** The group's currently-applied view (falls back to the first view). */
export function activeView(g: Group): SavedView | undefined {
  const vs = groupViews(g);
  return vs.find((v) => v.id === g.activeViewId) ?? vs[0];
}

/** Produce a name not already used by the group's views (e.g. "New view 2"). */
export function uniqueViewName(g: Group, base: string): string {
  const taken = new Set(groupViews(g).map((v) => v.name));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base} ${n}`)) n++;
  return `${base} ${n}`;
}
