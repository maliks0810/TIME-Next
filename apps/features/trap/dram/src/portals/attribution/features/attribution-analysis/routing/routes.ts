
export const ATTRIBUTION_BASE = '/dram/attribution' as const;

export const ATTRIBUTION_ROUTES = {
  dashboard: `${ATTRIBUTION_BASE}/dashboard`,
  workspace: `${ATTRIBUTION_BASE}/workspace`,
  wizard: `${ATTRIBUTION_BASE}/wizard`,
} as const;

export type AttributionRouteKey = keyof typeof ATTRIBUTION_ROUTES;
export type AttributionRoutePath =
  typeof ATTRIBUTION_ROUTES[AttributionRouteKey]
