import { useState, type JSX, type ReactNode } from 'react';
import type { DecimalMode, DecimalSettings } from '../domain/format';
import { DEFAULT_DECIMAL_SETTINGS } from '../domain/format';
import type { PortfolioAnalysisContext } from '../types';
import { PortfolioAnalysisSummary } from './PortfolioAnalysisSummary';
import { PortfolioAnalysisToolbar } from './PortfolioAnalysisToolbar';
import { PortfolioAnalysisContent } from './PortfolioAnalysisContent';
import '../styles/portfolio-analysis-overrides.css';
import '../styles/pfa-toolbar-selector.css';

export type PortfolioAnalysisColumnGroupId = 'mv' | 'par' | 'dur' | 'drift';
export type PortfolioAnalysisColumnGroupVisibility = Record<PortfolioAnalysisColumnGroupId, boolean>;

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
}: {
  context: PortfolioAnalysisContext;
  onBack?: () => void;
  backLabel?: string;
  toolbarLeftContent?: ReactNode;
  portfolioSelectorCaption?: string;
}): JSX.Element {
  const [securitySearchQuery, setSecuritySearchQuery] = useState('');
  const [decimalSettings, setDecimalSettings] = useState<DecimalSettings>(DEFAULT_DECIMAL_SETTINGS);
  const [decimalMode, setDecimalMode] = useState<DecimalMode>('round');
  const [columnGroups, setColumnGroups] = useState<PortfolioAnalysisColumnGroupVisibility>(DEFAULT_COLUMN_GROUPS);

  return (
    <div className="portfolio-analysis-page flex h-full min-h-0 flex-col bg-grey-100">
      <section className="portfolio-analysis-page-header">
        <PortfolioAnalysisSummary context={context} />
      </section>
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
          onBack={onBack}
          backLabel={backLabel}
          leftContent={toolbarLeftContent}
          leftContentCaption={portfolioSelectorCaption}
        />
      </section>
      <PortfolioAnalysisContent
        context={context}
        searchQuery={securitySearchQuery}
        decimalSettings={decimalSettings}
        decimalMode={decimalMode}
        columnGroups={columnGroups}
      />
    </div>
  );
}
