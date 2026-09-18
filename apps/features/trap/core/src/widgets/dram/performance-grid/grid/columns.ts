import { STATIC_METRICS, PERIOD_METRICS, PERIOD_ORDER } from "../data/catalog";
import type { CustomPeriod } from "../data/types";

/** Visible periods in their stored order (drag-to-reorder writes that order);
 *  invalid keys are filtered out. New periods are inserted canonically on add. */
export function orderedPeriods(periods: string[], customPeriods: CustomPeriod[]): string[] {
  const custKeys = new Set(customPeriods.map((c) => c.key));
  return periods.filter((p) => PERIOD_ORDER.includes(p) || custKeys.has(p));
}

/** Insert a period key at its canonical slot among standard periods (customs go
 *  last) — keeps a sensible default order when toggling, before any manual drag. */
export function insertPeriodCanonical(periods: string[], p: string): string[] {
  if (periods.includes(p)) return periods;
  const ci = PERIOD_ORDER.indexOf(p);
  if (ci < 0) return [...periods, p]; // custom period → append
  const out = [...periods];
  let at = out.length;
  for (let i = 0; i < out.length; i++) {
    const oi = PERIOD_ORDER.indexOf(out[i]);
    if (oi >= 0 && oi > ci) {
      at = i;
      break;
    }
  }
  out.splice(at, 0, p);
  return out;
}

export function periodLabel(p: string, customPeriods: CustomPeriod[]): string {
  const cp = customPeriods.find((c) => c.key === p);
  return cp ? cp.label : p;
}

/** Visible characteristic columns (respecting the benchmark toggle). */
export function staticCols(staticM: Record<string, boolean>, showBench: boolean): string[] {
  return Object.keys(STATIC_METRICS).filter(
    (k) => staticM[k] && !(STATIC_METRICS[k].bench && !showBench),
  );
}

/** Visible per-period metric columns (respecting the benchmark toggle). */
export function periodCols(periodM: Record<string, boolean>, showBench: boolean): string[] {
  return Object.keys(PERIOD_METRICS).filter(
    (k) => periodM[k] && !(PERIOD_METRICS[k].bench && !showBench),
  );
}

/** Signed static / period metrics get red/green treatment. */
export const SIGNED_STATIC = new Set(["activeWt"]);
export const SIGNED_PERIOD = new Set(["activeRet", "contrib", "activeCon"]);
