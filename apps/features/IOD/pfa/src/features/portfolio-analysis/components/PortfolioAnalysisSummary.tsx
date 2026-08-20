import type { JSX } from 'react';
import { chip } from '../domain/dates';
import { fmtMoney, fmtNumber } from '../domain/format';
import type { PortfolioAnalysisContext } from '../types';

function valueFrom(record: Record<string, unknown> | undefined, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
}

function Meta({ label, value }: { label: string; value: string }): JSX.Element | null {
  if (!value) return null;
  return (
    <span className="portfolio-analysis-summary-metric">
      <span className="portfolio-analysis-summary-metric-label">{label}</span>
      <span className="portfolio-analysis-summary-metric-value">{value}</span>
    </span>
  );
}

function KrdText({ portfolio }: { portfolio: Record<string, unknown> | undefined }): JSX.Element | null {
  const k2 = valueFrom(portfolio, ['dur3Mo2Yr', 'krd2YrBucket', 'krd2YrBucketContribution']);
  const k5 = valueFrom(portfolio, ['dur5Yr', 'krd5YrBucket', 'krd5YrBucketContribution']);
  const k10 = valueFrom(portfolio, ['dur10Yr', 'krd10YrBucket', 'krd10YrBucketContribution']);
  const k30 = valueFrom(portfolio, ['dur20Yr30Yr', 'krd30YrBucket', 'krd30YrBucketContribution']);
  const parts = [
    k2 == null ? '' : `2Y ${fmtNumber(k2)}`,
    k5 == null ? '' : `5Y ${fmtNumber(k5)}`,
    k10 == null ? '' : `10Y ${fmtNumber(k10)}`,
    k30 == null ? '' : `30Y ${fmtNumber(k30)}`,
  ].filter(Boolean);
  if (!parts.length) return null;
  return <Meta label="KRD" value={parts.join(' ')} />;
}

export function PortfolioAnalysisSummary({ context }: { context: PortfolioAnalysisContext }): JSX.Element {
  const current = context.snapshots[0];
  const metadata = current?.metadata;
  const portfolio = current?.portfolio as Record<string, unknown> | undefined;
  const dur = valueFrom(portfolio, ['dur', 'duration']);
  const futureText = context.futureEligible == null ? '' : context.futureEligible ? 'Y' : 'N';

  return (
    <div className="portfolio-analysis-summary-shell">
      <div className="portfolio-analysis-summary-strip">
        <div className="portfolio-analysis-summary-title-zone">
          <div className="portfolio-analysis-summary-title">Portfolio Analyzer</div>
        </div>
        <div className="portfolio-analysis-summary-context-strip">
          <span className="portfolio-analysis-summary-context-badge portfolio-analysis-summary-context-badge--portfolio-identity">
            {context.portfolioKey}
            {context.portfolioName ? ` / ${context.portfolioName}` : ''}
          </span>
          <span className="portfolio-analysis-summary-context-badge portfolio-analysis-summary-context-badge--drift">
            Drift {chip(0)} vs {chip(context.comparisonTMinus)}
          </span>
        </div>
        <div className="portfolio-analysis-summary-meta portfolio-analysis-summary-meta--info">
          <Meta label="Benchmark" value={context.benchmarkCode ?? ''} />
          <Meta label="PF Group" value={context.portfolioGroup ?? ''} />
          <Meta label="RHS Group" value={context.rhsGroup ?? ''} />
          <Meta label="Future" value={futureText} />
          <Meta label="MV" value={fmtMoney(metadata?.mv)} />
          <Meta label="DUR" value={fmtNumber(dur)} />
          <KrdText portfolio={portfolio} />
        </div>
      </div>
    </div>
  );
}
