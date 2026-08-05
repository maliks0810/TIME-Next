import type {
  Snapshot,
  MonitorV2Cashflow,
  MonitorV2Trade,
  PortfolioAnalysisDayAttribution,
  PortfolioAnalysisRowEventDetails,
  PortfolioAnalysisTradeEvent,
  PortfolioAnalysisTreeRow,
  PortfolioPositionAnalytics,
  BenchmarkPositionAnalytics,
  SecurityAnalytics,
} from "../types";
import { calculateCashflowDurationImpact } from "./calculations";
import { dateOnly, includedEventTMinus, includedPositionTMinus } from "./dates";

const DURATION_METRIC_KEY = "dur";
const TCW_CORE_LEVEL_KEYS = [
  "tcwCoreLevel1",
  "tcwCoreLevel2",
  "tcwCoreLevel3",
  "tcwCoreLevel4",
  "tcwCoreLevel5",
  "tcwCoreLevel6",
  "tcwCoreLevel7",
] as const;

type DayAttribution = PortfolioAnalysisDayAttribution & {
  durationContribution?: number | null;
};
type MutableTreeRow = PortfolioAnalysisTreeRow &
  Record<string, unknown> & {
    day: Record<number, DayAttribution>;
    total: DayAttribution;
  };
type AnyRecord = Record<string, unknown>;
type PositionDateValue = {
  exposure: number | null;
  marketValue: number | null;
  par: number | null;
  durationContribution: number | null;
};
type BenchmarkDateValue = {
  exposure: number | null;
  marketValue: number | null;
  par: number | null;
  durationContribution: number | null;
};
type SourcePresence = { portfolio: boolean; benchmark: boolean };
type NodeBuildContext = {
  nodes: Map<string, MutableTreeRow>;
  childrenByParentId: Map<string, string[]>;
  portfolioKey: string;
};
type PositionTreeAssignment = {
  treeId: string;
  parentId: string;
  pathDepth: number;
  sample: PortfolioPositionAnalytics;
  fullPathKey: string;
};
type TradeTargetDebug = {
  date: string;
  securityKey: string;
  portfolioKey: string;
  targetCount: number;
  allocatedToPosition: boolean;
};

const FIELD = {
  asOfDate: ["asOfDate", "as_of_date", "AS_OF_DATE", "date", "DATE"],
  portfolioKey: [
    "portfolioKey",
    "portfolio_key",
    "PORTFOLIO_KEY",
    "portfolioNumber",
    "legacyPortfolioNumber",
  ],
  securityKey: [
    "securityKey",
    "security_key",
    "SECURITY_KEY",
    "secKey",
    "aladdinId",
  ],
  securityDescription: [
    "securityDescription",
    "security_description",
    "SECURITY_DESCRIPTION",
    "securityDesc",
    "security_desc",
    "SECURITY_DESC",
    "description",
    "DESCRIPTION",
  ],
  ticker: [
    "ticker",
    "TICKER",
    "issueTicker",
    "ISSUE_TICKER",
    "bloombergTicker",
    "BLOOMBERG_TICKER",
  ],
  longShortFlag: [
    "longShortFlag",
    "long_short_flag",
    "LONG_SHORT_FLAG",
    "longShort",
    "LONG_SHORT",
  ],
  durationContribution: [
    "durationContribution",
    "duration_contribution",
    "DURATION_CONTRIBUTION",
    "durContribution",
    "dur_contribution",
    "DUR_CONTRIBUTION",
  ],
  marketValuePercent: [
    "marketValuePercent",
    "market_value_percent",
    "MARKET_VALUE_PERCENT",
    "marketValuePct",
    "market_value_pct",
    "MARKET_VALUE_PCT",
    "mvPercent",
    "mvPct",
    "MV_PERCENT",
    "MV_PCT",
  ],
  usdMarketValue: [
    "usdMarketValue",
    "usd_market_value",
    "USD_MARKET_VALUE",
    "marketValue",
    "market_value",
    "MARKET_VALUE",
    "mv",
    "MV",
  ],
  currentFace: [
    "currentFace",
    "current_face",
    "CURRENT_FACE",
    "currFaceAmt",
    "CURR_FACE_AMT",
    "par",
    "PAR",
  ],
  tradeDate: ["tradeDate", "trade_date", "TRADE_DATE"],
  settleDate: ["settleDate", "settle_date", "SETTLE_DATE"],
  ctd: [
    "ctd",
    "CTD",
    "durContribution",
    "DUR_CONTRIBUTION",
    "durationContribution",
    "DURATION_CONTRIBUTION",
  ],
  tradePrice: ["tradePrice", "TradePrice"],
  baseAmount: ["baseAmount", "base_amount", "BASE_AMOUNT"],
};

function raw(source: unknown, names: readonly string[]): unknown {
  const r = source as AnyRecord;
  for (const n of names) if (r[n] !== undefined && r[n] !== null) return r[n];
  return undefined;
}
function getString(
  source: unknown,
  names: readonly string[],
  fallback = "",
): string {
  return String(raw(source, names) ?? fallback).trim();
}
function getNumber(source: unknown, names: readonly string[]): number | null {
  const v = raw(source, names);
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
function clean(value: string | number | null | undefined): string {
  return String(value ?? "").trim();
}
function normalizedDate(value: string | null | undefined): string | null {
  return dateOnly(value);
}
function snapshotDate(
  snapshots: Record<number, Snapshot>,
  tMinus: number,
): string | null {
  return normalizedDate(snapshots[tMinus]?.asOfDate ?? null);
}
function safeIdPart(value: string): string {
  return value.replaceAll("|", "/").trim();
}
function positionMatchKey(position: PortfolioPositionAnalytics): string {
  return getString(position, FIELD.securityKey);
}
function portfolioSecurityDateKey(
  source: unknown,
  date: string | null,
): string {
  return [
    getString(source, FIELD.portfolioKey),
    getString(source, FIELD.securityKey),
    date ?? "",
  ]
    .map(clean)
    .join("|");
}
function securityDateKey(
  securityKey: string | null | undefined,
  date: string | null,
): string {
  return [clean(securityKey), date ?? ""].join("|");
}
function tcwCoreLevels(source: unknown): string[] {
  const r = source as AnyRecord;
  return TCW_CORE_LEVEL_KEYS.map((k) =>
    clean(r[k] as string | number | null | undefined),
  );
}
function compactTcwCorePath(source: unknown): string[] {
  return tcwCoreLevels(source).filter(Boolean);
}
function fullTcwCorePathKey(source: unknown): string {
  return TCW_CORE_LEVEL_KEYS.map(
    (k, i) =>
      `${i + 1}:${clean((source as AnyRecord)[k] as string | number | null | undefined)}`,
  ).join("|");
}
function tcwCoreDebug(source: unknown): Record<string, unknown> {
  const r = source as AnyRecord;
  return Object.fromEntries(TCW_CORE_LEVEL_KEYS.map((k) => [k, r[k] ?? null]));
}
function positionLabel(position: PortfolioPositionAnalytics): string {
  const level1 = clean(
    (position as AnyRecord).tcwCoreLevel1 as string | number | null | undefined,
  );
  if (level1.toLowerCase() === "government") {
    const description = getString(position, FIELD.securityDescription);
    if (description) return description;
  }
  return (
    getString(position, FIELD.securityKey) || getString(position, FIELD.ticker)
  );
}
function blankDay(): DayAttribution {
  return {
    exposure: null,
    marketValue: null,
    marketValueDelta: null,
    par: null,
    parDelta: null,
    durationContribution: null,
    durationDelta: null,
    trades: null,
    cashflows: null,
    drift: null,
    benchmarkExposure: null,
    benchmarkMarketValue: null,
    benchmarkPar: null,
    benchmarkDurationContribution: null,
    exposureDelta: null,
    benchmarkExposureDelta: null,
    benchmarkDurationDelta: null,
    activeExposure: null,
    activeExposureDelta: null,
    activeDurationContribution: null,
    activeDurationDelta: null,
    activeDurationDeltaExTrades: null,
    overUnderExposure: null,
    overUnderDurationContribution: null,
  };
}
function addNullable(
  a: number | null | undefined,
  b: number | null | undefined,
): number | null {
  return a == null && b == null ? null : (a ?? 0) + (b ?? 0);
}
function deltaNumber(
  current: number | null | undefined,
  prior: number | null | undefined,
): number | null {
  return current == null && prior == null
    ? null
    : (current ?? 0) - (prior ?? 0);
}
function normalizeBenchmarkExposure(
  value: number | null | undefined,
): number | null {
  return value == null || !Number.isFinite(value) ? null : value / 100;
}
function subtractWhenAvailable(
  left: number | null | undefined,
  right: number | null | undefined,
): number | null {
  return left == null || right == null ? null : left - right;
}
function applyActivePointInTime(day: DayAttribution): DayAttribution {
  const activeExposure = subtractWhenAvailable(
    day.exposure,
    day.benchmarkExposure,
  );
  const activeDurationContribution = subtractWhenAvailable(
    day.durationContribution,
    day.benchmarkDurationContribution,
  );
  return {
    ...day,
    activeExposure,
    activeDurationContribution,
    // Transitional aliases keep already-integrated consumers source compatible.
    overUnderExposure: activeExposure,
    overUnderDurationContribution: activeDurationContribution,
  };
}

function fieldName(
  tMinus: number | "total",
  metric: keyof DayAttribution,
): string {
  return tMinus === "total"
    ? `total${metric[0].toUpperCase()}${metric.slice(1)}`
    : `d${tMinus}${metric[0].toUpperCase()}${metric.slice(1)}`;
}
function eventAndReferenceTMinus(comparisonTMinus: number): number[] {
  const s = new Set<number>(includedEventTMinus(comparisonTMinus));
  s.add(comparisonTMinus);
  return [...s].sort((a, b) => a - b);
}
function firstEventTMinus(comparisonTMinus: number): number {
  return includedEventTMinus(comparisonTMinus)[0] ?? 0;
}
function totalFromDays(
  day: Record<number, DayAttribution>,
  comparisonTMinus: number,
): DayAttribution {
  const first = firstEventTMinus(comparisonTMinus);
  const pointInTime = day[first] ?? blankDay();
  const total = includedEventTMinus(comparisonTMinus).reduce<DayAttribution>(
    (acc, tMinus) => {
      const d = day[tMinus] ?? blankDay();
      return {
        ...blankDay(),
        exposure: null,
        marketValue: null,
        marketValueDelta: addNullable(acc.marketValueDelta, d.marketValueDelta),
        par: null,
        parDelta: addNullable(acc.parDelta, d.parDelta),
        durationContribution: null,
        durationDelta: addNullable(acc.durationDelta, d.durationDelta),
        trades: addNullable(acc.trades, d.trades),
        cashflows: addNullable(acc.cashflows, d.cashflows),
        drift: addNullable(acc.drift, d.drift),
        benchmarkExposure: null,
        benchmarkMarketValue: null,
        benchmarkPar: null,
        benchmarkDurationContribution: null,
        overUnderExposure: null,
        overUnderDurationContribution: null,
      };
    },
    blankDay(),
  );
  total.exposure = pointInTime.exposure;
  total.marketValue = pointInTime.marketValue;
  total.par = pointInTime.par;
  total.durationContribution = pointInTime.durationContribution;
  total.benchmarkExposure = pointInTime.benchmarkExposure;
  total.benchmarkMarketValue = pointInTime.benchmarkMarketValue;
  total.benchmarkPar = pointInTime.benchmarkPar;
  total.benchmarkDurationContribution =
    pointInTime.benchmarkDurationContribution;
  total.activeExposure = pointInTime.activeExposure;
  total.activeDurationContribution = pointInTime.activeDurationContribution;
  total.overUnderExposure = pointInTime.activeExposure;
  total.overUnderDurationContribution = pointInTime.activeDurationContribution;
  return total;
}
function syncFlatFields(row: MutableTreeRow, comparisonTMinus: number): void {
  includedPositionTMinus(comparisonTMinus).forEach((tMinus) => {
    const d = row.day[tMinus] ?? blankDay();
    row[fieldName(tMinus, "exposure")] = d.exposure;
    row[fieldName(tMinus, "marketValue")] = d.marketValue;
    row[fieldName(tMinus, "marketValueDelta")] = d.marketValueDelta;
    row[fieldName(tMinus, "par")] = d.par;
    row[fieldName(tMinus, "parDelta")] = d.parDelta;
    row[fieldName(tMinus, "durationContribution")] = d.durationContribution;
    row[fieldName(tMinus, "durationDelta")] = d.durationDelta;
    row[fieldName(tMinus, "trades")] = d.trades;
    row[fieldName(tMinus, "cashflows")] = d.cashflows;
    row[fieldName(tMinus, "drift")] = d.drift;
    row[fieldName(tMinus, "benchmarkExposure")] = d.benchmarkExposure;
    row[fieldName(tMinus, "benchmarkMarketValue")] = d.benchmarkMarketValue;
    row[fieldName(tMinus, "benchmarkPar")] = d.benchmarkPar;
    row[fieldName(tMinus, "benchmarkDurationContribution")] =
      d.benchmarkDurationContribution;
    row[fieldName(tMinus, "exposureDelta")] = d.exposureDelta;
    row[fieldName(tMinus, "benchmarkExposureDelta")] = d.benchmarkExposureDelta;
    row[fieldName(tMinus, "benchmarkDurationDelta")] = d.benchmarkDurationDelta;
    row[fieldName(tMinus, "activeExposure")] = d.activeExposure;
    row[fieldName(tMinus, "activeExposureDelta")] = d.activeExposureDelta;
    row[fieldName(tMinus, "activeDurationContribution")] =
      d.activeDurationContribution;
    row[fieldName(tMinus, "activeDurationDelta")] = d.activeDurationDelta;
    row[fieldName(tMinus, "activeDurationDeltaExTrades")] =
      d.activeDurationDeltaExTrades;
    row[fieldName(tMinus, "overUnderExposure")] = d.activeExposure;
    row[fieldName(tMinus, "overUnderDurationContribution")] =
      d.activeDurationContribution;
  });
  row[fieldName("total", "exposure")] = row.total.exposure;
  row[fieldName("total", "marketValue")] = row.total.marketValue;
  row[fieldName("total", "marketValueDelta")] = row.total.marketValueDelta;
  row[fieldName("total", "par")] = row.total.par;
  row[fieldName("total", "parDelta")] = row.total.parDelta;
  row[fieldName("total", "durationContribution")] =
    row.total.durationContribution;
  row[fieldName("total", "durationDelta")] = row.total.durationDelta;
  row[fieldName("total", "trades")] = row.total.trades;
  row[fieldName("total", "cashflows")] = row.total.cashflows;
  row[fieldName("total", "drift")] = row.total.drift;
  row[fieldName("total", "benchmarkExposure")] = row.total.benchmarkExposure;
  row[fieldName("total", "benchmarkMarketValue")] =
    row.total.benchmarkMarketValue;
  row[fieldName("total", "benchmarkPar")] = row.total.benchmarkPar;
  row[fieldName("total", "benchmarkDurationContribution")] =
    row.total.benchmarkDurationContribution;
  row[fieldName("total", "exposureDelta")] = row.total.exposureDelta;
  row[fieldName("total", "benchmarkExposureDelta")] =
    row.total.benchmarkExposureDelta;
  row[fieldName("total", "benchmarkDurationDelta")] =
    row.total.benchmarkDurationDelta;
  row[fieldName("total", "activeExposure")] = row.total.activeExposure;
  row[fieldName("total", "activeExposureDelta")] =
    row.total.activeExposureDelta;
  row[fieldName("total", "activeDurationContribution")] =
    row.total.activeDurationContribution;
  row[fieldName("total", "activeDurationDelta")] =
    row.total.activeDurationDelta;
  row[fieldName("total", "activeDurationDeltaExTrades")] =
    row.total.activeDurationDeltaExTrades;
  row[fieldName("total", "overUnderExposure")] = row.total.activeExposure;
  row[fieldName("total", "overUnderDurationContribution")] =
    row.total.activeDurationContribution;
}
function addChild(
  ctx: NodeBuildContext,
  parentId: string | null,
  childId: string,
): void {
  if (!parentId) return;
  const children = ctx.childrenByParentId.get(parentId) ?? [];
  if (!children.includes(childId)) children.push(childId);
  ctx.childrenByParentId.set(parentId, children);
}
function ensureNode(
  ctx: NodeBuildContext,
  node: MutableTreeRow,
): MutableTreeRow {
  const existing = ctx.nodes.get(node.id);
  if (existing) return existing;
  ctx.nodes.set(node.id, node);
  addChild(ctx, node.parentId, node.id);
  return node;
}
function ensurePath(ctx: NodeBuildContext, path: string[]): MutableTreeRow {
  let parentId = "root";
  let pathId = "root";
  let node = ctx.nodes.get("root");
  path.forEach((label, index) => {
    pathId = `${pathId}|${index + 1}:${safeIdPart(label)}`;
    node = ensureNode(ctx, {
      id: pathId,
      parentId,
      label,
      nodeType: "bucket",
      depth: index + 1,
      portfolioKey: ctx.portfolioKey,
      day: {},
      total: blankDay(),
    });
    parentId = pathId;
  });
  return node ?? ctx.nodes.get("root")!;
}
function ensureSyntheticTradeRow(
  ctx: NodeBuildContext,
  trade: MonitorV2Trade,
  tMinus: number,
  parentBucket: MutableTreeRow,
): MutableTreeRow {
  const tradeOnlyBucket = ensureNode(ctx, {
    id: `${parentBucket.id}|trade-only`,
    parentId: parentBucket.id,
    label: "Trade Only",
    nodeType: "bucket",
    depth: parentBucket.depth + 1,
    portfolioKey: ctx.portfolioKey,
    day: {},
    total: blankDay(),
  });
  const securityKey = getString(trade, FIELD.securityKey) || "Unknown";
  return ensureNode(ctx, {
    id: `${tradeOnlyBucket.id}|syntheticTrade|${safeIdPart(securityKey)}|${tMinus}`,
    parentId: tradeOnlyBucket.id,
    label: securityKey,
    nodeType: "syntheticTrade",
    depth: tradeOnlyBucket.depth + 1,
    portfolioKey: ctx.portfolioKey,
    ticker: String((trade as AnyRecord).assetType ?? ""),
    securityKey,
    day: {},
    total: blankDay(),
    events: {},
  });
}
function addDateValue(
  map: Map<string, number>,
  date: string | null,
  value: number | null | undefined,
): void {
  if (!date || typeof value !== "number" || !Number.isFinite(value)) return;
  map.set(date, (map.get(date) ?? 0) + value);
}
function directTradeMapKey(nodeId: string, tMinus: number): string {
  return `${nodeId}|${tMinus}`;
}
function addTradeEvent(
  row: MutableTreeRow,
  tMinus: number,
  trade: PortfolioAnalysisTradeEvent,
): void {
  row.events = row.events ?? {};
  const current = row.events[tMinus] ?? {};
  row.events[tMinus] = {
    ...current,
    trades: [...(current.trades ?? []), trade],
  };
}
function addCashflowEvent(
  row: MutableTreeRow,
  tMinus: number,
  cashflow: MonitorV2Cashflow,
): void {
  row.events = row.events ?? {};
  const current = row.events[tMinus] ?? {};
  row.events[tMinus] = {
    ...current,
    cashflows: [...(current.cashflows ?? []), cashflow],
  };
}
function mergeEvents(
  base: PortfolioAnalysisRowEventDetails | undefined,
  add: PortfolioAnalysisRowEventDetails | undefined,
): PortfolioAnalysisRowEventDetails {
  return {
    trades: [...(base?.trades ?? []), ...(add?.trades ?? [])],
    cashflows: [...(base?.cashflows ?? []), ...(add?.cashflows ?? [])],
  };
}
function aggregateValuesRecursive(
  node: MutableTreeRow,
  ctx: NodeBuildContext,
  allTMinus: number[],
  visited = new Set<string>(),
): void {
  if (visited.has(node.id)) return;
  visited.add(node.id);
  if (node.nodeType === "position" || node.nodeType === "syntheticTrade")
    return;
  const children = (ctx.childrenByParentId.get(node.id) ?? [])
    .map((id) => ctx.nodes.get(id))
    .filter(Boolean) as MutableTreeRow[];
  children.forEach((child) =>
    aggregateValuesRecursive(child, ctx, allTMinus, visited),
  );
  const hasPortfolio = children.some(
    (child) =>
      child.holdingState === "portfolio-only" || child.holdingState === "both",
  );
  const hasBenchmark = children.some(
    (child) =>
      child.holdingState === "benchmark-only" || child.holdingState === "both",
  );
  node.holdingState =
    hasPortfolio && hasBenchmark
      ? "both"
      : hasPortfolio
        ? "portfolio-only"
        : hasBenchmark
          ? "benchmark-only"
          : "historical-only";

  allTMinus.forEach((tMinus) => {
    const totals = children.reduce<DayAttribution>((acc, child) => {
      const d = child.day[tMinus] ?? blankDay();
      return {
        ...blankDay(),
        exposure: addNullable(acc.exposure, d.exposure),
        marketValue: addNullable(acc.marketValue, d.marketValue),
        marketValueDelta: null,
        par: addNullable(acc.par, d.par),
        parDelta: null,
        durationContribution: addNullable(
          acc.durationContribution,
          d.durationContribution,
        ),
        durationDelta: null,
        trades: null,
        cashflows: null,
        drift: null,
        benchmarkExposure: addNullable(
          acc.benchmarkExposure,
          d.benchmarkExposure,
        ),
        benchmarkMarketValue: addNullable(
          acc.benchmarkMarketValue,
          d.benchmarkMarketValue,
        ),
        benchmarkPar: addNullable(acc.benchmarkPar, d.benchmarkPar),
        benchmarkDurationContribution: addNullable(
          acc.benchmarkDurationContribution,
          d.benchmarkDurationContribution,
        ),
        overUnderExposure: null,
        overUnderDurationContribution: null,
      };
    }, blankDay());
    node.day[tMinus] = applyActivePointInTime({
      ...(node.day[tMinus] ?? blankDay()),
      exposure: totals.exposure,
      marketValue: totals.marketValue,
      par: totals.par,
      durationContribution: totals.durationContribution,
      benchmarkExposure: totals.benchmarkExposure,
      benchmarkMarketValue: totals.benchmarkMarketValue,
      benchmarkPar: totals.benchmarkPar,
      benchmarkDurationContribution: totals.benchmarkDurationContribution,
    });
  });
}
function computeDeltasAndTradesRecursive(
  node: MutableTreeRow,
  ctx: NodeBuildContext,
  comparisonTMinus: number,
  directTradeByNodeDay: Map<string, number>,
  visited = new Set<string>(),
): void {
  if (visited.has(node.id)) return;
  visited.add(node.id);
  const children = (ctx.childrenByParentId.get(node.id) ?? [])
    .map((id) => ctx.nodes.get(id))
    .filter(Boolean) as MutableTreeRow[];
  children.forEach((child) =>
    computeDeltasAndTradesRecursive(
      child,
      ctx,
      comparisonTMinus,
      directTradeByNodeDay,
      visited,
    ),
  );
  includedEventTMinus(comparisonTMinus).forEach((tMinus) => {
    const current = applyActivePointInTime(node.day[tMinus] ?? blankDay());
    const prior = applyActivePointInTime(node.day[tMinus + 1] ?? blankDay());
    const directTrades =
      directTradeByNodeDay.get(directTradeMapKey(node.id, tMinus)) ?? null;
    const childTrades =
      node.nodeType === "position" || node.nodeType === "syntheticTrade"
        ? null
        : children.reduce<number | null>(
            (total, child) =>
              addNullable(total, child.day[tMinus]?.trades ?? null),
            null,
          );
    current.marketValueDelta =
      node.nodeType === "syntheticTrade"
        ? null
        : subtractWhenAvailable(current.marketValue, prior.marketValue);
    current.parDelta =
      node.nodeType === "syntheticTrade"
        ? null
        : subtractWhenAvailable(current.par, prior.par);
    current.durationDelta =
      node.nodeType === "syntheticTrade"
        ? null
        : subtractWhenAvailable(
            current.durationContribution,
            prior.durationContribution,
          );
    current.exposureDelta = subtractWhenAvailable(
      current.exposure,
      prior.exposure,
    );
    current.benchmarkExposureDelta = subtractWhenAvailable(
      current.benchmarkExposure,
      prior.benchmarkExposure,
    );
    current.benchmarkDurationDelta = subtractWhenAvailable(
      current.benchmarkDurationContribution,
      prior.benchmarkDurationContribution,
    );
    current.activeExposureDelta = subtractWhenAvailable(
      current.activeExposure,
      prior.activeExposure,
    );
    current.activeDurationDelta = subtractWhenAvailable(
      current.activeDurationContribution,
      prior.activeDurationContribution,
    );
    current.trades =
      node.nodeType === "position" || node.nodeType === "syntheticTrade"
        ? directTrades
        : addNullable(childTrades, directTrades);
    current.cashflows = null;
    current.activeDurationDeltaExTrades = subtractWhenAvailable(
      current.activeDurationDelta,
      current.trades,
    );
    current.drift =
      node.nodeType === "root" || node.nodeType === "syntheticTrade"
        ? null
        : (current.durationDelta ?? 0) - (current.trades ?? 0);
    node.day[tMinus] = applyActivePointInTime(current);
  });
  const baselineTMinus = comparisonTMinus;
  const baseline = node.day[baselineTMinus] ?? blankDay();
  const baselineDirectTrades =
    directTradeByNodeDay.get(directTradeMapKey(node.id, baselineTMinus)) ??
    null;
  const baselineChildTrades =
    node.nodeType === "position" || node.nodeType === "syntheticTrade"
      ? null
      : children.reduce<number | null>(
          (total, child) =>
            addNullable(total, child.day[baselineTMinus]?.trades ?? null),
          null,
        );
  baseline.trades =
    node.nodeType === "position" || node.nodeType === "syntheticTrade"
      ? baselineDirectTrades
      : addNullable(baselineChildTrades, baselineDirectTrades);
  baseline.cashflows = null;
  baseline.drift = null;
  node.day[baselineTMinus] = applyActivePointInTime(baseline);
  node.total = totalFromDays(node.day, comparisonTMinus);
  syncFlatFields(node, comparisonTMinus);
}
function aggregateEventsRecursive(
  node: MutableTreeRow,
  ctx: NodeBuildContext,
  allTMinus: number[],
  visited = new Set<string>(),
): void {
  if (visited.has(node.id)) return;
  visited.add(node.id);
  const children = (ctx.childrenByParentId.get(node.id) ?? [])
    .map((id) => ctx.nodes.get(id))
    .filter(Boolean) as MutableTreeRow[];
  children.forEach((child) =>
    aggregateEventsRecursive(child, ctx, allTMinus, visited),
  );
  if (!children.length) return;
  node.events = node.events ?? {};
  allTMinus.forEach((tMinus) => {
    const merged = children.reduce<PortfolioAnalysisRowEventDetails>(
      (acc, child) => mergeEvents(acc, child.events?.[tMinus]),
      node.events?.[tMinus] ?? {},
    );
    if ((merged.trades?.length ?? 0) || (merged.cashflows?.length ?? 0))
      node.events![tMinus] = merged;
  });
}
function attachDiagnostics(
  row: MutableTreeRow,
  allTMinus: number[],
  snapshots: Record<number, Snapshot>,
  securityByDateSecurity: Map<string, SecurityAnalytics>,
): void {
  if (row.nodeType !== "position" && row.nodeType !== "syntheticTrade") return;
  row.diagnostics = row.diagnostics ?? {};
  allTMinus.forEach((tMinus) => {
    const currentDate = snapshotDate(snapshots, tMinus);
    const priorDate = snapshotDate(snapshots, tMinus + 1);
    const currentSecurity =
      securityByDateSecurity.get(
        securityDateKey(row.securityKey, currentDate),
      ) ?? null;
    const priorSecurity =
      securityByDateSecurity.get(securityDateKey(row.securityKey, priorDate)) ??
      null;
    const currentDay = row.day[tMinus] ?? blankDay();
    row.diagnostics![tMinus] = {
      currentSecurity,
      priorSecurity,
      securityDurationDelta: deltaNumber(
        currentSecurity?.duration,
        priorSecurity?.duration,
      ),
      dirtyPriceDelta: deltaNumber(
        currentSecurity?.dirtyPrice,
        priorSecurity?.dirtyPrice,
      ),
      localPriceDelta: deltaNumber(
        currentSecurity?.localPrice,
        priorSecurity?.localPrice,
      ),
      oasDelta: deltaNumber(currentSecurity?.oas, priorSecurity?.oas),
      spreadDurationDelta: deltaNumber(
        currentSecurity?.spreadDuration,
        priorSecurity?.spreadDuration,
      ),
      mvMovedWithFlatPar:
        Math.abs(currentDay.marketValueDelta ?? 0) > 0 &&
        Math.abs(currentDay.parDelta ?? 0) === 0,
    };
  });
}
function rowOrderTraversal(ctx: NodeBuildContext): PortfolioAnalysisTreeRow[] {
  const result: MutableTreeRow[] = [];
  const visited = new Set<string>();
  const stack = ["root"];
  while (stack.length) {
    const id = stack.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const row = ctx.nodes.get(id);
    if (!row) continue;
    result.push(row);
    const children = ctx.childrenByParentId.get(id) ?? [];
    for (let i = children.length - 1; i >= 0; i--)
      if (children[i] !== id && !visited.has(children[i]))
        stack.push(children[i]);
  }
  return result;
}
function exposeDebug(summary: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  (
    window as unknown as { __portfolioAnalysisDebug?: Record<string, unknown> }
  ).__portfolioAnalysisDebug = summary;
  console.groupCollapsed("[PortfolioAnalysis] tree build debug");
  console.table(summary);
  console.groupEnd();
}
export function buildPortfolioAnalysisRowIndex(
  rows: PortfolioAnalysisTreeRow[],
): {
  rowById: Map<string, PortfolioAnalysisTreeRow>;
  childIdsByParentId: Map<string, string[]>;
} {
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const childIdsByParentId = new Map<string, string[]>();
  rows.forEach((row) => {
    if (!row.parentId) return;
    const children = childIdsByParentId.get(row.parentId) ?? [];
    if (!children.includes(row.id)) children.push(row.id);
    childIdsByParentId.set(row.parentId, children);
  });
  return { rowById, childIdsByParentId };
}

export function buildPortfolioAnalysisTreeRows({
  positions,
  benchmarkPositions = [],
  securities = [],
  snapshots,
  trades,
  cashflows,
  comparisonTMinus,
  portfolioKey,
  portfolioName,
}: {
  positions: PortfolioPositionAnalytics[];
  benchmarkPositions?: BenchmarkPositionAnalytics[];
  securities?: SecurityAnalytics[];
  snapshots: Record<number, Snapshot>;
  trades: MonitorV2Trade[];
  cashflows: MonitorV2Cashflow[];
  comparisonTMinus: number;
  portfolioKey: string;
  portfolioName?: string;
}): PortfolioAnalysisTreeRow[] {
  const nodes = new Map<string, MutableTreeRow>();
  const childrenByParentId = new Map<string, string[]>();
  const ctx: NodeBuildContext = { nodes, childrenByParentId, portfolioKey };
  const eventTMinus = includedEventTMinus(comparisonTMinus);
  const allTMinus = eventAndReferenceTMinus(comparisonTMinus);
  const dateToTMinus = new Map<string, number>();
  const positionValuesByTreeDate = new Map<string, PositionDateValue>();
  const benchmarkValuesByTreeDate = new Map<string, BenchmarkDateValue>();
  const sourcePresenceByTreeDate = new Map<string, SourcePresence>();
  const assignmentsByTreeId = new Map<string, PositionTreeAssignment>();
  const positionTreeIdsByPortfolioSecurityDate = new Map<string, string[]>();
  const directTradeByNodeDay = new Map<string, number>();
  const rootTradeByDate = new Map<string, number>();
  const cashflowAmountByDate = new Map<string, number>();
  const skippedLevelSamples: Array<Record<string, unknown>> = [];
  const securityByDateSecurity = new Map<string, SecurityAnalytics>();

  securities.forEach((security) => {
    const date = normalizedDate(security.asOfDate);
    if (security.securityKey && date)
      securityByDateSecurity.set(
        securityDateKey(security.securityKey, date),
        security,
      );
  });
  allTMinus.forEach((tMinus) => {
    const d = snapshotDate(snapshots, tMinus);
    if (d) dateToTMinus.set(d, tMinus);
  });
  ensureNode(ctx, {
    id: "root",
    parentId: null,
    label: `${portfolioKey}${portfolioName ? ` / ${portfolioName}` : ""}`,
    nodeType: "root",
    depth: 0,
    portfolioKey,
    day: {},
    total: blankDay(),
    events: {},
  });
  let nonZeroDurationRows = 0;
  let nonZeroExposureRows = 0;
  positions.forEach((position) => {
    const date = normalizedDate(getString(position, FIELD.asOfDate));
    const durationContribution = getNumber(
      position,
      FIELD.durationContribution,
    );
    const exposure = getNumber(position, FIELD.marketValuePercent);
    const marketValue =
      typeof position.usdMarketValue === "number" &&
      Number.isFinite(position.usdMarketValue)
        ? position.usdMarketValue
        : getNumber(position, FIELD.usdMarketValue);
    const par =
      typeof position.currentFace === "number" &&
      Number.isFinite(position.currentFace)
        ? position.currentFace
        : getNumber(position, FIELD.currentFace);
    if (durationContribution && durationContribution !== 0)
      nonZeroDurationRows++;
    if (exposure && exposure !== 0) nonZeroExposureRows++;
    const levels = tcwCoreLevels(position);
    const firstBlankBeforeValue = levels.findIndex(
      (level, index) => !level && levels.slice(index + 1).some(Boolean),
    );
    if (firstBlankBeforeValue >= 0 && skippedLevelSamples.length < 20)
      skippedLevelSamples.push({
        securityKey: getString(position, FIELD.securityKey),
        asOfDate: date,
        levels,
      });
    const path = levels.filter(Boolean);
    const parent = ensurePath(ctx, path.length ? path : ["Unclassified"]);
    const fullPathKey = fullTcwCorePathKey(position);
    const treeId = `${parent.id}|position|${safeIdPart(fullPathKey)}|${safeIdPart(positionMatchKey(position))}`;
    if (!assignmentsByTreeId.has(treeId))
      assignmentsByTreeId.set(treeId, {
        treeId,
        sample: position,
        parentId: parent.id,
        pathDepth: path.length || 1,
        fullPathKey,
      });
    if (date) {
      const sourcePresenceKey = `${treeId}|${date}`;
      const sourcePresence = sourcePresenceByTreeDate.get(
        sourcePresenceKey,
      ) ?? {
        portfolio: false,
        benchmark: false,
      };
      sourcePresence.portfolio = true;
      sourcePresenceByTreeDate.set(sourcePresenceKey, sourcePresence);
    }
    if (date) {
      const treeDateKey = `${treeId}|${date}`;
      const existing = positionValuesByTreeDate.get(treeDateKey) ?? {
        exposure: null,
        marketValue: null,
        par: null,
        durationContribution: null,
      };
      positionValuesByTreeDate.set(treeDateKey, {
        exposure: addNullable(existing.exposure, exposure),
        marketValue: addNullable(existing.marketValue, marketValue),
        par: addNullable(existing.par, par),
        durationContribution: addNullable(
          existing.durationContribution,
          durationContribution,
        ),
      });
      const securityDateKeyValue = portfolioSecurityDateKey(position, date);
      const ids =
        positionTreeIdsByPortfolioSecurityDate.get(securityDateKeyValue) ?? [];
      if (!ids.includes(treeId)) ids.push(treeId);
      positionTreeIdsByPortfolioSecurityDate.set(securityDateKeyValue, ids);
    }
  });
  benchmarkPositions.forEach((position) => {
    const date = normalizedDate(getString(position, FIELD.asOfDate));
    const path = tcwCoreLevels(position).filter(Boolean);
    const parent = ensurePath(ctx, path.length ? path : ["Unclassified"]);
    const fullPathKey = fullTcwCorePathKey(position);
    const securityKey = getString(position, FIELD.securityKey);
    const treeId = `${parent.id}|position|${safeIdPart(fullPathKey)}|${safeIdPart(securityKey)}`;
    if (!assignmentsByTreeId.has(treeId)) {
      assignmentsByTreeId.set(treeId, {
        treeId,
        sample: position as unknown as PortfolioPositionAnalytics,
        parentId: parent.id,
        pathDepth: path.length || 1,
        fullPathKey,
      });
    }
    if (date) {
      const sourcePresenceKey = `${treeId}|${date}`;
      const sourcePresence = sourcePresenceByTreeDate.get(
        sourcePresenceKey,
      ) ?? {
        portfolio: false,
        benchmark: false,
      };
      sourcePresence.benchmark = true;
      sourcePresenceByTreeDate.set(sourcePresenceKey, sourcePresence);
    }

    if (!date) return;
    const key = `${treeId}|${date}`;
    const existing = benchmarkValuesByTreeDate.get(key) ?? {
      exposure: null,
      marketValue: null,
      par: null,
      durationContribution: null,
    };
    benchmarkValuesByTreeDate.set(key, {
      exposure: addNullable(
        existing.exposure,
        normalizeBenchmarkExposure(
          getNumber(position, [
            "marketValuePercentage",
            "MARKET_VALUE_PERCENTAGE",
          ]),
        ),
      ),
      marketValue: addNullable(
        existing.marketValue,
        getNumber(position, FIELD.usdMarketValue),
      ),
      par: addNullable(existing.par, getNumber(position, FIELD.currentFace)),
      durationContribution: addNullable(
        existing.durationContribution,
        getNumber(position, FIELD.durationContribution),
      ),
    });
  });

  assignmentsByTreeId.forEach((assignment, treeId) => {
    const { sample, parentId, pathDepth } = assignment;
    const portfolioTDate = snapshotDate(snapshots, 0);
    const benchmarkTMinus1Date = snapshotDate(snapshots, 1);
    const hasPortfolioAtT =
      sourcePresenceByTreeDate.get(`${treeId}|${portfolioTDate ?? ""}`)
        ?.portfolio === true;
    const hasBenchmarkAtTMinus1 =
      sourcePresenceByTreeDate.get(`${treeId}|${benchmarkTMinus1Date ?? ""}`)
        ?.benchmark === true;
    const holdingState =
      hasPortfolioAtT && hasBenchmarkAtTMinus1
        ? "both"
        : hasPortfolioAtT
          ? "portfolio-only"
          : hasBenchmarkAtTMinus1
            ? "benchmark-only"
            : "historical-only";
    const row = ensureNode(ctx, {
      id: treeId,
      parentId,
      label: positionLabel(sample),
      nodeType: "position",
      depth: pathDepth + 1,
      portfolioKey,
      ticker: getString(sample, FIELD.ticker),
      securityKey: getString(sample, FIELD.securityKey),
      longShortFlag: getString(sample, FIELD.longShortFlag),
      securityGroup: sample.securityGroup,
      securityType: sample.securityType,
      holdingState,
      day: {},
      total: blankDay(),
      events: {},
      diagnostics: {},
    });
    allTMinus.forEach((tMinus) => {
      const date = snapshotDate(snapshots, tMinus);
      const v = date
        ? positionValuesByTreeDate.get(`${treeId}|${date}`)
        : undefined;
      const benchmarkTMinus = tMinus === 0 ? 1 : tMinus;
      const benchmarkDate = snapshotDate(snapshots, benchmarkTMinus);
      const benchmarkValue = benchmarkDate
        ? benchmarkValuesByTreeDate.get(`${treeId}|${benchmarkDate}`)
        : undefined;
      row.day[tMinus] = applyActivePointInTime({
        ...blankDay(),
        exposure: v?.exposure ?? null,
        marketValue: v?.marketValue ?? null,
        marketValueDelta: null,
        par: v?.par ?? null,
        parDelta: null,
        durationContribution: v?.durationContribution ?? null,
        durationDelta: null,
        trades: null,
        cashflows: null,
        drift: null,
        benchmarkExposure: benchmarkValue?.exposure ?? null,
        benchmarkMarketValue: benchmarkValue?.marketValue ?? null,
        benchmarkPar: benchmarkValue?.par ?? null,
        benchmarkDurationContribution:
          benchmarkValue?.durationContribution ?? null,
        overUnderExposure: null,
        overUnderDurationContribution: null,
      });
    });
    attachDiagnostics(row, allTMinus, snapshots, securityByDateSecurity);
  });
  const root = ctx.nodes.get("root")!;
  cashflows.forEach((cashflow) => {
    const date = normalizedDate(getString(cashflow, FIELD.settleDate));
    addDateValue(
      cashflowAmountByDate,
      date,
      getNumber(cashflow, FIELD.baseAmount),
    );
    const tMinus = date ? dateToTMinus.get(date) : undefined;
    if (tMinus != null) addCashflowEvent(root, tMinus, cashflow);
  });
  const tradeTargetDebug: TradeTargetDebug[] = [];
  trades.forEach((trade) => {
    const tradeDate = normalizedDate(getString(trade, FIELD.tradeDate));
    if (!tradeDate) return;
    const ctd = getNumber(trade, FIELD.ctd);
    const tradePrice = getNumber(trade, FIELD.tradePrice);
    const tradeSecurity = securityByDateSecurity.get(
      securityDateKey(getString(trade, FIELD.securityKey), tradeDate),
    );
    const enrichedTrade = {
      ...trade,
      tradePrice,
      secPrice: tradeSecurity?.localPrice ?? null,
    };
    addDateValue(rootTradeByDate, tradeDate, ctd);
    const tMinus = dateToTMinus.get(tradeDate);
    if (tMinus == null) return;
    const targetIds =
      positionTreeIdsByPortfolioSecurityDate.get(
        portfolioSecurityDateKey(trade, tradeDate),
      ) ?? [];
    const allocation =
      targetIds.length > 0 ? (ctd ?? 0) / targetIds.length : (ctd ?? 0);
    if (targetIds.length > 0) {
      targetIds.forEach((targetId) => {
        const key = directTradeMapKey(targetId, tMinus);
        directTradeByNodeDay.set(
          key,
          (directTradeByNodeDay.get(key) ?? 0) + allocation,
        );
        const row = ctx.nodes.get(targetId);
        if (row)
          addTradeEvent(row, tMinus, {
            ...enrichedTrade,
            matchStatus: "same-day-position",
          });
      });
    } else {
      const bucket = ensurePath(
        ctx,
        compactTcwCorePath(trade).length
          ? compactTcwCorePath(trade)
          : ["Unclassified"],
      );
      const synthetic = ensureSyntheticTradeRow(ctx, trade, tMinus, bucket);
      const key = directTradeMapKey(synthetic.id, tMinus);
      directTradeByNodeDay.set(
        key,
        (directTradeByNodeDay.get(key) ?? 0) + allocation,
      );
      synthetic.day[tMinus] = synthetic.day[tMinus] ?? blankDay();
      addTradeEvent(synthetic, tMinus, {
        ...enrichedTrade,
        matchStatus: "trade-only",
      });
      attachDiagnostics(
        synthetic,
        allTMinus,
        snapshots,
        securityByDateSecurity,
      );
    }
    if (tradeTargetDebug.length < 30)
      tradeTargetDebug.push({
        date: tradeDate,
        securityKey: getString(trade, FIELD.securityKey),
        portfolioKey: getString(trade, FIELD.portfolioKey),
        targetCount: targetIds.length,
        allocatedToPosition: targetIds.length > 0,
      });
  });
  aggregateValuesRecursive(root, ctx, allTMinus);
  computeDeltasAndTradesRecursive(
    root,
    ctx,
    comparisonTMinus,
    directTradeByNodeDay,
  );
  aggregateEventsRecursive(root, ctx, allTMinus);
  eventTMinus.forEach((tMinus) => {
    const prior = snapshots[tMinus + 1];
    const date = snapshotDate(snapshots, tMinus) ?? "";
    const rootDay = root.day[tMinus] ?? blankDay();
    const cashflowNetMoney = cashflowAmountByDate.get(date) ?? 0;
    const cashflowImpact = calculateCashflowDurationImpact(
      cashflowNetMoney,
      prior?.metadata.mv ?? null,
      prior?.portfolio[DURATION_METRIC_KEY] ?? null,
    );
    const durationDelta = rootDay.durationDelta ?? 0;
    const tradeImpact = rootTradeByDate.get(date) ?? rootDay.trades ?? 0;
    root.day[tMinus] = {
      ...rootDay,
      trades: tradeImpact,
      cashflows: cashflowImpact,
      drift: durationDelta - tradeImpact - cashflowImpact,
    };
  });
  const baselineDate = snapshotDate(snapshots, comparisonTMinus) ?? "";
  const baselineRootDay = root.day[comparisonTMinus] ?? blankDay();
  root.day[comparisonTMinus] = applyActivePointInTime({
    ...baselineRootDay,
    trades: rootTradeByDate.get(baselineDate) ?? baselineRootDay.trades,
    cashflows: null,
    drift: null,
  });
  root.total = totalFromDays(root.day, comparisonTMinus);
  syncFlatFields(root, comparisonTMinus);
  const ordered = rowOrderTraversal(ctx);
  exposeDebug({
    positions: positions.length,
    benchmarkPositions: benchmarkPositions.length,
    securities: securities.length,
    trades: trades.length,
    cashflows: cashflows.length,
    nodes: ordered.length,
    assignments: assignmentsByTreeId.size,
    positionTreeDateKeys: positionValuesByTreeDate.size,
    positionSecurityDateKeys: positionTreeIdsByPortfolioSecurityDate.size,
    directTradeNodeDays: directTradeByNodeDay.size,
    positionTradeTargetKeys: [...directTradeByNodeDay.keys()].filter((key) =>
      key.includes("|position|"),
    ).length,
    syntheticTradeRows: ordered.filter(
      (row) => row.nodeType === "syntheticTrade",
    ).length,
    nonZeroDurationRows,
    nonZeroExposureRows,
    firstPositionMarketValue: positions[0]
      ? getNumber(positions[0], FIELD.usdMarketValue)
      : null,
    firstPositionPar: positions[0]
      ? getNumber(positions[0], FIELD.currentFace)
      : null,
    tcwCoreLevelKeys: TCW_CORE_LEVEL_KEYS,
    firstPositionTcwCoreFields: positions[0]
      ? tcwCoreDebug(positions[0])
      : null,
    skippedLevelSamples,
    tradeTargetDebug,
    snapshotDates: Object.fromEntries(
      Array.from({ length: comparisonTMinus + 1 }, (_, i) => [
        i,
        snapshotDate(snapshots, i),
      ]),
    ),
    rootDay: root.day,
    rootTotal: root.total,
  });
  return ordered;
}
