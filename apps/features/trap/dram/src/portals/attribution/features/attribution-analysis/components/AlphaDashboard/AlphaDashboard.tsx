
import React, { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Space } from "antd";

import { SummaryCard } from "./SummaryCard";
import { DataTable } from "./DataTable";
import { EmptyPanel } from "./EmptyPanel";
import { PillSelector } from "./PillSelector";

import type { EChartsOption } from "echarts";
import type {
  DashboardPayload,
  ExportRow,
  MetricKey,
  RankingItem,
  SummaryValues,
} from "./types/alphaDashboard";
import {
  getMetricValue,
  normalizeItem,
  safeArray,
} from "./utils/alphaDashboardHelpers";
import { downloadFile, toCsv } from "./utils/alphaDashboardExport";
import { compact, pct } from "./utils/alphaDashboardFormatters";
import {
  buildGroupedBarOption,
  buildHeatmapOption,
  buildRankBarOption,
  buildTreemapOption,
  metricLabel,
  METRICS,
} from "./utils/alphaDashboardCharts";

const ui: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: 12,
    boxSizing: "border-box",
  },
  container: {
    maxWidth: 1480,
    margin: "0 auto",
    display: "grid",
    gap: 10,
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    marginTop: 8,
    color: "#64748b",
    fontSize: 14,
  },
  toolbar: {
    display: "flex",
    gap: 5,
    alignItems: "center",
    flexWrap: "wrap",
  },
  input: {
    minWidth: 170,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: 12,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },
  button: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  primaryButton: {
    border: "none",
    background: "#0f172a",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: 16,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    border: "1px solid #e2e8f0",
    padding: "4px 10px",
    color: "#64748b",
    background: "#fff",
    fontSize: 12,
    fontWeight: 700,
  },
  footerNote: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 10,
  },
};

interface AlphaDashboardProps {
  payload: DashboardPayload;
}

export default function AlphaDashboard({
  payload,
}: AlphaDashboardProps) {
  const periods =
    Array.isArray(payload.periods) && payload.periods.length
      ? payload.periods
      : ["MTD", "QTD", "YTD"];

  const availableStyles =
    Array.isArray(payload.styles) && payload.styles.length
      ? payload.styles
      : Object.keys(payload.rankingsByStyle ?? {});

  const initialStyle = availableStyles[0] ?? "Unknown";
  const initialPeriod = periods[0] ?? "MTD";

  const [styleKey, setStyleKey] = useState<string>(initialStyle);
  const [period, setPeriod] = useState<string>(initialPeriod);
  const [search, setSearch] = useState<string>("");
  const [metric, setMetric] = useState<MetricKey>("alpha");

  const rawView = useMemo(() => {
    return payload.rankingsByStyle?.[styleKey]?.[period] ?? { top: [], bottom: [] };
  }, [payload, styleKey, period]);

  const filteredView = useMemo<{ top: RankingItem[]; bottom: RankingItem[] }>(() => {
    const query = search.trim().toLowerCase();

    const filterFn = (row: RankingItem): boolean => {
      if (!query) return true;
      return (
        String(row.portfolioName).toLowerCase().includes(query) ||
        String(row.portfolioNumber).toLowerCase().includes(query) ||
        String(row.benchmarkName).toLowerCase().includes(query) ||
        String(row.performanceStatus).toLowerCase().includes(query)
      );
    };

    return {
      top: safeArray(rawView.top)
        .map(normalizeItem)
        .filter(filterFn)
        .sort((a, b) => {
          const ar = a.rank ?? Number.MAX_SAFE_INTEGER;
          const br = b.rank ?? Number.MAX_SAFE_INTEGER;
          if (ar !== br) return ar - br;
          return a.portfolioName.localeCompare(b.portfolioName);
        }),

      bottom: safeArray(rawView.bottom)
        .map(normalizeItem)
        .filter(filterFn)
        .sort((a, b) => {
          const ar = a.rank ?? Number.MAX_SAFE_INTEGER;
          const br = b.rank ?? Number.MAX_SAFE_INTEGER;
          if (ar !== br) return ar - br;
          return a.portfolioName.localeCompare(b.portfolioName);
        }),
    };
  }, [rawView, search]);

  const summary = useMemo<SummaryValues>(() => {
    const best = filteredView.top.length
      ? getMetricValue(filteredView.top[0], metric)
      : null;
    const worst = filteredView.bottom.length
      ? getMetricValue(filteredView.bottom[0], metric)
      : null;
    const spread = best != null && worst != null ? best - worst : null;
    const totalNav = [...filteredView.top, ...filteredView.bottom].reduce(
      (sum, row) => sum + (row.nav ?? 0),
      0
    );
    return { best, worst, spread, totalNav };
  }, [filteredView, metric]);

  const exportRows = useMemo<ExportRow[]>(() => {
    return [
      ...filteredView.top.map((row) => ({ ...row, bucket: "top" as const })),
      ...filteredView.bottom.map((row) => ({ ...row, bucket: "bottom" as const })),
    ];
  }, [filteredView]);

  const hasData = filteredView.top.length > 0 || filteredView.bottom.length > 0;

  const metricTone: "green" | "red" | "blue" | "purple" =
    metric === "alpha"
      ? "blue"
      : metric === "portfolioReturn"
      ? "green"
      : "purple";

  const metricColor = METRICS[metric].color;

  const topChartOption = useMemo<EChartsOption>(() => {
    return buildRankBarOption(
      rawView.top,
      `${styleKey} ${period} — Top Gainers (${metricLabel(metric)})`,
      metric,
      metricColor,
      "top"
    );
  }, [rawView.top, styleKey, period, metric, metricColor]);

  const bottomChartOption = useMemo<EChartsOption>(() => {
    return buildRankBarOption(
      rawView.bottom,
      `${styleKey} ${period} — Top Losers (${metricLabel(metric)})`,
      metric,
      "#ef4444",
      "bottom"
    );
  }, [rawView.bottom, styleKey, period, metric]);

  const groupedBarOption = useMemo<EChartsOption>(
    () => buildGroupedBarOption(payload, period, metric),
    [payload, period, metric]
  );

  const treemapOption = useMemo<EChartsOption>(
    () => buildTreemapOption(payload, period, metric),
    [payload, period, metric]
  );

  const heatmapOption = useMemo<EChartsOption>(
    () => buildHeatmapOption(payload, metric),
    [payload, metric]
  );

  const handleExportCsv = (): void => {
    downloadFile(
      `alpha-dashboard-${styleKey}-${period}-${metric}.csv`,
      toCsv(exportRows, metric),
      "text/csv;charset=utf-8;"
    );
  };

  const handleExportJson = (): void => {
    downloadFile(
      `alpha-dashboard-${styleKey}-${period}-${metric}.json`,
      JSON.stringify({ style: styleKey, period, metric, rows: exportRows }, null, 2),
      "application/json;charset=utf-8;"
    );
  };

  return (
    <div style={ui.page}>
      <div style={ui.container}>
        <div style={ui.hero}>
          <div style={ui.toolbar}>
            <select
              value={styleKey}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setStyleKey(event.target.value)
              }
              style={ui.input}
            >
              {availableStyles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search portfolio, number, benchmark..."
              value={search}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(event.target.value)
              }
              style={{ ...ui.input, minWidth: 280 }}
            />

            <button type="button" style={ui.button} onClick={handleExportCsv}>
              Export CSV
            </button>
            <button type="button" style={ui.button} onClick={handleExportJson}>
              Export JSON
            </button>
            {/* <button type="button" style={ui.primaryButton} onClick={resetFilters}>
              Reset
            </button> */}
          </div>
        </div>


      <Space direction="horizontal" size={12} style={{ width: "100%" }}>
        <PillSelector<MetricKey>
          items={Object.values(METRICS).map((item) => ({
            value: item.key,
            label: item.label,
          }))}
          value={metric}
          onChange={setMetric}
        />

        <PillSelector<string>
          items={periods.map((item) => ({
            value: item,
            label: item,
          }))}
          value={period}
          onChange={setPeriod}
        />
      </Space>


        <div style={ui.grid3}>
          <SummaryCard
            label={`Best ${metricLabel(metric)}`}
            value={pct(summary.best)}
            tone={metricTone}
          />
          <SummaryCard
            label={`Worst ${metricLabel(metric)}`}
            value={pct(summary.worst)}
            tone="red"
          />
          <SummaryCard
            label={`${metricLabel(metric)} Spread`}
            value={pct(summary.spread)}
            tone="blue"
          />
        </div>

        <div style={ui.grid3}>
          <SummaryCard label="Tracked NAV" value={compact(summary.totalNav)} tone="purple" />
          <SummaryCard
            label="Displayed Gainers"
            value={String(filteredView.top.length)}
            tone="green"
          />
          <SummaryCard
            label="Displayed Losers"
            value={String(filteredView.bottom.length)}
            tone="red"
          />
        </div>

        {hasData ? (
          <>
            <div style={ui.grid2}>
              <Card
                title="Top Gainers"
                extra={<span style={ui.badge}>{styleKey}</span>}
                bordered
                style={{ borderRadius: 20 }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={ui.subtitle}>
                  Selected style and period ranked by {metricLabel(metric).toLowerCase()}
                </div>
                <ReactECharts
                  style={{ height: 360, width: "100%" }}
                  option={topChartOption}
                  notMerge
                  lazyUpdate
                />
                <div style={ui.footerNote}>
                  Dense-rank ties can cause more than 5 rows when ranks are tied.
                </div>
              </Card>

              <Card
                title="Top Losers"
                extra={<span style={ui.badge}>{period}</span>}
                bordered
                style={{ borderRadius: 20 }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={ui.subtitle}>Lowest values in the selected metric</div>
                <ReactECharts
                  style={{ height: 360, width: "100%" }}
                  option={bottomChartOption}
                  notMerge
                  lazyUpdate
                />
                <div style={ui.footerNote}>Search filters apply to both charts and tables.</div>
              </Card>
            </div>

            <div style={ui.grid2}>
              <Card
                title="Grouped Bar Chart by Style"
                extra={<span style={ui.badge}>Cross-style</span>}
                bordered
                style={{ borderRadius: 20 }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={ui.subtitle}>
                  Average top and bottom {metricLabel(metric).toLowerCase()} across styles for{" "}
                  {period}
                </div>
                <ReactECharts
                  style={{ height: 360, width: "100%" }}
                  option={groupedBarOption}
                  notMerge
                  lazyUpdate
                />
              </Card>

              <Card
                title="Treemap View"
                extra={<span style={ui.badge}>Treemap</span>}
                bordered
                style={{ borderRadius: 20 }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={ui.subtitle}>
                  Size by NAV, color grouped by positive or negative metric
                </div>
                <ReactECharts
                  style={{ height: 360, width: "100%" }}
                  option={treemapOption}
                  notMerge
                  lazyUpdate
                />
              </Card>
            </div>

            <div style={ui.grid2}>
              <Card
                title="Heatmap by Style and Period"
                extra={<span style={ui.badge}>Heatmap</span>}
                bordered
                style={{ borderRadius: 20 }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={ui.subtitle}>
                  Average combined top/bottom {metricLabel(metric).toLowerCase()} for each
                  style-period bucket
                </div>
                <ReactECharts
                  style={{ height: 360, width: "100%" }}
                  option={heatmapOption}
                  notMerge
                  lazyUpdate
                />
              </Card>

              <Card
                title="Export Preview"
                extra={<span style={ui.badge}>{exportRows.length} rows</span>}
                bordered
                style={{ borderRadius: 20 }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={ui.subtitle}>Current filtered rows included in export</div>
                <div style={ui.footerNote}>
                  Use Export CSV or Export JSON to download the current filtered selection.
                </div>
                <div style={{ ...ui.footerNote, marginTop: 6 }}>
                  Fields exported: rank, metric, alpha, gross return, net return, NAV,
                  benchmark, status, and bucket.
                </div>
              </Card>
            </div>

            <div style={ui.grid2}>
              <DataTable
                title={`${styleKey} ${period} — Gainers`}
                rows={filteredView.top}
                metric={metric}
              />
              <DataTable
                title={`${styleKey} ${period} — Losers`}
                rows={filteredView.bottom}
                metric={metric}
              />
            </div>
          </>
        ) : (
          <EmptyPanel title={`${styleKey} ${period} — No Results`} />
        )}
      </div>
    </div>
  );
}