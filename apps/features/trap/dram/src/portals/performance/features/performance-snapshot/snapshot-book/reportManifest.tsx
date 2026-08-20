import type { SnapshotReportDefinition, SnapshotReportId } from "./types";
import TCWDailyFlashRankings from "../TCWDailyFlashRankings";
import TCWFundsPerformanceSnapshot from "../TCWFundsPerformanceSnapshot";
import TCWUCITSFundsPerformanceSnapshot from "../TCWUCITSFundsPerformanceSnapshot";
import TCWStrategyPerformanceSnapshot from "../TCWStrategyPerformanceSnapshot";

export const REPORT_ORDER: readonly SnapshotReportId[] = [
  "daily-flash",
  "tcw-funds",
  "tcw-ucits-usd",
  "tcw-ucits-eur",
  "tcw-strategy",
] as const;

export const SNAPSHOT_REPORTS: readonly SnapshotReportDefinition[] = [
  {
    id: "daily-flash",
    sequence: 1,
    shortTitle: "Daily Flash",
    title: "Daily Flash Rankings",
    allowStandaloneExport: false,
    component: TCWDailyFlashRankings,
    componentProps: { embedded: true, allowStandaloneExport: false },
  },
  {
    id: "tcw-funds",
    sequence: 2,
    shortTitle: "TCW Funds",
    title: "TCW Funds Performance Snapshot",
    allowStandaloneExport: true,
    component: TCWFundsPerformanceSnapshot,
    componentProps: { embedded: true, allowStandaloneExport: true },
  },
  {
    id: "tcw-ucits-usd",
    sequence: 3,
    shortTitle: "UCITS USD",
    title: "TCW UCITS Funds Performance Snapshot, USD",
    allowStandaloneExport: true,
    component: TCWUCITSFundsPerformanceSnapshot,
    componentProps: { embedded: true, currency: "USD", allowStandaloneExport: true },
  },
  {
    id: "tcw-ucits-eur",
    sequence: 4,
    shortTitle: "UCITS EUR",
    title: "TCW UCITS Funds Performance Snapshot, EUR",
    allowStandaloneExport: true,
    component: TCWUCITSFundsPerformanceSnapshot,
    componentProps: { embedded: true, currency: "EUR", allowStandaloneExport: true },
  },
  {
    id: "tcw-strategy",
    sequence: 5,
    shortTitle: "Strategy",
    title: "TCW Strategy Performance Snapshot",
    allowStandaloneExport: true,
    component: TCWStrategyPerformanceSnapshot,
    componentProps: { embedded: true, allowStandaloneExport: true },
  },
] as const;

export function getReport(id: SnapshotReportId): SnapshotReportDefinition {
  const report = SNAPSHOT_REPORTS.find((item) => item.id === id);
  if (!report) throw new Error(`Unknown snapshot report: ${id}`);
  return report;
}
