/**
 * Typed data-source seam. The UI + engine talk only to this interface so a real
 * GraphQL/REST source can be dropped in later without touching either.
 */
import { SECS, BENCH, benchWeights } from "./universe";
import { PF, PMAP, ENT, ENT_EQ, portWeights } from "./portfolios";
import { prand } from "./mock";
import type { Security, Benchmark, Portfolio, BenchKey, CustomPeriod } from "./types";

export interface DataProvider {
  securities(): Security[];
  benchmarks(): Record<BenchKey, Benchmark>;
  benchWeights(bk: BenchKey): Map<string, number>;

  /** Full firm master (700) + entitlement-scoped views. */
  portfolioMaster(): Portfolio[];
  entitled(): Portfolio[];
  entitledEquity(): Portfolio[];
  portfolio(id: string): Portfolio | undefined;
  portWeights(pid: string): Map<string, number>;

  /** Return for a security in a standard or custom period. */
  returnOf(s: Security, period: string, customPeriods?: CustomPeriod[]): number;

  // ---- deferred seams (typed stubs) ----
  /** TODO(C6): snapshot as-of a business date. */
  snapshot?(asOf: string): void;
  /** TODO(C7): bitemporal T1 business date / T2 delivery vintage. */
  vintage?(t1: string, t2: string): void;
}

/** Synthetic return for a user-defined custom period (deterministic). */
function synthRet(s: Security, cp: CustomPeriod): number {
  return +((s.ret.YTD ?? 0) * cp.factor + (prand(s.idx * 97 + cp.seed) * 2 - 1) * 4).toFixed(2);
}

export const mockDataProvider: DataProvider = {
  securities: () => SECS,
  benchmarks: () => BENCH,
  benchWeights,
  portfolioMaster: () => PF,
  entitled: () => ENT,
  entitledEquity: () => ENT_EQ,
  portfolio: (id) => PMAP[id],
  portWeights,
  returnOf(s, period, customPeriods = []) {
    if (s.ret[period] !== undefined) return s.ret[period] as number;
    const cp = customPeriods.find((c) => c.key === period);
    return cp ? synthRet(s, cp) : 0;
  },
};
