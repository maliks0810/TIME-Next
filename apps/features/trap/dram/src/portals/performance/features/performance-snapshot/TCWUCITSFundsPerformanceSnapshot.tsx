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
  parentPfNumber?: string;
  benchmarkCode?: string;
  benchmarkName?: string;
  rowOrder?: number;
  snapshotSection?: string;
  fundName: string;
  isin?: string;
  shareClassSuffix?: string;
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
  shareClassSuffix?: string;
  pfNumber?: string;
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

const fmtReturn = (v?: Num): React.ReactNode => {
  const n = toNum(v);
  if (n == null) return <span style={{ color: GRAY }}>-</span>;
  // Golden report: red negatives / black positives for BOTH fund and index rows.
  const color = n < 0 ? RED : BLACK;
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

// Date-only formatter that avoids the UTC parse off-by-one.
const fmtRefDate = (v?: string): string => {
  if (!v) return "";
  const iso = String(v).slice(0, 10);
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Date(y, m - 1, d).toLocaleDateString("en-US");
};

const getShareClassSuffix = (
  row: Pick<UcitsRow, "shareClassSuffix" | "fundName">
): string => {
  const suppliedSuffix = row.shareClassSuffix?.trim().toUpperCase();
  if (suppliedSuffix) return suppliedSuffix;

  const match = row.fundName?.trim().match(/\b(AEHE|IEHE|IU|I)$/i);
  return match?.[1]?.toUpperCase() ?? "";
};

interface Props {
  embedded?: boolean;
  allowStandaloneExport?: boolean;
  currency?: "USD" | "EUR";
}

function normalizeUcitsResponse(
  response: UcitsSnapshotResponse,
  requestedCurrency: "USD" | "EUR"
): UcitsSnapshotViewModel {
  const grouped = new Map<string, NormalizedUcitsRow[]>();
  for (const [index, source] of (response.rows ?? []).entries()) {
    const sectionName = source.snapshotSection?.trim() || "Unclassified";
    // ISIN is the reliable fallback for legacy payloads that mark
    // benchmark rows as funds.
    const isFund =
      source.rowType === "benchmark" ? false : Boolean(source.isin?.trim());

    const normalizedRow: NormalizedUcitsRow = {
      ...source,
      id:
        source.id ??
        `${requestedCurrency}-${source.pfNumber ?? "row"}-${source.isin ?? index}`,
      rowType: isFund ? "fund" : "benchmark",
      parentPfNumber: !isFund
        ? source.parentPfNumber ?? source.pfNumber
        : source.parentPfNumber,
      shareClassSuffix: isFund ? getShareClassSuffix(source) : undefined,
      priorDay: source.priorDayReturn,
      mtd: source.mtdReturn,
      qtd: source.qtdReturn,
      ytd: source.ytdReturn,
      oneYear: source.oneYearReturn,
      threeYear: source.threeYearReturn,
      fiveYear: source.fiveYearReturn,
      morningstarRating: source.morningstarOverallRating,
    };
    const existingRows = grouped.get(sectionName) ?? [];
    existingRows.push(normalizedRow);
    grouped.set(sectionName, existingRows);
  }

  const sections: UcitsSection[] = Array.from(
    grouped.entries(),
    ([sectionName, rows]) => ({ sectionName, rows })
  );

  // Keep each EUR share class independently while excluding index rows.
  const seen = new Set<string>();
  const references: FundReference[] = [];
  for (const row of response.rows ?? []) {
    const isFund =
      row.rowType === "benchmark" ? false : Boolean(row.isin?.trim());
    if (!isFund) continue;

    const name = row.fundName?.trim();
    if (!name) continue;

    const suffix = getShareClassSuffix(row);
    const identity = [row.pfNumber ?? "", row.isin ?? "", suffix, name].join("|");
    if (seen.has(identity)) continue;

    seen.add(identity);
    references.push({
      fundName: name,
      morningstarCategory: row.morningstarCategory,
      inceptionDate: row.inceptionDate,
      shareClassSuffix: suffix,
      pfNumber: row.pfNumber,
    });
  }

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
  const [data, setData] = useState<UcitsSnapshotViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [exporting, setExporting] = useState<"" | "excel" | "pdf">("");

  const currencyLabel = currency === "EUR" ? "Euros" : "U.S. Dollar";

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ currency });
      const url = buildDram2UrlNonAttribution(
        `performance/tcw-ucits-funds-performance-snapshot/?${query.toString()}`
      );
      const response = await fetch(url);
      if (!response.ok) {
        let msg = `Failed to load UCITS ${currency}`;
        try {
          const body = (await response.json()) as { detail?: string };
          msg = body.detail ?? msg;
        } catch {
          // Keep the default error message.
        }
        throw new Error(msg);
      }
      const apiData = (await response.json()) as UcitsSnapshotResponse;
      setData(normalizeUcitsResponse(apiData, currency));
    } catch (loadError) {
      setData(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : `Failed to load UCITS ${currency}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [currency]);

  const rows = useMemo<GridRow[]>(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    const output: GridRow[] = [];

    data.sections
      .filter((item) => section === "all" || item.sectionName === section)
      .forEach((item) => {
        // First, find which FUNDS match the search (by pf/name/isin/category).
        const fundMatches = (row: NormalizedUcitsRow) =>
          [row.pfNumber, row.fundName, row.isin, row.morningstarCategory].some(
            (value) => String(value ?? "").toLowerCase().includes(term)
          );

        const matchedFundPfs = new Set(
          item.rows
            .filter((r) => r.rowType === "fund" && (term === "" || fundMatches(r)))
            .map((r) => r.pfNumber ?? "")
        );

        // Keep a row if: it's a matching fund, OR it's a benchmark whose parent
        // fund matched (so indices always travel with their fund), OR (no term)
        // a benchmark that itself matched.
        const matchedRows = item.rows.filter((row) => {
          if (row.rowType === "fund") {
            return term === "" || fundMatches(row);
          }
          // benchmark
          const parentMatched =
            row.parentPfNumber != null &&
            matchedFundPfs.has(row.parentPfNumber);
          return term === "" || parentMatched || fundMatches(row);
        });

        if (matchedRows.length === 0) return;

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

  // EUR matches the report: AEHE on the left and IEHE on the right.
  // Other currencies retain a balanced two-column layout.
  const referenceColumns = useMemo<[FundReference[], FundReference[]]>(() => {
    const refs = data?.references ?? [];

    if (data?.currencyCode === "EUR") {
      const aehe: FundReference[] = [];
      const iehe: FundReference[] = [];
      const other: FundReference[] = [];

      refs.forEach((ref) => {
        const suffix = ref.shareClassSuffix?.toUpperCase() ?? "";
        if (suffix === "AEHE") aehe.push(ref);
        else if (suffix === "IEHE") iehe.push(ref);
        else other.push(ref);
      });

      return [[...aehe, ...other], iehe];
    }

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
    { key: "priorDay", pct: "priorDayPercentile", title: "Prior Day" },
    { key: "mtd", pct: "mtdPercentile", title: "MTD" },
    { key: "qtd", pct: "qtdPercentile", title: "QTD" },
    { key: "ytd", pct: "ytdPercentile", title: "YTD" },
    { key: "oneYear", pct: "oneYearPercentile", title: "1 Year" },
    { key: "threeYear", pct: "threeYearPercentile", title: "3 Years" },
    { key: "fiveYear", pct: "fiveYearPercentile", title: "5 Years" },
  ];

  const repeatedFundPfNumbers = useMemo(() => {
    const repeatedKeys = new Set<string>();
    let previousSection = "";
    let previousFundPf = "";

    rows.forEach((row) => {
      if (row.rowType === "section") {
        previousSection = row.sectionName;
        previousFundPf = "";
        return;
      }
      if (row.rowType !== "fund") return;

      const currentPf = row.pfNumber ?? "";
      if (
        row.sectionName === previousSection &&
        currentPf !== "" &&
        currentPf === previousFundPf
      ) {
        repeatedKeys.add(row.key);
      }

      previousSection = row.sectionName;
      previousFundPf = currentPf;
    });

    return repeatedKeys;
  }, [rows]);

  const columns: ColumnsType<GridRow> = [
    {
      title: "PF #",
      dataIndex: "pfNumber",
      width: 60,
      align: "center",
      onCell: (row) =>
        row.rowType === "section"
          ? { colSpan: 19, className: "section-band" }
          : {},
      // PF # shows on the FUND row only; benchmark rows leave it blank.
      render: (v: string, row) => {
        if (row.rowType === "section") {
          return <span className="section-band-text">{row.fundName}</span>;
        }
        if (row.rowType !== "fund") return "";

        return (
          <Text strong>
            {repeatedFundPfNumbers.has(row.key) ? "--" : v}
          </Text>
        );
      },
    },
    {
      title: "Fund / Index",
      dataIndex: "fundName",
      width: 260,
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
      // ISIN shows on fund rows only (benchmarks have none in the golden report).
      render: (v: string, row) =>
        row.rowType === "fund" ? (
          <span style={{ color: GRAY }}>{v}</span>
        ) : (
          ""
        ),
    },
    ...perfPairs.flatMap((pair): ColumnsType<GridRow> => [
      {
        title: pair.title,
        dataIndex: pair.key,
        key: pair.key,
        width: 76,
        align: "right",
        onCell: bandCell,
        render: (value: Num) => fmtReturn(value),
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
    ]),
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
      // AUM shows on fund rows only.
      render: (v: Num, row) => (row.rowType === "fund" ? fmtAum(v) : ""),
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
      render: (v: Num, row) =>
        row.rowType === "fund" ? fmtRating(v, isBench(row)) : "",
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
        `performance/tcw-ucits-funds-performance-snapshot/export/${kind}/?${query.toString()}`
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
    navigator.language
  ).toUpperCase();
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
                TCW UCITS Funds Performance Snapshot
              </Title>
              <Text strong style={{ color: "#1f4e78" }}>
                All data in {currencyLabel}, Net of Fees
              </Text>
            </div>
            {data && (
              <div className="snapshot-disclosure">
                <div className="asof">
                  AS OF {asOfLabel} &nbsp;|&nbsp; ESTIMATES ONLY &ndash; FOR
                  INTERNAL USE ONLY
                </div>
                <div className="prior">PRIOR SOURCE DATE: {priorLabel}</div>
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
        {/* Fund reference footer: AEHE left and IEHE right for EUR */}
        {data?.references?.length ? (
          <div className="reference-block">
            {referenceColumns.map((columnReferences, columnIndex) => (
              <table className="reference-table" key={columnIndex}>
                <colgroup>
                  <col className="ref-name-column" />
                  <col className="ref-category-column" />
                  <col className="ref-date-column" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="ref-name">TCW UCITS Fund</th>
                    <th className="ref-cat">Morningstar Category</th>
                    <th className="ref-date">Inception Date</th>
                  </tr>
                </thead>
                <tbody>
                  {columnReferences.map((ref) => {
                    const key = [
                      ref.pfNumber ?? "",
                      ref.shareClassSuffix ?? "",
                      ref.fundName,
                    ].join("-");

                    return (
                      <tr key={key}>
                        <td className="ref-name" title={ref.fundName}>
                          {ref.fundName}
                        </td>
                        <td
                          className="ref-cat"
                          title={ref.morningstarCategory ?? ""}
                        >
                          {ref.morningstarCategory ?? ""}
                        </td>
                        <td className="ref-date">
                          {fmtRefDate(ref.inceptionDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ))}
          </div>
        ) : null}
        <div className="snapshot-footnote">
          Morningstar Ratings: Within Morningstar Category, the top 10% of funds
          receive 5 stars and the bottom 10% receive 1 star. Funds are rated for
          up to three time periods, three-, five-, and 10-years and these
          ratings are combined to produce an overall rating. Quartile rankings
          based on Fund&rsquo;s assigned Morningstar category. &nbsp;|&nbsp;
          Source: Morningstar, TCW Portfolio Analytics
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
          font-style: italic;
        }
        /* Reference footer */
        .reference-block {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          align-items: start;
          column-gap: 64px;
          margin-top: 48px;
          width: 100%;
        }
        .reference-table {
          width: 100%;
          min-width: 0;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 11px;
        }
        .reference-table .ref-name-column { width: 36%; }
        .reference-table .ref-category-column { width: 46%; }
        .reference-table .ref-date-column { width: 18%; }
        .reference-table th {
          height: 24px;
          padding: 2px 6px 4px;
          color: #17365d;
          font-weight: 700;
          line-height: 1.2;
          text-align: left;
          border-bottom: 1px solid #17365d;
          white-space: nowrap;
        }
        .reference-table td {
          height: 20px;
          padding: 1px 6px;
          color: #1a1a1a;
          line-height: 1.3;
          vertical-align: middle;
          border-bottom: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .reference-table td.ref-cat,
        .reference-table th.ref-cat { color: #1f4e78; }
        .reference-table td.ref-date,
        .reference-table th.ref-date {
          text-align: right;
          white-space: nowrap;
        }
        .snapshot-footnote {
          margin-top: 24px;
          min-height: 30px;
          padding-top: 6px;
          border-top: 1px solid #17365d;
          font-size: 10px;
          color: ${GRAY};
          line-height: 1.5;
          white-space: normal;
        }
        @media print {
          .snapshot-no-print { display: none !important; }
          .ant-table-content { overflow: visible !important; }
          .reference-block {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            column-gap: 48px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .reference-table,
          .snapshot-footnote {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .reference-table td {
            overflow: visible;
            text-overflow: clip;
          }
          @page { size: legal landscape; margin: .25in; }
        }
      `}</style>
    </div>
  );
}
