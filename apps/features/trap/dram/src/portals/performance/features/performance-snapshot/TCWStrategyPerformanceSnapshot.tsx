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
import { downloadExport } from "./api/download";
import { buildDram2UrlNonAttribution } from "./api/services";
import { formatDateOnly } from "./snapshot-book/helper";

const { Title, Text } = Typography;

type RowKind = "fund" | "benchmark" | "section";

// Numeric fields may arrive as JSON strings (Snowflake NUMBER/Decimal) or as
// literal "N/A" / "--" placeholders, so values are typed loosely and coerced.
type Cell = number | string | null | undefined;

interface StrategyReturnPeriods {
  priorDay?: Cell;
  mtd?: Cell;
  qtd?: Cell;
  ytd?: Cell;
  oneYear?: Cell;
  threeYear?: Cell;
  fiveYear?: Cell;
}

interface StrategyRow {
  key: string;
  rowType: RowKind;
  portfolioNumber?: string | null;
  sourcePortfolioNumber?: string | null;
  parentPortfolioNumber?: string | null;
  displayName: string;
  benchmarkCode?: string | null;
  benchmarkName?: string | null;
  returns: StrategyReturnPeriods;
  portfolioAumMillions?: Cell;
  inceptionDate?: string | null;
  rowOrder?: number;
  dataWarning?: string | null;
}

interface StrategySection {
  key: string;
  // Backend may serialize either snake_case (original builder) or camelCase
  // (newer builder); accept both so section names never come back blank.
  section_name?: string;
  sectionName?: string;
  sectionOrder: number;
  rows: StrategyRow[];
}

interface StrategySnapshotResponse {
  asOfDate: string;
  longTermAsOfDate?: string;
  aumAsOfDate?: string;
  subtitle?: string;
  currency?: string; // e.g. "USD"
  currencyLabel?: string; // e.g. "U.S. Dollar"
  feeBasis?: string; // e.g. "Gross of Fees"
  // Two-column disclosure footnote (left column, right column).
  disclosuresLeft?: string[];
  disclosuresRight?: string[];
  // Backend serializes `dataWarnings`; older payloads used `warnings`.
  dataWarnings?: string[];
  warnings?: string[];
  sections: StrategySection[];
}

interface GridRow extends StrategyRow {
  key: string;
  sectionName: string;
}

// =====================================================================
// Safe accessors + numeric coercion + formatters
// =====================================================================

const RED = "#cf1322";
const GRAY = "#666666";
const BLACK = "#1a1a1a";

// Section name works regardless of snake_case / camelCase serialization.
const sectionNameOf = (s: StrategySection): string =>
  s.section_name ?? s.sectionName ?? "";

// Coerce numbers or numeric strings; returns null for "N/A", "--", "", etc.
const toNum = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

// Return cell: red negatives, black positives. Non-numeric placeholders
// (e.g. "N/A", "--") pass through verbatim in gray.
const fmtReturn = (v?: Cell): React.ReactNode => {
  const n = toNum(v);
  if (n == null) {
    const text = typeof v === "string" && v.trim() ? v.trim() : "-";
    return <span style={{ color: GRAY }}>{text}</span>;
  }
  const color = n < 0 ? RED : BLACK;
  return <span style={{ color }}>{n.toFixed(2)}</span>;
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

// Date-only formatter that avoids the UTC-parse off-by-one (e.g. an ISO
// "2011-11-01" rendering as 10/31 in negative time zones).
const fmtDate = (v?: string | null): React.ReactNode => {
  if (!v) return "";
  const iso = String(v).slice(0, 10);
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Date(y, m - 1, d).toLocaleDateString("en-US");
};
const fmtLongTermHeader = (
  value?: string | null
): string => {
  if (!value) {
    return "As Of Prior Month End";
  }

  const iso = String(value).slice(0, 10);
  const [y, m, d] = iso.split("-").map(Number);

  if (!y || !m || !d) {
    return "As Of Prior Month End";
  }

  const dt = new Date(y, m - 1, d);

  return `As Of ${dt.toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  )}`;
};
// =====================================================================
// Component
// =====================================================================

export default function TCWStrategyPerformanceSnapshot() {
  const [data, setData] = useState<StrategySnapshotResponse | null>(null);
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
        buildDram2UrlNonAttribution("performance/tcw-strategy-performance-snapshot/")
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

  const rows = useMemo<GridRow[]>(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    const out: GridRow[] = [];
    data.sections
      .filter((s) => section === "all" || sectionNameOf(s) === section)
      .forEach((s) => {
        const name = sectionNameOf(s);
        const matched = s.rows.filter((r) =>
          [r.portfolioNumber, r.displayName].some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(term)
          )
        );
        if (!matched.length) return;
        out.push({
          key: `section-${s.key}`,
          rowType: "section",
          displayName: name,
          sectionName: name,
          returns: {},
        } as GridRow);
        matched.forEach((r) =>
          out.push({
            ...r,
            key: r.key,
            sectionName: name,
          })
        );
      });
    return out;
  }, [data, search, section]);

  // AntD onCell: record is the FIRST argument; index is optional/unused.
  const bandCell = (row: GridRow) =>
    row.rowType === "section" ? { colSpan: 0 } : {};

  const returnCol = (title: string, field: keyof StrategyReturnPeriods) => ({
    title,
    width: 78,
    align: "right" as const,
    onCell: bandCell,
    render: (_: unknown, row: GridRow) => fmtReturn(row.returns?.[field]),
  });

  // Total LEAF column count for the section band colSpan
  // (PF#, Strategy, PriorDay, MTD, QTD, YTD, 1Y, 3Y, 5Y, AUM, Inception = 11).
  const COLUMN_COUNT = 11;
  const longTermHeaderLabel = fmtLongTermHeader(
    data?.longTermAsOfDate
  );
  const columns: ColumnsType<GridRow> = [
    {
      title: "PF #",
      dataIndex: "portfolioNumber",
      width: 60,
      align: "center",
      onCell: (row) =>
        row.rowType === "section"
          ? { colSpan: COLUMN_COUNT, className: "section-band" }
          : {},
      // PF # shows on the FUND row only; benchmark rows leave it blank.
      render: (v: string, row) =>
        row.rowType === "section" ? (
          <span className="section-band-text">{row.displayName}</span>
        ) : row.rowType === "fund" ? (
          v ?? row.parentPortfolioNumber ?? ""
        ) : (
          ""
        ),
    },
    {
      title: "Strategy / Index",
      dataIndex: "displayName",
      width: 260,
      onCell: bandCell,
      render: (v: string) => <span style={{ color: BLACK }}>{v}</span>,
    },
    returnCol("Prior Day", "priorDay"),
    returnCol("MTD", "mtd"),
    returnCol("QTD", "qtd"),
    returnCol("YTD", "ytd"),
    {
      title: longTermHeaderLabel,
      className: "group-head",
      children: [
        returnCol("1 Year", "oneYear"),
        returnCol("3 Years", "threeYear"),
        returnCol("5 Years", "fiveYear"),
      ],
    },
    {
      title: (
        <>
          Portfolio AUM
          <br />
          ($ mil)
        </>
      ),
      dataIndex: "portfolioAumMillions",
      width: 100,
      align: "right",
      onCell: bandCell,
      render: (v: Cell) => fmtAum(v),
    },
    {
      title: (
        <>
          Inception
          <br />
          Date
        </>
      ),
      dataIndex: "inceptionDate",
      width: 100,
      align: "center",
      onCell: bandCell,
      render: (v: string) => <span style={{ color: GRAY }}>{fmtDate(v)}</span>,
    },
  ];

  const exp = async (kind: "excel" | "pdf") => {
    setExporting(kind);
    try {
      await downloadExport(
        buildDram2UrlNonAttribution(
          `performance/tcw-strategy-performance-snapshot/export/${kind}/` +
            `?as_of_date=${data?.asOfDate ?? ""}`
        ),
        `TCW_Strategy_Performance_Snapshot.${kind === "excel" ? "xlsx" : "pdf"}`
      );
      message.success(`${kind.toUpperCase()} export completed`);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting("");
    }
  };

  const currencyLabel = data?.currencyLabel ?? "U.S. Dollar";
  const feeBasis = data?.feeBasis ?? "Gross of Fees";

  // Two-column footnote, driven by the response.
  const disclosuresLeft = data?.disclosuresLeft?.length
    ? data.disclosuresLeft
    : [
        "All returns should be considered preliminary gross returns.",
        "Source: TCW Portfolio Analytics",
      ];
  const disclosuresRight = data?.disclosuresRight ?? [];

  // Backend serializes `dataWarnings`; tolerate the older `warnings` name too.
  const warnings = data?.dataWarnings ?? data?.warnings ?? [];

  const asOfLabel = formatDateOnly(
    data?.asOfDate,
    navigator.language
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
                TCW Strategy Performance Snapshot (non-Mutual Funds)
              </Title>
              <Text strong style={{ color: "#1f4e78" }}>
                {data?.subtitle ?? `All data in ${currencyLabel}, ${feeBasis}`}
              </Text>
            </div>
            {data && (
              <div className="snapshot-disclosure">
                <div className="asof">
                  AS OF {asOfLabel} &nbsp;|&nbsp; ESTIMATES ONLY &ndash; FOR
                  INTERNAL USE ONLY
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
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
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
        {warnings.length ? (
          <Alert
            type="warning"
            showIcon
            closable
            style={{ marginBottom: 12 }}
            className="snapshot-no-print"
            message={`${warnings.length} data-quality warning(s)`}
            description={
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            }
          />
        ) : null}
        <Space className="snapshot-no-print" style={{ marginBottom: 16 }}>
          <Input.Search
            allowClear
            placeholder="Search strategy or PF #"
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
          />
          <Select
            value={section}
            style={{ width: 240 }}
            onChange={setSection}
            options={[
              { label: "All sections", value: "all" },
              ...(data?.sections.map((s) => {
                const name = sectionNameOf(s);
                return { label: name, value: name };
              }) ?? []),
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
              scroll={{ x: 1300 }}
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
        {/* Two-column, data-driven disclosure footnote */}
        <div className="snapshot-footnote">
          <div className="footnote-col">
            {disclosuresLeft.map((line, i) => (
              <div key={`l-${i}`}>{line}</div>
            ))}
          </div>
          <div className="footnote-col">
            {disclosuresRight.map((line, i) => (
              <div key={`r-${i}`}>{line}</div>
            ))}
          </div>
        </div>
      </Card>
      <style>{`
        .snapshot-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }
        .snapshot-disclosure { text-align: right; }
        .snapshot-disclosure .asof {
          color: ${GRAY}; font-size: 12px; font-weight: 700;
        }
        .snapshot-table .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #17365d !important;
          font-weight: 700;
          font-size: 11px;
          text-align: center;
          border-bottom: 2px solid #17365d;
          white-space: normal;
        }
        /* Only the leaf header row carries the top rule; group head sits above */
        .snapshot-table .ant-table-thead > tr:last-child > th {
          border-top: 2px solid #17365d;
        }
        .snapshot-table .group-head {
          border-bottom: 1px solid #17365d !important;
        }
        .snapshot-table .ant-table-tbody > tr > td {
          font-size: 11px;
          border-bottom: 1px solid #ececec;
        }
        /* Section band: shaded + LEFT-aligned (overrides PF# column center) */
        .snapshot-table td.section-band {
          background: #dce6f1 !important;
          text-align: left !important;
        }
        .section-band-text { color: #17365d; font-weight: 700; }
        .section-row td { background: #dce6f1 !important; }
        .benchmark-row td { background: #fafafa !important; }
        /* Two-column footnote */
        .snapshot-footnote {
          display: flex;
          gap: 40px;
          margin-top: 12px;
          padding-top: 6px;
          border-top: 1px solid #17365d;
          font-size: 10px;
          color: ${GRAY};
          line-height: 1.5;
        }
        .snapshot-footnote .footnote-col { flex: 1; }
        @media print {
          .snapshot-no-print { display: none !important; }
          .ant-table-content { overflow: visible !important; }
          @page { size: legal landscape; margin: .25in; }
        }
      `}</style>
    </div>
  );
}
