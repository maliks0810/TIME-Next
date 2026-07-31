import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { X } from "lucide-react";
import type { DecimalMode, DecimalSettings } from "../../domain/format";
import type {
  PortfolioAnalysisContext,
  PortfolioAnalysisTreeRow,
} from "../../types";
import type { PortfolioAnalysisColumnGroupContext } from "./PortfolioAnalysisColumnGroupContext";
import { PortfolioAnalysisEventsTab } from "./PortfolioAnalysisEventsTab";
import {
  PortfolioAnalysisSecurityTab,
  type SecurityMode,
} from "./PortfolioAnalysisSecurityTab";
import { PortfolioAnalysisSummaryTab } from "./PortfolioAnalysisSummaryTab";
import type { PortfolioAnalysisPeriodKey } from "./PortfolioAnalysisPeriodSelector";
import {
  deltaPeriods,
  initialActivePeriodForScope,
  scopePeriod,
} from "./periodScope";

export type PortfolioAnalysisBottomPanelTab = "summary" | "security" | "events";
const MIN_PANEL_HEIGHT = 180;
const MAX_PANEL_HEIGHT = 640;

function tMinusLabel(value: number): string {
  return value === 0 ? "T" : `T-${value}`;
}
function deltaLabel(period: number): string {
  return `${tMinusLabel(period)} vs ${tMinusLabel(period + 1)}`;
}
function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      data-active={active}
      aria-pressed={active}
      className="portfolio-analysis-bottom-tab"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
function fullPathForRow(
  row: PortfolioAnalysisTreeRow | null,
  rows: PortfolioAnalysisTreeRow[],
): string {
  if (!row) return "No row selected";
  const rowById = new Map(rows.map((candidate) => [candidate.id, candidate]));
  const path: string[] = [];
  let current: PortfolioAnalysisTreeRow | undefined = row;
  while (current) {
    path.push(String(current.label ?? current.securityKey ?? current.id));
    current = current.parentId ? rowById.get(current.parentId) : undefined;
  }
  return path.reverse().join(" / ");
}
function scopeResetKey(
  row: PortfolioAnalysisTreeRow | null,
  selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null,
): string {
  return [
    row?.id ?? "",
    selectedColumnGroup?.field ?? "",
    String(selectedColumnGroup?.period ?? ""),
  ].join("|");
}
function clampPanelHeight(value: number, availableHeight?: number): number {
  const viewportMaximum =
    typeof window === "undefined"
      ? MAX_PANEL_HEIGHT
      : Math.floor(window.innerHeight * 0.82);
  const parentMaximum =
    availableHeight == null
      ? viewportMaximum
      : Math.max(MIN_PANEL_HEIGHT, availableHeight - 48);
  return Math.min(
    Math.min(MAX_PANEL_HEIGHT, viewportMaximum, parentMaximum),
    Math.max(MIN_PANEL_HEIGHT, value),
  );
}

export function PortfolioAnalysisBottomPanel({
  open,
  selectedRow,
  rows,
  context,
  activeTMinus,
  activeTab,
  selectedColumnGroup,
  onActiveTabChange,
  onActiveTMinusChange,
  onClose,
  decimalSettings,
  decimalMode,
  securitiesAvailable,
  height,
  onHeightChange,
}: {
  open: boolean;
  selectedRow: PortfolioAnalysisTreeRow | null;
  rows: PortfolioAnalysisTreeRow[];
  context: PortfolioAnalysisContext;
  activeTMinus: PortfolioAnalysisPeriodKey;
  activeTab: PortfolioAnalysisBottomPanelTab;
  selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null;
  onActiveTabChange: (tab: PortfolioAnalysisBottomPanelTab) => void;
  onActiveTMinusChange: (period: PortfolioAnalysisPeriodKey) => void;
  onClose: () => void;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
  securitiesAvailable: boolean;
  height: number;
  onHeightChange: (height: number) => void;
}): JSX.Element | null {
  const panelRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const onHeightChangeRef = useRef(onHeightChange);
  const resizeStateRef = useRef<{
    panelBottom: number;
    pointerId: number;
  } | null>(null);
  const pathTitle = useMemo(
    () => fullPathForRow(selectedRow, rows),
    [rows, selectedRow],
  );
  const resetKey = useMemo(
    () => scopeResetKey(selectedRow, selectedColumnGroup),
    [selectedRow, selectedColumnGroup],
  );
  const selectedScopePeriod = useMemo(
    () =>
      initialActivePeriodForScope(
        context,
        scopePeriod(context, activeTMinus, selectedColumnGroup),
      ),
    [activeTMinus, context, selectedColumnGroup],
  );
  const [panelActiveTMinus, setPanelActiveTMinus] =
    useState<PortfolioAnalysisPeriodKey>(selectedScopePeriod);
  const [securityMode, setSecurityMode] = useState<SecurityMode>("value");
  const availableDeltaPeriods = useMemo(
    () => deltaPeriods(context, "total"),
    [context],
  );

  useEffect(
    () => setPanelActiveTMinus(selectedScopePeriod),
    [resetKey, selectedScopePeriod],
  );
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    onHeightChangeRef.current = onHeightChange;
  }, [onHeightChange]);

  const handlePanelActiveTMinusChange = (
    period: PortfolioAnalysisPeriodKey,
  ): void => {
    setPanelActiveTMinus(period);
    onActiveTMinusChange(period);
  };

  useEffect(() => {
    const stopResize = (): void => {
      resizeStateRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.classList.remove(
        "portfolio-analysis-bottom-panel-resizing",
      );
    };
    const onPointerMove = (event: PointerEvent): void => {
      const state = resizeStateRef.current;
      if (!state || state.pointerId !== event.pointerId) return;
      event.preventDefault();
      const availableHeight = panelRef.current?.parentElement?.clientHeight;
      onHeightChangeRef.current(
        clampPanelHeight(state.panelBottom - event.clientY, availableHeight),
      );
    };
    const onPointerUp = (event: PointerEvent): void => {
      const state = resizeStateRef.current;
      if (state && state.pointerId === event.pointerId) stopResize();
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      if (resizeStateRef.current) stopResize();
      else onCloseRef.current();
    };
    document.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("keydown", onKeyDown);
      stopResize();
    };
  }, []);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    const panel = panelRef.current;
    if (!panel) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeStateRef.current = {
      panelBottom: panel.getBoundingClientRect().bottom,
      pointerId: event.pointerId,
    };
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
    document.body.classList.add("portfolio-analysis-bottom-panel-resizing");
  };

  if (!open) return null;
  const hasSecondary = activeTab === "summary" || activeTab === "security";
  const panelHeight = clampPanelHeight(height);
  return (
    <aside
      ref={panelRef}
      className="portfolio-analysis-bottom-panel"
      aria-hidden={!open}
      style={{ height: panelHeight, flexBasis: panelHeight }}
    >
      <div
        className="portfolio-analysis-bottom-resize-handle"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize detail panel"
        title="Drag to resize detail panel"
        onPointerDown={startResize}
      >
        <span
          className="portfolio-analysis-bottom-resize-grip"
          aria-hidden="true"
        />
      </div>
      <div className="portfolio-analysis-bottom-header">
        <div className="portfolio-analysis-bottom-title-zone">
          <div className="portfolio-analysis-bottom-subtitle" title={pathTitle}>
            {pathTitle}
          </div>
        </div>
        <div className="portfolio-analysis-bottom-navigation">
          <div
            className="portfolio-analysis-bottom-secondary-slot"
            data-visible={hasSecondary}
          >
            {activeTab === "summary" ? (
              <div
                className="portfolio-analysis-period-mini-selector"
                role="group"
                aria-label="Analysis period"
              >
                {availableDeltaPeriods.map((period) => (
                  <button
                    key={period}
                    type="button"
                    data-active={panelActiveTMinus === period}
                    aria-pressed={panelActiveTMinus === period}
                    onClick={() => handlePanelActiveTMinusChange(period)}
                  >
                    {deltaLabel(period)}
                  </button>
                ))}
              </div>
            ) : null}
            {activeTab === "security" ? (
              <div
                className="portfolio-analysis-bottom-mode-toggle"
                role="group"
                aria-label="Security display mode"
              >
                <button
                  type="button"
                  data-active={securityMode === "value"}
                  aria-pressed={securityMode === "value"}
                  onClick={() => setSecurityMode("value")}
                >
                  Value
                </button>
                <button
                  type="button"
                  data-active={securityMode === "delta"}
                  aria-pressed={securityMode === "delta"}
                  onClick={() => setSecurityMode("delta")}
                >
                  Delta
                </button>
              </div>
            ) : null}
          </div>
          <span
            className="portfolio-analysis-bottom-nav-divider"
            data-visible={hasSecondary}
            aria-hidden="true"
          />
          <div
            className="portfolio-analysis-bottom-tabs"
            role="tablist"
            aria-label="Bottom panel views"
          >
            <TabButton
              active={activeTab === "summary"}
              label="Summary"
              onClick={() => onActiveTabChange("summary")}
            />
            <TabButton
              active={activeTab === "security"}
              label="Security"
              onClick={() => onActiveTabChange("security")}
            />
            <TabButton
              active={activeTab === "events"}
              label="Events"
              onClick={() => onActiveTabChange("events")}
            />
          </div>
        </div>
        <button
          type="button"
          className="portfolio-analysis-bottom-close"
          onClick={onClose}
          title="Close detail panel"
          aria-label="Close detail panel"
        >
          <X size={13} strokeWidth={2} />
        </button>
      </div>
      <div className="portfolio-analysis-bottom-body">
        {!selectedRow ? (
          <div className="portfolio-analysis-bottom-empty">
            Double-click a Drift cell to inspect details.
          </div>
        ) : null}
        {selectedRow && activeTab === "summary" ? (
          <PortfolioAnalysisSummaryTab
            selectedRow={selectedRow}
            rows={rows}
            context={context}
            activeTMinus={panelActiveTMinus}
            onActiveTMinusChange={handlePanelActiveTMinusChange}
            decimalSettings={decimalSettings}
            decimalMode={decimalMode}
          />
        ) : null}
        {selectedRow && activeTab === "security" ? (
          <PortfolioAnalysisSecurityTab
            selectedRow={selectedRow}
            context={context}
            activeTMinus={panelActiveTMinus}
            selectedColumnGroup={selectedColumnGroup}
            onActiveTMinusChange={handlePanelActiveTMinusChange}
            decimalSettings={decimalSettings}
            decimalMode={decimalMode}
            securitiesAvailable={securitiesAvailable}
            mode={securityMode}
          />
        ) : null}
        {selectedRow && activeTab === "events" ? (
          <PortfolioAnalysisEventsTab
            selectedRow={selectedRow}
            context={context}
            activeTMinus={panelActiveTMinus}
            selectedColumnGroup={selectedColumnGroup}
            onActiveTMinusChange={handlePanelActiveTMinusChange}
            decimalSettings={decimalSettings}
            decimalMode={decimalMode}
          />
        ) : null}
      </div>
    </aside>
  );
}
