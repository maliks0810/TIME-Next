import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DownloadOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { downloadExport , } from "./api/download";
import { buildDram2UrlNonAttribution } from "./api/services";
import { formatDateOnly } from "./snapshot-book/helper";

const { Title, Text } = Typography;

type RowKind = "fund" | "benchmark" | "section";
type Cell = number | string | null | undefined;
interface SnapshotRow {
  id: string;
  pfNumber?: string;
  parentPfNumber?: string;
  benchmarkCode?: string;
  benchmarkName?: string;
  rowOrder?: number;
  rowType: RowKind;
  fundName: string;
  ticker?: string;
  priorDay?: Cell;
  priorDayPercentile?: Cell;
  mtd?: Cell;
  mtdPercentile?: Cell;
  qtd?: Cell;
  qtdPercentile?: Cell;
  ytd?: Cell;
  ytdPercentile?: Cell;
  oneYear?: Cell;
  oneYearPercentile?: Cell;
  threeYear?: Cell;
  threeYearPercentile?: Cell;
  fiveYear?: Cell;
  fiveYearPercentile?: Cell;
  fundAumMillions?: Cell;
  morningstarRating?: Cell;
  morningstarCategory?: string;
  dataWarning?: string;
}

interface SnapshotSection {
  sectionName: string;
  rows: SnapshotRow[];
}

interface SnapshotResponse {
  asOfDate: string;
  priorDate?: string;
  warnings: string[];
  sections: SnapshotSection[];
}

// Table rows carry the section name + a synthetic "section" band row.
interface GridRow extends SnapshotRow {
  key: string;
  sectionName: string;
}

// =====================================================================
// Value formatters / colorers (mirror the Excel + PDF logic)
// =====================================================================
const RED = "#cf1322";
const GREEN = "#1e7d32";
const GRAY = "#666666";
const BLACK = "#1a1a1a";
const GOLD = "#c69214";

const toNum = (value: unknown): number | null => {
  if (value == null || value === "") {
    return null;
  }

  const numberValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
};

const fmtReturn = (
  value: Cell
): React.ReactNode => {
  const numberValue = toNum(value);

  if (numberValue == null) {
    return <span style={{ color: GRAY }}>-</span>;
  }

  return (
    <span
      style={{
        color: numberValue < 0 ? RED : BLACK,
      }}
    >
      {numberValue.toFixed(2)}
    </span>
  );
};



const fmtPercentile = (v?: number, benchmark = false): React.ReactNode => {
  if (v == null) return <span style={{ color: GRAY }} />;
  const color = benchmark
    ? GRAY
    : v <= 25
    ? GREEN
    : v >= 75
    ? RED
    : GRAY;
  return <span style={{ color }}>{v}</span>;
};

const fmtAum = (v?: Cell): React.ReactNode => {
  const n = toNum(v);
  return n == null
    ? ""
    : n.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
};

const fmtRating = (v?: number, benchmark = false): React.ReactNode => {
  const n = Math.min(Math.max(Math.round(v ?? 0), 0), 5);
  if (n <= 0) return null;
  return (
    <span style={{ color: benchmark ? GRAY : GOLD, letterSpacing: 1 }}>
      {"\u2605".repeat(n)}
    </span>
  );
};

// =====================================================================
// Component
// =====================================================================
export default function TCWFundsPerformanceSnapshot() {
  const [data, setData] = useState<SnapshotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [exporting, setExporting] = useState<"" | "excel" | "pdf">("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(
        buildDram2UrlNonAttribution("performance/tcw-funds-performance-snapshot/")
      );
      if (!r.ok) throw new Error((await r.json()).detail ?? "Load failed");
      setData(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // Build grid rows, injecting a section band row before each group.
  const rows = useMemo<GridRow[]>(() => {
  if (!data) return [];

  const term = search.trim().toLowerCase();
  const out: GridRow[] = [];

  data.sections
    .filter((s) => section === "all" || s.sectionName === section)
    .forEach((s) => {
      const matchingParents = new Set(
        s.rows
          .filter(
            (r) =>
              r.rowType === "fund" &&
              [r.pfNumber, r.fundName, r.ticker, r.morningstarCategory].some(
                (v) => String(v ?? "").toLowerCase().includes(term),
              ),
          )
          .map((r) => r.pfNumber ?? ""),
      );

      // ROW_ORDER already represents fund -> primary -> secondary and keeps
      // each portfolio block together. Never sort benchmark rows by AUM.
      const matched = [...s.rows]
        .sort((a, b) => (a.rowOrder ?? 999999) - (b.rowOrder ?? 999999))
        .filter((r) => {
          if (!term) return true;
          if (r.rowType === "fund") return matchingParents.has(r.pfNumber ?? "");
          return matchingParents.has(r.parentPfNumber ?? "");
        });

      if (!matched.length) return;

      // Section band row
      out.push({
        id: `section-${s.sectionName}`,
        key: `section-${s.sectionName}`,
        rowType: "section",
        fundName: s.sectionName,
        sectionName: s.sectionName,
      });

      matched.forEach((r) =>
        out.push({
          ...r,
          key: r.id,
          sectionName: s.sectionName,
        }),
      );
    });

  return out;
}, [data, search, section]);

  // Section band rows span all columns; the rest render normally.
  // NOTE: AntD's onCell signature is (record, index?) -> the record is the
  // FIRST argument, so this helper takes `row` as its single parameter.
  const bandCell = (row: GridRow) =>
    row.rowType === "section" ? { colSpan: 0 } : {};

  const perfPairs: {
    key: keyof SnapshotRow;
    pct: keyof SnapshotRow;
    title: string;
  }[] = [
    { key: "priorDay", pct: "priorDayPercentile", title: "Prior Day" },
    { key: "mtd", pct: "mtdPercentile", title: "MTD" },
    { key: "qtd", pct: "qtdPercentile", title: "QTD" },
    { key: "ytd", pct: "ytdPercentile", title: "YTD" },
    { key: "oneYear", pct: "oneYearPercentile", title: "1 Year" },
    { key: "threeYear", pct: "threeYearPercentile", title: "3 Years" },
    { key: "fiveYear", pct: "fiveYearPercentile", title: "5 Years" },
  ];

  const columns: ColumnsType<GridRow> = [
    {
      title: "PF #",
      dataIndex: "pfNumber",
      width: 70,
      fixed: "left",
      align: "center",
      onCell: (row) =>
        row.rowType === "section"
          ? { colSpan: 19, className: "section-band" }
          : {},
      render: (v: string, row) =>
        row.rowType === "section" ? (
          <span className="section-band-text">{row.fundName}</span>
        ) : row.rowType === "fund" ? (
          <Text strong>{v}</Text>
        ) : (
          ""
        ),
    },
    {
      title: "Fund / Index",
      dataIndex: "fundName",
      width: 280,
      fixed: "left",
      onCell: bandCell,
      render: (v: string, row) => (
        <Text
          strong={row.rowType === "fund"}
          italic={row.rowType === "benchmark"}
          style={{
            color: BLACK,
            paddingLeft: row.rowType === "benchmark" ? 14 : 0,
          }}
        >
          {v}
        </Text>
      ),
    },
    {
      title: "Ticker",
      dataIndex: "ticker",
      width: 85,
      align: "center",
      onCell: bandCell,
      render: (v: string, row) => (row.rowType === "fund" ? v : ""),
    },
    ...perfPairs.flatMap((p): ColumnsType<GridRow> => {
      const isBench = (row: GridRow) => row.rowType === "benchmark";
      return [
        {
          title: p.title,
          dataIndex: p.key as string,
          width: 78,
          align: "right",
          onCell: bandCell,
          render: (v: Cell) => fmtReturn(v),
        },
        {
          title: "Percentile",
          dataIndex: p.pct as string,
          width: 82,
          align: "center",
          onCell: bandCell,
          render: (v: number, row) => fmtPercentile(v, isBench(row)),
        },
      ];
    }),
    {
      title: (
        <>
          Fund AUM
          <br />
          ($ mil)
        </>
      ),
      dataIndex: "fundAumMillions",
      width: 100,
      align: "right",
      onCell: bandCell,
      render: (v: Cell, row) =>
        row.rowType === "fund" ? fmtAum(v) : "",
    },
    {
      title: (
        <>
          Morningstar
          <br />
          Overall Rating
        </>
      ),
      dataIndex: "morningstarRating",
      width: 120,
      align: "center",
      onCell: bandCell,
      render: (v: Cell, row) =>
        row.rowType === "fund" ? fmtRating(toNum(v) ?? undefined, false) : null,
    },
  ];

  const exp = async (kind: "excel" | "pdf") => {
    setExporting(kind);
    try {
      await downloadExport(
        buildDram2UrlNonAttribution(`performance/tcw-funds-performance-snapshot/export/${kind}/` +
          `?as_of_date=${data?.asOfDate ?? ""}`),
        `TCW_Funds_Performance_Snapshot.${
          kind === "excel" ? "xlsx" : "pdf"
        }`
      );
      message.success(`${kind.toUpperCase()} export completed`);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting("");
    }
  };

const priorLabel = formatDateOnly(
  data?.priorDate,
  navigator.language,
);

const asOfLabel = formatDateOnly(
  data?.asOfDate,
  navigator.language,
).toUpperCase();

  return (
    <div className="snapshot-print-container" style={{ padding: 20 }}>
      <Card
        bordered={false}
        className="snapshot-card"
        title={
          <div className="snapshot-header">
            <div>
              <Title level={3} style={{ margin: 0, color: "#17365d" }}>
                TCW Funds Performance Snapshot
              </Title>
              <Text strong style={{ color: "#1f4e78" }}>
                All data in U.S. Dollar, Net of Fees
              </Text>
            </div>
            {data && (
              <div className="snapshot-disclosure">
                <div className="asof">
                  AS OF {asOfLabel} &nbsp;|&nbsp; ESTIMATES ONLY &ndash;
                  FOR INTERNAL USE ONLY
                </div>
                <div className="prior">
                  PRIOR SOURCE DATE: {priorLabel}
                </div>
              </div>
            )}
          </div>
        }
        extra={
          <Space className="snapshot-no-print">
            <Button icon={<ReloadOutlined />} onClick={() => void load()}>
              Refresh
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              loading={exporting === "pdf"}
              onClick={() => void exp("pdf")}
            >
              PDF
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={exporting === "excel"}
              onClick={() => void exp("excel")}
            >
              Excel
            </Button>
          </Space>
        }
      >
        {error && (
          <Alert
            type="error"
            showIcon
            closable
            style={{ marginBottom: 12 }}
            message={error}
            action={
              <Button danger size="small" onClick={() => void load()}>
                Retry
              </Button>
            }
          />
        )}

        {data?.warnings?.length ? (
          <Alert
            type="warning"
            showIcon
            closable
            style={{ marginBottom: 12 }}
            className="snapshot-no-print"
            message={`${data.warnings.length} data-quality warning(s)`}
            description={
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {data.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            }
          />
        ) : null}

        <Space className="snapshot-no-print" style={{ marginBottom: 16 }}>
          <Input.Search
            allowClear
            placeholder="Search fund, ticker, PF or category"
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
          />
          <Select
            value={section}
            style={{ width: 220 }}
            onChange={setSection}
            options={[
              { label: "All sections", value: "all" },
              ...(data?.sections.map((s) => ({
                label: s.sectionName,
                value: s.sectionName,
              })) ?? []),
            ]}
          />
        </Space>

        <Spin spinning={loading}>
          {rows.length ? (
            <Table<GridRow>
              className="snapshot-table"
              size="small"
              rowKey="key"
              columns={columns}
              dataSource={rows}
              pagination={false}
              scroll={{ x: 1900 }}
              rowClassName={(row) =>
                row.rowType === "benchmark"
                  ? "benchmark-row"
                  : row.rowType === "section"
                  ? "section-row"
                  : ""
              }
            />
          ) : (
            !loading && <Empty />
          )}
        </Spin>


        <div className="snapshot-ytd-note">YTD represents ITD for TPAY</div>
        <div className="snapshot-footnote">
          Morningstar Ratings: Within Morningstar Category, the top 10% of
          funds receive 5 stars and the bottom 10% receive 1 star. Funds are
          rated for up to three time periods, three-, five-, and 10-years,
          and these ratings are combined to produce an overall rating.
          Quartile rankings are based on each fund&rsquo;s assigned
          Morningstar category. &nbsp;|&nbsp; Source: Morningstar, TCW
          Portfolio Analytics
        </div>
      </Card>

      <style>{`
        .snapshot-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }
        .snapshot-disclosure { text-align: right; }
        .snapshot-disclosure .asof {
          color: ${GRAY}; font-size: 12px; font-weight: 700;
        }
        .snapshot-disclosure .prior {
          color: ${GRAY}; font-size: 11px; font-style: italic;
          margin-top: 2px;
        }

        /* Header: navy text on white with a rule (no solid blue fill) */
        .snapshot-table .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #17365d !important;
          font-weight: 700;
          font-size: 11px;
          text-align: center;
          border-top: 2px solid #17365d;
          border-bottom: 2px solid #17365d;
          white-space: normal;
        }
        .snapshot-table .ant-table-tbody > tr > td {
          font-size: 11px;
          border-bottom: 1px solid #ececec;
        }

        /* Section band row */
        .snapshot-table td.section-band {
          background: #dce6f1 !important;
          text-align: left !important;
        }
        .section-band-text {
          color: #17365d; font-weight: 700;
        }
        .section-row td { background: #dce6f1 !important; }

        /* Benchmark rows: italic gray */
        .benchmark-row td {
          background: #fafafa !important;
          color: ${GRAY};
          font-style: italic;
        }

        .snapshot-ytd-note {
          margin-top: 16px;
          font-size: 10px;
          color: #17365d;
        }
        .snapshot-footnote {
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid #17365d;
          font-size: 10px;
          color: ${GRAY};
          line-height: 1.4;
        }

        @media print {
          .snapshot-no-print { display: none !important; }
          .ant-table-content { overflow: visible !important; }
          .ant-table-cell-fix-left,
          .ant-table-cell-fix-right { position: static !important; }
          @page { size: legal landscape; margin: .25in; }
        }
      `}</style>
    </div>
  );
}
