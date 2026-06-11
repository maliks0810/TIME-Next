import { MetricKey, RankingItem } from "./types/alphaDashboard";
import { metricLabel } from "./utils/alphaDashboardCharts";
import { compact, pct } from "./utils/alphaDashboardFormatters";
import { getMetricValue } from "./utils/alphaDashboardHelpers";

interface DataTableProps {
  title: string;
  rows: RankingItem[];
  metric: MetricKey;
}

const ui = {
  panel: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
    overflow: "hidden" as const,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "18px 20px 8px 20px",
    flexWrap: "wrap" as const,
  },
  panelTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
  },
  panelSubtle: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
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
  panelBody: {
    padding: 20,
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto" as const,
    maxHeight: 460,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },
  th: {
    textAlign: "left" as const,
    color: "#64748b",
    fontWeight: 700,
    borderBottom: "1px solid #e2e8f0",
    background: "#fafcff",
    position: "sticky" as const,
    top: 0,
    padding: "12px 10px",
    whiteSpace: "nowrap" as const,
    zIndex: 1,
  },
  td: {
    borderBottom: "1px solid #e2e8f0",
    padding: "12px 10px",
    verticalAlign: "top" as const,
  },
  right: {
    textAlign: "right" as const,
  },
};

export function DataTable({ title, rows, metric }: DataTableProps) {
  return (
    <div style={ui.panel}>
      <div style={ui.panelHeader}>
        <div>
          <h3 style={ui.panelTitle}>{title}</h3>
          <div style={ui.panelSubtle}>{rows.length} portfolios</div>
        </div>
        <div style={ui.badge}>{metricLabel(metric)}</div>
      </div>

      <div style={ui.panelBody}>
        <div style={ui.tableWrap}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Rank</th>
                <th style={ui.th}>Portfolio</th>
                <th style={{ ...ui.th, ...ui.right }}>{metricLabel(metric)}</th>
                <th style={{ ...ui.th, ...ui.right }}>Alpha</th>
                <th style={{ ...ui.th, ...ui.right }}>Gross</th>
                <th style={{ ...ui.th, ...ui.right }}>Net</th>
                <th style={{ ...ui.th, ...ui.right }}>NAV</th>
                <th style={ui.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...ui.td, textAlign: "center", color: "#64748b" }}>
                    No rows available.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.portfolioNumber}-${row.rank ?? "na"}-${title}`}>
                    <td style={ui.td}>{row.rank ?? "—"}</td>
                    <td style={ui.td}>
                      <div style={{ fontWeight: 700 }}>{row.portfolioName}</div>
                      <div style={{ color: "#64748b", fontSize: 12 }}>{row.portfolioNumber}</div>
                      <div style={{ color: "#64748b", fontSize: 12 }}>{row.benchmarkName}</div>
                    </td>
                    <td
                      style={{
                        ...ui.td,
                        ...ui.right,
                        fontWeight: 700,
                        color: (getMetricValue(row, metric) ?? 0) >= 0 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {pct(getMetricValue(row, metric))}
                    </td>
                    <td style={{ ...ui.td, ...ui.right }}>{pct(row.alpha)}</td>
                    <td style={{ ...ui.td, ...ui.right }}>{pct(row.portfolioReturn)}</td>
                    <td style={{ ...ui.td, ...ui.right }}>{pct(row.netReturn)}</td>
                    <td style={{ ...ui.td, ...ui.right }}>{compact(row.nav)}</td>
                    <td style={ui.td}>{row.performanceStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}