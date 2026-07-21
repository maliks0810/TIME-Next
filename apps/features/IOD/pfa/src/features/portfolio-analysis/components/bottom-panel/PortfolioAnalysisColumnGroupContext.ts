import type { PortfolioAnalysisBottomPanelTab } from './PortfolioAnalysisBottomPanel';

export type PortfolioAnalysisColumnGroupKind =
  | 'breakdown'
  | 'childContributors'
  | 'positionMovement'
  | 'securityAnalytics'
  | 'events'
  | 'currentValue'
  | 'priorValue'
  | 'unknown';

export type PortfolioAnalysisColumnGroupContext = {
  kind: PortfolioAnalysisColumnGroupKind;
  label: string;
  field?: string;
  period?: number | 'total';
};

export function preferredTabForColumnGroup(
  context: PortfolioAnalysisColumnGroupContext | null | undefined,
): PortfolioAnalysisBottomPanelTab {
  if (!context) return 'summary';
  if (context.kind === 'securityAnalytics' || context.kind === 'positionMovement') return 'security';
  if (context.kind === 'events') return 'events';
  return 'summary';
}

export function describeColumnGroupContext(
  context: PortfolioAnalysisColumnGroupContext | null | undefined,
): string {
  return context?.label ?? 'Selection';
}
