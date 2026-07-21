import type {
  WaterfallBucket,
  WaterfallGraph,
  WaterfallResolveResult,
  WaterfallRuleSet,
  WaterfallSide,
} from './waterfallTypes';

function normalize(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

export function sortWaterfallBuckets(buckets: WaterfallBucket[]): WaterfallBucket[] {
  return [...buckets].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getBucketForDuration(
  duration: number | null | undefined,
  buckets: WaterfallBucket[],
): WaterfallBucket | null {
  const value = Number(duration ?? Number.NaN);
  if (!Number.isFinite(value)) return null;

  return sortWaterfallBuckets(buckets).find((bucket) => {
    const minOk = bucket.minDuration == null || value >= bucket.minDuration;
    const maxOk = bucket.maxDuration == null || value < bucket.maxDuration;
    return minOk && maxOk;
  }) ?? null;
}

export function deriveTenorBucketFromInstrumentDuration(
  duration: number | null | undefined,
  buckets: WaterfallBucket[],
): WaterfallBucket | null {
  return getBucketForDuration(duration, buckets);
}

export function resolveWaterfall({
  graph,
  portfolioDuration,
  rhsGroupCode,
  side,
}: {
  graph: WaterfallGraph;
  portfolioDuration: number | null | undefined;
  rhsGroupCode: string | null | undefined;
  side: WaterfallSide;
}): WaterfallResolveResult {
  const durationBucket = getBucketForDuration(portfolioDuration, graph.buckets);
  if (!durationBucket) return emptyResult('NO_DURATION_BUCKET', side);

  const ruleSet = findRuleSet(graph.ruleSets, rhsGroupCode);
  if (!ruleSet) return emptyResult('NO_RULE_SET', side, durationBucket);

  const rule = ruleSet.rules.find(
    (candidate) => candidate.durationBucketId === durationBucket.bucketId && candidate.side === side,
  );
  if (!rule) return emptyResult('NO_RULE_ROW', side, durationBucket, ruleSet);

  const instruments = [...rule.steps]
    .sort((a, b) => a.stepOrder - b.stepOrder)
    .flatMap((step) => {
      const bucket = graph.tenorInstrumentBuckets.find(
        (candidate) => candidate.side === side && candidate.bucketId === step.tenorBucketId,
      );

      return [...(bucket?.instruments ?? [])]
        .filter((instrument) => step.instrumentType === 'BOTH' || instrument.instrumentType === step.instrumentType)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((instrument) => ({
          ...instrument,
          stepOrder: step.stepOrder,
          durationBucketId: durationBucket.bucketId,
          tenorBucketId: step.tenorBucketId,
          ruleSetId: ruleSet.ruleSetId,
        }));
    });

  return { status: 'RESOLVED', side, durationBucket, ruleSet, instruments };
}

function findRuleSet(ruleSets: WaterfallRuleSet[], rhsGroupCode: string | null | undefined): WaterfallRuleSet | null {
  const rhs = normalize(rhsGroupCode);
  return [...ruleSets]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .find((ruleSet) => ruleSet.matchType === 'RHS_GROUP' && normalize(ruleSet.rhsGroupCode) === rhs)
    ?? [...ruleSets]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .find((ruleSet) => ruleSet.matchType === 'CATCH_ALL')
    ?? null;
}

function emptyResult(
  reason: NonNullable<WaterfallResolveResult['reason']>,
  side: WaterfallSide,
  durationBucket: WaterfallBucket | null = null,
  ruleSet: WaterfallRuleSet | null = null,
): WaterfallResolveResult {
  return { status: 'EMPTY', reason, side, durationBucket, ruleSet, instruments: [] };
}
