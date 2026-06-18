import { useMemo } from "react";
import { Typography } from "antd";
import ReactECharts from "echarts-for-react";
import "./AttributionPrintView.css";
const { Title, Text } = Typography;

type RowType = Record<string, unknown>;

interface Props {
  rows: RowType[];
  period: string;
  benchmarkName?: string;
  pageTitle?: string;
  valueDate?: string;
  selectedSector?: string | null;
  onSectorSelect?: (sector: string) => void;

}

type TableRow = {
  key: number;
  sector: string;
  pfWeight: number;
  bmWeight: number;
  pfReturn: number;
  bmReturn: number;
  diff: number;
  alloc: number;
  select: number;
  total: number;
};

const toNum = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value)
    ? value
    : 0;



const formatPct = (v: unknown) =>
  typeof v === "number" ? (v * 100).toFixed(2) : "";

export default function AttributionPrintView({
  rows,
  period,
  benchmarkName,
}: Props) {

 const tableRows: TableRow[] = useMemo(() => {
  return rows.map((r, idx) => ({
    key: idx,

    sector: String(r["SecurityGroup"] ?? ""),

    pfWeight: toNum(r["PFAvgWeight"]),
    bmWeight: toNum(r["BMAvgWeight"]),

    pfReturn: toNum(r["PFTotalRet"]),
    bmReturn: toNum(r["BMTotalRet"]),

    diff:
      toNum(r["PFTotalRet"]) -
      toNum(r["BMTotalRet"]),

    alloc: toNum(r["AllocEffect"]),
    select: toNum(r["SelectEffect"]),

    total:
      toNum(r["AllocEffect"]) +
      toNum(r["SelectEffect"]) +
      toNum(r["InterEffect"]),
  }));
}, [rows]);

  const chartOption = {
    tooltip: { trigger: "axis" },
    legend: {
      data: ["Asset Allocation", "Security Selection"],
      bottom: 0,
    },
    xAxis: {
      type: "category",
      data: rows.map(r => r["SecurityGroup"]),
      axisLabel: { rotate: 30 },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (v: number) => (v * 100).toFixed(2) + "%",
      },
    },
    series: [
      {
        name: "Asset Allocation",
        type: "bar",
        data: rows.map(r => r["AllocEffect"]),
        itemStyle: { color: "#1f6aa5" },
      },
      {
        name: "Security Selection",
        type: "bar",
        data: rows.map(r => r["SelectEffect"]),
        itemStyle: { color: "#6b6b6b" },
      },
    ],
  };

const cellStyle = {
  padding: "6px 8px",
  textAlign: "right" as const,
};
const cellTextStyle = {
  padding: "6px 8px",
  textAlign: "left" as const,
};

  return (
     <div className="print-scale">
     <div style={{ padding: 16, background: "#fff" }}>

      {/* Title */}
      <Title level={4}>Attribution Analysis</Title>
      <Text strong>Sector Returns & Attribution</Text>
      <div>{period.toUpperCase()}</div>

      {/* Table */}

<table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  }}
>

<thead>
  {/* TOP HEADER ROW */}
  <tr style={{ borderBottom: "2px solid #333" }}>
    <th rowSpan={2} style={{ textAlign: "left", padding: "6px 8px" }}>
      Sector
    </th>

    <th rowSpan={2}>Avg %</th>

    <th colSpan={1}>Benchmark</th>

    <th colSpan={2}>Returns</th>

    <th rowSpan={2}>Difference</th>

    <th colSpan={3} style={{ textAlign: "center" }}>Attribution</th>
  </tr>

  {/* SECOND HEADER ROW */}
  <tr style={{ borderBottom: "2px solid #333" }}>
    <th>BM Weight</th>

    <th>PF Return</th>
    <th>BM Return</th>

    <th>Alloc</th>
    <th>Select</th>
    <th>Total</th>
  </tr>
</thead>

        <tbody>
          {tableRows.map((r) => (
            <tr key={r.key}>
              <td style={cellTextStyle}>{r.sector}</td>
              <td style={cellStyle}>{formatPct(r.pfWeight)}</td>
              <td style={cellStyle}>{formatPct(r.bmWeight)}</td>
              <td style={cellStyle}>{formatPct(r.pfReturn)}</td>
              <td style={cellStyle}>{formatPct(r.bmReturn)}</td>
              <td style={cellStyle}>{formatPct(r.diff)}</td>
              <td style={cellStyle}>{formatPct(r.alloc)}</td>
              <td style={cellStyle}>{formatPct(r.select)}</td>
              <td style={cellStyle}>{formatPct(r.total)}</td>
            </tr>
          ))}
        </tbody>



      </table>

      {/* Benchmark */}
      {benchmarkName && (
        <div style={{ marginTop: 12 }}>
          <Text>Benchmark: {benchmarkName}</Text>
        </div>
      )}

      {/* Chart */}
      <div style={{ marginTop: 24 }}>
        <Title level={5}>Sector Attribution</Title>
        <ReactECharts style={{ height: 380 }} option={chartOption} />
      </div>
    </div>
    </div>
  );
}