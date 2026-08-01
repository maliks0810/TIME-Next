import { useMemo } from "react";
import { Empty, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ComparePeriodInfo } from "../../pages/attribution/AtributionAnalysisWorkspace";

const { Text } = Typography;

/* ----------------------------- types ----------------------------- */
type DataRow = Record<string, unknown>;

type CompareMetric = "weight" | "totalReturn" | "contribution";

/** Which attribution effect columns to show in effect mode. */
type EffectKey = "alloc" | "select" | "inter" | "total";

type Props = {
  leftPeriod: ComparePeriodInfo;
  rightPeriod: ComparePeriodInfo;
  leftRows: DataRow[];
  rightRows: DataRow[];
  /**
   * View mode:
   *  - "metric" (default): PF / BM / Active for a metric family (weight, return, contribution)
   *  - "effect": Allocation / Selection / Interaction / Total Active with deltas
   */
  view?: "metric" | "effect";
  /** Which metric family to tabulate when view="metric". Defaults to "weight". */
  metric?: CompareMetric;
  selectedGroup?: string | null;
  onSelect?: (group: string) => void;
};

type CompareGridRow = {
  key: string;
  securityGroup: string;
  leftPf: number;
  leftBm: number;
  rightPf: number;
  rightBm: number;
  pfDelta: number; // right - left (portfolio)
  bmDelta: number; // right - left (benchmark)
  leftActive: number; // pf - bm (left period)
  rightActive: number; // pf - bm (right period)
  activeDelta: number; // rightActive - leftActive
};

/* ----------------------------- field maps ----------------------------- */
const NUMBER_FIELDS: Record<
  CompareMetric,
  { label: string; pf: string; bm: string }
> = {
  weight: { label: "Weight", pf: "PFAvgWeight", bm: "BMAvgWeight" },
  totalReturn: { label: "Total Return", pf: "PFTotalRet", bm: "BMTotalRet" },
  contribution: {
    label: "Contribution Return",
    pf: "PFContToRet",
    bm: "BMContToRet",
  },
};

// Attribution effect source fields (mirror of the waterfall in AttributionCompareView).
// Total Active is derived: alloc + select + inter.
const EFFECT_FIELDS: Array<{ key: EffectKey; label: string; field?: string }> = [
  { key: "alloc", label: "Allocation", field: "AllocEffect" },
  { key: "select", label: "Selection", field: "SelectEffect" },
  { key: "inter", label: "Interaction", field: "InterEffect" },
  { key: "total", label: "Total Active" }, // derived
];

/* ----------------------------- helpers ----------------------------- */
function getNumber(row: DataRow | null | undefined, key: string): number {
  const value = row?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

// Mirror of the compare view: fall back to SecurityName when SecurityGroup is empty.
function getGroup(row: DataRow | null | undefined): string {
  return String(row?.["SecurityGroup"] ?? row?.["SecurityName"] ?? "");
}

function fmtPct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * Build an aligned, per-group compare dataset for the table.
 * Total is kept and pinned first; all other groups follow.
 */
function buildCompareGridRows(
  leftRows: DataRow[],
  rightRows: DataRow[],
  metric: CompareMetric
): CompareGridRow[] {
  const { pf, bm } = NUMBER_FIELDS[metric];

  const leftMap = new Map<string, DataRow>();
  const rightMap = new Map<string, DataRow>();

  for (const row of leftRows) {
    const key = getGroup(row);
    if (key) leftMap.set(key, row);
  }
  for (const row of rightRows) {
    const key = getGroup(row);
    if (key) rightMap.set(key, row);
  }

  const keys = Array.from(
    new Set([...Array.from(leftMap.keys()), ...Array.from(rightMap.keys())])
  );

  const rows: CompareGridRow[] = keys.map((key) => {
    const left = leftMap.get(key) ?? null;
    const right = rightMap.get(key) ?? null;

    const leftPf = getNumber(left, pf);
    const leftBm = getNumber(left, bm);
    const rightPf = getNumber(right, pf);
    const rightBm = getNumber(right, bm);

    const leftActive = leftPf - leftBm;
    const rightActive = rightPf - rightBm;

    return {
      key,
      securityGroup: key,
      leftPf,
      leftBm,
      rightPf,
      rightBm,
      pfDelta: rightPf - leftPf,
      bmDelta: rightBm - leftBm,
      leftActive,
      rightActive,
      activeDelta: rightActive - leftActive,
    };
  });

  // Pin "Total" first, then sort the rest by absolute active delta (desc).
  rows.sort((a, b) => {
    if (a.securityGroup === "Total") return -1;
    if (b.securityGroup === "Total") return 1;
    return Math.abs(b.activeDelta) - Math.abs(a.activeDelta);
  });

  return rows;
}

/* ----------------------------- effect mode ----------------------------- */
type EffectGridRow = {
  key: string;
  securityGroup: string;
  // per-effect values for each period + delta
  left: Record<EffectKey, number>;
  right: Record<EffectKey, number>;
  delta: Record<EffectKey, number>; // right - left
};

function readEffects(row: DataRow | null): Record<EffectKey, number> {
  const alloc = getNumber(row, "AllocEffect");
  const select = getNumber(row, "SelectEffect");
  const inter = getNumber(row, "InterEffect");
  return { alloc, select, inter, total: alloc + select + inter };
}

function buildEffectGridRows(
  leftRows: DataRow[],
  rightRows: DataRow[]
): EffectGridRow[] {
  const leftMap = new Map<string, DataRow>();
  const rightMap = new Map<string, DataRow>();

  for (const row of leftRows) {
    const key = getGroup(row);
    if (key) leftMap.set(key, row);
  }
  for (const row of rightRows) {
    const key = getGroup(row);
    if (key) rightMap.set(key, row);
  }

  const keys = Array.from(
    new Set([...Array.from(leftMap.keys()), ...Array.from(rightMap.keys())])
  );

  const rows: EffectGridRow[] = keys.map((key) => {
    const left = readEffects(leftMap.get(key) ?? null);
    const right = readEffects(rightMap.get(key) ?? null);
    const delta: Record<EffectKey, number> = {
      alloc: right.alloc - left.alloc,
      select: right.select - left.select,
      inter: right.inter - left.inter,
      total: right.total - left.total,
    };
    return { key, securityGroup: key, left, right, delta };
  });

  // Total first, then by absolute Total-Active delta desc.
  rows.sort((a, b) => {
    if (a.securityGroup === "Total") return -1;
    if (b.securityGroup === "Total") return 1;
    return Math.abs(b.delta.total) - Math.abs(a.delta.total);
  });

  return rows;
}

/* ----------------------------- component ----------------------------- */
export default function AttributionCompareGrid({
  leftPeriod,
  rightPeriod,
  leftRows,
  rightRows,
  view = "metric",
  metric = "weight",
  selectedGroup,
  onSelect,
}: Props) {
  const isEffect = view === "effect";
  const metricLabel = isEffect ? "Attribution Effects" : NUMBER_FIELDS[metric].label;
  const leftCode = leftPeriod.code;
  const rightCode = rightPeriod.code;

  const data = useMemo(
    () => buildCompareGridRows(leftRows, rightRows, metric),
    [leftRows, rightRows, metric]
  );

  const effectData = useMemo(
    () => buildEffectGridRows(leftRows, rightRows),
    [leftRows, rightRows]
  );

  const deltaStyle = (value: number): React.CSSProperties => ({
    color: value > 0 ? "#16a34a" : value < 0 ? "#dc2626" : undefined,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
  });

  const numStyle: React.CSSProperties = {
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
  };

  const columns: ColumnsType<CompareGridRow> = [
    {
      title: "Group",
      dataIndex: "securityGroup",
      key: "securityGroup",
      fixed: "left",
      width: 200,
      render: (value: string) => (
        <Text strong={value === "Total"}>{value}</Text>
      ),
    },
    {
      title: leftCode,
      children: [
        {
          title: "PF",
          dataIndex: "leftPf",
          key: "leftPf",
          align: "right",
          render: (v: number) => <span style={numStyle}>{fmtPct(v)}</span>,
        },
        {
          title: "BM",
          dataIndex: "leftBm",
          key: "leftBm",
          align: "right",
          render: (v: number) => <span style={numStyle}>{fmtPct(v)}</span>,
        },
        {
          title: "Active",
          dataIndex: "leftActive",
          key: "leftActive",
          align: "right",
          render: (v: number) => <span style={deltaStyle(v)}>{fmtPct(v)}</span>,
        },
      ],
    },
    {
      title: rightCode,
      children: [
        {
          title: "PF",
          dataIndex: "rightPf",
          key: "rightPf",
          align: "right",
          render: (v: number) => <span style={numStyle}>{fmtPct(v)}</span>,
        },
        {
          title: "BM",
          dataIndex: "rightBm",
          key: "rightBm",
          align: "right",
          render: (v: number) => <span style={numStyle}>{fmtPct(v)}</span>,
        },
        {
          title: "Active",
          dataIndex: "rightActive",
          key: "rightActive",
          align: "right",
          render: (v: number) => <span style={deltaStyle(v)}>{fmtPct(v)}</span>,
        },
      ],
    },
    {
      title: `Δ (${rightCode} − ${leftCode})`,
      children: [
        {
          title: "PF Δ",
          dataIndex: "pfDelta",
          key: "pfDelta",
          align: "right",
          sorter: (a, b) => a.pfDelta - b.pfDelta,
          render: (v: number) => <span style={deltaStyle(v)}>{fmtPct(v)}</span>,
        },
        {
          title: "BM Δ",
          dataIndex: "bmDelta",
          key: "bmDelta",
          align: "right",
          sorter: (a, b) => a.bmDelta - b.bmDelta,
          render: (v: number) => <span style={deltaStyle(v)}>{fmtPct(v)}</span>,
        },
        {
          title: "Active Δ",
          dataIndex: "activeDelta",
          key: "activeDelta",
          align: "right",
          defaultSortOrder: "descend",
          sorter: (a, b) => Math.abs(a.activeDelta) - Math.abs(b.activeDelta),
          render: (v: number) => (
            <Text strong style={deltaStyle(v)}>
              {fmtPct(v)}
            </Text>
          ),
        },
      ],
    },
  ];

  /* --------------------- effect-mode columns --------------------- */
  const effectColumns: ColumnsType<EffectGridRow> = [
    {
      title: "Group",
      dataIndex: "securityGroup",
      key: "securityGroup",
      fixed: "left",
      width: 200,
      render: (value: string) => <Text strong={value === "Total"}>{value}</Text>,
    },
    ...EFFECT_FIELDS.map((eff) => ({
      title: eff.label,
      children: [
        {
          title: leftCode,
          key: `${eff.key}-left`,
          align: "right" as const,
          render: (_: unknown, r: EffectGridRow) => (
            <span style={numStyle}>{fmtPct(r.left[eff.key])}</span>
          ),
        },
        {
          title: rightCode,
          key: `${eff.key}-right`,
          align: "right" as const,
          render: (_: unknown, r: EffectGridRow) => (
            <span style={numStyle}>{fmtPct(r.right[eff.key])}</span>
          ),
        },
        {
          title: "Δ",
          key: `${eff.key}-delta`,
          align: "right" as const,
          sorter: (a: EffectGridRow, b: EffectGridRow) =>
            a.delta[eff.key] - b.delta[eff.key],
          ...(eff.key === "total"
            ? { defaultSortOrder: "descend" as const }
            : {}),
          render: (_: unknown, r: EffectGridRow) => (
            <Text
              strong={eff.key === "total"}
              style={deltaStyle(r.delta[eff.key])}
            >
              {fmtPct(r.delta[eff.key])}
            </Text>
          ),
        },
      ],
    })),
  ];

  /* --------------------- effect-mode render --------------------- */
  if (isEffect) {
    if (!effectData.length) {
      return <Empty description="No aligned compare-period data available." />;
    }
    return (
      <Table<EffectGridRow>
        size="small"
        bordered
        columns={effectColumns}
        dataSource={effectData}
        pagination={false}
        scroll={{ x: "max-content", y: 420 }}
        title={() => (
          <Text strong>
            {metricLabel} (bps/%): {leftCode} vs {rightCode}
          </Text>
        )}
        rowClassName={(record) =>
          record.securityGroup === selectedGroup ? "ant-table-row-selected" : ""
        }
        onRow={(record) => ({
          onClick: () => {
            if (record.securityGroup !== "Total") {
              onSelect?.(record.securityGroup);
            }
          },
          style: { cursor: onSelect ? "pointer" : "default" },
        })}
      />
    );
  }

  /* --------------------- metric-mode render --------------------- */
  if (!data.length) {
    return <Empty description="No aligned compare-period data available." />;
  }

  return (
    <Table<CompareGridRow>
      size="small"
      bordered
      columns={columns}
      dataSource={data}
      pagination={false}
      scroll={{ x: "max-content", y: 420 }}
      title={() => (
        <Text strong>
          {metricLabel}: {leftCode} vs {rightCode}
        </Text>
      )}
      rowClassName={(record) =>
        record.securityGroup === selectedGroup ? "ant-table-row-selected" : ""
      }
      onRow={(record) => ({
        onClick: () => {
          if (record.securityGroup !== "Total") {
            onSelect?.(record.securityGroup);
          }
        },
        style: { cursor: onSelect ? "pointer" : "default" },
      })}
    />
  );
}
