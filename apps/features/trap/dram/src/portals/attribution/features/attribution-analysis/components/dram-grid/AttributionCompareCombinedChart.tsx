import { useMemo, useState } from "react";
import { Empty, Segmented, Space, Typography, theme } from "antd";
import ReactECharts from "echarts-for-react";
import type {
  BarSeriesOption,
  LineSeriesOption,
} from "echarts/charts";
import type {
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from "echarts/components";
import type { ComposeOption } from "echarts/core";
import type { ComparePeriodInfo } from "../../pages/attribution/AtributionAnalysisWorkspace";

const { Text } = Typography;

/* ----------------------------- types ----------------------------- */
type DataRow = Record<string, unknown>;

type ChartMode = "effect" | "metric";
type CompareMetric = "weight" | "totalReturn" | "contribution";

type Props = {
  leftPeriod: ComparePeriodInfo;
  rightPeriod: ComparePeriodInfo;
  leftRows: DataRow[];
  rightRows: DataRow[];
  /** "effect" = alloc/select/inter bars + Total Active Δ line (default). */
  mode?: ChartMode;
  /** Used only when mode="metric". Defaults to "weight". */
  metric?: CompareMetric;
  /** Match the grid: "fraction" (0.0123) or "percent" (1.23). Default fraction. */
  inputScale?: "fraction" | "percent";
  selectedGroup?: string | null;
  onSelect?: (group: string) => void;
  height?: number;
};

type ChartOption = ComposeOption<
  | GridComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | BarSeriesOption
  | LineSeriesOption
>;

/* ----------------------------- field maps ----------------------------- */
const NUMBER_FIELDS: Record<
  CompareMetric,
  { label: string; pf: string; bm: string }
> = {
  weight: { label: "Weight", pf: "PFAvgWeight", bm: "BMAvgWeight" },
  totalReturn: { label: "Total Return", pf: "PFTotalRet", bm: "BMTotalRet" },
  contribution: { label: "Contribution", pf: "PFContToRet", bm: "BMContToRet" },
};

const EFFECT_FIELDS: Array<{ label: string; field: string }> = [
  { label: "Allocation", field: "AllocEffect" },
  { label: "Selection", field: "SelectEffect" },
  { label: "Interaction", field: "InterEffect" },
];

/* ----------------------------- helpers ----------------------------- */
function getNumber(row: DataRow | null | undefined, key: string): number {
  const value = row?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readNum(
  row: DataRow | null | undefined,
  key: string,
  scale: "fraction" | "percent"
): number {
  const raw = getNumber(row, key);
  return scale === "percent" ? raw / 100 : raw;
}

function getGroup(row: DataRow | null | undefined): string {
  return String(row?.["SecurityGroup"] ?? row?.["SecurityName"] ?? "");
}

function fmtPct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

type Aligned = {
  group: string;
  left: DataRow | null;
  right: DataRow | null;
};

function alignRows(leftRows: DataRow[], rightRows: DataRow[]): Aligned[] {
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
  ).filter((k) => k !== "Total");
  return keys.map((group) => ({
    group,
    left: leftMap.get(group) ?? null,
    right: rightMap.get(group) ?? null,
  }));
}

/* ----------------------------- component ----------------------------- */
export default function AttributionCompareCombinedChart({
  leftPeriod,
  rightPeriod,
  leftRows,
  rightRows,
  mode: modeProp,
  metric = "weight",
  inputScale = "fraction",
  selectedGroup,
  onSelect,
  height = 460,
}: Props) {
  const { token } = theme.useToken();
  const [mode, setMode] = useState<ChartMode>(modeProp ?? "effect");

  const leftCode = leftPeriod.code;
  const rightCode = rightPeriod.code;

  const aligned = useMemo(
    () => alignRows(leftRows, rightRows),
    [leftRows, rightRows]
  );

  const option = useMemo<ChartOption>(() => {
    const categories = aligned.map((a) => a.group);

    const axisBase = {
      colorText: token.colorText,
      colorSub: token.colorTextSecondary,
      colorBorder: token.colorBorderSecondary,
    };

    let barSeries: BarSeriesOption[] = [];
    let deltaData: number[] = [];
    let deltaName = "";

    if (mode === "effect") {
      const mkStack = (
        side: "left" | "right",
        code: string
      ): BarSeriesOption[] =>
        EFFECT_FIELDS.map((eff, idx) => ({
          name: `${code} ${eff.label}`,
          type: "bar",
          stack: side,
          emphasis: { focus: "series" },
          data: aligned.map((a) => readNum(a[side], eff.field, inputScale)),
          itemStyle: {
            color: [token.colorPrimary, token.colorInfo, token.colorSuccess][
              idx
            ],
            opacity: side === "left" ? 0.65 : 1,
          },
        }));

      barSeries = [...mkStack("left", leftCode), ...mkStack("right", rightCode)];

      deltaName = "Total Active Δ";
      deltaData = aligned.map((a) => {
        const leftTotal = EFFECT_FIELDS.reduce(
          (s, e) => s + readNum(a.left, e.field, inputScale),
          0
        );
        const rightTotal = EFFECT_FIELDS.reduce(
          (s, e) => s + readNum(a.right, e.field, inputScale),
          0
        );
        return rightTotal - leftTotal;
      });
    } else {
      const { pf, bm } = NUMBER_FIELDS[metric];
      barSeries = [
        {
          name: `${leftCode} PF`,
          type: "bar",
          data: aligned.map((a) => readNum(a.left, pf, inputScale)),
          itemStyle: { color: token.colorPrimary, opacity: 0.65 },
        },
        {
          name: `${leftCode} BM`,
          type: "bar",
          data: aligned.map((a) => readNum(a.left, bm, inputScale)),
          itemStyle: { color: token.colorTextSecondary, opacity: 0.65 },
        },
        {
          name: `${rightCode} PF`,
          type: "bar",
          data: aligned.map((a) => readNum(a.right, pf, inputScale)),
          itemStyle: { color: token.colorInfo },
        },
        {
          name: `${rightCode} BM`,
          type: "bar",
          data: aligned.map((a) => readNum(a.right, bm, inputScale)),
          itemStyle: { color: token.colorBorderSecondary },
        },
      ];

      deltaName = "Active Δ";
      deltaData = aligned.map((a) => {
        const leftActive =
          readNum(a.left, pf, inputScale) - readNum(a.left, bm, inputScale);
        const rightActive =
          readNum(a.right, pf, inputScale) - readNum(a.right, bm, inputScale);
        return rightActive - leftActive;
      });
    }

    const deltaLine: LineSeriesOption = {
      name: deltaName,
      type: "line",
      yAxisIndex: 1,
      data: deltaData,
      smooth: false,
      symbolSize: 8,
      z: 5,
      itemStyle: { color: token.colorError },
      lineStyle: { width: 2 },
    };

    return {
      backgroundColor: "transparent",
      textStyle: { color: axisBase.colorText },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (v) =>
          typeof v === "number" ? fmtPct(v) : String(v ?? ""),
      },
      legend: {
        type: "scroll",
        top: 0,
        textStyle: { color: axisBase.colorSub },
      },
      grid: { left: 56, right: 56, top: 48, bottom: 72 },
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: {
          color: axisBase.colorSub,
          rotate: categories.length > 6 ? 30 : 0,
          interval: 0,
        },
        axisLine: { lineStyle: { color: axisBase.colorBorder } },
      },
      yAxis: [
        {
          type: "value",
          name: mode === "effect" ? "Effect" : NUMBER_FIELDS[metric].label,
          axisLabel: {
            color: axisBase.colorSub,
            formatter: (v: number) => fmtPct(v),
          },
          splitLine: { lineStyle: { color: axisBase.colorBorder } },
        },
        {
          type: "value",
          name: deltaName,
          position: "right",
          axisLabel: {
            color: axisBase.colorSub,
            formatter: (v: number) => fmtPct(v),
          },
          splitLine: { show: false },
        },
      ],
      series: [...barSeries, deltaLine],
    };
  }, [aligned, mode, metric, inputScale, leftCode, rightCode, token]);

  const onEvents = useMemo(
    () => ({
      click: (params: { name?: unknown }) => {
        if (typeof params?.name === "string" && params.name) {
          onSelect?.(params.name);
        }
      },
    }),
    [onSelect]
  );

  if (!aligned.length) {
    return <Empty description="No aligned compare-period data available." />;
  }

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <Text strong>
          {mode === "effect"
            ? "Attribution Effects"
            : NUMBER_FIELDS[metric].label}
          : {leftCode} vs {rightCode}
          {selectedGroup ? ` · ${selectedGroup}` : ""}
        </Text>
        <Segmented<ChartMode>
          size="small"
          value={mode}
          onChange={(v) => setMode(v as ChartMode)}
          options={[
            { label: "Effects", value: "effect" },
            { label: "Metric", value: "metric" },
          ]}
        />
      </Space>
      <ReactECharts
        style={{ height, width: "100%" }}
        option={option}
        notMerge
        lazyUpdate
        onEvents={onEvents}
      />
    </Space>
  );
}