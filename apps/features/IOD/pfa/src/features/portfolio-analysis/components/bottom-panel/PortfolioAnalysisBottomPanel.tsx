import { useEffect, useMemo, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { X } from 'lucide-react';
import { periodCaption, type PortfolioAnalysisPeriodKey } from './PortfolioAnalysisPeriodSelector';
import type { DecimalMode, DecimalSettings } from '../../domain/format';
import type { PortfolioAnalysisContext, PortfolioAnalysisTreeRow } from '../../types';
import { PortfolioAnalysisSummaryTab } from './PortfolioAnalysisSummaryTab';
import { PortfolioAnalysisSecurityTab } from './PortfolioAnalysisSecurityTab';
import { PortfolioAnalysisEventsTab } from './PortfolioAnalysisEventsTab';
import type { PortfolioAnalysisColumnGroupContext } from './PortfolioAnalysisColumnGroupContext';
import { describeColumnGroupContext } from './PortfolioAnalysisColumnGroupContext';
import { initialActivePeriodForScope, scopePeriod } from './periodScope';

export type PortfolioAnalysisBottomPanelTab = 'summary' | 'security' | 'events';

const MIN_PANEL_HEIGHT = 180;
const MAX_PANEL_HEIGHT = 640;

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }): JSX.Element {
  return (
    <button type="button" data-active={active} aria-pressed={active} className="portfolio-analysis-bottom-tab" onClick={onClick}>
      {label}
    </button>
  );
}

function fullPathForRow(row: PortfolioAnalysisTreeRow | null, rows: PortfolioAnalysisTreeRow[]): string {
  if (!row) return 'No row selected';

  const rowById = new Map(rows.map((candidate) => [candidate.id, candidate]));
  const path: string[] = [];
  let current: PortfolioAnalysisTreeRow | undefined = row;

  while (current) {
    path.push(String(current.label ?? current.securityKey ?? current.id));
    current = current.parentId ? rowById.get(current.parentId) : undefined;
  }

  return path.reverse().join(' / ');
}

function scopeResetKey(row: PortfolioAnalysisTreeRow | null, selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null): string {
  return [row?.id ?? '', selectedColumnGroup?.field ?? '', String(selectedColumnGroup?.period ?? '')].join('|');
}

function clampPanelHeight(value: number): number {
  const viewportMax = typeof window === 'undefined' ? MAX_PANEL_HEIGHT : Math.floor(window.innerHeight * 0.75);
  return Math.min(Math.min(MAX_PANEL_HEIGHT, viewportMax), Math.max(MIN_PANEL_HEIGHT, value));
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
  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const pathTitle = useMemo(() => fullPathForRow(selectedRow, rows), [rows, selectedRow]);
  const resetKey = useMemo(() => scopeResetKey(selectedRow, selectedColumnGroup), [selectedRow, selectedColumnGroup]);

  const selectedScopePeriod = useMemo(
    () => initialActivePeriodForScope(context, scopePeriod(context, activeTMinus, selectedColumnGroup)),
    [activeTMinus, context, selectedColumnGroup],
  );
  const [panelActiveTMinus, setPanelActiveTMinus] = useState<PortfolioAnalysisPeriodKey>(selectedScopePeriod);

  useEffect(() => {
    setPanelActiveTMinus(selectedScopePeriod);
  }, [resetKey, selectedScopePeriod]);

  const handlePanelActiveTMinusChange = (period: PortfolioAnalysisPeriodKey): void => {
    setPanelActiveTMinus(period);
    onActiveTMinusChange(period);
  };

  useEffect(() => {
    const stopResize = (): void => {
      resizeStateRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.classList.remove('portfolio-analysis-bottom-panel-resizing');
    };

    const onPointerMove = (event: PointerEvent): void => {
      const state = resizeStateRef.current;
      if (!state) return;

      const nextHeight = clampPanelHeight(state.startHeight + state.startY - event.clientY);
      onHeightChange(nextHeight);
    };

    const onPointerUp = (): void => {
      stopResize();
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        if (resizeStateRef.current) stopResize();
        else onClose();
      }
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('keydown', onKeyDown);
      stopResize();
    };
  }, [onClose, onHeightChange]);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    resizeStateRef.current = { startY: event.clientY, startHeight: clampPanelHeight(height) };
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    document.body.classList.add('portfolio-analysis-bottom-panel-resizing');
  };

  if (!open) return null;

  const period = periodCaption(context, panelActiveTMinus);
  const panelHeight = clampPanelHeight(height);

  return (
    <aside
      className="portfolio-analysis-bottom-panel"
      aria-hidden={!open}
      style={{ height: panelHeight, flexBasis: panelHeight }}
    >
      <div
        className="portfolio-analysis-bottom-resize-handle"
        role="separator"
        aria-orientation="horizontal"
        title="Drag to resize"
        onPointerDown={startResize}
      />

      <div className="portfolio-analysis-bottom-header">
        <div className="portfolio-analysis-bottom-title-zone">
          <div className="portfolio-analysis-bottom-title">Explain Drift</div>
          <div className="portfolio-analysis-bottom-subtitle" title={pathTitle}>{pathTitle}</div>
          <div className="portfolio-analysis-bottom-period">{period}</div>
          <div className="portfolio-analysis-bottom-context-chip">{describeColumnGroupContext(selectedColumnGroup)}</div>
        </div>

        <div className="portfolio-analysis-bottom-tabs" role="tablist" aria-label="Drift detail tabs">
          <TabButton active={activeTab === 'summary'} label="Summary" onClick={() => onActiveTabChange('summary')} />
          <TabButton active={activeTab === 'security'} label="Security" onClick={() => onActiveTabChange('security')} />
          <TabButton active={activeTab === 'events'} label="Events" onClick={() => onActiveTabChange('events')} />
        </div>

        <button type="button" className="portfolio-analysis-bottom-close" onClick={onClose} title="Close drift detail" aria-label="Close drift detail">
          <X size={13} strokeWidth={2} />
        </button>
      </div>

      <div className="portfolio-analysis-bottom-body">
        {!selectedRow ? <div className="portfolio-analysis-bottom-empty">Double-click a Drift cell to inspect details.</div> : null}

        {selectedRow && activeTab === 'summary' ? (
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

        {selectedRow && activeTab === 'security' ? (
          <PortfolioAnalysisSecurityTab
            selectedRow={selectedRow}
            context={context}
            activeTMinus={panelActiveTMinus}
            selectedColumnGroup={selectedColumnGroup}
            onActiveTMinusChange={handlePanelActiveTMinusChange}
            decimalSettings={decimalSettings}
            decimalMode={decimalMode}
            securitiesAvailable={securitiesAvailable}
          />
        ) : null}

        {selectedRow && activeTab === 'events' ? (
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
