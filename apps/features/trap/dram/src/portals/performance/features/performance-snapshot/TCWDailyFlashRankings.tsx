import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
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

// Numeric fields may arrive as JSON strings (Snowflake NUMBER/Decimal) or as
// literal "N/A" / "--" placeholders, so values are typed loosely and coerced.
type Cell = number | string | null | undefined;

interface FlashRow {
  id: string;
  pfNumber?: string;
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
  morningstarCategory?: string;
  fundAumMillions?: Cell;
  morningstarRating?: Cell;
  dataWarning?: string;
}

interface FlashSnapshotResponse {
  asOfDate: string;
  title: string;
  subtitle: string;
  disclosures?: string[];
  warnings: string[];
  rows: FlashRow[];
}

// =====================================================================
// Safe numeric coercion + formatters
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

const fmtReturn = (v?: Cell): React.ReactNode => {
  const n = toNum(v);
  if (n == null) {
    const text = typeof v === "string" && v.trim() ? v.trim() : "-";
    return <span style={{ color: GRAY }}>{text}</span>;
  }
  return <span style={{ color: n < 0 ? RED : BLACK }}>{n.toFixed(2)}</span>;
};

const fmtPercentile = (v?: Cell): React.ReactNode => {
  const n = toNum(v);
  if (n == null) return <span style={{ color: GRAY }} />;
  const color = n <= 25 ? GREEN : n >= 75 ? RED : GRAY;
  return <span style={{ color }}>{n}</span>;
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

const fmtRating = (v?: Cell): React.ReactNode => {
  const raw = toNum(v);
  const n = raw == null ? 0 : Math.min(Math.max(Math.round(raw), 0), 5);
  if (n <= 0) return null;
  return (
    <span style={{ color: GOLD, letterSpacing: 1 }}>
      {"\u2605".repeat(n)}
    </span>
  );
};

// =====================================================================
// Component
// =====================================================================
export default function TCWDailyFlashRankings() {
  const [data, setData] = useState<FlashSnapshotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState<"" | "excel" | "pdf">("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(
        buildDram2UrlNonAttribution("performance/tcw-daily-flash-rankings/")
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

  const rows = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data.rows
      .filter((r) =>
        [r.pfNumber, r.fundName, r.ticker, r.morningstarCategory].some((v) =>
          String(v ?? "").toLowerCase().includes(term)
        )
      )
      .map((r) => ({ ...r, key: r.id }));
  }, [data, search]);

  const returnCol = (title: string, key: keyof FlashRow) => ({
    title,
    dataIndex: key as string,
    width: 76,
    align: "right" as const,
    render: (v: Cell) => fmtReturn(v),
  });

  const pctCol = (key: keyof FlashRow) => ({
    title: "Percentile",
    dataIndex: key as string,
    width: 80,
    align: "center" as const,
    render: (v: Cell) => fmtPercentile(v),
  });

  const columns: ColumnsType<FlashRow & { key: string }> = [
    {
      title: "PF #",
      dataIndex: "pfNumber",
      width: 60,
      fixed: "left",
      align: "center",
    },
    {
      title: "Fund Name",
      dataIndex: "fundName",
      width: 240,
      fixed: "left",
      render: (v: string) => <Text strong>{v}</Text>,
    },
    { title: "Ticker", dataIndex: "ticker", width: 80, align: "center" },
    returnCol("Prior Day", "priorDay"),
    pctCol("priorDayPercentile"),
    returnCol("MTD", "mtd"),
    pctCol("mtdPercentile"),
    returnCol("QTD", "qtd"),
    pctCol("qtdPercentile"),
    returnCol("YTD", "ytd"),
    pctCol("ytdPercentile"),
    {
      title: "Morningstar Category",
      dataIndex: "morningstarCategory",
      width: 220,
    },
    {
      title: (
        <>
          Fund
          <br />
          AUM ($ mil)
        </>
      ),
      dataIndex: "fundAumMillions",
      width: 100,
      align: "right",
      render: (v: Cell) => fmtAum(v),
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
      render: (v: Cell) => fmtRating(v),
    },
  ];

  const exp = async (kind: "excel" | "pdf") => {
    setExporting(kind);
    try {
      await downloadExport(
        buildDram2UrlNonAttribution(`performance/tcw-daily-flash-rankings/export/${kind}/` +
          `?as_of_date=${data?.asOfDate ?? ""}`),
        `TCW_Daily_Flash_Rankings.${kind === "excel" ? "xlsx" : "pdf"}`
      );
      message.success(`${kind.toUpperCase()} export completed`);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting("");
    }
  };


const asOfLabel = formatDateOnly(
  data?.asOfDate,
  navigator.language,
).toUpperCase();

  const disclosures = data?.disclosures ?? [];

  return (
    <div className="snapshot-print-container" style={{ padding: 20 }}>
      <Card
        bordered={false}
        className="snapshot-card"
        title={
          <div className="snapshot-header">
            <div>
              <Title level={3} style={{ margin: 0, color: "#17365d" }}>
                {data?.title ??
                  "Daily Flash Rankings \u2013 Top 10 Funds By Fund Size"}
              </Title>
              <Text
                strong
                style={{
                  color: "#1f4e78",
                  fontSize: 11,
                  letterSpacing: 0.3,
                }}
              >
                {data?.subtitle ??
                  "TCW FUNDS PERFORMANCE SNAPSHOT  |  ALL DATA IN U.S. " +
                    "DOLLAR, NET OF FEES"}
              </Text>
            </div>
            {data && (
              <div className="snapshot-disclosure">
                <div className="asof">
                  AS OF {asOfLabel} &nbsp;|&nbsp; ESTIMATES ONLY &ndash;
                  FOR INTERNAL USE ONLY
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
            style={{ width: 340 }}
          />
        </Space>

        <Spin spinning={loading}>
          {rows.length ? (
            <Table<FlashRow & { key: string }>
              className="snapshot-table"
              size="small"
              rowKey="key"
              columns={columns}
              dataSource={rows}
              pagination={false}
              scroll={{ x: 1500 }}
            />
          ) : (
            !loading && <Empty />
          )}
        </Spin>

        {disclosures.length ? (
          <div className="snapshot-footnote">
            {disclosures.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        ) : null}
      </Card>

      <style>{`
        .snapshot-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }
        .snapshot-disclosure { text-align: right; padding-top: 4px; }
        .snapshot-disclosure .asof {
          color: ${GRAY}; font-size: 12px; font-weight: 700;
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
        .snapshot-footnote {
          margin-top: 12px;
          padding-top: 6px;
          border-top: 1px solid #17365d;
          font-size: 10px;
          color: ${GRAY};
          line-height: 1.5;
        }
        .snapshot-footnote div { margin-bottom: 2px; }
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
