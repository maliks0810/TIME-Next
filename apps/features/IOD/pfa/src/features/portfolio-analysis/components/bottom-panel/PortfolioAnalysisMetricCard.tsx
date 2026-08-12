import type { JSX } from 'react';

type PortfolioAnalysisMetricCardProps = {
  label: string;
  value: string;
  tone?: number | null;
  title?: string;
};

function toneClass(value: number | null | undefined): string {
  if (typeof value !== 'number' || value === 0) return 'text-grey-900';
  return value > 0 ? 'text-tcw-green' : 'text-tcw-plum';
}

export function PortfolioAnalysisMetricCard({ label, value, tone, title }: PortfolioAnalysisMetricCardProps): JSX.Element {
  return (
    <div className="portfolio-analysis-bottom-card" title={title}>
      <div className="portfolio-analysis-bottom-card-label">{label}</div>
      <div className={`portfolio-analysis-bottom-card-value ${toneClass(tone)}`}>{value || '—'}</div>
    </div>
  );
}
