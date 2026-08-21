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

// Numeric fields may arrive as JSON strings (Snowflake NUMBER/Decimal),
// so `toNum` coerces before any .toFixed(...) call.
type Num = number | string | null | undefined;

type RowKind = "fund" | "benchmark" | "section";
type ApiRowKind = Exclude<RowKind, "section">;

interface UcitsRow {
  id?: string;
  rowType?: ApiRowKind;
  pfNumber?: string;
  snapshotSection?: string;
  fundName: string;
  isin?: string;
  inceptionDate?: string;

  priorDayReturn?: Num;
  priorDayPercentile?: Num;
  mtdReturn?: Num;
  mtdPercentile?: Num;
  qtdReturn?: Num;
  qtdPercentile?: Num;
  ytdReturn?: Num;
  ytdPercentile?: Num;
  oneYearReturn?: Num;
  oneYearPercentile?: Num;
  threeYearReturn?: Num;
  threeYearPercentile?: Num;
  fiveYearReturn?: Num;
  fiveYearPercentile?: Num;

  fundAumMillions?: Num;
  morningstarOverallRating?: Num;
  morningstarCategory?: string;
  dataWarning?: string;
}
interface UcitsSnapshotResponse {
  asOfDate: string;
  previousAvailableDate?: string;
  currencyCode?: "USD" | "EUR";
  subtitle?: string;
  warnings?: string[];
  rows?: UcitsRow[];
  generatedAt?: string;
}

interface NormalizedUcitsRow extends Omit<UcitsRow, "id" | "rowType"> {
  id: string;
  rowType: RowKind;

  priorDay?: Num;
  mtd?: Num;
  qtd?: Num;
  ytd?: Num;
  oneYear?: Num;
  threeYear?: Num;
  fiveYear?: Num;

  morningstarRating?: Num;
}

interface UcitsSection {
  sectionName: string;
  rows: NormalizedUcitsRow[];
}

interface FundReference {
  fundName: string;
  morningstarCategory?: string;
  inceptionDate?: string;
}

interface UcitsSnapshotViewModel {
  asOfDate: string;
  priorDate?: string;
  currencyCode: "USD" | "EUR";
  warnings: string[];
  sections: UcitsSection[];
  references: FundReference[];
  generatedAt?: string;
}

interface GridRow extends NormalizedUcitsRow {
  key: string;
  sectionName: string;
}

// =====================================================================
// Safe numeric coercion + value formatters / colorers
// =====================================================================
const RED = "#cf1322";
const GREEN = "#1e7d32";
const GRAY = "#666666";
const BLACK = "#1a1a1a";
const GOLD = "#c69214";

const toNum = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const fmtReturn = (v?: Num, benchmark = false): React.ReactNode => {
  const n = toNum(v);
  if (n == null) return <span style={{ color: GRAY }}>-</span>;
  const color = benchmark ? GRAY : n < 0 ? RED : BLACK;
  return <span style={{ color }}>{n.toFixed(2)}</span>;
};

const fmtPercentile = (v?: Num, benchmark = false): React.ReactNode => {
  const n = toNum(v);
  if (n == null) return <span style={{ color: GRAY }} />;
  const color = benchmark ? GRAY : n <= 25 ? GREEN : n >= 75 ? RED : GRAY;
  return <span style={{ color }}>{n}</span>;
};

const fmtAum = (v?: Num): React.ReactNode => {
  const n = toNum(v);
  return n == null
    ? ""
    : n.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
};

const fmtRating = (v?: Num, benchmark = false): React.ReactNode => {
  const raw = toNum(v);
  const n = raw == null ? 0 : Math.min(Math.max(Math.round(raw), 0), 5);
  if (n <= 0) return null;
  return (
    <span style={{ color: benchmark ? GRAY : GOLD, letterSpacing: 1 }}>
      {"\u2605".repeat(n)}
    </span>
  );
};
interface Props {
  embedded?: boolean;
  allowStandaloneExport?: boolean;
  currency?: "USD" | "EUR";
}

function normalizeUcitsResponse(
  response: UcitsSnapshotResponse,
  requestedCurrency: "USD" | "EUR",
): UcitsSnapshotViewModel {
  const grouped = new Map<string, NormalizedUcitsRow[]>();

  for (const [index, source] of (response.rows ?? []).entries()) {
    const sectionName =
      source.snapshotSection?.trim() || "Unclassified";

    const normalizedRow: NormalizedUcitsRow = {
      ...source,

      id:
        source.id ??
        `${requestedCurrency}-${source.pfNumber ?? "row"}-${source.isin ?? index}`,

      rowType: source.rowType ?? "fund",

      priorDay: source.priorDayReturn,
      mtd: source.mtdReturn,
      qtd: source.qtdReturn,
      ytd: source.ytdReturn,
      oneYear: source.oneYearReturn,
      threeYear: source.threeYearReturn,
      fiveYear: source.fiveYearReturn,

      morningstarRating:
        source.morningstarOverallRating,
    };

    const existingRows = grouped.get(sectionName) ?? [];
    existingRows.push(normalizedRow);
    grouped.set(sectionName, existingRows);
  }

  const sections: UcitsSection[] = Array.from(
    grouped.entries(),
    ([sectionName, rows]) => ({
      sectionName,
      rows,
    }),
  );

  const references: FundReference[] = (response.rows ?? []).map(
    (row) => ({
      fundName: row.fundName,
      morningstarCategory: row.morningstarCategory,
      inceptionDate: row.inceptionDate,
    }),
  );

  return {
    asOfDate: response.asOfDate,
    priorDate: response.previousAvailableDate,
    currencyCode: response.currencyCode ?? requestedCurrency,
    warnings: response.warnings ?? [],
    sections,
    references,
  };
}
// =====================================================================
// Component
// =====================================================================
export default function TCWUCITSFundsPerformanceSnapshot({
  currency = "USD",
}: Props) {
const [data, setData] =
  useState<UcitsSnapshotViewModel | null>(null);

const [error, setError] =
  useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [exporting, setExporting] = useState<"" | "excel" | "pdf">("");

  const currencyLabel =
  currency === "EUR"
    ? "Euros"
    : "U.S. Dollar";


const load = async (): Promise<void> => {
  setLoading(true);
  setError(null);

  try {
    const query = new URLSearchParams({
      currency,
    });

    const url = buildDram2UrlNonAttribution(
      `performance/tcw-ucits-funds-performance-snapshot/?${query.toString()}`,
    );

    const response = await fetch(url);

    if (!response.ok) {
      let message = `Failed to load UCITS ${currency}`;

      try {
        const body = (await response.json()) as {
          detail?: string;
        };

        message = body.detail ?? message;
      } catch {
        // Keep the default error message.
      }

      throw new Error(message);
    }

    const apiData =
      (await response.json()) as UcitsSnapshotResponse;

    const viewModel = normalizeUcitsResponse(
      apiData,
      currency,
    );

    setData(viewModel);
  } catch (loadError) {
    setData(null);
    setError(
      loadError instanceof Error
        ? loadError.message
        : `Failed to load UCITS ${currency}`,
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  void load();
}, [currency]);

const rows = useMemo<GridRow[]>(() => {
  if (!data) {
    return [];
  }

  const term = search.trim().toLowerCase();
  const output: GridRow[] = [];

  data.sections
    .filter(
      (item) =>
        section === "all" ||
        item.sectionName === section,
    )
    .forEach((item) => {
      const matchedRows = item.rows.filter((row) =>
        [
          row.pfNumber,
          row.fundName,
          row.isin,
          row.morningstarCategory,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(term),
        ),
      );

      if (matchedRows.length === 0) {
        return;
      }

      output.push({
        id: `${currency}-section-${item.sectionName}`,
        key: `${currency}-section-${item.sectionName}`,
        rowType: "section",
        fundName: item.sectionName,
        sectionName: item.sectionName,
      });

      matchedRows.forEach((row, index) => {
        output.push({
          ...row,
          key:
            `${currency}-${item.sectionName}-` +
            `${row.id ?? row.pfNumber ?? index}`,
          sectionName: item.sectionName,
        });
      });
    });

  return output;
}, [currency, data, search, section]);

  // Split references into two balanced columns for the footer.
  const referenceColumns = useMemo(() => {
    const refs = data?.references ?? [];
    const mid = Math.ceil(refs.length / 2);
    return [refs.slice(0, mid), refs.slice(mid)];
  }, [data]);

  // AntD onCell: record is the FIRST argument; index is optional/unused.
  const bandCell = (row: GridRow) =>
    row.rowType === "section" ? { colSpan: 0 } : {};

  const isBench = (row: GridRow) => row.rowType === "benchmark";

type PerformanceValueKey =
  | "priorDay"
  | "mtd"
  | "qtd"
  | "ytd"
  | "oneYear"
  | "threeYear"
  | "fiveYear";

type PerformancePercentileKey =
  | "priorDayPercentile"
  | "mtdPercentile"
  | "qtdPercentile"
  | "ytdPercentile"
  | "oneYearPercentile"
  | "threeYearPercentile"
  | "fiveYearPercentile";

const perfPairs: Array<{
  key: PerformanceValueKey;
  pct: PerformancePercentileKey;
  title: string;
}> = [
  {
    key: "priorDay",
    pct: "priorDayPercentile",
    title: "Prior Day",
  },
  {
    key: "mtd",
    pct: "mtdPercentile",
    title: "MTD",
  },
  {
    key: "qtd",
    pct: "qtdPercentile",
    title: "QTD",
  },
  {
    key: "ytd",
    pct: "ytdPercentile",
    title: "YTD",
  },
  {
    key: "oneYear",
    pct: "oneYearPercentile",
    title: "1 Year",
  },
  {
    key: "threeYear",
    pct: "threeYearPercentile",
    title: "3 Years",
  },
  {
    key: "fiveYear",
    pct: "fiveYearPercentile",
    title: "5 Years",
  },
];

  const columns: ColumnsType<GridRow> = [
    {
      title: "PF #",
      dataIndex: "pfNumber",
      width: 60,
      fixed: "left",
      align: "center",
      onCell: (row) =>
        row.rowType === "section"
          ? { colSpan: 19, className: "section-band" }
          : {},
      render: (v: string, row) =>
        row.rowType === "section" ? (
          <span className="section-band-text">{row.fundName}</span>
        ) : (
          <Text strong={row.rowType === "fund"}>{v}</Text>
        ),
    },
    {
      title: "Fund / Index",
      dataIndex: "fundName",
      width: 260,
      fixed: "left",
      onCell: bandCell,
      render: (v: string, row) => (
        <Text
          strong={row.rowType === "fund"}
          italic={row.rowType === "benchmark"}
          style={{ color: row.rowType === "benchmark" ? GRAY : BLACK }}
        >
          {v}
        </Text>
      ),
    },
    {
      title: "ISIN",
      dataIndex: "isin",
      width: 120,
      align: "center",
      onCell: bandCell,
      render: (v: string) => <span style={{ color: GRAY }}>{v}</span>,
    },
    ...perfPairs.flatMap(
  (pair): ColumnsType<GridRow> => [
    {
      title: pair.title,
      dataIndex: pair.key,
      key: pair.key,
      width: 76,
      align: "right",
      onCell: bandCell,
      render: (value: Num, row: GridRow) =>
        fmtReturn(value, isBench(row)),
    },
    {
      title: "Percentile",
      dataIndex: pair.pct,
      key: pair.pct,
      width: 80,
      align: "center",
      onCell: bandCell,
      render: (value: Num, row: GridRow) =>
        fmtPercentile(value, isBench(row)),
    },
  ],
),
    {
      title: (
        <>
          Fund AUM
          <br />
          ($ mil)
        </>
      ),
      dataIndex: "fundAumMillions",
      width: 90,
      align: "right",
      onCell: bandCell,
      render: (v: Num) => fmtAum(v),
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
      width: 110,
      align: "center",
      onCell: bandCell,
      render: (v: Num, row) => fmtRating(v, isBench(row)),
    },
  ];

  const exp = async (kind: "excel" | "pdf") => {
    setExporting(kind);
    try {
      const query = new URLSearchParams({
        currency,
        as_of_date: data?.asOfDate ?? "",
      });

      const exportUrl = buildDram2UrlNonAttribution(
        `performance/tcw-ucits-funds-performance-snapshot/${kind}/?${query.toString()}`
      );
      await downloadExport(
        exportUrl,
        `TCW_UCITS_Funds_Performance_Snapshot.${
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
).toUpperCase();

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
                TCW UCITS Funds Performance Snapshot
              </Title>
              <Text strong style={{ color: "#1f4e78" }}>
                All data in {currencyLabel}, Net of Fees
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
            placeholder="Search fund, ISIN, PF or category"
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
              scroll={{ x: 1700 }}
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

        {/* Fund reference footer: category + inception date, two columns */}
        {data?.references?.length ? (
          <div className="reference-block">
            {referenceColumns.map((col, colIndex) => (
              <table className="reference-table" key={colIndex}>
                <thead>
                  <tr>
                    <th className="ref-name">TCW UCITS Fund</th>
                    <th className="ref-cat">Morningstar Category</th>
                    <th className="ref-date">Inception Date</th>
                  </tr>
                </thead>
                <tbody>
                  {col.map((ref, i) => (
                    <tr key={i}>
                      <td className="ref-name">{ref.fundName}</td>
                      <td className="ref-cat">
                        {ref.morningstarCategory ?? ""}
                      </td>
                      <td className="ref-date">
                        {ref.inceptionDate
                          ? new Date(ref.inceptionDate).toLocaleDateString(
                              "en-US"
                            )
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        ) : null}

        <div className="snapshot-footnote">
          Morningstar Ratings: Within Morningstar Category, the top 10% of
          funds receive 5 stars and the bottom 10% receive 1 star. Funds are
          rated for up to three time periods, three-, five-, and 10-years and
          these ratings are combined to produce an overall rating. Quartile
          rankings based on Fund&rsquo;s assigned Morningstar category.
          &nbsp;|&nbsp; Source: Morningstar, TCW Portfolio Analytics
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
        .snapshot-disclosure .prior {
          color: ${GRAY}; font-size: 11px; font-style: italic;
          margin-top: 2px;
        }
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
        /* Section band: shaded + LEFT-aligned (overrides PF# column center) */
        .snapshot-table td.section-band {
          background: #dce6f1 !important;
          text-align: left !important;
        }
        .section-band-text { color: #17365d; font-weight: 700; }
        .section-row td { background: #dce6f1 !important; }
        .benchmark-row td {
          background: #fafafa !important;
          color: ${GRAY};
          font-style: italic;
        }

        /* Reference footer */
        .reference-block {
          display: flex;
          gap: 32px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .reference-table {
          flex: 1 1 45%;
          border-collapse: collapse;
          font-size: 10px;
          min-width: 320px;
        }
        .reference-table th {
          color: #17365d;
          font-weight: 700;
          text-align: left;
          padding: 3px 6px;
          border-bottom: 1px solid #17365d;
        }
        .reference-table td {
          padding: 2px 6px;
          color: #1a1a1a;
          border-bottom: 1px solid #f0f0f0;
        }
        .reference-table td.ref-cat,
        .reference-table th.ref-cat { color: #1f4e78; }
        .reference-table td.ref-date,
        .reference-table th.ref-date {
          text-align: right; white-space: nowrap;
        }

        .snapshot-footnote {
          margin-top: 16px;
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
