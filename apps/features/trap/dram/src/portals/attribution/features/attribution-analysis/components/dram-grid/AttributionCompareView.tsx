import { useMemo, useState } from "react";
import
{ Card,
Col, Empty, Row, Segmented, Space, Typography } from "antd";
import ReactECharts from "echarts-for-react";

const { Text } = Typography;

type Row = Record<string, unknown>;

type CompareMetric = "weight" | "totalReturn" | "contribution";
type GlobalSort = "absDelta" | "portfolio" | "benchmark" | "name";

type Props = {
  leftPeriod: string;
  rightPeriod: string;
  leftRows: Row[];
  rightRows: Row[];
  selectedGroup?: string | null;
  onSelect?: (group: string) => void;
  height?: number;
};

type AlignedGroupRow = {
  SecurityGroup: string;
  left: Row | null;
  right: Row | null;
};

const NUMBER_FIELDS = {
  weight: {
    label: "Weight",
    pf: "PFAvgWeight",
    bm: "BMAvgWeight",
  },
  totalReturn: {
    label: "Total Return",
    pf: "PFTotalRet",
    bm: "BMTotalRet",
  },
  contribution: {
    label: "Contribution Return",
    pf: "PFContribToRet",
    bm: "BMContribToRet",
  },
} satisfies Record<
  CompareMetric,
  { label: string; pf: string; bm: string }
>;

function getNumber(row: Row | null | undefined, key: string): number {
  const value = row?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getGroup(row: Row | null | undefined): string {
  return String(row?.["SecurityGroup"] ?? "");
}

function fmtPct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function alignRows(leftRows: Row[], rightRows: Row[]): AlignedGroupRow[] {
  const leftMap = new Map<string, Row>();
  const rightMap = new Map<string, Row>();

  for (const row of leftRows) {
    const key = getGroup(row);
    if (key) leftMap.set(key, row);
  }

  for (const row of rightRows) {
    const key = getGroup(row);
    if (key) rightMap.set(key, row);
  }

  const keys = Array.from(
    new Set<string>([
      ...Array.from(leftMap.keys()),
      ...Array.from(rightMap.keys()),
    ])
  ).filter((key) => key !== "Total");

  return keys.map((key) => ({
    SecurityGroup: key,
    left: leftMap.get(key) ?? null,
    right: rightMap.get(key) ?? null,
  }));
}

function sortAlignedRows(
  rows: AlignedGroupRow[],
  metric: CompareMetric,
  sortBy: GlobalSort
): AlignedGroupRow[] {
  const { pf, bm } = NUMBER_FIELDS[metric];

  const next = [...rows];

  next.sort((a, b) => {
    const aPfDelta = getNumber(a.right, pf) - getNumber(a.left, pf);
    const bPfDelta = getNumber(b.right, pf) - getNumber(b.left, pf);

    const aBmDelta = getNumber(a.right, bm) - getNumber(a.left, bm);
    const bBmDelta = getNumber(b.right, bm) - getNumber(b.left, bm);

    const aAbsDelta = Math.max(Math.abs(aPfDelta), Math.abs(aBmDelta));
    const bAbsDelta = Math.max(Math.abs(bPfDelta), Math.abs(bBmDelta));

    switch (sortBy) {
      case "portfolio":
        return getNumber(b.right, pf) - getNumber(a.right, pf);
      case "benchmark":
        return getNumber(b.right, bm) - getNumber(a.right, bm);
      case "name":
        return a.SecurityGroup.localeCompare(b.SecurityGroup);
      case "absDelta":
      default:
        return bAbsDelta - aAbsDelta;
    }
  });

  return next;
}

function buildPfBmDeltaOption(
  rows: AlignedGroupRow[],
  metric: CompareMetric,
  leftPeriod: string,
  rightPeriod: string
) {
  const cfg = NUMBER_FIELDS[metric];
  const categories = rows.map((r) => r.SecurityGroup);

  const leftPf = rows.map((r) => getNumber(r.left, cfg.pf));
  const leftBm = rows.map((r) => getNumber(r.left, cfg.bm));
  const rightPf = rows.map((r) => getNumber(r.right, cfg.pf));
  const rightBm = rows.map((r) => getNumber(r.right, cfg.bm));

  const pfDelta = rows.map((r) => getNumber(r.right, cfg.pf) - getNumber(r.left, cfg.pf));
  const bmDelta = rows.map((r) => getNumber(r.right, cfg.bm) - getNumber(r.left, cfg.bm));

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: Array<{ seriesName: string; value: number; axisValue: string }>) => {
        if (!Array.isArray(params) || !params.length) return "";
        return [
          `<strong>${params[0].axisValue}</strong>`,
          ...params.map((p) => `${p.seriesName}: ${fmtPct(p.value)}`),
        ].join("<br/>");
      },
    },
    legend: {
      top: 0,
    },
    grid: {
      left: 56,
      right: 56,
      top: 64,
      bottom: 96,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        interval: 0,
        rotate: 35,
      },
    },
    yAxis: [
      {
        type: "value",
        name: cfg.label,
        axisLabel: {
          formatter: (v: number) => fmtPct(v),
        },
      },
      {
        type: "value",
        name: "Delta",
        axisLabel: {
          formatter: (v: number) => fmtPct(v),
        },
      },
    ],
    series: [
      {
        name: `${leftPeriod.toUpperCase()} Portfolio`,
        type: "bar",
        data: leftPf,
        itemStyle: { color: "#013D7D" },
      },
      {
        name: `${leftPeriod.toUpperCase()} Benchmark`,
        type: "bar",
        data: leftBm,
        itemStyle: { color: "#B2B2B2" },
      },
      {
        name: `${rightPeriod.toUpperCase()} Portfolio`,
        type: "bar",
        data: rightPf,
        itemStyle: { color: "#013D7D" },
      },
      {
        name: `${rightPeriod.toUpperCase()} Benchmark`,
        type: "bar",
        data: rightBm,
        itemStyle: { color: "#B2B2B2" },
      },
      {
        name: "Portfolio Δ",
        type: "line",
        yAxisIndex: 1,
        data: pfDelta,
        smooth: false,
        symbolSize: 8,
        itemStyle: { color: "#d32f2f" },
        lineStyle: { width: 2 },
      },
      {
        name: "Benchmark Δ",
        type: "line",
        yAxisIndex: 1,
        data: bmDelta,
        smooth: false,
        symbolSize: 8,
        itemStyle: { color: "#DB9F00" },
        lineStyle: { width: 2, type: "dashed" },
      },
    ],
  };
}

function buildWaterfallOption(
  row: Row | null,
  period: string
) {
  const alloc = getNumber(row, "AllocEffect");
  const select = getNumber(row, "SelectEffect");
  const inter = getNumber(row, "InterEffect");
  const total = alloc + select + inter;

  const values = [alloc, select, inter, total];
  const labels = ["Allocation", "Selection", "Interaction", "Total Active"];
  const cumulative = [0, alloc, alloc + select, 0];

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },

      formatter: () => {
          return [
            `<strong>${period.toUpperCase()}</strong>`,
            `Allocation: ${fmtPct(alloc)}`,
            `Selection: ${fmtPct(select)}`,
            `Interaction: ${fmtPct(inter)}`,
            `Total Active: ${fmtPct(total)}`,
          ].join("<br/>");
        },

    },
    grid: {
      left: 40,
      right: 24,
      top: 56,
      bottom: 40,
    },
    xAxis: {
      type: "category",
      data: labels,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (v: number) => fmtPct(v),
      },
    },
    series: [
      {
        type: "bar",
        stack: "total",
        itemStyle: {
          color: "rgba(0,0,0,0)",
          borderColor: "rgba(0,0,0,0)",
        },
        emphasis: {
          itemStyle: {
            color: "rgba(0,0,0,0)",
            borderColor: "rgba(0,0,0,0)",
          },
        },
        data: cumulative,
      },
      {
        name: "Effect",
        type: "bar",
        stack: "total",
        label: {
          show: true,
          position: "top",
          formatter: ({ value }: { value: number }) => fmtPct(value),
        },
        data: values.map((v, idx) => ({
          value: v,
          itemStyle: {
            color:
              idx === 3
                ? "#013D7D"
                : v >= 0
                ? "#B2B2B2"
                : "#DB9F00",
          },
        })),
      },
    ],
  };
}

export default function AttributionCompareView({
  leftPeriod,
  rightPeriod,
  leftRows,
  rightRows,
  selectedGroup,
  onSelect,
  height = 420,
}: Props) {
  const [metric, setMetric] = useState<CompareMetric>("weight");
  const [sortBy, setSortBy] = useState<GlobalSort>("absDelta");

  const alignedRows = useMemo(() => {
    return sortAlignedRows(alignRows(leftRows, rightRows), metric, sortBy);
  }, [leftRows, rightRows, metric, sortBy]);

  const leftLookup = useMemo(() => {
    const map = new Map<string, Row>();
    for (const row of leftRows) {
      map.set(getGroup(row), row);
    }
    return map;
  }, [leftRows]);

  const rightLookup = useMemo(() => {
    const map = new Map<string, Row>();
    for (const row of rightRows) {
      map.set(getGroup(row), row);
    }
    return map;
  }, [rightRows]);

  const waterfallGroup = selectedGroup ?? "Total";
  const leftSelected = leftLookup.get(waterfallGroup) ?? leftLookup.get("Total") ?? null;
  const rightSelected = rightLookup.get(waterfallGroup) ?? rightLookup.get("Total") ?? null;

  const pfBmOption = useMemo(
    () => buildPfBmDeltaOption(alignedRows, metric, leftPeriod, rightPeriod),
    [alignedRows, metric, leftPeriod, rightPeriod]
  );

  const leftWaterfall = useMemo(
    () => buildWaterfallOption(leftSelected, leftPeriod),
    [leftSelected, leftPeriod]
  );

  const rightWaterfall = useMemo(
    () => buildWaterfallOption(rightSelected, rightPeriod),
    [rightSelected, rightPeriod]
  );

  if (!alignedRows.length) {
    return <Empty description="No aligned compare-period data available." />;
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row justify="space-between" align="middle">
        <Text strong>Portfolio vs Benchmark with Delta</Text>

        <Space>
          <Segmented
            value={metric}
            onChange={(value) => setMetric(value as CompareMetric)}
            options={[
              { label: "Weight", value: "weight" },
              { label: "Total Return", value: "totalReturn" },
              { label: "Contribution", value: "contribution" },
            ]}
          />
          <Segmented
            value={sortBy}
            onChange={(value) => setSortBy(value as GlobalSort)}
            options={[
              { label: "Δ", value: "absDelta" },
              { label: "PF", value: "portfolio" },
              { label: "BM", value: "benchmark" },
              { label: "A→Z", value: "name" },
            ]}
          />
        </Space>
      </Row>

      <ReactECharts
        style={{ width: "100%", height }}
        option={pfBmOption}
        notMerge
        lazyUpdate
        onEvents={{
          click: (params: { name?: string }) => {
            if (typeof params?.name === "string") {
              onSelect?.(params.name);
            }
          },
        }}
      />

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            title={
              <Row justify="space-between">
                <span>Attribution Waterfall</span>
                <Text type="secondary">
                  {leftPeriod.toUpperCase()} · {waterfallGroup}
                </Text>
              </Row>
            }
          >
            <ReactECharts
              style={{ width: "100%", height: 320 }}
              option={leftWaterfall}
              notMerge
              lazyUpdate
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <Row justify="space-between">
                <span>Attribution Waterfall</span>
                <Text type="secondary">
                  {rightPeriod.toUpperCase()} · {waterfallGroup}
                </Text>
              </Row>
            }
          >
            <ReactECharts
              style={{ width: "100%", height: 320 }}
              option={rightWaterfall}
              notMerge
              lazyUpdate
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
