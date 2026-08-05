import { ChevronDown, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type MouseEvent as ReactMouseEvent,
  type UIEvent,
} from "react";
import { createPortal } from "react-dom";
import type { PortfolioAnalysisColumnGroupContext } from "./bottom-panel/PortfolioAnalysisColumnGroupContext";
import type {
  PortfolioAnalysisContext,
  PortfolioAnalysisTreeRow,
} from "../types";
import { buildPortfolioAnalysisRowIndex } from "../domain/tree";
import { chip, includedPositionTMinus } from "../domain/dates";
import {
  fmtDynamicNumber,
  fmtDynamicPercent,
  fmtDynamicSignedNumber,
  fmtDynamicSignedPercent,
  type DecimalMode,
  type DecimalSettings,
} from "../domain/format";

type MenuState = { x: number; y: number; row: PortfolioAnalysisTreeRow } | null;
type ColumnKind =
  "label" | "text" | "number" | "plainNumber" | "exposure" | "signedExposure";
type StickyKind = "first" | "second";
type SortDirection = "asc" | "desc";
type ColumnGroupId = "mv" | "par" | "dur" | "drift";
type ColumnGroupVisibility = Record<ColumnGroupId, boolean>;
type MetricName =
  | "exposure"
  | "marketValue"
  | "marketValueDelta"
  | "par"
  | "parDelta"
  | "durationContribution"
  | "durationDelta"
  | "trades"
  | "cashflows"
  | "drift"
  | "benchmarkExposure"
  | "benchmarkMarketValue"
  | "benchmarkPar"
  | "benchmarkDurationContribution"
  | "exposureDelta"
  | "benchmarkExposureDelta"
  | "benchmarkDurationDelta"
  | "activeExposure"
  | "activeExposureDelta"
  | "activeDurationContribution"
  | "activeDurationDelta"
  | "activeDurationDeltaExTrades";
type SortState = {
  field: string;
  metric: MetricName;
  direction: SortDirection;
};
type LeafColumn = {
  key: string;
  caption: string;
  width: number;
  kind: ColumnKind;
  field?: string;
  metric?: MetricName;
  columnGroup?: ColumnGroupId;
  sticky?: StickyKind;
  groupStart?: boolean;
  groupEnd?: boolean;
  sortable?: boolean;
  tMinus?: number | "total";
};
type HeaderGroup = {
  key: string;
  caption: string;
  width: number;
  sticky?: StickyKind;
  leaves: LeafColumn[];
};

type PortfolioAnalysisTreeGridProps = {
  context: PortfolioAnalysisContext;
  rows: PortfolioAnalysisTreeRow[];
  isLoading: boolean;
  isError: boolean;
  searchQuery: string;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
  columnGroups: ColumnGroupVisibility;
  benchmarkEnabled: boolean;
  selectedRowId: string | null;
  selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null;
  onSelectedRowIdChange: (rowId: string | null) => void;
  onSelectedColumnGroupChange?: (
    context: PortfolioAnalysisColumnGroupContext | null,
  ) => void;
  onOpenColumnGroupDetail?: (
    rowId: string,
    tMinus: number | "total",
    context: PortfolioAnalysisColumnGroupContext,
  ) => void;
  onOpenDriftDetail: (rowId: string, tMinus: number | "total") => void;
};

const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 48;
const OVERSCAN_ROWS = 20;
const INDENT_PX = 16;
const MENU_WIDTH = 230;
const MENU_HEIGHT = 174;
const MENU_MARGIN = 8;
const ABSOLUTE_SORT_METRICS = new Set<MetricName>([
  "marketValueDelta",
  "parDelta",
  "durationDelta",
  "trades",
  "cashflows",
  "drift",
  "exposureDelta",
  "benchmarkExposureDelta",
  "benchmarkDurationDelta",
  "activeExposure",
  "activeExposureDelta",
  "activeDurationContribution",
  "activeDurationDelta",
  "activeDurationDeltaExTrades",
]);

function fieldName(tMinus: number | "total", metric: MetricName): string {
  return tMinus === "total"
    ? `total${metric[0].toUpperCase()}${metric.slice(1)}`
    : `d${tMinus}${metric[0].toUpperCase()}${metric.slice(1)}`;
}
function valueOf(row: PortfolioAnalysisTreeRow, field?: string): unknown {
  return field ? (row as unknown as Record<string, unknown>)[field] : undefined;
}
function hasNonZeroNumericValue(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value !== 0;
}
function isPortfolioHeldAt(
  row: PortfolioAnalysisTreeRow,
  tMinus: number,
): boolean {
  return (
    hasNonZeroNumericValue(valueOf(row, fieldName(tMinus, "marketValue"))) ||
    hasNonZeroNumericValue(valueOf(row, fieldName(tMinus, "par"))) ||
    hasNonZeroNumericValue(valueOf(row, fieldName(tMinus, "exposure")))
  );
}
function isFormerPortfolioHolding(
  row: PortfolioAnalysisTreeRow,
  comparisonTMinus: number,
): boolean {
  if (row.nodeType !== "position" || isPortfolioHeldAt(row, 0)) return false;
  return includedPositionTMinus(comparisonTMinus)
    .filter((tMinus) => tMinus > 0)
    .some((tMinus) => isPortfolioHeldAt(row, tMinus));
}
function labelClassName(
  row: PortfolioAnalysisTreeRow,
  comparisonTMinus: number,
): string {
  const labelTypeClass =
    row.nodeType === "position"
      ? "portfolio-analysis-grid-position-label"
      : row.nodeType === "syntheticTrade"
        ? "portfolio-analysis-grid-synthetic-label"
        : "portfolio-analysis-grid-bucket-label";
  const holdingClass = isFormerPortfolioHolding(row, comparisonTMinus)
    ? "text-tcw-plum"
    : `portfolio-analysis-grid-holding-${row.holdingState ?? "historical-only"}`;
  return `portfolio-analysis-grid-truncate !font-normal ${labelTypeClass} ${holdingClass}`;
}
function numericValue(
  row: PortfolioAnalysisTreeRow,
  field: string,
  metric: MetricName,
): number | null {
  const raw = valueOf(row, field);
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  return ABSOLUTE_SORT_METRICS.has(metric) ? Math.abs(raw) : raw;
}
function normalizeSearch(value: string): string {
  return value.trim().toUpperCase().replaceAll("-", "").replaceAll(" ", "");
}
function priorTMinusCaption(tMinus: number): string {
  return chip(tMinus + 1);
}
function stickyClass(sticky?: StickyKind): string {
  return sticky === "first"
    ? "portfolio-analysis-grid-sticky-1"
    : sticky === "second"
      ? "portfolio-analysis-grid-sticky-2"
      : "";
}
function groupStickyClass(sticky?: StickyKind): string {
  return sticky === "first"
    ? "portfolio-analysis-grid-header-group-sticky-1"
    : sticky === "second"
      ? "portfolio-analysis-grid-header-group-sticky-2"
      : "";
}
function groupHeaderClasses(group: HeaderGroup): string {
  return [
    "portfolio-analysis-grid-header-cell",
    "portfolio-analysis-grid-header-root-cell",
    "portfolio-analysis-grid-group-start",
    groupStickyClass(group.sticky),
  ]
    .filter(Boolean)
    .join(" ");
}
function headerCellClasses(
  column: LeafColumn,
  sortState: SortState | null,
): string {
  return [
    "portfolio-analysis-grid-header-cell",
    "portfolio-analysis-grid-header-leaf",
    "portfolio-analysis-grid-header-child-cell",
    column.sortable ? "portfolio-analysis-grid-header-sortable" : "",
    sortState?.field === column.field
      ? "portfolio-analysis-grid-header-sorted"
      : "",
    column.groupStart ? "portfolio-analysis-grid-group-start" : "",
    stickyClass(column.sticky),
  ]
    .filter(Boolean)
    .join(" ");
}
function cellClasses(column: LeafColumn, align: string): string {
  return [
    "portfolio-analysis-grid-cell",
    align,
    column.groupStart ? "portfolio-analysis-grid-group-start" : "",
    column.groupEnd ? "portfolio-analysis-grid-group-end" : "",
    stickyClass(column.sticky),
  ]
    .filter(Boolean)
    .join(" ");
}
function menuPosition(event: ReactMouseEvent): { x: number; y: number } {
  return {
    x: Math.min(
      Math.max(event.clientX, MENU_MARGIN),
      window.innerWidth - MENU_WIDTH - MENU_MARGIN,
    ),
    y: Math.min(
      Math.max(event.clientY, MENU_MARGIN),
      window.innerHeight - MENU_HEIGHT - MENU_MARGIN,
    ),
  };
}
function ancestorIds(
  rowId: string,
  rowById: Map<string, PortfolioAnalysisTreeRow>,
): string[] {
  const result: string[] = [];
  let current = rowById.get(rowId);
  while (current?.parentId) {
    result.push(current.parentId);
    current = rowById.get(current.parentId);
  }
  return result;
}
function nodeTypeRank(row: PortfolioAnalysisTreeRow): number {
  if (row.nodeType === "root") return 0;
  if (row.nodeType === "bucket") return 1;
  if (row.nodeType === "position") return 2;
  return 3;
}
function compareRows(
  a: PortfolioAnalysisTreeRow,
  b: PortfolioAnalysisTreeRow,
  sortState: SortState | null,
): number {
  if (a.nodeType !== b.nodeType) return nodeTypeRank(a) - nodeTypeRank(b);
  if (!sortState)
    return String(a.label ?? "").localeCompare(String(b.label ?? ""));
  const av = numericValue(a, sortState.field, sortState.metric);
  const bv = numericValue(b, sortState.field, sortState.metric);
  if (av == null && bv != null) return 1;
  if (av != null && bv == null) return -1;
  if (av != null && bv != null && av !== bv)
    return sortState.direction === "asc" ? av - bv : bv - av;
  return String(a.label ?? "").localeCompare(String(b.label ?? ""));
}
function buildVisibleRows(
  rows: PortfolioAnalysisTreeRow[],
  rowById: Map<string, PortfolioAnalysisTreeRow>,
  childIdsByParentId: Map<string, string[]>,
  expandedIds: Set<string>,
  sortState: SortState | null,
): { visibleRows: PortfolioAnalysisTreeRow[]; traversalCycleIds: string[] } {
  const visibleRows: PortfolioAnalysisTreeRow[] = [];
  const traversalCycleIds: string[] = [];
  const emitted = new Set<string>();
  const rootIds = rowById.has("root")
    ? ["root"]
    : rows.filter((row) => !row.parentId).map((row) => row.id);
  const visit = (id: string): void => {
    const row = rowById.get(id);
    if (!row) return;
    if (emitted.has(id)) {
      traversalCycleIds.push(id);
      return;
    }
    emitted.add(id);
    visibleRows.push(row);
    if (!expandedIds.has(id)) return;
    const children = (childIdsByParentId.get(id) ?? [])
      .map((childId) => rowById.get(childId))
      .filter(Boolean) as PortfolioAnalysisTreeRow[];
    children.sort((left, right) => compareRows(left, right, sortState));
    children.forEach((child) => visit(child.id));
  };
  rootIds.forEach(visit);
  return { visibleRows, traversalCycleIds };
}
function sortIndicator(
  column: LeafColumn,
  sortState: SortState | null,
): string {
  if (!sortState || !column.sortable || sortState.field !== column.field)
    return "";
  return sortState.direction === "asc" ? " ↑" : " ↓";
}
function isColumnVisible(
  column: LeafColumn,
  columnGroups: ColumnGroupVisibility,
): boolean {
  return column.columnGroup == null ? true : columnGroups[column.columnGroup];
}

function columnGroupContextForColumn(
  context: PortfolioAnalysisContext,
  column: LeafColumn,
): PortfolioAnalysisColumnGroupContext {
  if (column.kind === "label")
    return { kind: "unknown", label: "Position", field: "label" };
  if (column.kind === "text")
    return {
      kind: "unknown",
      label: column.caption || "Text",
      field: column.field ?? column.key,
    };

  if (column.tMinus === "total") {
    return {
      kind: "breakdown",
      label: `T vs ${chip(context.comparisonTMinus)}`,
      field: "period-total",
      period: "total",
    };
  }

  if (typeof column.tMinus === "number") {
    return {
      kind: "breakdown",
      label: context.dateLabels[column.tMinus] ?? chip(column.tMinus),
      field: `period-${column.tMinus}`,
      period: column.tMinus,
    };
  }

  return {
    kind: "unknown",
    label: column.caption || "Selection",
    field: column.field ?? column.key,
  };
}

function isSameSelectedPeriodBand(
  selected: PortfolioAnalysisColumnGroupContext | null | undefined,
  context: PortfolioAnalysisContext,
  column: LeafColumn,
): boolean {
  if (!selected) return false;
  const candidate = columnGroupContextForColumn(context, column);
  return (
    selected.field === candidate.field && selected.period === candidate.period
  );
}

function withVisibleLeaves(
  group: HeaderGroup,
  columnGroups: ColumnGroupVisibility,
): HeaderGroup | null {
  const leaves = group.leaves.filter((leaf) =>
    isColumnVisible(leaf, columnGroups),
  );
  if (!leaves.length) return null;
  return {
    ...group,
    width: leaves.reduce((sum, leaf) => sum + leaf.width, 0),
    leaves,
  };
}
function formatGridNumber(
  value: number | null | undefined,
  metric: MetricName | undefined,
  kind: ColumnKind,
  decimalSettings: DecimalSettings,
  decimalMode: DecimalMode,
): string {
  if (kind === "exposure")
    return fmtDynamicPercent(value, decimalSettings.pct, decimalMode);
  if (kind === "signedExposure")
    return fmtDynamicSignedPercent(value, decimalSettings.pct, decimalMode);
  if (
    metric === "marketValue" ||
    metric === "marketValueDelta" ||
    metric === "benchmarkMarketValue"
  ) {
    return metric === "marketValueDelta"
      ? fmtDynamicSignedNumber(value, decimalSettings.money, decimalMode)
      : fmtDynamicNumber(value, decimalSettings.money, decimalMode);
  }
  if (metric === "par" || metric === "parDelta" || metric === "benchmarkPar") {
    return metric === "parDelta"
      ? fmtDynamicSignedNumber(value, decimalSettings.qty, decimalMode)
      : fmtDynamicNumber(value, decimalSettings.qty, decimalMode);
  }
  return kind === "number"
    ? fmtDynamicSignedNumber(value, decimalSettings.contrib, decimalMode)
    : fmtDynamicNumber(value, decimalSettings.contrib, decimalMode);
}

type DerivedTooltipContent = { formula: string; execution: string };
const DERIVED_METRICS = new Set<MetricName>([
  "exposureDelta",
  "benchmarkExposureDelta",
  "activeExposure",
  "activeExposureDelta",
  "marketValueDelta",
  "durationDelta",
  "benchmarkDurationDelta",
  "activeDurationContribution",
  "activeDurationDelta",
  "activeDurationDeltaExTrades",
]);

function tooltipPeriodLabel(
  context: PortfolioAnalysisContext,
  tMinus: number,
): string {
  return context.dateLabels[tMinus] ?? chip(tMinus);
}

function derivedTooltipContent(
  context: PortfolioAnalysisContext,
  row: PortfolioAnalysisTreeRow,
  column: LeafColumn,
  decimalSettings: DecimalSettings,
  decimalMode: DecimalMode,
): DerivedTooltipContent | null {
  const metric = column.metric;
  const tMinus = column.tMinus;
  if (!metric || !DERIVED_METRICS.has(metric) || typeof tMinus !== "number")
    return null;
  const currentLabel = tooltipPeriodLabel(context, tMinus);
  const priorLabel = tooltipPeriodLabel(context, tMinus + 1);
  const read = (name: MetricName, period = tMinus): number | null => {
    const value = valueOf(row, fieldName(period, name));
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  };
  const fmt = (
    value: number | null,
    name: MetricName,
    signed = false,
  ): string => {
    if (value == null) return "";
    const kind: ColumnKind = name.toLowerCase().includes("exposure")
      ? signed
        ? "signedExposure"
        : "exposure"
      : signed
        ? "number"
        : "plainNumber";
    return formatGridNumber(value, name, kind, decimalSettings, decimalMode);
  };
  const unavailable = "Not available because the prior value is missing";
  const binary = (
    leftName: MetricName,
    rightName: MetricName,
    formulaLeft: string,
    formulaRight: string,
    leftPeriod = tMinus,
    rightPeriod = tMinus + 1,
  ): DerivedTooltipContent => {
    const left = read(leftName, leftPeriod);
    const right = read(rightName, rightPeriod);
    const result = read(metric);
    return {
      formula: `${formulaLeft} - ${formulaRight}`,
      execution:
        left == null || right == null || result == null
          ? unavailable
          : `${fmt(left, leftName)} - ${fmt(right, rightName)} = ${fmt(result, metric, true)}`,
    };
  };
  switch (metric) {
    case "exposureDelta":
      return binary(
        "exposure",
        "exposure",
        `PF MV%(${currentLabel})`,
        `PF MV%(${priorLabel})`,
      );
    case "benchmarkExposureDelta":
      return binary(
        "benchmarkExposure",
        "benchmarkExposure",
        `BM MV%(${currentLabel})`,
        `BM MV%(${priorLabel})`,
      );
    case "activeExposure":
      return binary(
        "exposure",
        "benchmarkExposure",
        `PF MV%(${currentLabel})`,
        `BM MV%(${currentLabel})`,
        tMinus,
        tMinus,
      );
    case "activeExposureDelta":
      return binary(
        "activeExposure",
        "activeExposure",
        `Active MV%(${currentLabel})`,
        `Active MV%(${priorLabel})`,
      );
    case "marketValueDelta":
      return binary(
        "marketValue",
        "marketValue",
        `PF MV(${currentLabel})`,
        `PF MV(${priorLabel})`,
      );
    case "durationDelta":
      return binary(
        "durationContribution",
        "durationContribution",
        `PF Dur Contrib(${currentLabel})`,
        `PF Dur Contrib(${priorLabel})`,
      );
    case "benchmarkDurationDelta":
      return binary(
        "benchmarkDurationContribution",
        "benchmarkDurationContribution",
        `BM Dur Contrib(${currentLabel})`,
        `BM Dur Contrib(${priorLabel})`,
      );
    case "activeDurationContribution":
      return binary(
        "durationContribution",
        "benchmarkDurationContribution",
        `PF Dur Contrib(${currentLabel})`,
        `BM Dur Contrib(${currentLabel})`,
        tMinus,
        tMinus,
      );
    case "activeDurationDelta":
      return binary(
        "activeDurationContribution",
        "activeDurationContribution",
        `Active Dur Contrib(${currentLabel})`,
        `Active Dur Contrib(${priorLabel})`,
      );
    case "activeDurationDeltaExTrades":
      return binary(
        "activeDurationDelta",
        "trades",
        `Active Δ Dur Contrib(${currentLabel},${priorLabel})`,
        `Trades(${currentLabel},${priorLabel})`,
        tMinus,
        tMinus,
      );
    default:
      return null;
  }
}
export function PortfolioAnalysisTreeGrid({
  context,
  rows,
  isLoading,
  isError,
  searchQuery,
  decimalSettings,
  decimalMode,
  columnGroups,
  benchmarkEnabled,
  selectedRowId,
  selectedColumnGroup,
  onSelectedRowIdChange,
  onSelectedColumnGroupChange,
  onOpenColumnGroupDetail,
  onOpenDriftDetail,
}: PortfolioAnalysisTreeGridProps): JSX.Element {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(["root"]),
  );
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [menu, setMenu] = useState<MenuState>(null);
  const [internalSelectedColumnGroup, setInternalSelectedColumnGroup] =
    useState<PortfolioAnalysisColumnGroupContext | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const effectiveSelectedColumnGroup =
    internalSelectedColumnGroup ?? selectedColumnGroup ?? null;
  const refreshViewport = useCallback((): void => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setViewportHeight(scroller.clientHeight);
    setScrollTop(scroller.scrollTop);
  }, []);
  const displayTMinus = useMemo(
    () => includedPositionTMinus(context.comparisonTMinus),
    [context.comparisonTMinus],
  );
  const { rowById, childIdsByParentId } = useMemo(
    () => buildPortfolioAnalysisRowIndex(rows),
    [rows],
  );
  const nonLeafRows = useMemo(
    () =>
      rows.filter((row) => (childIdsByParentId.get(row.id)?.length ?? 0) > 0),
    [childIdsByParentId, rows],
  );
  const sameLevelNonLeafIdsByDepth = useMemo(() => {
    const map = new Map<number, string[]>();
    nonLeafRows.forEach((row) => {
      const ids = map.get(row.depth) ?? [];
      ids.push(row.id);
      map.set(row.depth, ids);
    });
    return map;
  }, [nonLeafRows]);
  const normalizedQuery = useMemo(
    () => normalizeSearch(searchQuery),
    [searchQuery],
  );
  const matchedRowIds = useMemo(() => {
    if (!normalizedQuery) return [];
    return rows
      .filter(
        (row) =>
          row.nodeType === "position" || row.nodeType === "syntheticTrade",
      )
      .filter((row) =>
        normalizeSearch(String(row.securityKey ?? row.label ?? "")).includes(
          normalizedQuery,
        ),
      )
      .map((row) => row.id);
  }, [normalizedQuery, rows]);
  const matchedRowIdSet = useMemo(
    () => new Set(matchedRowIds),
    [matchedRowIds],
  );
  const { visibleRows, traversalCycleIds } = useMemo(
    () =>
      buildVisibleRows(
        rows,
        rowById,
        childIdsByParentId,
        expandedIds,
        sortState,
      ),
    [rows, rowById, childIdsByParentId, expandedIds, sortState],
  );

  const headerGroups = useMemo<HeaderGroup[]>(() => {
    const groups: HeaderGroup[] = [
      {
        key: "position",
        caption: "Position",
        width: 360,
        sticky: "first",
        leaves: [
          {
            key: "label",
            caption: "Position",
            width: 360,
            kind: "label",
            field: "label",
            sticky: "first",
          },
        ],
      },
      {
        key: "ticker",
        caption: "Ticker",
        width: 100,
        sticky: "second",
        leaves: [
          {
            key: "ticker",
            caption: "Ticker",
            width: 100,
            kind: "text",
            field: "ticker",
            sticky: "second",
          },
        ],
      },
      {
        key: "total",
        caption: `T vs ${chip(context.comparisonTMinus)} Drift`,
        width: 440,
        leaves: [
          {
            key: "total-delta-mv",
            caption: "Δ MV",
            width: 108,
            kind: "number",
            metric: "marketValueDelta",
            columnGroup: "mv",
            sortable: true,
            field: fieldName("total", "marketValueDelta"),
            tMinus: "total",
          },
          {
            key: "total-delta",
            caption: "Δ Dur",
            width: 86,
            kind: "number",
            metric: "durationDelta",
            columnGroup: "dur",
            sortable: true,
            field: fieldName("total", "durationDelta"),
            tMinus: "total",
          },
          {
            key: "total-trades",
            caption: "Trades",
            width: 82,
            kind: "number",
            metric: "trades",
            columnGroup: "drift",
            sortable: true,
            field: fieldName("total", "trades"),
            tMinus: "total",
          },
          {
            key: "total-cashflows",
            caption: "Cashflows",
            width: 92,
            kind: "number",
            metric: "cashflows",
            columnGroup: "drift",
            sortable: true,
            field: fieldName("total", "cashflows"),
            tMinus: "total",
          },
          {
            key: "total-drift",
            caption: "Drift",
            width: 72,
            kind: "number",
            metric: "drift",
            columnGroup: "drift",
            sortable: true,
            field: fieldName("total", "drift"),
            tMinus: "total",
          },
        ],
      },
    ];
    displayTMinus.forEach((tMinus) => {
      const isBaseline = tMinus === context.comparisonTMinus;
      const priorCaption = priorTMinusCaption(tMinus);
      const leaves: LeafColumn[] = [
        {
          key: `d${tMinus}-exposure`,
          caption: "PF MV%",
          width: 88,
          kind: "exposure",
          metric: "exposure",
          columnGroup: "mv",
          sortable: true,
          field: fieldName(tMinus, "exposure"),
          tMinus,
        },
        ...(!isBaseline
          ? [
              {
                key: `d${tMinus}-exposure-delta`,
                caption: `PF Δ MV% [${priorCaption}]`,
                width: 112,
                kind: "signedExposure" as const,
                metric: "exposureDelta" as const,
                columnGroup: "mv" as const,
                sortable: true,
                field: fieldName(tMinus, "exposureDelta"),
                tMinus,
              },
            ]
          : []),
        ...(benchmarkEnabled
          ? [
              {
                key: `d${tMinus}-bm-exposure`,
                caption: "BM MV%",
                width: 88,
                kind: "exposure" as const,
                metric: "benchmarkExposure" as const,
                columnGroup: "mv" as const,
                sortable: true,
                field: fieldName(tMinus, "benchmarkExposure"),
                tMinus,
              },
              ...(!isBaseline
                ? [
                    {
                      key: `d${tMinus}-bm-exposure-delta`,
                      caption: `BM Δ MV% [${priorCaption}]`,
                      width: 116,
                      kind: "signedExposure" as const,
                      metric: "benchmarkExposureDelta" as const,
                      columnGroup: "mv" as const,
                      sortable: true,
                      field: fieldName(tMinus, "benchmarkExposureDelta"),
                      tMinus,
                    },
                  ]
                : []),
              {
                key: `d${tMinus}-active-exposure`,
                caption: "Active MV%",
                width: 96,
                kind: "signedExposure" as const,
                metric: "activeExposure" as const,
                columnGroup: "mv" as const,
                sortable: true,
                field: fieldName(tMinus, "activeExposure"),
                tMinus,
              },
              ...(!isBaseline
                ? [
                    {
                      key: `d${tMinus}-active-exposure-delta`,
                      caption: `Active Δ MV% [${priorCaption}]`,
                      width: 108,
                      kind: "signedExposure" as const,
                      metric: "activeExposureDelta" as const,
                      columnGroup: "mv" as const,
                      sortable: true,
                      field: fieldName(tMinus, "activeExposureDelta"),
                      tMinus,
                    },
                  ]
                : []),
            ]
          : []),
        {
          key: `d${tMinus}-mv`,
          caption: "PF MV",
          width: 104,
          kind: "plainNumber",
          metric: "marketValue",
          columnGroup: "mv",
          sortable: true,
          field: fieldName(tMinus, "marketValue"),
          tMinus,
        },
        ...(!isBaseline
          ? [
              {
                key: `d${tMinus}-delta-mv`,
                caption: `PF Δ MV [${priorCaption}]`,
                width: 112,
                kind: "number" as const,
                metric: "marketValueDelta" as const,
                columnGroup: "mv" as const,
                sortable: true,
                field: fieldName(tMinus, "marketValueDelta"),
                tMinus,
              },
            ]
          : []),
        {
          key: `d${tMinus}-par`,
          caption: "PF PAR",
          width: 104,
          kind: "plainNumber",
          metric: "par",
          columnGroup: "par",
          sortable: true,
          field: fieldName(tMinus, "par"),
          tMinus,
        },
        ...(!isBaseline
          ? [
              {
                key: `d${tMinus}-delta-par`,
                caption: `PF Δ PAR [${priorCaption}]`,
                width: 112,
                kind: "number" as const,
                metric: "parDelta" as const,
                columnGroup: "par" as const,
                sortable: true,
                field: fieldName(tMinus, "parDelta"),
                tMinus,
              },
            ]
          : []),
        {
          key: `d${tMinus}-dur-contribution`,
          caption: "PF Dur",
          width: 82,
          kind: "plainNumber",
          metric: "durationContribution",
          columnGroup: "dur",
          sortable: true,
          field: fieldName(tMinus, "durationContribution"),
          tMinus,
        },
        ...(!isBaseline
          ? [
              {
                key: `d${tMinus}-delta`,
                caption: `PF Δ Dur [${priorCaption}]`,
                width: 112,
                kind: "number" as const,
                metric: "durationDelta" as const,
                columnGroup: "dur" as const,
                sortable: true,
                field: fieldName(tMinus, "durationDelta"),
                tMinus,
              },
            ]
          : []),
        ...(benchmarkEnabled
          ? [
              {
                key: `d${tMinus}-bm-duration`,
                caption: "BM Dur",
                width: 86,
                kind: "plainNumber" as const,
                metric: "benchmarkDurationContribution" as const,
                columnGroup: "dur" as const,
                sortable: true,
                field: fieldName(tMinus, "benchmarkDurationContribution"),
                tMinus,
              },
              ...(!isBaseline
                ? [
                    {
                      key: `d${tMinus}-bm-duration-delta`,
                      caption: `BM Δ Dur [${priorCaption}]`,
                      width: 116,
                      kind: "number" as const,
                      metric: "benchmarkDurationDelta" as const,
                      columnGroup: "dur" as const,
                      sortable: true,
                      field: fieldName(tMinus, "benchmarkDurationDelta"),
                      tMinus,
                    },
                  ]
                : []),
              {
                key: `d${tMinus}-active-duration`,
                caption: "Active Dur",
                width: 92,
                kind: "number" as const,
                metric: "activeDurationContribution" as const,
                columnGroup: "dur" as const,
                sortable: true,
                field: fieldName(tMinus, "activeDurationContribution"),
                tMinus,
              },
              ...(!isBaseline
                ? [
                    {
                      key: `d${tMinus}-active-duration-delta`,
                      caption: `Active Δ Dur [${priorCaption}]`,
                      width: 116,
                      kind: "number" as const,
                      metric: "activeDurationDelta" as const,
                      columnGroup: "dur" as const,
                      sortable: true,
                      field: fieldName(tMinus, "activeDurationDelta"),
                      tMinus,
                    },
                    {
                      key: `d${tMinus}-active-duration-delta-ex-trades`,
                      caption: `Active Δ Dur - Trades [${priorCaption}]`,
                      width: 144,
                      kind: "number" as const,
                      metric: "activeDurationDeltaExTrades" as const,
                      columnGroup: "dur" as const,
                      sortable: true,
                      field: fieldName(tMinus, "activeDurationDeltaExTrades"),
                      tMinus,
                    },
                  ]
                : []),
            ]
          : []),
        {
          key: `d${tMinus}-trades`,
          caption: "Trades",
          width: 82,
          kind: "number",
          metric: "trades",
          columnGroup: "drift",
          sortable: true,
          field: fieldName(tMinus, "trades"),
          tMinus,
        },
        {
          key: `d${tMinus}-cashflows`,
          caption: "Cashflows",
          width: 92,
          kind: "number",
          metric: "cashflows",
          columnGroup: "drift",
          sortable: true,
          field: fieldName(tMinus, "cashflows"),
          tMinus,
        },
        {
          key: `d${tMinus}-drift`,
          caption: "Drift",
          width: 62,
          kind: "number",
          metric: "drift",
          columnGroup: "drift",
          sortable: true,
          field: fieldName(tMinus, "drift"),
          tMinus,
        },
      ];
      groups.push({
        key: `day-${tMinus}`,
        caption: context.dateLabels[tMinus] ?? chip(tMinus),
        width: 0,
        leaves,
      });
    });
    return groups
      .map((group) => withVisibleLeaves(group, columnGroups))
      .filter(Boolean) as HeaderGroup[];
  }, [benchmarkEnabled, columnGroups, context, displayTMinus]);

  const leafColumns = useMemo(
    () =>
      headerGroups.flatMap((group) =>
        group.leaves.map((leaf, index) => ({
          ...leaf,
          groupStart: index === 0,
          groupEnd: index === group.leaves.length - 1,
        })),
      ),
    [headerGroups],
  );
  const totalWidth = useMemo(
    () => leafColumns.reduce((sum, column) => sum + column.width, 0),
    [leafColumns],
  );
  const effectiveViewportHeight =
    scrollerRef.current?.clientHeight ?? viewportHeight;
  const bodyHeight = Math.max(0, effectiveViewportHeight - HEADER_HEIGHT);
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS,
  );
  const endIndex = Math.min(
    visibleRows.length,
    Math.ceil((scrollTop + bodyHeight) / ROW_HEIGHT) + OVERSCAN_ROWS,
  );
  const renderedRows = visibleRows.slice(startIndex, endIndex);

  useEffect(() => {
    setExpandedIds((current) => {
      const next = new Set<string>();
      current.forEach((id) => {
        if (rowById.has(id)) next.add(id);
      });
      if (rowById.has("root")) next.add("root");
      return next;
    });
  }, [rowById]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(refreshViewport);
    return () => window.cancelAnimationFrame(frame);
  }, [expandedIds, refreshViewport, rows.length]);

  useEffect(() => {
    if (!matchedRowIds.length) return;
    setExpandedIds((current) => {
      const next = new Set(current);
      matchedRowIds.forEach((rowId) =>
        ancestorIds(rowId, rowById).forEach((ancestorId) =>
          next.add(ancestorId),
        ),
      );
      return next;
    });
  }, [matchedRowIds, rowById]);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    update();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const debug = {
      rows: rows.length,
      nonLeafRows: nonLeafRows.length,
      expandedIds: expandedIds.size,
      visibleRows: visibleRows.length,
      renderedRows: renderedRows.length,
      traversalCycleIds,
      viewportHeight,
      scrollTop,
      selectedRowId,
      sortState,
      searchQuery,
      matchedRows: matchedRowIds.length,
      columnGroups,
    };
    (
      window as unknown as {
        __portfolioAnalysisGridDebug?: Record<string, unknown>;
      }
    ).__portfolioAnalysisGridDebug = debug;
    console.groupCollapsed("[PortfolioAnalysis] custom grid debug");
    console.table(debug);
    console.groupEnd();
  }, [
    columnGroups,
    expandedIds.size,
    matchedRowIds.length,
    nonLeafRows.length,
    renderedRows.length,
    rows.length,
    scrollTop,
    searchQuery,
    selectedRowId,
    sortState,
    traversalCycleIds,
    viewportHeight,
    visibleRows.length,
  ]);
  useEffect(() => {
    if (!menu) return;
    const close = (event: globalThis.MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenu(null);
    };
    const timer = window.setTimeout(
      () => document.addEventListener("mousedown", close),
      0,
    );
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", close);
    };
  }, [menu]);

  const hasChildren = (row: PortfolioAnalysisTreeRow): boolean =>
    (childIdsByParentId.get(row.id)?.length ?? 0) > 0;
  const toggleRow = (row: PortfolioAnalysisTreeRow): void => {
    if (!hasChildren(row)) return;
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
  };
  const toggleSort = (column: LeafColumn): void => {
    const { sortable, field, metric } = column;
    if (!sortable || !field || !metric) return;
    setSortState((current): SortState | null => {
      if (current?.field !== field) return { field, metric, direction: "desc" };
      if (current.direction === "desc")
        return {
          field: current.field,
          metric: current.metric,
          direction: "asc",
        };
      return null;
    });
  };
  const expandAll = (): void => {
    setExpandedIds(new Set(nonLeafRows.map((row) => row.id)));
    setMenu(null);
    window.requestAnimationFrame(refreshViewport);
  };
  const collapseAll = (): void => {
    setExpandedIds(new Set(["root"]));
    setMenu(null);
  };
  const expandCurrentLevel = (row: PortfolioAnalysisTreeRow): void => {
    setExpandedIds(
      (current) =>
        new Set([
          ...current,
          ...(sameLevelNonLeafIdsByDepth.get(row.depth) ?? []),
        ]),
    );
    setMenu(null);
    window.requestAnimationFrame(refreshViewport);
  };
  const collapseCurrentLevel = (row: PortfolioAnalysisTreeRow): void => {
    const ids = new Set(sameLevelNonLeafIdsByDepth.get(row.depth) ?? []);
    setExpandedIds((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.delete(id));
      if (rowById.has("root")) next.add("root");
      return next;
    });
    setMenu(null);
  };
  const openContextMenu = (
    event: ReactMouseEvent,
    row: PortfolioAnalysisTreeRow,
  ): void => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasChildren(row)) {
      setMenu(null);
      onSelectedRowIdChange(row.id);
      return;
    }
    onSelectedRowIdChange(row.id);
    setMenu({ ...menuPosition(event), row });
  };
  const selectCellContext = (
    row: PortfolioAnalysisTreeRow,
    column: LeafColumn,
  ): void => {
    const nextColumnGroup = columnGroupContextForColumn(context, column);
    onSelectedRowIdChange(row.id);
    setInternalSelectedColumnGroup(nextColumnGroup);
    onSelectedColumnGroupChange?.(nextColumnGroup);

    if (column.tMinus != null) {
      onOpenColumnGroupDetail?.(row.id, column.tMinus, nextColumnGroup);
    }
  };

  const openContextMenuByRowId = (
    event: ReactMouseEvent<HTMLElement>,
    rowId: string | null | undefined,
  ): void => {
    if (!rowId) return;
    const row = rowById.get(rowId);
    if (!row) return;
    openContextMenu(event, row);
  };
  const handleGridContextMenuCapture = (
    event: ReactMouseEvent<HTMLDivElement>,
  ): void => {
    const target = event.target as HTMLElement | null;
    const rowElement = target?.closest?.(
      "[data-portfolio-analysis-row-id]",
    ) as HTMLElement | null;
    const rowId = rowElement?.dataset.portfolioAnalysisRowId;
    if (rowId) openContextMenuByRowId(event, rowId);
  };

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.16em] text-grey-600">
        Loading position analytics…
      </div>
    );
  if (isError)
    return (
      <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.16em] text-tcw-plum">
        Unable to load position analytics.
      </div>
    );

  return (
    <div
      ref={scrollerRef}
      className="portfolio-analysis-grid-scroll"
      onContextMenuCapture={handleGridContextMenuCapture}
      onScroll={(event: UIEvent<HTMLDivElement>) => {
        setScrollTop(event.currentTarget.scrollTop);
        setViewportHeight(event.currentTarget.clientHeight);
      }}
    >
      <div
        className="portfolio-analysis-grid-inner"
        style={{ width: totalWidth }}
      >
        <div className="portfolio-analysis-grid-header">
          <div className="portfolio-analysis-grid-header-row">
            {headerGroups.map((group) => (
              <div
                key={group.key}
                className={groupHeaderClasses(group)}
                style={{ width: group.width }}
              >
                {group.leaves.length === 1
                  ? group.leaves[0].caption
                  : group.caption}
              </div>
            ))}
          </div>
          <div className="portfolio-analysis-grid-header-row">
            {leafColumns.map((column) => (
              <button
                type="button"
                key={column.key}
                className={headerCellClasses(column, sortState)}
                style={{ width: column.width }}
                onClick={() => toggleSort(column)}
                disabled={!column.sortable}
              >
                {column.kind === "label" || column.kind === "text"
                  ? ""
                  : `${column.caption}${sortIndicator(column, sortState)}`}
              </button>
            ))}
          </div>
        </div>
        <div
          className="portfolio-analysis-grid-body"
          style={{ height: visibleRows.length * ROW_HEIGHT }}
        >
          {renderedRows.map((row, offset) => {
            const rowIndex = startIndex + offset;
            const stateClass = matchedRowIdSet.has(row.id)
              ? "portfolio-analysis-grid-row-search-match"
              : row.id === selectedRowId
                ? "portfolio-analysis-grid-row-selected"
                : rowIndex % 2 === 0
                  ? "portfolio-analysis-grid-row-even"
                  : "portfolio-analysis-grid-row-odd";
            const rowClass = [
              "portfolio-analysis-grid-row",
              row.nodeType === "syntheticTrade"
                ? "portfolio-analysis-grid-row-synthetic-trade"
                : "",
              stateClass,
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div
                key={row.id}
                className={rowClass}
                data-portfolio-analysis-row-id={row.id}
                style={{ top: rowIndex * ROW_HEIGHT, width: totalWidth }}
                onClick={() => onSelectedRowIdChange(row.id)}
                onMouseDown={(event) => {
                  if (event.button === 2) openContextMenu(event, row);
                }}
                onContextMenu={(event) => openContextMenu(event, row)}
              >
                {leafColumns.map((column) => (
                  <GridCell
                    key={column.key}
                    context={context}
                    row={row}
                    column={column}
                    isSelectedRow={row.id === selectedRowId}
                    selectedColumnGroup={effectiveSelectedColumnGroup}
                    hasChildren={hasChildren(row)}
                    expanded={expandedIds.has(row.id)}
                    toggleRow={toggleRow}
                    onCellSelect={selectCellContext}
                    decimalSettings={decimalSettings}
                    decimalMode={decimalMode}
                    onOpenDriftDetail={onOpenDriftDetail}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      {menu &&
        createPortal(
          <div
            ref={menuRef}
            className="portfolio-analysis-context-menu"
            style={{
              position: "fixed",
              left: menu.x,
              top: menu.y,
              zIndex: 2147483647,
            }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <div className="portfolio-analysis-context-menu-title">Tree</div>
            <ContextMenuButton label="Expand all" onClick={expandAll} />
            <ContextMenuButton
              label="Collapse all"
              onClick={collapseAll}
              muted
            />
            <div className="portfolio-analysis-context-menu-divider" />
            <div className="portfolio-analysis-context-menu-title">
              Current level
            </div>
            <ContextMenuButton
              label="Expand current level"
              onClick={() => expandCurrentLevel(menu.row)}
            />
            <ContextMenuButton
              label="Collapse current level"
              onClick={() => collapseCurrentLevel(menu.row)}
              muted
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

function GridCell({
  context,
  row,
  column,
  isSelectedRow,
  selectedColumnGroup,
  hasChildren,
  expanded,
  toggleRow,
  onCellSelect,
  decimalSettings,
  decimalMode,
  onOpenDriftDetail,
}: {
  context: PortfolioAnalysisContext;
  row: PortfolioAnalysisTreeRow;
  column: LeafColumn;
  isSelectedRow: boolean;
  selectedColumnGroup: PortfolioAnalysisColumnGroupContext | null | undefined;
  hasChildren: boolean;
  expanded: boolean;
  toggleRow: (row: PortfolioAnalysisTreeRow) => void;
  onCellSelect: (row: PortfolioAnalysisTreeRow, column: LeafColumn) => void;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
  onOpenDriftDetail: (rowId: string, tMinus: number | "total") => void;
}): JSX.Element {
  const cellRef = useRef<HTMLDivElement | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const tooltipId = `portfolio-analysis-tooltip-${row.id.replace(/[^a-zA-Z0-9_-]/g, "-")}-${column.key}`;
  const tooltipContent = derivedTooltipContent(
    context,
    row,
    column,
    decimalSettings,
    decimalMode,
  );
  const showTooltip = (): void => {
    if (!tooltipContent) return;
    const rect = cellRef.current?.getBoundingClientRect();
    if (!rect) return;
    const estimatedHeight = 62;
    setTooltipPosition({
      top:
        rect.top > estimatedHeight + 8
          ? rect.top - estimatedHeight - 6
          : rect.bottom + 6,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 430)),
    });
    setTooltipOpen(true);
  };
  useEffect(() => {
    if (!tooltipOpen) return;
    const close = (): void => setTooltipOpen(false);
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [tooltipOpen]);
  const selectedPeriodBandClass =
    isSelectedRow &&
    isSameSelectedPeriodBand(selectedColumnGroup, context, column)
      ? " portfolio-analysis-grid-selected-period-band-cell"
      : "";

  if (column.kind === "label") {
    return (
      <div
        className={`${cellClasses(column, "portfolio-analysis-grid-cell-left")}${selectedPeriodBandClass}`}
        style={{ width: column.width }}
        onClick={(event) => {
          event.stopPropagation();
          onCellSelect(row, column);
        }}
      >
        <div
          className="portfolio-analysis-grid-label-wrap"
          style={{ paddingLeft: Math.max(0, row.depth) * INDENT_PX }}
        >
          <button
            type="button"
            className={`portfolio-analysis-grid-caret ${hasChildren ? "" : "portfolio-analysis-grid-caret-placeholder"}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleRow(row);
            }}
          >
            {hasChildren ? (
              expanded ? (
                <ChevronDown size={15} strokeWidth={2} />
              ) : (
                <ChevronRight size={15} strokeWidth={2} />
              )
            ) : null}
          </button>
          <span
            className={labelClassName(row, context.comparisonTMinus)}
            style={{ fontWeight: 400 }}
          >
            {row.label}
          </span>
        </div>
      </div>
    );
  }
  const raw = valueOf(row, column.field);
  const text =
    column.kind === "text"
      ? String(raw ?? "")
      : formatGridNumber(
          raw as number | null,
          column.metric,
          column.kind,
          decimalSettings,
          decimalMode,
        );
  const isSigned = column.kind === "number" || column.kind === "signedExposure";
  const color =
    isSigned && typeof raw === "number" && raw !== 0
      ? raw > 0
        ? " text-tcw-green"
        : " text-tcw-plum"
      : "";
  const align =
    column.kind === "number" ||
    column.kind === "plainNumber" ||
    column.kind === "exposure" ||
    column.kind === "signedExposure"
      ? "portfolio-analysis-grid-cell-right"
      : "portfolio-analysis-grid-cell-left";
  return (
    <div
      ref={cellRef}
      className={`${cellClasses(column, align)}${color}${selectedPeriodBandClass}`}
      style={{ width: column.width }}
      tabIndex={tooltipContent ? 0 : undefined}
      aria-describedby={tooltipOpen && tooltipContent ? tooltipId : undefined}
      onMouseEnter={showTooltip}
      onMouseLeave={() => setTooltipOpen(false)}
      onFocus={showTooltip}
      onBlur={() => setTooltipOpen(false)}
      onClick={(event) => {
        event.stopPropagation();
        onCellSelect(row, column);
      }}
      onDoubleClick={(event) => {
        if (column.metric !== "drift" || column.tMinus == null) return;
        event.preventDefault();
        event.stopPropagation();
        onOpenDriftDetail(row.id, column.tMinus);
      }}
    >
      <span className="portfolio-analysis-grid-truncate">{text}</span>
      {tooltipOpen && tooltipContent && tooltipPosition
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              className="portfolio-analysis-derived-tooltip"
              style={{
                position: "fixed",
                top: tooltipPosition.top,
                left: tooltipPosition.left,
              }}
            >
              <div className="portfolio-analysis-derived-tooltip-row portfolio-analysis-derived-tooltip-formula">
                <span>Formula:</span>
                <span>{tooltipContent.formula}</span>
              </div>
              <div className="portfolio-analysis-derived-tooltip-row portfolio-analysis-derived-tooltip-execution">
                <span>Execution:</span>
                <span>{tooltipContent.execution}</span>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
function ContextMenuButton({
  label,
  onClick,
  muted = false,
}: {
  label: string;
  onClick: () => void;
  muted?: boolean;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`portfolio-analysis-context-menu-button ${muted ? "portfolio-analysis-context-menu-button-muted" : ""}`}
    >
      {label}
    </button>
  );
}
