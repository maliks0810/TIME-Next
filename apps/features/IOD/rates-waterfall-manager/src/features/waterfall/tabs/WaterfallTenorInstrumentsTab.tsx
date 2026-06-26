import { Search } from 'lucide-react';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useTreasuryInstruments, type RwmTreasuryInstrument } from '../../../api';
import { cn } from '../../../ui/utils';
import { deriveTenorBucketFromInstrumentDuration, sortWaterfallBuckets } from '../model/waterfallClientResolver';
import { formatWaterfallBucketRange } from '../model/waterfallFormat';
import type { WaterfallBucket, WaterfallInstrumentType, WaterfallSide } from '../model/waterfallTypes';
import { useWaterfallManagerStore } from '../store/waterfallManagerStore';

type CandidateInstrument = RwmTreasuryInstrument & {
  securityId: string;
  cusip?: string | null;
  description: string | null;
  duration: number | null;
  instrumentType: WaterfallInstrumentType;
};

export function WaterfallTenorInstrumentsTab(): JSX.Element {
  const buckets = useWaterfallManagerStore((state) => state.graph.buckets);
  const instrumentBuckets = useWaterfallManagerStore((state) => state.graph.tenorInstrumentBuckets);
  const selectedSide = useWaterfallManagerStore((state) => state.selectedSide);
  const setSelectedSide = useWaterfallManagerStore((state) => state.setSelectedSide);
  const addInstrumentFromTreasury = useWaterfallManagerStore((state) => state.addInstrumentFromTreasury);
  const removeInstrument = useWaterfallManagerStore((state) => state.removeInstrument);
  const moveInstrument = useWaterfallManagerStore((state) => state.moveInstrument);

  const [query, setQuery] = useState('');
  const treasuryInstrumentsQuery = useTreasuryInstruments();

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
      <aside className="rwm-card rwm-candidate-card">
        <div className="shrink-0 border-b border-grey-200 px-4 py-3">
          <h2 className="font-tcw-bold text-sm text-grey-900">Candidate Instruments</h2>
          <div className="mt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-grey-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search instruments..."
                className="h-8 w-full rounded-md border border-grey-300 bg-tcw-white pl-8 pr-2 text-[12px] outline-none focus:border-tcw-blue"
              />
            </div>
          </div>
          <SideSwitch selectedSide={selectedSide} onChange={setSelectedSide} />
        </div>

        <div className="rwm-candidate-list">
          {candidateInstruments.map((instrument) => {
            const bucket = deriveTenorBucketFromInstrumentDuration(instrument.duration, buckets);
            return (
              <button
                key={`${instrument.securityId}-${instrument.instrumentType}`}
                type="button"
                disabled={!bucket}
                onClick={() => addInstrumentFromTreasury(selectedSide, instrument)}
                className="rwm-candidate-row disabled:cursor-not-allowed disabled:opacity-45"
              >
                <div className="flex items-center justify-between gap-2 leading-tight">
                  <span className="truncate font-medium text-grey-900">{instrument.securityId}</span>
                  <span className={cn('shrink-0 text-[10px]', instrument.instrumentType === 'FUTURES' ? 'text-tcw-green' : 'text-tcw-blue')}>
                    {instrument.instrumentType}
                  </span>
                </div>
                <div className="mt-0.5 flex min-w-0 items-center justify-between gap-2 text-[10.5px] leading-tight">
                  <span className="truncate text-grey-600">{instrument.description}</span>
                  <span className="shrink-0 text-grey-500">
                    Dur {instrument.duration?.toFixed?.(3) ?? '—'} · {bucket?.code ?? 'No match'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="rwm-card min-h-0 overflow-hidden">
        <div className="rwm-section-title-bar">
          <h2 className="font-tcw-bold text-sm text-grey-900">Instrument Buckets</h2>
        </div>
        <div className="grid min-h-0 gap-4 overflow-auto p-4 xl:grid-cols-2">
          <SideBucketColumn
            side="BUY"
            buckets={sortWaterfallBuckets(buckets)}
            instrumentBuckets={instrumentBuckets}
            onRemove={removeInstrument}
            onMove={moveInstrument}
          />
          <SideBucketColumn
            side="SELL"
            buckets={sortWaterfallBuckets(buckets)}
            instrumentBuckets={instrumentBuckets}
            onRemove={removeInstrument}
            onMove={moveInstrument}
          />
        </div>
      </section>
    </div>
  );
}

function SideSwitch({ selectedSide, onChange }: { selectedSide: WaterfallSide; onChange: (side: WaterfallSide) => void }): JSX.Element {
  return (
    <div className="rwm-side-switch rwm-side-switch-strong mt-2" aria-label="Candidate instrument side">
      {(['BUY', 'SELL'] as WaterfallSide[]).map((side) => {
        const active = selectedSide === side;
        return (
          <button
            key={side}
            type="button"
            onClick={() => onChange(side)}
            aria-pressed={active}
            className={cn(
              'rwm-side-switch-button',
              active && side === 'BUY' && 'rwm-side-switch-button--buy-active',
              active && side === 'SELL' && 'rwm-side-switch-button--sell-active',
            )}
          >
            {side}
          </button>
        );
      })}
    </div>
  );
}

function SideBucketColumn({
  side,
  buckets,
  instrumentBuckets,
  onRemove,
  onMove,
}: {
  side: WaterfallSide;
  buckets: WaterfallBucket[];
  instrumentBuckets: Array<{
    side: WaterfallSide;
    bucketId: number;
    instruments: Array<{
      securityId: string;
      description?: string | null;
      instrumentType: WaterfallInstrumentType;
      displayOrder: number;
    }>;
  }>;
  onRemove: (side: WaterfallSide, bucketId: number, securityId: string) => void;
  onMove: (side: WaterfallSide, bucketId: number, securityId: string, direction: 'up' | 'down') => void;
}): JSX.Element {
  return (
    <div className="space-y-3">
      {buckets.map((bucket) => {
        const instruments = instrumentBuckets.find((item) => item.side === side && item.bucketId === bucket.bucketId)?.instruments ?? [];

        return (
          <section key={`${side}-${bucket.bucketId}`} className="overflow-hidden rounded-lg border border-grey-300 bg-tcw-white">
            <div className="rwm-instrument-bucket-header">
              <span className={cn('font-tcw-bold text-[12px]', side === 'BUY' ? 'text-tcw-green' : 'text-tcw-plum')}>{bucket.code}</span>
              <span className="truncate text-[10.5px] text-grey-600">{formatWaterfallBucketRange(bucket)}</span>
            </div>
            <div className="divide-y divide-grey-200">
              {instruments.length === 0 && <div className="px-3 py-2 text-[11px] italic text-grey-600">No instruments.</div>}
              {instruments.map((instrument) => (
                <div key={instrument.securityId} className="rwm-bucket-instrument-row">
                  <span className="text-grey-500">{instrument.displayOrder}</span>
                  <span className="truncate font-medium text-grey-900" title={instrument.description ?? instrument.securityId}>
                    {instrument.securityId}
                  </span>
                  <span className="truncate text-grey-600">{instrument.description}</span>
                  <span className="text-grey-600">{instrument.instrumentType}</span>
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      title="Move up"
                      onClick={() => onMove(side, bucket.bucketId, instrument.securityId, 'up')}
                      className="text-grey-500 hover:text-tcw-blue"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      onClick={() => onMove(side, bucket.bucketId, instrument.securityId, 'down')}
                      className="text-grey-500 hover:text-tcw-blue"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => onRemove(side, bucket.bucketId, instrument.securityId)}
                      className="text-grey-500 hover:text-tcw-plum"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function mapTreasuryInstrument(row: RwmTreasuryInstrument): CandidateInstrument | null {
  const securityId = String(row.securityKey ?? row.securityId ?? row.cusip ?? '').trim();
  if (!securityId) return null;

  const rawType = String(row.assetType ?? row.instrumentType ?? '').trim().toUpperCase();
  const duration = Number(row.duration ?? row.effectiveDuration ?? Number.NaN);

  return {
    ...row,
    securityId,
    cusip: row.cusip as string | null | undefined,
    description: String(row.securityDescription ?? row.description ?? ''),
    duration: Number.isFinite(duration) ? duration : null,
    instrumentType: rawType === 'FUT' || rawType === 'FUTURES' ? 'FUTURES' : 'BOND',
  };
}

export default WaterfallTenorInstrumentsTab;
