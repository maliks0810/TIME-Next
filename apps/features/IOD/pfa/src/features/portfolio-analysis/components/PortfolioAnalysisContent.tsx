import { useMemo, useState, type JSX } from "react";
import { chip } from "../domain/dates";
import { buildPortfolioAnalysisTreeRows } from "../domain/tree";
import type { DecimalMode, DecimalSettings } from "../domain/format";
import type {
  BenchmarkPositionAnalytics,
  BenchmarkUniverseType,
  PortfolioAnalysisContext,
  SecurityAnalytics,
} from "../types";
import type { PortfolioAnalysisColumnGroupVisibility } from "./PortfolioAnalysisPage";
import { PortfolioAnalysisMainPanel } from "./PortfolioAnalysisMainPanel";
import {
  PortfolioAnalysisBottomPanel,
  preferredTabForColumnGroup,
  type PortfolioAnalysisBottomPanelTab,
  type PortfolioAnalysisColumnGroupContext,
} from "./bottom-panel";
import type { PortfolioAnalysisPeriodKey } from "./bottom-panel/PortfolioAnalysisPeriodBreakdownGrid";
import "./bottom-panel/portfolio-analysis-bottom-panel.css";
function columnGroupContextFromPeriod(
  context: PortfolioAnalysisContext,
  period: PortfolioAnalysisPeriodKey,
): PortfolioAnalysisColumnGroupContext {
  if (period === "total")
    return {
      kind: "breakdown",
      label: `T vs ${chip(context.comparisonTMinus)}`,
      field: "period-total",
      period: "total",
    };
  return {
    kind: "breakdown",
    label: context.dateLabels[period] ?? chip(period),
    field: `period-${period}`,
    period,
  };
}
export function PortfolioAnalysisContent({
  context,
  searchQuery,
  decimalSettings,
  decimalMode,
  columnGroups,
  lookThrough,
  benchmarkVisible,
  benchmarkUniverseType,
  benchmarkPositions,
  securities,
  benchmarkLoading,
  benchmarkError,
  securitiesError,
  loadVersion,
  exportRequestId,
  onExportingChange,
}: {
  context: PortfolioAnalysisContext;
  searchQuery: string;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
  columnGroups: PortfolioAnalysisColumnGroupVisibility;
  lookThrough: boolean;
  benchmarkVisible: boolean;
  benchmarkUniverseType: BenchmarkUniverseType;
  benchmarkPositions: BenchmarkPositionAnalytics[];
  securities: SecurityAnalytics[];
  benchmarkLoading: boolean;
  benchmarkError: boolean;
  securitiesError: boolean;
  loadVersion: number;
  exportRequestId: number;
  onExportingChange: (isExporting: boolean) => void;
}): JSX.Element {
  void lookThrough;
  void benchmarkUniverseType;
  void loadVersion;
  const effectiveBenchmarkPositions = benchmarkVisible
    ? benchmarkPositions
    : [];
  const rows = useMemo(
    () =>
      buildPortfolioAnalysisTreeRows({
        positions: context.cachedPositions ?? [],
        benchmarkPositions: effectiveBenchmarkPositions,
        securities,
        snapshots: context.snapshots,
        trades: context.cachedTrades ?? [],
        cashflows: context.cachedCashflows ?? [],
        comparisonTMinus: context.comparisonTMinus,
        portfolioKey: context.portfolioKey,
        portfolioName: context.portfolioName,
      }),
    [
      effectiveBenchmarkPositions,
      securities,
      context.snapshots,
      context.cachedPositions,
      context.cachedTrades,
      context.cachedCashflows,
      context.comparisonTMinus,
      context.portfolioKey,
      context.portfolioName,
    ],
  );
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedColumnGroup, setSelectedColumnGroup] =
    useState<PortfolioAnalysisColumnGroupContext | null>(null);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] =
    useState<PortfolioAnalysisBottomPanelTab>("summary");
  const [activeTMinus, setActiveTMinus] =
    useState<PortfolioAnalysisPeriodKey>("total");
  const [bottomPanelHeight, setBottomPanelHeight] = useState(286);
  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedRowId) ?? null,
    [rows, selectedRowId],
  );
  const handleSelectedRowIdChange = (rowId: string | null): void => {
    setSelectedRowId(rowId);
    if (!rowId) setSelectedColumnGroup(null);
  };
  const openColumnGroupDetail = (
    rowId: string,
    tMinus: PortfolioAnalysisPeriodKey,
    columnGroupContext: PortfolioAnalysisColumnGroupContext,
  ): void => {
    setSelectedRowId(rowId);
    setSelectedColumnGroup(columnGroupContext);
    setActiveTMinus(tMinus);
    setBottomPanelTab(preferredTabForColumnGroup(columnGroupContext));
    setBottomPanelOpen(true);
  };
  const openDriftDetail = (
    rowId: string,
    tMinus: PortfolioAnalysisPeriodKey,
  ): void => {
    const group = columnGroupContextFromPeriod(context, tMinus);
    setSelectedRowId(rowId);
    setSelectedColumnGroup(group);
    setActiveTMinus(tMinus);
    setBottomPanelTab("summary");
    setBottomPanelOpen(true);
  };
  return (
    <section className="portfolio-analysis-content min-h-0 min-w-0 flex-1 overflow-hidden p-0">
      <PortfolioAnalysisMainPanel
        context={context}
        rows={rows}
        isLoading={benchmarkLoading}
        isError={benchmarkError}
        searchQuery={searchQuery}
        decimalSettings={decimalSettings}
        decimalMode={decimalMode}
        columnGroups={columnGroups}
        benchmarkEnabled={benchmarkVisible}
        selectedRowId={selectedRowId}
        selectedColumnGroup={selectedColumnGroup}
        onSelectedRowIdChange={handleSelectedRowIdChange}
        onSelectedColumnGroupChange={setSelectedColumnGroup}
        onOpenColumnGroupDetail={openColumnGroupDetail}
        onOpenDriftDetail={openDriftDetail}
        exportRequestId={exportRequestId}
        onExportingChange={onExportingChange}
      />
      <PortfolioAnalysisBottomPanel
        open={bottomPanelOpen}
        selectedRow={selectedRow}
        rows={rows}
        context={context}
        activeTMinus={activeTMinus}
        activeTab={bottomPanelTab}
        selectedColumnGroup={selectedColumnGroup}
        onActiveTabChange={setBottomPanelTab}
        onActiveTMinusChange={setActiveTMinus}
        onClose={() => setBottomPanelOpen(false)}
        decimalSettings={decimalSettings}
        decimalMode={decimalMode}
        securitiesAvailable={!securitiesError}
        height={bottomPanelHeight}
        onHeightChange={setBottomPanelHeight}
      />
    </section>
  );
}
