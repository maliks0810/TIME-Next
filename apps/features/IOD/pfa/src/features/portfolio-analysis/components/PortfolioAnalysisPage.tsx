import { useState, type JSX, type ReactNode } from "react";
import type { DecimalMode, DecimalSettings } from "../domain/format";
import { DEFAULT_DECIMAL_SETTINGS } from "../domain/format";
import type {
  BenchmarkPositionAnalytics,
  BenchmarkUniverseType,
  PortfolioAnalysisContext,
  SecurityAnalytics,
} from "../types";
import { PortfolioAnalysisSummary } from "./PortfolioAnalysisSummary";
import { PortfolioAnalysisToolbar } from "./PortfolioAnalysisToolbar";
import { PortfolioAnalysisContent } from "./PortfolioAnalysisContent";
import "../styles/portfolio-analysis-overrides.css";
import "../styles/pfa-toolbar-selector.css";
import "../styles/pfa-look-through-toggle.css";

export type PortfolioAnalysisColumnGroupId = "mv" | "par" | "dur" | "drift";
export type PortfolioAnalysisColumnGroupVisibility = Record<
  PortfolioAnalysisColumnGroupId,
  boolean
>;

const DEFAULT_COLUMN_GROUPS: PortfolioAnalysisColumnGroupVisibility = {
  mv: true,
  par: false,
  dur: true,
  drift: true,
};

export function PortfolioAnalysisPage({
  context,
  onBack,
  backLabel,
  toolbarLeftContent,
  portfolioSelectorCaption,
  lookThrough = false,
  benchmarkEnabled = false,
  benchmarkUniverseType = "RETURNS",
  benchmarkPositions = [],
  securities = [],
  benchmarkLoading = false,
  benchmarkError = false,
  securitiesError = false,
  loadVersion = 0,
}: {
  context: PortfolioAnalysisContext;
  onBack?: () => void;
  backLabel?: string;
  toolbarLeftContent?: ReactNode;
  portfolioSelectorCaption?: string;
  lookThrough?: boolean;
  benchmarkEnabled?: boolean;
  benchmarkUniverseType?: BenchmarkUniverseType;
  benchmarkPositions?: BenchmarkPositionAnalytics[];
  securities?: SecurityAnalytics[];
  benchmarkLoading?: boolean;
  benchmarkError?: boolean;
  securitiesError?: boolean;
  loadVersion?: number;
}): JSX.Element {
  const [securitySearchQuery, setSecuritySearchQuery] = useState("");
  const [decimalSettings, setDecimalSettings] = useState<DecimalSettings>(
    DEFAULT_DECIMAL_SETTINGS,
  );
  const [decimalMode, setDecimalMode] = useState<DecimalMode>("round");
  const [columnGroups, setColumnGroups] =
    useState<PortfolioAnalysisColumnGroupVisibility>(DEFAULT_COLUMN_GROUPS);
  const [benchmarkVisible, setBenchmarkVisible] = useState(true);
  const [exportRequestId, setExportRequestId] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const effectiveBenchmarkVisible = benchmarkEnabled && benchmarkVisible;

  return (
    <div className="portfolio-analysis-page flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <PortfolioAnalysisSummary context={context} />
      <section className="portfolio-analysis-toolbar-shell">
        <PortfolioAnalysisToolbar
          context={context}
          searchQuery={securitySearchQuery}
          onSearchQueryChange={setSecuritySearchQuery}
          decimalSettings={decimalSettings}
          onDecimalSettingsChange={setDecimalSettings}
          decimalMode={decimalMode}
          onDecimalModeChange={setDecimalMode}
          columnGroups={columnGroups}
          onColumnGroupsChange={setColumnGroups}
          benchmarkAvailable={benchmarkEnabled}
          benchmarkVisible={effectiveBenchmarkVisible}
          onBenchmarkVisibleChange={setBenchmarkVisible}
          onBack={onBack}
          backLabel={backLabel}
          leftContent={toolbarLeftContent}
          leftContentCaption={portfolioSelectorCaption}
          isExporting={isExporting}
          onExport={() => setExportRequestId((current) => current + 1)}
        />
      </section>
      <PortfolioAnalysisContent
        context={context}
        searchQuery={securitySearchQuery}
        decimalSettings={decimalSettings}
        decimalMode={decimalMode}
        columnGroups={columnGroups}
        lookThrough={lookThrough}
        benchmarkVisible={effectiveBenchmarkVisible}
        benchmarkUniverseType={benchmarkUniverseType}
        benchmarkPositions={benchmarkPositions}
        securities={securities}
        benchmarkLoading={benchmarkLoading}
        benchmarkError={benchmarkError}
        securitiesError={securitiesError}
        loadVersion={loadVersion}
        exportRequestId={exportRequestId}
        onExportingChange={setIsExporting}
      />
    </div>
  );
}
