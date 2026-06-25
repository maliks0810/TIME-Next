import type { MetricKey, RankingItem, RankingItemRaw } from "../types/alphaDashboard";
import dayjs from "dayjs";

export function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

export function normalizeItem(item: RankingItemRaw): RankingItem {
  const portfolioReturn =
    item.portfolioReturn ?? item.return ?? null;

  const netReturn =
    item.netReturn ?? item.portfolioNetReturn ?? item.portNetReturn ?? null;

  return {
    portfolioNumber: item.portfolioNumber ?? "—",
    portfolioName: item.portfolioName ?? "Unknown Portfolio",
    alpha: item.alpha == null ? null : Number(item.alpha),
    portfolioReturn: portfolioReturn == null ? null : Number(portfolioReturn),
    netReturn: netReturn == null ? null : Number(netReturn),
    rank: item.rank == null ? null : Number(item.rank),
    nav: item.nav == null ? null : Number(item.nav),
    benchmarkName: item.benchmarkName ?? "—",
    performanceStatus: item.performanceStatus ?? "—",
  };
}

export function getMetricValue(
  row: RankingItem,
  metric: MetricKey
): number | null {
  if (metric === "portfolioReturn") return row.portfolioReturn;
  if (metric === "netReturn") return row.netReturn;
  return row.alpha;
}

export function average(values: Array<number | null | undefined>): number | null {
  const nums = values.map(Number).filter((value) => Number.isFinite(value));
  return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : null;
}

export function sortRows(
  rows: RankingItem[],
  metric: MetricKey,
  direction: "asc" | "desc"
): RankingItem[] {
  return [...rows].sort((left, right) => {
    const leftValue =
      getMetricValue(left, metric) ?? (direction === "desc" ? -Infinity : Infinity);
    const rightValue =
      getMetricValue(right, metric) ?? (direction === "desc" ? -Infinity : Infinity);

    const diff =
      direction === "desc" ? rightValue - leftValue : leftValue - rightValue;

    if (diff !== 0) return diff;
    return String(left.portfolioName).localeCompare(String(right.portfolioName));
  });
}


export function getLastMonthEnd(): string {
  return dayjs().startOf("month").subtract(1, "day").format("YYYY-MM-DD");
}
