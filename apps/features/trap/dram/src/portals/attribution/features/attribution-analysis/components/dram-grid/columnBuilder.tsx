import type { ColumnsType, ColumnType } from "antd/es/table";
import type {
  AttributionRow,
  GridConfigResponse,
  PersistedGridState,
  NormalizedColumnConfig,
  PrimitiveCellValue,
  ApiColumnConfig,
} from "./types";

import { formatValue, getDefaultWidth, getMinWidth } from "./formatters";
import { GroupHeader } from "./GroupHeader";
import { AnalyticResultRow, AnalyticsResponse } from "../../lib/services";

/* =========================================================
   Constants
   ========================================================= */

const DEFAULT_GROUP_ORDER = Number.MAX_SAFE_INTEGER;

/* =========================================================
   Resolvers (support camelCase + snake_case)
   ========================================================= */

const resolveGroupKey = (col: ApiColumnConfig): string => {
  const key =
    col.columnGroupKey ??
    col.columnGroupKey ??
    col.group ??
    "";

  if (typeof key === "string" && key.trim() !== "") {
    return key.trim();
  }

  return "ungrouped";
};

const resolveGroupLabel = (col: ApiColumnConfig): string => {
  const label =
    col.columnGroupLabel ??
    col.columnGroupLabel;

  if (typeof label === "string") {
    return label.trim();
  }

  return "";
};

const resolveGroupOrder = (col: ApiColumnConfig): number => {
  const value =
    col.columnGroupOrder ??
    col.columnGroupOrder;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return DEFAULT_GROUP_ORDER;
};

const resolveGroupStyleToken = (col: ApiColumnConfig): string => {
  const token =
    col.columnGroupStyleToken ??
    col.columnGroupStyleToken;

  if (typeof token === "string" && token.trim() !== "") {
    return token.trim();
  }

  return "default";
};

/* =========================================================
   1. Normalize Columns
   ========================================================= */

export const normalizeColumns = (
  config: GridConfigResponse,
  state: PersistedGridState,
  accessorOverrides?: Record<string, string>
): NormalizedColumnConfig[] => {
  const apiCols = config.columnConfigs.all;

  const normalized = apiCols.map<NormalizedColumnConfig>((col, index) => {
    const accessor = accessorOverrides?.[col.id] ?? col.accessor ?? col.id;

    const visible =
      state.visibility[col.id] !== undefined
        ? state.visibility[col.id]
        : col.visible;

    const width =
      state.widths[col.id] ??
      getDefaultWidth(col.format, col.label, col.frozen);

    return {
      id: col.id,
      label: col.label,
      accessor,
      visible,
      frozen: col.frozen,

      groupKey: resolveGroupKey(col),
      groupLabel: resolveGroupLabel(col),
      groupOrder: resolveGroupOrder(col),
      groupStyleToken: resolveGroupStyleToken(col),

      order: col.order,
      format: col.format,
      width,
      minWidth: getMinWidth(col.format, col.frozen),
      serverIndex: index,
    };
  });

  const byId = new Map(normalized.map((c) => [c.id, c]));

  const order = state.order ?? [];

  const orderedIds = [
    ...order.filter((id) => byId.has(id)),
    ...normalized
      .filter((c) => !order.includes(c.id))
      .sort((a, b) => a.serverIndex - b.serverIndex)
      .map((c) => c.id),
  ];

  return orderedIds
    .map((id) => byId.get(id))
    .filter((c): c is NormalizedColumnConfig => Boolean(c));
};

/* =========================================================
   2. Group Buckets
   ========================================================= */

interface ColumnGroupBucket {
  groupKey: string;
  groupLabel: string;
  groupOrder: number;
  groupStyleToken: string;
  firstColumnServerIndex: number;
  columns: NormalizedColumnConfig[];
}

const buildGroupBuckets = (
  columns: NormalizedColumnConfig[]
): ColumnGroupBucket[] => {
  const buckets = new Map<string, ColumnGroupBucket>();

  for (const col of columns) {
    const existing = buckets.get(col.groupKey);

    if (existing) {
      existing.columns.push(col);

      existing.groupOrder = Math.min(existing.groupOrder, col.groupOrder);

      existing.firstColumnServerIndex = Math.min(
        existing.firstColumnServerIndex,
        col.serverIndex
      );

      if (existing.groupLabel === "" && col.groupLabel !== "") {
        existing.groupLabel = col.groupLabel;
      }

      if (
        existing.groupStyleToken === "default" &&
        col.groupStyleToken !== "default"
      ) {
        existing.groupStyleToken = col.groupStyleToken;
      }

      continue;
    }

    buckets.set(col.groupKey, {
      groupKey: col.groupKey,
      groupLabel: col.groupLabel,
      groupOrder: col.groupOrder,
      groupStyleToken: col.groupStyleToken,
      firstColumnServerIndex: col.serverIndex,
      columns: [col],
    });
  }

  return Array.from(buckets.values()).sort((a, b) => {
    if (a.groupOrder !== b.groupOrder) {
      return a.groupOrder - b.groupOrder;
    }

    return a.firstColumnServerIndex - b.firstColumnServerIndex;
  });
};

/* =========================================================
   3. Build AntD Columns
   ========================================================= */

export const buildColumns = ({
  columns,
}: {
  columns: NormalizedColumnConfig[];
}): ColumnsType<AttributionRow> => {
  const visible = columns.filter((c) => c.visible);

  const frozenColumns = visible.filter((c) => c.frozen);
  const nonFrozenColumns = visible.filter((c) => !c.frozen);

  const isTotalRow = (record: AttributionRow): boolean => {
    return record.SecurityGroup === "Total";
  };

  const buildLeaf = (
    col: NormalizedColumnConfig
  ): ColumnType<AttributionRow> => ({
    title: col.label,
    key: col.id,
    dataIndex: col.accessor,
    width: col.width,
    fixed: col.frozen ? "left" : undefined,
    ellipsis: true,
    align: col.format === "text" ? "left" : "right",
    shouldCellUpdate: (record, prev) =>
      record[col.accessor] !== prev[col.accessor],

    render: (value: PrimitiveCellValue, record: AttributionRow) => {
      if (col.accessor === "SecurityGroup") {

        if (isTotalRow(record)) {
          return <span><strong>{value}</strong></span>;
        }

        return (
          <span style={{ paddingLeft: 16 }}>
            {value}
          </span>
        );
      }

      return formatValue(value, col.format);
    },

  });

  const result: ColumnsType<AttributionRow> = frozenColumns.map(buildLeaf);

  const groupBuckets = buildGroupBuckets(nonFrozenColumns);

  for (const bucket of groupBuckets) {
    const groupLeafColumns = bucket.columns.map(buildLeaf);

    if (bucket.groupLabel === "") {
      result.push(...groupLeafColumns);
      continue;
    }

    result.push({
      title: (
        <GroupHeader
          label={bucket.groupLabel}
          token={bucket.groupStyleToken}
        />
      ),
      key: `group_${bucket.groupKey}`,
      children: groupLeafColumns,
    });
  }

  return result;
};

/* =========================================================
   4. Scroll Width
   ========================================================= */

export const getTotalScrollWidth = (
  columns: NormalizedColumnConfig[]
): number =>
  columns
    .filter((c) => c.visible)
    .reduce((sum, c) => sum + c.width, 0);

/* =========================================================
   5. Rows Mapping
   ========================================================= */

export const mapRowsToTableRows = (
  rows: Record<string, PrimitiveCellValue>[]
): AttributionRow[] =>
  rows.map((row, idx) => ({
    key: String(idx),
    ...row,
  }));

export const buildRawTree = (rows: AnalyticResultRow[]): DrilldownGroupRow[] => {
  const map = new Map<string, AnalyticResultRow[]>();

  for (const row of rows) {
    const date = String(row["ASOfDate"] ?? "Unknown");

    if (!map.has(date)) {
      map.set(date, []);
    }

    map.get(date)!.push(row);
  }

  return Array.from(map.entries()).map(([date, items], i) => ({
    key: `group-${date}`,
    __rowType: "group",
    ASOfDate: date,
    SecurityGroup: date,
    children: items.map((r, j) => ({
      ...r,
      key: `detail-${i}-${j}`,
      __rowType: "detail" as const,
    })),
  }));
};


export type DrilldownDetailRow = AnalyticResultRow & {
  key: string;
  __rowType: "detail";
};

export type DrilldownGroupRow = {
  key: string;
  __rowType: "group";
  ASOfDate: string;
  SecurityGroup: string;
  children: DrilldownDetailRow[];
};

export type DrilldownRow = DrilldownGroupRow | DrilldownDetailRow;

export const extractAnalysisDatasets = (apiResp: AnalyticsResponse) => {
  const grids = Array.isArray(apiResp.data?.grids)
    ? apiResp.data.grids
    : [];

  const aggregated = grids.find((g) => g.title === "ytd");
  const raw = grids.find((g) => g.title === "all_data");

  return {
    main: aggregated?.rows ?? [],
    drilldown: buildRawTree(raw?.rows ?? []),
  };
};
