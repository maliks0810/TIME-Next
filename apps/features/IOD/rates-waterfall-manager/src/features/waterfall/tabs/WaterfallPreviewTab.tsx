import { Search } from 'lucide-react';
import type { JSX, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  useRwmPortfolioOptions,
  useTreasuryInstruments,
  type RwmPortfolioOption,
  type RwmTreasuryInstrument,
} from '../../../api';
import { resolveWaterfall, sortWaterfallBuckets } from '../model/waterfallClientResolver';
import { formatWaterfallBucketRange } from '../model/waterfallFormat';
import type { WaterfallBucket, WaterfallResolvedInstrument, WaterfallSide } from '../model/waterfallTypes';
import { useWaterfallManagerStore } from '../store/waterfallManagerStore';

export function WaterfallPreviewTab(): JSX.Element {
  const { options } = useRwmPortfolioOptions();
  const treasuryInstrumentsQuery = useTreasuryInstruments();
  const graph = useWaterfallManagerStore((state) => state.graph);
  const mode = useWaterfallManagerStore((state) => state.previewMode);
  const setMode = useWaterfallManagerStore((state) => state.setPreviewMode);
  const rhs = useWaterfallManagerStore((state) => state.previewRhsGroupCode);
  const setRhs = useWaterfallManagerStore((state) => state.setPreviewRhsGroupCode);
  const key = useWaterfallManagerStore((state) => state.previewPortfolioKey);
  const setKey = useWaterfallManagerStore((state) => state.setPreviewPortfolioKey);

  const [search, setSearch] = useState('');
  const [manual, setManual] = useState('');

  const treasuryDurationBySecurity = useMemo(
    () => buildTreasuryDurationMap(treasuryInstrumentsQuery.data ?? []),
    [treasuryInstrumentsQuery.data],
  );

  const selected = options.find((option) => option.portfolioKey === key) ?? null;
  const rhsGroups = useMemo(
    () =>
      Array.from(
        new Set([
          ...options.map((option) => option.rhsGroupCode).filter(Boolean),
          ...graph.ruleSets.map((ruleSet) => ruleSet.rhsGroupCode ?? '').filter(Boolean),
        ]),
      ).sort(),
    [graph.ruleSets, options],
  );

  const rhsCode = mode === 'portfolio' ? selected?.rhsGroupCode ?? '' : rhs ?? '';
  const duration = mode === 'portfolio' ? selected?.duration ?? null : parseManualDuration(manual);
  const buy = resolveWaterfall({ graph, portfolioDuration: duration, rhsGroupCode: rhsCode, side: 'BUY' });
  const sell = resolveWaterfall({ graph, portfolioDuration: duration, rhsGroupCode: rhsCode, side: 'SELL' });

  return (
    <div className="grid gap-3">
      <div className="rwm-preview-top">
        <section className="rwm-card overflow-visible">
          <div className="flex h-9 items-center gap-3 border-b border-grey-200 px-3">
            <h2 className="font-tcw-bold text-sm text-grey-900">Preview Input</h2>
            <span className="text-[11px] text-grey-600">
              {duration === null ? 'Duration —' : `Duration ${duration.toFixed(3)}`}
            </span>
          </div>

          <div className="rwm-preview-input-grid">
            <Field label="Mode">
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as 'rhsGroup' | 'portfolio')}
                className="h-8 rounded-md border border-grey-300 bg-tcw-white px-2 text-[12px]"
              >
                <option value="rhsGroup">RHS Group</option>
                <option value="portfolio">Portfolio</option>
              </select>
            </Field>

            {mode === 'rhsGroup' ? (
              <Field label="RHS Group">
                <select
                  value={rhs ?? ''}
                  onChange={(event) => setRhs(event.target.value || null)}
                  className="h-8 w-full rounded-md border border-grey-300 bg-tcw-white px-2 text-[12px]"
                >
                  <option value="">Select RHS...</option>
                  {rhsGroups.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Picker
                options={options}
                selectedPortfolioKey={key}
                searchText={search}
                onSearchTextChange={setSearch}
                onSelectPortfolio={setKey}
              />
            )}

            <Field label="Duration">
              <input
                value={manual}
                onChange={(event) => setManual(event.target.value)}
                placeholder="8.25"
                className="h-8 w-full rounded-md border border-grey-300 px-2 text-[12px]"
              />
            </Field>
          </div>
        </section>

        <section className="rwm-card overflow-hidden">
          <div className="flex h-9 items-center justify-between border-b border-grey-200 px-3">
            <h2 className="font-tcw-bold text-sm text-grey-900">Configured Buckets</h2>
            <span className="text-[11px] text-grey-600">{buy.durationBucket?.code ?? 'No duration bucket'}</span>
          </div>

          <div className="rwm-bucket-grid">
            {sortWaterfallBuckets(graph.buckets).map((bucket) => (
              <BucketPill key={bucket.bucketId} bucket={bucket} active={bucket.bucketId === buy.durationBucket?.bucketId} />
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Resolved
          side="BUY"
          bucket={buy.durationBucket ?? null}
          instruments={buy.instruments}
          status={buy.status}
          reason={buy.reason}
          treasuryDurationBySecurity={treasuryDurationBySecurity}
        />
        <Resolved
          side="SELL"
          bucket={sell.durationBucket ?? null}
          instruments={sell.instruments}
          status={sell.status}
          reason={sell.reason}
          treasuryDurationBySecurity={treasuryDurationBySecurity}
        />
      </div>
    </div>
  );
}

function parseManualDuration(value: string): number | null {
  const parsed = Number(value || Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-grey-600">{label}</span>
      {children}
    </label>
  );
}

function BucketPill({ bucket, active }: { bucket: WaterfallBucket; active: boolean }): JSX.Element {
  return (
    <div className={active ? 'rwm-bucket-pill rwm-bucket-pill--active' : 'rwm-bucket-pill'}>
      <span className="font-medium">{bucket.code}</span> · {formatWaterfallBucketRange(bucket)}
    </div>
  );
}

function Resolved({
  side,
  bucket,
  instruments,
  status,
  reason,
  treasuryDurationBySecurity,
}: {
  side: WaterfallSide;
  bucket: WaterfallBucket | null;
  instruments: WaterfallResolvedInstrument[];
  status: string;
  reason?: string;
  treasuryDurationBySecurity: Map<string, number>;
}): JSX.Element {
  return (
    <section className="rwm-card overflow-hidden">
      <div className="flex h-9 items-center justify-between border-b border-grey-200 px-3">
        <h2 className={side === 'BUY' ? 'font-tcw-bold text-sm text-tcw-green' : 'font-tcw-bold text-sm text-tcw-plum'}>
          {side} Waterfall
        </h2>
        <span className="text-[11px] text-grey-600">{bucket?.code ?? '—'}</span>
      </div>

      <div className="p-3">
        <div className="mb-2 text-[12px] text-grey-600">
          {status === 'RESOLVED' ? `${instruments.length} instruments` : reason}
        </div>

        {instruments.length === 0 ? (
          <div className="rounded-md border border-dashed border-grey-300 bg-grey-100 px-3 py-2 text-[11px] italic text-grey-600">
            No resolved instruments.
          </div>
        ) : (
          <div className="space-y-1">
            {instruments.map((instrument, index) => (
              <div
                key={`${instrument.securityId}-${index}`}
                className="grid grid-cols-[32px_minmax(0,1fr)_72px_80px] gap-2 rounded-md border border-grey-200 px-3 py-2 text-[12px]"
              >
                <span className="text-grey-500">{index + 1}</span>
                <span className="truncate font-medium text-grey-900">{instrument.securityId}</span>
                <span className="text-right text-grey-600">
                  {formatDuration(getInstrumentDuration(instrument, treasuryDurationBySecurity))}
                </span>
                <span className="text-right text-grey-600">{instrument.instrumentType}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Picker({
  options,
  selectedPortfolioKey,
  searchText,
  onSearchTextChange,
  onSelectPortfolio,
}: {
  options: RwmPortfolioOption[];
  selectedPortfolioKey: string | null;
  searchText: string;
  onSearchTextChange: (value: string) => void;
  onSelectPortfolio: (value: string | null) => void;
}): JSX.Element {
  const selected = options.find((option) => option.portfolioKey === selectedPortfolioKey);
  const filtered = options.filter((option) => option.searchText.includes(searchText.trim().toLowerCase())).slice(0, 20);

  return (
    <div className="rwm-typeahead-container space-y-2">
      <Field label="Portfolio">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-grey-500" />
          <input
            value={selected ? selected.portfolioKey : searchText}
            onChange={(event) => {
              onSearchTextChange(event.target.value);
              if (selectedPortfolioKey) onSelectPortfolio(null);
            }}
            placeholder="Type portfolio key or RHS group..."
            className="h-8 w-full rounded-md border border-grey-300 bg-tcw-white pl-8 pr-2 text-[12px]"
          />
        </div>
      </Field>

      {searchText && !selected && (
        <div className="rwm-typeahead-menu">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-grey-600">No matching portfolios.</div>
          ) : (
            filtered.map((option) => (
              <button
                key={option.portfolioKey}
                type="button"
                onClick={() => {
                  onSelectPortfolio(option.portfolioKey);
                  onSearchTextChange('');
                }}
                className="block w-full px-3 py-2 text-left hover:bg-tcw-blue-100"
              >
                <div className="font-medium text-grey-900">{option.portfolioKey}</div>
                <div className="text-[11px] text-grey-600">RHS {option.rhsGroupCode || '—'}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function buildTreasuryDurationMap(rows: RwmTreasuryInstrument[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const row of rows) {
    const duration = toNumberOrNull(row.duration ?? row.effectiveDuration);
    if (duration === null) continue;

    for (const key of [row.securityKey, row.securityId, row.cusip]) {
      const normalized = normalizeKey(key);
      if (normalized) map.set(normalized, duration);
    }
  }

  return map;
}

function getInstrumentDuration(
  instrument: WaterfallResolvedInstrument,
  treasuryDurationBySecurity: Map<string, number>,
): number | null {
  const anyInstrument = instrument as WaterfallResolvedInstrument & {
    duration?: number | null;
    effectiveDuration?: number | null;
    securityKey?: string | null;
    cusip?: string | null;
  };

  const direct = toNumberOrNull(anyInstrument.duration ?? anyInstrument.effectiveDuration);
  if (direct !== null) return direct;

  for (const key of [instrument.securityId, anyInstrument.securityKey, anyInstrument.cusip]) {
    const normalized = normalizeKey(key);
    if (!normalized) continue;

    const duration = treasuryDurationBySecurity.get(normalized);
    if (duration !== undefined) return duration;
  }

  return null;
}

function normalizeKey(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

function toNumberOrNull(value: unknown): number | null {
  const parsed = Number(value ?? Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDuration(value: number | null | undefined): string {
  return value == null ? '—' : Number.isFinite(value) ? value.toFixed(3) : '—';
}

export default WaterfallPreviewTab;
