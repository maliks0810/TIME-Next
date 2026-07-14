import type { PortfolioAnalysisBottomPanelTab } from '../bottom-panel';
import type {
  PortfolioAnalysisColumnGroupContext,
  PortfolioAnalysisColumnGroupKind,
} from '../bottom-panel';
import { preferredTabForColumnGroup } from '../bottom-panel';

export type PortfolioAnalysisGridCellInfo = {
  dataField?: string;
  caption?: string;
  ownerBand?: string;
};

function normalize(value: string | undefined): string {
  return (value ?? '').toLowerCase();
}

export function inferPortfolioAnalysisColumnGroup(
  cell: PortfolioAnalysisGridCellInfo,
): PortfolioAnalysisColumnGroupContext {
  const dataField = normalize(cell.dataField);
  const caption = normalize(cell.caption);
  const ownerBand = normalize(cell.ownerBand);
  const haystack = `${dataField} ${caption} ${ownerBand}`;

  let kind: PortfolioAnalysisColumnGroupKind = 'unknown';
  let label = 'Selection';

  if (haystack.includes('trade') || haystack.includes('cashflow') || haystack.includes('event')) {
    kind = 'events';
    label = 'Events';
  } else if (haystack.includes('security') || haystack.includes('oas') || haystack.includes('krd') || haystack.includes('price')) {
    kind = 'securityAnalytics';
    label = 'Security Analytics';
  } else if (haystack.includes('position') || haystack.includes('mv') || haystack.includes('par') || haystack.includes('dur contrib')) {
    kind = 'positionMovement';
    label = 'Position Movement';
  } else if (haystack.includes('drift') || haystack.includes('delta') || haystack.includes('Δ')) {
    kind = 'breakdown';
    label = 'Breakdown';
  } else if (ownerBand.includes('t-') || dataField.includes('prior')) {
    kind = 'priorValue';
    label = 'Prior Value';
  } else if (ownerBand.includes('t') || dataField.includes('current')) {
    kind = 'currentValue';
    label = 'Current Value';
  }

  return { kind, label, field: cell.dataField };
}

export function bottomPanelTabForGridCell(
  cell: PortfolioAnalysisGridCellInfo,
): PortfolioAnalysisBottomPanelTab {
  return preferredTabForColumnGroup(inferPortfolioAnalysisColumnGroup(cell));
}

export function columnGroupClassName(
  context: PortfolioAnalysisColumnGroupContext | null | undefined,
): string {
  return context ? `portfolio-analysis-selected-column-group-${context.kind}` : '';
}

export function isSameColumnGroup(
  selected: PortfolioAnalysisColumnGroupContext | null | undefined,
  candidate: PortfolioAnalysisColumnGroupContext | null | undefined,
): boolean {
  if (!selected || !candidate) return false;
  if (selected.kind !== candidate.kind) return false;

  // For recognized semantic groups, group by kind. For unknown groups, fall back to exact field.
  if (selected.kind !== 'unknown') return true;
  return selected.field === candidate.field;
}
