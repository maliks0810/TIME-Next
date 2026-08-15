import type { JSX } from "react";
import type { DecimalMode, DecimalSettings } from "../../domain/format";
import { fmtDynamicSignedNumber } from "../../domain/format";
import { buildPortfolioAnalysisRowIndex } from "../../domain/tree";
import type {
  PortfolioAnalysisContext,
  PortfolioAnalysisTradeEvent,
  PortfolioAnalysisTreeRow,
} from "../../types";
import { PortfolioAnalysisMetricCard } from "./PortfolioAnalysisMetricCard";
import { PortfolioAnalysisMiniGrid } from "./PortfolioAnalysisMiniGrid";
import { PortfolioAnalysisPeriodBreakdownGrid } from "./PortfolioAnalysisPeriodBreakdownGrid";
import type { PortfolioAnalysisPeriodKey } from "./PortfolioAnalysisPeriodSelector";

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
}
function valueOf(
  row: PortfolioAnalysisTreeRow,
  period: PortfolioAnalysisPeriodKey,
  key: keyof PortfolioAnalysisTreeRow["total"],
): number | null {
  return period === "total"
    ? (row.total[key] ?? null)
    : (row.day[period]?.[key] ?? null);
}

function fmtContrib(
  value: number | null | undefined,
  settings: DecimalSettings,
  mode: DecimalMode,
): string {
  return fmtDynamicSignedNumber(value, settings.contrib, mode);
}
function fmtMoney(
  value: number | null | undefined,
  settings: DecimalSettings,
  mode: DecimalMode,
): string {
  return fmtDynamicSignedNumber(value, settings.money, mode);
}
function fmtQty(
  value: number | null | undefined,
  settings: DecimalSettings,
  mode: DecimalMode,
): string {
  return fmtDynamicSignedNumber(value, settings.qty, mode);
}
function eventDetails(
  row: PortfolioAnalysisTreeRow,
  period: PortfolioAnalysisPeriodKey,
): { trades?: PortfolioAnalysisTradeEvent[] } {
  if (period !== "total") return row.events?.[period] ?? {};
  return Object.values(row.events ?? {}).reduce(
    (acc, details) => ({
      trades: [...(acc.trades ?? []), ...(details.trades ?? [])],
    }),
    {} as { trades?: PortfolioAnalysisTradeEvent[] },
  );
}

function RollupSummary({
  selectedRow,
  rows,
  context,
  activeTMinus,
  onActiveTMinusChange,
  decimalSettings,
  decimalMode,
}: {
  selectedRow: PortfolioAnalysisTreeRow;
  rows: PortfolioAnalysisTreeRow[];
  context: PortfolioAnalysisContext;
  activeTMinus: PortfolioAnalysisPeriodKey;
  onActiveTMinusChange: (period: PortfolioAnalysisPeriodKey) => void;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
}): JSX.Element {
  const { childIdsByParentId, rowById } = buildPortfolioAnalysisRowIndex(rows);
  const childRows = (childIdsByParentId.get(selectedRow.id) ?? [])
    .map((id) => rowById.get(id))
    .filter(Boolean) as PortfolioAnalysisTreeRow[];
  return (
    <div className="portfolio-analysis-bottom-tab-content portfolio-analysis-bottom-tab-content-fill">
      <div className="portfolio-analysis-bottom-two-col portfolio-analysis-bottom-two-col-fill">
        <PortfolioAnalysisPeriodBreakdownGrid
          selectedRow={selectedRow}
          context={context}
          activeTMinus={activeTMinus}
          onActiveTMinusChange={onActiveTMinusChange}
          decimalSettings={decimalSettings}
          decimalMode={decimalMode}
          showCashflows={selectedRow.nodeType === "root"}
        />
        <section className="portfolio-analysis-bottom-section portfolio-analysis-bottom-section-fill">
          <div className="portfolio-analysis-bottom-section-title">
            Child Contributors
          </div>
          <PortfolioAnalysisMiniGrid
            rows={childRows}
            emptyText="No child rows."
            defaultSortKey="drift"
            columns={[
              {
                key: "child",
                label: "Child",
                align: "left",
                render: (row) => row.label,
                sortValue: (row) => row.label,
              },
              {
                key: "deltaDur",
                label: "Δ Dur",
                render: (row) =>
                  fmtContrib(
                    valueOf(row, activeTMinus, "durationDelta"),
                    decimalSettings,
                    decimalMode,
                  ),
                sortValue: (row) =>
                  Math.abs(valueOf(row, activeTMinus, "durationDelta") ?? 0),
                toneValue: (row) => valueOf(row, activeTMinus, "durationDelta"),
              },
              {
                key: "trades",
                label: "Trades",
                render: (row) =>
                  fmtContrib(
                    valueOf(row, activeTMinus, "trades"),
                    decimalSettings,
                    decimalMode,
                  ),
                sortValue: (row) =>
                  Math.abs(valueOf(row, activeTMinus, "trades") ?? 0),
                toneValue: (row) => valueOf(row, activeTMinus, "trades"),
              },
              {
                key: "cashflows",
                label: "Cashflows",
                render: (row) =>
                  selectedRow.nodeType === "root"
                    ? fmtContrib(
                        valueOf(row, activeTMinus, "cashflows"),
                        decimalSettings,
                        decimalMode,
                      )
                    : "—",
                sortValue: (row) =>
                  Math.abs(valueOf(row, activeTMinus, "cashflows") ?? 0),
                toneValue: (row) => valueOf(row, activeTMinus, "cashflows"),
              },
              {
                key: "drift",
                label: "Drift",
                render: (row) =>
                  fmtContrib(
                    valueOf(row, activeTMinus, "drift"),
                    decimalSettings,
                    decimalMode,
                  ),
                sortValue: (row) =>
                  Math.abs(valueOf(row, activeTMinus, "drift") ?? 0),
                toneValue: (row) => valueOf(row, activeTMinus, "drift"),
              },
              {
                key: "deltaMv",
                label: "Δ MV",
                render: (row) =>
                  fmtMoney(
                    valueOf(row, activeTMinus, "marketValueDelta"),
                    decimalSettings,
                    decimalMode,
                  ),
                sortValue: (row) =>
                  Math.abs(valueOf(row, activeTMinus, "marketValueDelta") ?? 0),
                toneValue: (row) =>
                  valueOf(row, activeTMinus, "marketValueDelta"),
              },
              {
                key: "deltaPar",
                label: "Δ PAR",
                render: (row) =>
                  fmtQty(
                    valueOf(row, activeTMinus, "parDelta"),
                    decimalSettings,
                    decimalMode,
                  ),
                sortValue: (row) =>
                  Math.abs(valueOf(row, activeTMinus, "parDelta") ?? 0),
                toneValue: (row) => valueOf(row, activeTMinus, "parDelta"),
              },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
function PositionSummary({
  selectedRow,
  context,
  activeTMinus,
  onActiveTMinusChange,
  decimalSettings,
  decimalMode,
}: {
  selectedRow: PortfolioAnalysisTreeRow;
  context: PortfolioAnalysisContext;
  activeTMinus: PortfolioAnalysisPeriodKey;
  onActiveTMinusChange: (period: PortfolioAnalysisPeriodKey) => void;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
}): JSX.Element {
  return (
    <div className="portfolio-analysis-bottom-tab-content portfolio-analysis-bottom-tab-content-fill">
      <PortfolioAnalysisPeriodBreakdownGrid
        selectedRow={selectedRow}
        context={context}
        activeTMinus={activeTMinus}
        onActiveTMinusChange={onActiveTMinusChange}
        decimalSettings={decimalSettings}
        decimalMode={decimalMode}
        showCashflows={false}
      />
    </div>
  );
}
function SyntheticTradeSummary({
  selectedRow,
  activeTMinus,
  decimalSettings,
  decimalMode,
}: {
  selectedRow: PortfolioAnalysisTreeRow;
  activeTMinus: PortfolioAnalysisPeriodKey;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
}): JSX.Element {
  const trades = eventDetails(selectedRow, activeTMinus).trades ?? [];
  const firstTrade = trades[0];
  const face = asNumber(firstTrade?.flippedCurrentFace);
  const net = asNumber(firstTrade?.flippedTradeNetMoney);
  const ctd = asNumber(firstTrade?.ctd);
  return (
    <div className="portfolio-analysis-bottom-tab-content">
      <div className="portfolio-analysis-bottom-notice">
        Trade-only row: no same-day position was found for this trade security.
      </div>
      <div className="portfolio-analysis-bottom-card-grid portfolio-analysis-bottom-card-grid--synthetic">
        <PortfolioAnalysisMetricCard
          label="Trades"
          value={fmtContrib(
            valueOf(selectedRow, activeTMinus, "trades"),
            decimalSettings,
            decimalMode,
          )}
          tone={valueOf(selectedRow, activeTMinus, "trades")}
        />
        <PortfolioAnalysisMetricCard
          label="Face"
          value={fmtQty(face, decimalSettings, decimalMode)}
          tone={face}
        />
        <PortfolioAnalysisMetricCard
          label="Net"
          value={fmtMoney(net, decimalSettings, decimalMode)}
          tone={net}
        />
        <PortfolioAnalysisMetricCard
          label="CTD"
          value={fmtContrib(ctd, decimalSettings, decimalMode)}
          tone={ctd}
        />
      </div>
    </div>
  );
}
export function PortfolioAnalysisSummaryTab({
  selectedRow,
  rows,
  context,
  activeTMinus,
  onActiveTMinusChange,
  decimalSettings,
  decimalMode,
}: {
  selectedRow: PortfolioAnalysisTreeRow;
  rows: PortfolioAnalysisTreeRow[];
  context: PortfolioAnalysisContext;
  activeTMinus: PortfolioAnalysisPeriodKey;
  onActiveTMinusChange: (period: PortfolioAnalysisPeriodKey) => void;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
}): JSX.Element {
  if (selectedRow.nodeType === "root" || selectedRow.nodeType === "bucket")
    return (
      <RollupSummary
        selectedRow={selectedRow}
        rows={rows}
        context={context}
        activeTMinus={activeTMinus}
        onActiveTMinusChange={onActiveTMinusChange}
        decimalSettings={decimalSettings}
        decimalMode={decimalMode}
      />
    );
  if (selectedRow.nodeType === "syntheticTrade")
    return (
      <SyntheticTradeSummary
        selectedRow={selectedRow}
        activeTMinus={activeTMinus}
        decimalSettings={decimalSettings}
        decimalMode={decimalMode}
      />
    );
  return (
    <PositionSummary
      selectedRow={selectedRow}
      context={context}
      activeTMinus={activeTMinus}
      onActiveTMinusChange={onActiveTMinusChange}
      decimalSettings={decimalSettings}
      decimalMode={decimalMode}
    />
  );
}