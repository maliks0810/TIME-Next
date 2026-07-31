import { ArrowLeft, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type JSX, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { PortfolioAnalysisContext } from '../types';
import type { DecimalMode, DecimalSettings } from '../domain/format';
import { normalizeDecimalPlaces } from '../domain/format';
import type { PortfolioAnalysisColumnGroupId, PortfolioAnalysisColumnGroupVisibility } from './PortfolioAnalysisPage';

type DecimalKey = keyof DecimalSettings;
type MenuPosition = { top: number; left: number; width: number };

type PortfolioAnalysisToolbarProps = {
  context: PortfolioAnalysisContext;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  decimalSettings: DecimalSettings;
  onDecimalSettingsChange: (value: DecimalSettings) => void;
  decimalMode: DecimalMode;
  onDecimalModeChange: (value: DecimalMode) => void;
  columnGroups: PortfolioAnalysisColumnGroupVisibility;
  onColumnGroupsChange: (value: PortfolioAnalysisColumnGroupVisibility) => void;
  benchmarkEnabled: boolean;
  onBenchmarkEnabledChange: (value: boolean) => void;
  onBack?: () => void;
  backLabel?: string;
  leftContent?: ReactNode;
  leftContentCaption?: string;
};

const COLUMN_GROUPS: Array<{ id: PortfolioAnalysisColumnGroupId; label: string; title: string }> = [
  { id: 'mv', label: 'MV', title: 'Show MV%, MV, and Δ MV columns.' },
  { id: 'par', label: 'PAR', title: 'Show PAR and Δ PAR columns.' },
  { id: 'dur', label: 'DUR', title: 'Show duration contribution and Δ Dur columns.' },
  { id: 'drift', label: 'DRIFT', title: 'Show trades, cashflows, and drift columns.' },
];

function setDecimal(settings: DecimalSettings, key: DecimalKey, value: number): DecimalSettings {
  return { ...settings, [key]: normalizeDecimalPlaces(value) };
}

function DecimalInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }): JSX.Element {
  return (
    <label className="portfolio-analysis-decimal-menu-row">
      <span className="portfolio-analysis-decimal-menu-label">{label}</span>
      <input type="number" min={0} max={8} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function SegmentOption({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      data-active={active}
      aria-pressed={active}
      className="portfolio-analysis-toolbar-segment-option"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function GroupPill({ active, label, title, onClick }: { active: boolean; label: string; title: string; onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      title={title}
      data-active={active}
      aria-pressed={active}
      className="portfolio-analysis-group-pill"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function PortfolioAnalysisToolbar({
  searchQuery,
  onSearchQueryChange,
  decimalSettings,
  onDecimalSettingsChange,
  decimalMode,
  onDecimalModeChange,
  columnGroups,
  onColumnGroupsChange,
  benchmarkEnabled,
  onBenchmarkEnabledChange,
  onBack,
  backLabel = 'Back',
  leftContent,
}: PortfolioAnalysisToolbarProps): JSX.Element {
  const [decimalMenuOpen, setDecimalMenuOpen] = useState(false);
  const [decimalMenuPosition, setDecimalMenuPosition] = useState<MenuPosition | null>(null);
  const decimalButtonRef = useRef<HTMLButtonElement | null>(null);
  const decimalMenuRef = useRef<HTMLDivElement | null>(null);

  const updateDecimalMenuPosition = (): void => {
    const rect = decimalButtonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDecimalMenuPosition({
      top: rect.bottom + 4,
      left: Math.max(8, rect.left),
      width: 292,
    });
  };

  useLayoutEffect(() => {
    if (decimalMenuOpen) updateDecimalMenuPosition();
  }, [decimalMenuOpen, decimalSettings, decimalMode]);

  useEffect(() => {
    if (!decimalMenuOpen) return;
    const closeOnOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (decimalButtonRef.current?.contains(target) || decimalMenuRef.current?.contains(target)) return;
      setDecimalMenuOpen(false);
    };
    const updateOnResize = (): void => updateDecimalMenuPosition();
    document.addEventListener('mousedown', closeOnOutside);
    window.addEventListener('resize', updateOnResize);
    window.addEventListener('scroll', updateOnResize, true);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      window.removeEventListener('resize', updateOnResize);
      window.removeEventListener('scroll', updateOnResize, true);
    };
  }, [decimalMenuOpen]);

  const toggleColumnGroup = (id: PortfolioAnalysisColumnGroupId): void => {
    onColumnGroupsChange({ ...columnGroups, [id]: !columnGroups[id] });
  };

  const decimalLabel = `Decimal | M${decimalSettings.money} C${decimalSettings.contrib} Q${decimalSettings.qty} P${decimalSettings.pct}`;

  return (
    <div data-portfolio-analysis-toolbar-root className="portfolio-analysis-toolbar">
      <div className="portfolio-analysis-toolbar-left portfolio-analysis-toolbar-left--wide">
        {onBack ? (
          <button type="button" onClick={onBack} className="portfolio-analysis-toolbar-back-button" title={backLabel}>
            <ArrowLeft size={14} strokeWidth={2} />
            {backLabel}
          </button>
        ) : null}
        {leftContent ? (
          <div className="portfolio-analysis-toolbar-left-content">
            {leftContent}
          </div>
        ) : null}
      </div>

      <div className="portfolio-analysis-toolbar-center">
        <div className="portfolio-analysis-column-groups" aria-label="Column groups">
          {COLUMN_GROUPS.map((group) => (
            <GroupPill
              key={group.id}
              active={columnGroups[group.id]}
              label={group.label}
              title={group.title}
              onClick={() => toggleColumnGroup(group.id)}
            />
          ))}
          <GroupPill
            active={benchmarkEnabled}
            label="BM"
            title="Show benchmark positions and benchmark columns."
            onClick={() => onBenchmarkEnabledChange(!benchmarkEnabled)}
          />
        </div>
        <div className="portfolio-analysis-toolbar-divider" />
        <button
          ref={decimalButtonRef}
          type="button"
          className="portfolio-analysis-toolbar-button portfolio-analysis-decimal-trigger"
          onClick={() => setDecimalMenuOpen((open) => !open)}
          aria-expanded={decimalMenuOpen}
          title="Decimal display settings"
        >
          {decimalLabel}
          <ChevronDown size={12} strokeWidth={2} />
        </button>
        {decimalMenuOpen && decimalMenuPosition
          ? createPortal(
              <div
                ref={decimalMenuRef}
                className="pfa-toolbar-menu monitor-v2-date-menu portfolio-analysis-decimal-menu"
                style={{ top: decimalMenuPosition.top, left: decimalMenuPosition.left, width: decimalMenuPosition.width }}
              >
                <div className="portfolio-analysis-decimal-menu-title">Decimal display</div>
                <div className="portfolio-analysis-decimal-menu-grid">
                  <DecimalInput
                    label="Money"
                    value={decimalSettings.money}
                    onChange={(value) => onDecimalSettingsChange(setDecimal(decimalSettings, 'money', value))}
                  />
                  <DecimalInput
                    label="Contrib"
                    value={decimalSettings.contrib}
                    onChange={(value) => onDecimalSettingsChange(setDecimal(decimalSettings, 'contrib', value))}
                  />
                  <DecimalInput
                    label="Qty"
                    value={decimalSettings.qty}
                    onChange={(value) => onDecimalSettingsChange(setDecimal(decimalSettings, 'qty', value))}
                  />
                  <DecimalInput
                    label="Pct"
                    value={decimalSettings.pct}
                    onChange={(value) => onDecimalSettingsChange(setDecimal(decimalSettings, 'pct', value))}
                  />
                </div>
                <div className="portfolio-analysis-decimal-menu-divider" />
                <div className="portfolio-analysis-toolbar-segment portfolio-analysis-decimal-mode-segment">
                  <SegmentOption active={decimalMode === 'round'} label="Round" onClick={() => onDecimalModeChange('round')} />
                  <SegmentOption active={decimalMode === 'truncate'} label="Truncate" onClick={() => onDecimalModeChange('truncate')} />
                </div>
              </div>,
              document.body,
            )
          : null}
      </div>

      <div className="portfolio-analysis-toolbar-right">
        <div className="portfolio-analysis-search">
          <Search size={13} strokeWidth={2} className="portfolio-analysis-search-icon" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search security"
            className="portfolio-analysis-search-input"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchQueryChange('')}
              aria-label="Clear security search"
              title="Clear"
              className="portfolio-analysis-search-clear"
            >
              <X size={12} strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
