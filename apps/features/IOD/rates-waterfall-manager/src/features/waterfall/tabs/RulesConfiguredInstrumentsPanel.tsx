import type { JSX } from 'react';
import { useMemo } from 'react';
import { useTreasuryInstruments, type RwmTreasuryInstrument } from '../../../api';
import { sortWaterfallBuckets } from '../model/waterfallClientResolver';
import type {
  WaterfallBucket,
  WaterfallInstrumentType,
  WaterfallRuleSet,
  WaterfallSide,
  WaterfallStepInstrumentType,
} from '../model/waterfallTypes';
import { getWaterfallRuleSetKey, useWaterfallManagerStore } from '../store/waterfallManagerStore';

type ConfiguredInstrument = {
  securityId: string;
  description?: string | null;
  instrumentType: WaterfallInstrumentType;
  displayOrder?: number | null;
  duration?: number | null;
  effectiveDuration?: number | null;
  securityKey?: string | null;
  cusip?: string | null;
};

type TenorInstrumentBucket = {
  side: WaterfallSide;
  bucketId: number;
  instruments: ConfiguredInstrument[];
};

type ResolvedReferenceInstrument = ConfiguredInstrument & {
  resolvedOrder: number;
  ruleStepOrder: number;
  tenorBucketCode: string;
};

const SIDES: WaterfallSide[] = ['BUY', 'SELL'];

export function RulesConfiguredInstrumentsPanel(): JSX.Element {
  const buckets = useWaterfallManagerStore((state) => state.graph.buckets);
  const ruleSets = useWaterfallManagerStore((state) => state.graph.ruleSets);
  const selectedRuleSetKey = useWaterfallManagerStore((state) => state.selectedRuleSetKey);
  const tenorInstrumentBuckets = useWaterfallManagerStore(
    (state) => state.graph.tenorInstrumentBuckets,
  ) as TenorInstrumentBucket[];
  const treasuryInstrumentsQuery = useTreasuryInstruments();

  const orderedBuckets = sortWaterfallBuckets(buckets);
  const selectedRuleSet =
    ruleSets.find((ruleSet) => getWaterfallRuleSetKey(ruleSet) === selectedRuleSetKey) ?? ruleSets[0] ?? null;
  const treasuryDurationBySecurity = useMemo(
    () => buildTreasuryDurationMap(treasuryInstrumentsQuery.data ?? []),
    [treasuryInstrumentsQuery.data],
  );

  return (
    <section className="rwm-rules-reference-panel">
      <div className="rwm-rules-reference-header rwm-rules-reference-header--rule-style">
        <div className="rwm-rules-reference-title rwm-rules-reference-title--rule-style">Configured Instruments</div>
        <div className="rwm-rules-reference-subtitle">
          Instruments are shown in the execution order resolved by the selected rule set.
        </div>
      </div>
      <div className="rwm-rules-reference-scroll">
        {SIDES.map((side) => (
          <InstrumentSide
            key={side}
            side={side}
            buckets={orderedBuckets}
            tenorInstrumentBuckets={tenorInstrumentBuckets}
            selectedRuleSet={selectedRuleSet}
            treasuryDurationBySecurity={treasuryDurationBySecurity}
          />
        ))}
      </div>
    </section>
  );
}

function InstrumentSide({
  side,
  buckets,
  tenorInstrumentBuckets,
  selectedRuleSet,
  treasuryDurationBySecurity,
}: {
  side: WaterfallSide;
  buckets: WaterfallBucket[];
  tenorInstrumentBuckets: TenorInstrumentBucket[];
  selectedRuleSet: WaterfallRuleSet | null;
  treasuryDurationBySecurity: Map<string, number>;
}): JSX.Element {
  return (
    <div className="rwm-rules-reference-side">
      <div className={`rwm-rules-reference-side-title rwm-rules-reference-side-title--${side.toLowerCase()}`}>{side}</div>
      <div className="rwm-rules-reference-bucket-grid">
        {buckets.map((bucket) => {
          const instruments = resolveInstrumentsForRuleBucket({
            side,
            durationBucket: bucket,
            buckets,
            tenorInstrumentBuckets,
            selectedRuleSet,
          });

          return (
            <InstrumentBucket
              key={`${side}-${bucket.bucketId}`}
              side={side}
              bucket={bucket}
              instruments={instruments}
              treasuryDurationBySecurity={treasuryDurationBySecurity}
            />
          );
        })}
      </div>
    </div>
  );
}

function InstrumentBucket({
  bucket,
  instruments,
  treasuryDurationBySecurity,
}: {
  side: WaterfallSide;
  bucket: WaterfallBucket;
  instruments: ResolvedReferenceInstrument[];
  treasuryDurationBySecurity: Map<string, number>;
}): JSX.Element {
  return (
    <div className="rwm-rules-reference-bucket">
      <div className="rwm-rules-reference-bucket-header">{bucket.code}</div>
      {instruments.length === 0 ? (
        <div className="rwm-rules-reference-empty">No instruments</div>
      ) : (
        <div>
          {instruments.map((instrument) => (
            <div key={`${instrument.resolvedOrder}-${instrument.securityId}-${instrument.ruleStepOrder}`} className="rwm-rules-reference-row">
              <span className="rwm-rules-reference-order">{instrument.resolvedOrder}</span>
              <span className="truncate" title={instrument.securityId}>
                {instrument.securityId}
              </span>
              <span className="truncate" title={instrument.description ?? ''}>
                {instrument.description || '-'}
              </span>
              <span className="text-right tabular-nums">Dur {formatDuration(getInstrumentDuration(instrument, treasuryDurationBySecurity))}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function resolveInstrumentsForRuleBucket({
  side,
  durationBucket,
  buckets,
  tenorInstrumentBuckets,
  selectedRuleSet,
}: {
  side: WaterfallSide;
  durationBucket: WaterfallBucket;
  buckets: WaterfallBucket[];
  tenorInstrumentBuckets: TenorInstrumentBucket[];
  selectedRuleSet: WaterfallRuleSet | null;
}): ResolvedReferenceInstrument[] {
  if (!selectedRuleSet) return [];

  const rule = selectedRuleSet.rules.find((candidate) => candidate.side === side && candidate.durationBucketId === durationBucket.bucketId);
  if (!rule || rule.steps.length === 0) return [];

  const bucketById = new Map(buckets.map((bucket) => [bucket.bucketId, bucket]));
  const resolved: ResolvedReferenceInstrument[] = [];

  [...rule.steps]
    .sort((a, b) => a.stepOrder - b.stepOrder)
    .forEach((step) => {
      const tenorBucket = tenorInstrumentBuckets.find((candidate) => candidate.side === side && candidate.bucketId === step.tenorBucketId);
      const tenorBucketCode = bucketById.get(step.tenorBucketId)?.code ?? String(step.tenorBucketId);
      const instruments = [...(tenorBucket?.instruments ?? [])]
        .sort((a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0))
        .filter((instrument) => instrumentMatchesRuleType(instrument, step.instrumentType));

      instruments.forEach((instrument) => {
        resolved.push({
          ...instrument,
          resolvedOrder: resolved.length + 1,
          ruleStepOrder: step.stepOrder,
          tenorBucketCode,
        });
      });
    });

  return resolved;
}

function instrumentMatchesRuleType(instrument: ConfiguredInstrument, ruleType: WaterfallStepInstrumentType): boolean {
  if (ruleType === 'BOTH') return true;
  return instrument.instrumentType === ruleType;
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

function toNumberOrNull(value: unknown): number | null {
  const parsed = Number(value ?? Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDuration(value: number | null | undefined): string {
  if (value == null) return '-';
  return Number.isFinite(value) ? value.toFixed(3) : '-';
}

export default RulesConfiguredInstrumentsPanel;
