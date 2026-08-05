import type { JSX } from "react";
import type { DecimalMode, DecimalSettings } from "../domain/format";
import type {
  PortfolioAnalysisContext,
  PortfolioAnalysisTreeRow,
} from "../types";
import type { PortfolioAnalysisColumnGroupVisibility } from "./PortfolioAnalysisPage";
import type { PortfolioAnalysisColumnGroupContext } from "./bottom-panel";
import { PortfolioAnalysisTreeGrid } from "./PortfolioAnalysisTreeGrid";

export function PortfolioAnalysisMainPanel({
  context,
  rows,
  isLoading,
  isError,
  searchQuery,
  decimalSettings,
  decimalMode,
  columnGroups,
  benchmarkEnabled,
  selectedRowId,
  selectedColumnGroup,
  onSelectedRowIdChange,
  onSelectedColumnGroupChange,
  onOpenColumnGroupDetail,
  onOpenDriftDetail,
}: {
  context: PortfolioAnalysisContext;
  rows: PortfolioAnalysisTreeRow[];
  isLoading: boolean;
  isError: boolean;
  searchQuery: string;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
  columnGroups: PortfolioAnalysisColumnGroupVisibility;
  benchmarkEnabled: boolean;
  selectedRowId: string | null;
  selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null;
  onSelectedRowIdChange: (rowId: string | null) => void;
  onSelectedColumnGroupChange?: (
    context: PortfolioAnalysisColumnGroupContext | null,
  ) => void;
  onOpenColumnGroupDetail?: (
    rowId: string,
    tMinus: number | "total",
    context: PortfolioAnalysisColumnGroupContext,
  ) => void;
  onOpenDriftDetail: (rowId: string, tMinus: number | "total") => void;
}): JSX.Element {
  return (
    <main className="portfolio-analysis-main relative min-h-0 min-w-0 flex-1 overflow-hidden border border-grey-300 bg-tcw-white shadow-[0_1px_2px_rgba(13,13,13,0.04),0_8px_24px_rgba(1,61,125,0.06)]">
      <PortfolioAnalysisTreeGrid
        context={context}
        rows={rows}
        isLoading={isLoading}
        isError={isError}
        searchQuery={searchQuery}
        decimalSettings={decimalSettings}
        decimalMode={decimalMode}
        columnGroups={columnGroups}
        benchmarkEnabled={benchmarkEnabled}
        selectedRowId={selectedRowId}
        selectedColumnGroup={selectedColumnGroup}
        onSelectedRowIdChange={onSelectedRowIdChange}
        onSelectedColumnGroupChange={onSelectedColumnGroupChange}
        onOpenColumnGroupDetail={onOpenColumnGroupDetail}
        onOpenDriftDetail={onOpenDriftDetail}
      />
    </main>
  );
}
