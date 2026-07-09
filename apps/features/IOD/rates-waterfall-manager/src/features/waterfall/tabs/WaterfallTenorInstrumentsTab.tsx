import { Search } from 'lucide-react';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useTreasuryInstruments, type RwmTreasuryInstrument } from '../../../api';
import { cn } from '../../../ui/utils';
import { deriveTenorBucketFromInstrumentDuration, sortWaterfallBuckets } from '../model/waterfallClientResolver';
import { formatWaterfallBucketRange } from '../model/waterfallFormat';
import type { WaterfallInstrumentType, WaterfallSide } from '../model/waterfallTypes';
import { useWaterfallManagerStore } from '../store/waterfallManagerStore';

type CandidateInstrument = RwmTreasuryInstrument & {
  securityId: string;
  cusip?: string | null;
  description: string | null;
  duration: number | null;
  effectiveDuration?: number | null;
  instrumentType: WaterfallInstrumentType;
};

type ConfiguredInstrument = {
  securityId: string;
  cusip?: string | null;
  description?: string | null;
  duration?: number | null;
  effectiveDuration?: number | null;
  securityKey?: string | null;
  instrumentType: WaterfallInstrumentType;
  displayOrder?: number | null;
};

type TenorInstrumentBucket = {
  side: WaterfallSide;
  bucketId: number;
  instruments: ConfiguredInstrument[];
};

const SIDES: WaterfallSide[] = ['BUY', 'SELL'];

export function WaterfallTenorInstrumentsTab(): JSX.Element {
  const buckets = useWaterfallManagerStore((state) => state.graph.buckets);
  const instrumentBuckets = useWaterfallManagerStore((state) => state.graph.tenorInstrumentBuckets) as TenorInstrumentBucket[];
  const selectedSide = useWaterfallManagerStore((state) => state.selectedSide);
  const setSelectedSide = useWaterfallManagerStore((state) => state.setSelectedSide);
  const addInstrumentFromTreasury = useWaterfallManagerStore((state) => state.addInstrumentFromTreasury);
  const removeInstrument = useWaterfallManagerStore((state) => state.removeInstrument);
  const moveInstrument = useWaterfallManagerStore((state) => state.moveInstrument);

  const [query, setQuery] = useState('');
  const treasuryInstrumentsQuery = useTreasuryInstruments();

  const orderedBuckets = sortWaterfallBuckets(buckets);
  const treasuryDurationBySecurity = useMemo(
    () => buildTreasuryDurationMap(treasuryInstrumentsQuery.data ?? []),
    [treasuryInstrumentsQuery.data],
  );
  const candidateInstruments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return (treasuryInstrumentsQuery.data ?? [])
      .map(mapTreasuryInstrument)
      .filter((instrument): instrument is CandidateInstrument => Boolean(instrument))
      .filter((instrument) => {
        if (!normalizedQuery) return true;
        return `${instrument.securityId} ${instrument.cusip ?? ''} ${instrument.description ?? ''}`.toLowerCase().includes(normalizedQuery);
      })
      .slice(0, 10);
  }, [query, treasuryInstrumentsQuery.data]);

  return (
    <div className="rwm-candidate-layout">
      <section className="waterfall-card rwm-candidate-card">
        <div className="rwm-section-title-bar border-b border-grey-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="rwm-section-heading">CANDIDATES</div>
            </div>
            <SideSwitch selectedSide={selectedSide} onChange={setSelectedSide} />
          </div>
          <div className="rwm-typeahead-container mt-2">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-grey-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search instruments..."
              className="h-8 w-full rounded-md border border-grey-300 bg-tcw-white pl-8 pr-2 text-[12px] outline-none focus:border-tcw-blue"
            />
          </div>
        </div>

        <div className="rwm-candidate-list">
          {candidateInstruments.map((instrument) => {
            const bucket = deriveTenorBucketFromInstrumentDuration(instrument.duration, buckets);
            const disabled = !bucket;

            return (
              <button
                key={`${instrument.securityId}-${instrument.cusip ?? ''}`}
                type="button"
                disabled={disabled}
                onClick={() => addInstrumentFromTreasury(selectedSide, instrument)}
                className="rwm-candidate-row disabled:cursor-not-allowed disabled:opacity-45"
              >
                <div className="rwm-candidate-row-main">
                  <span className="rwm-candidate-security-key" title={instrument.securityId}>
                    {instrument.securityId}
                  </span>
                  <span className="rwm-candidate-duration">Dur {formatDuration(instrument.duration)}</span>
                </div>
                <div className="rwm-candidate-row-sub">
                  <span className="rwm-candidate-description" title={instrument.description ?? ''}>
                    {instrument.description || '-'}
                  </span>
                  <span className="rwm-candidate-bucket">{bucket ? bucket.code : 'No bucket'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="waterfall-card rwm-candidate-card">
        <div className="rwm-section-title-bar border-b border-grey-200">
          <div className="rwm-section-title-with-tag">
            <span className="rwm-section-heading">INSTRUMENT BUCKETS</span>
            <span className={cn('rwm-side-title-tag', selectedSide === 'BUY' ? 'rwm-side-title-tag--buy' : 'rwm-side-title-tag--sell')}>
              {selectedSide}
            </span>
          </div>
        </div>

        <div className="overflow-auto p-3">
          <div className="grid gap-3 xl:grid-cols-2">
            {orderedBuckets.map((bucket) => {
              const configuredBucket = instrumentBuckets.find((candidate) => candidate.side === selectedSide && candidate.bucketId === bucket.bucketId);
              const instruments = [...(configuredBucket?.instruments ?? [])].sort(
                (a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0),
              );

              return (
                <div key={`${selectedSide}-${bucket.bucketId}`} className="overflow-hidden rounded-lg border border-grey-200 bg-tcw-white">
                  <div className="rwm-instrument-bucket-header">
                    <div className="rwm-instrument-bucket-title-line">
                      <span className="truncate text-[11px] font-medium text-grey-900">{bucket.code}</span>
                      <span className="truncate text-[10.5px] text-grey-600">{formatWaterfallBucketRange(bucket)}</span>
                    </div>
                  </div>

                  {instruments.length === 0 ? (
                    <div className="p-3 text-[11px] italic text-grey-600">No instruments configured.</div>
                  ) : (
                    <div className="divide-y divide-grey-200">
                      {instruments.map((instrument, index) => (
                        <div key={`${instrument.securityId}-${index}`} className="rwm-bucket-instrument-row">
                          <span className="text-right text-[10.5px] text-grey-500">{index + 1}</span>
                          <span className="truncate font-medium text-grey-900" title={instrument.securityId}>
                            {instrument.securityId}
                          </span>
                          <span className="truncate text-grey-600" title={instrument.description ?? ''}>
                            {instrument.description || '-'}
                          </span>
                          <span className="text-right text-grey-700">
                            Dur: {formatDuration(getInstrumentDuration(instrument, treasuryDurationBySecurity))}
                          </span>
                          <span className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Move up"
                              className="rwm-bucket-order-button"
                              disabled={index === 0}
                              onClick={() => moveInstrument(selectedSide, bucket.bucketId, instrument.securityId, 'up')}
                            >
                              ^
                            </button>
                            <button
                              type="button"
                              title="Move down"
                              className="rwm-bucket-order-button"
                              disabled={index === instruments.length - 1}
                              onClick={() => moveInstrument(selectedSide, bucket.bucketId, instrument.securityId, 'down')}
                            >
                              v
                            </button>
                            <button
                              type="button"
                              title="Remove instrument"
                              className="rwm-bucket-order-button"
                              onClick={() => removeInstrument(selectedSide, bucket.bucketId, instrument.securityId)}
                            >
                              x
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function SideSwitch({ selectedSide, onChange }: { selectedSide: WaterfallSide; onChange: (side: WaterfallSide) => void }): JSX.Element {
  return (
    <div className="rwm-side-switch rwm-side-switch-strong">
      {SIDES.map((side) => (
        <button
          key={side}
          type="button"
          onClick={() => onChange(side)}
          className={cn(
            'rwm-side-switch-button',
            selectedSide === side && side === 'BUY' && 'rwm-side-switch-button--buy-active',
            selectedSide === side && side === 'SELL' && 'rwm-side-switch-button--sell-active',
          )}
        >
          {side}
        </button>
      ))}
    </div>
  );
}

function mapTreasuryInstrument(row: RwmTreasuryInstrument): CandidateInstrument | null {
  const source = row as RwmTreasuryInstrument & {
    assetType?: unknown;
    securityDescription?: unknown;
    securityType?: unknown;
  };
  const securityId = normalizeText(source.securityId ?? source.securityKey);
  if (!securityId) return null;

  const duration = toNumberOrNull(source.duration ?? source.effectiveDuration);
  const instrumentType = normalizeInstrumentType(source.instrumentType ?? source.assetType ?? source.securityType);

  return {
    ...row,
    securityId,
    cusip: normalizeText(source.cusip),
    description: normalizeText(source.description ?? source.securityDescription),
    duration,
    instrumentType,
  };
}

function normalizeInstrumentType(value: unknown): WaterfallInstrumentType {
  const normalized = String(value ?? '').trim().toUpperCase();
  return normalized.includes('FUT') ? 'FUTURES' : 'BOND';
}

function getInstrumentDuration(instrument: ConfiguredInstrument, treasuryDurationBySecurity: Map<string, number>): number | null {
  const directDuration = toNumberOrNull(instrument.duration ?? instrument.effectiveDuration);
  if (directDuration !== null) return directDuration;

  for (const key of [instrument.securityId, instrument.securityKey, instrument.cusip]) {
    const normalized = normalizeKey(key);
    if (!normalized) continue;

    const duration = treasuryDurationBySecurity.get(normalized);
    if (duration !== undefined) return duration;
  }

  return null;
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

function normalizeKey(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim();
}

function toNumberOrNull(value: unknown): number | null {
  const parsed = Number(value ?? Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDuration(value: number | null | undefined): string {
  return value == null ? '-' : Number.isFinite(value) ? value.toFixed(3) : '-';
}

export default WaterfallTenorInstrumentsTab;
