import type {
  WaterfallBucket,
  WaterfallGraph,
  WaterfallRuleSet,
  WaterfallRuleStep,
  WaterfallTenorInstrument,
  WaterfallTenorInstrumentBucket,
} from '../../model/waterfallTypes';

export type WaterfallAuditChangeKind = 'added' | 'removed' | 'modified';
export type WaterfallAuditChangeArea = 'Buckets' | 'Tenor Instruments' | 'Rule Sets' | 'Rule Steps';

export type WaterfallAuditChange = {
  area: WaterfallAuditChangeArea;
  kind: WaterfallAuditChangeKind;
  title: string;
  detail?: string;
  fields?: Array<{ field: string; before: string; after: string }>;
};

export type WaterfallAuditDiff = {
  before: WaterfallGraph | null;
  after: WaterfallGraph | null;
  parseError?: string;
  changes: WaterfallAuditChange[];
  counts: Record<WaterfallAuditChangeArea, number>;
};

const AREAS: WaterfallAuditChangeArea[] = ['Buckets', 'Tenor Instruments', 'Rule Sets', 'Rule Steps'];

export function buildWaterfallAuditDiff(beforeJson?: string | null, afterJson?: string | null): WaterfallAuditDiff {
  const beforeResult = parseGraph(beforeJson);
  const afterResult = parseGraph(afterJson);
  const parseError = beforeResult.error ?? afterResult.error;

  if (!beforeResult.graph || !afterResult.graph) {
    return emptyDiff(beforeResult.graph, afterResult.graph, parseError);
  }

  const changes = [
    ...diffBuckets(beforeResult.graph.buckets, afterResult.graph.buckets),
    ...diffTenorInstruments(beforeResult.graph.tenorInstrumentBuckets, afterResult.graph.tenorInstrumentBuckets),
    ...diffRuleSets(beforeResult.graph.ruleSets, afterResult.graph.ruleSets),
    ...diffRuleSteps(beforeResult.graph.ruleSets, afterResult.graph.ruleSets),
  ];

  const counts = countByArea(changes);
  return { before: beforeResult.graph, after: afterResult.graph, parseError, changes, counts };
}

function emptyDiff(before: WaterfallGraph | null, after: WaterfallGraph | null, parseError?: string): WaterfallAuditDiff {
  return { before, after, parseError, changes: [], counts: Object.fromEntries(AREAS.map((area) => [area, 0])) as Record<WaterfallAuditChangeArea, number> };
}

function parseGraph(value?: string | null): { graph: WaterfallGraph | null; error?: string } {
  const text = String(value ?? '').trim();
  if (!text) return { graph: null };
  try {
    const parsed = JSON.parse(text);
    const graph = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    if (!graph || typeof graph !== 'object') return { graph: null, error: 'Audit JSON is not an object.' };
    return {
      graph: {
        buckets: Array.isArray(graph.buckets) ? graph.buckets : [],
        tenorInstrumentBuckets: Array.isArray(graph.tenorInstrumentBuckets) ? graph.tenorInstrumentBuckets : [],
        ruleSets: Array.isArray(graph.ruleSets) ? graph.ruleSets : [],
      },
    };
  } catch (error) {
    return { graph: null, error: error instanceof Error ? error.message : 'Failed to parse audit JSON.' };
  }
}

function diffBuckets(before: WaterfallBucket[], after: WaterfallBucket[]): WaterfallAuditChange[] {
  const beforeMap = new Map(before.map((bucket) => [norm(bucket.code), bucket]));
  const afterMap = new Map(after.map((bucket) => [norm(bucket.code), bucket]));
  const changes: WaterfallAuditChange[] = [];

  for (const [key, bucket] of afterMap) {
    const previous = beforeMap.get(key);
    if (!previous) {
      changes.push({ area: 'Buckets', kind: 'added', title: bucket.code, detail: bucketRange(bucket) });
      continue;
    }
    const fields = changedFields([
      ['label', previous.label, bucket.label],
      ['displayOrder', previous.displayOrder, bucket.displayOrder],
      ['minDuration', previous.minDuration, bucket.minDuration],
      ['maxDuration', previous.maxDuration, bucket.maxDuration],
    ]);
    if (fields.length) changes.push({ area: 'Buckets', kind: 'modified', title: bucket.code, fields });
  }

  for (const [key, bucket] of beforeMap) {
    if (!afterMap.has(key)) changes.push({ area: 'Buckets', kind: 'removed', title: bucket.code, detail: bucketRange(bucket) });
  }

  return changes;
}

function diffTenorInstruments(before: WaterfallTenorInstrumentBucket[], after: WaterfallTenorInstrumentBucket[]): WaterfallAuditChange[] {
  const beforeMap = flattenInstruments(before);
  const afterMap = flattenInstruments(after);
  const changes: WaterfallAuditChange[] = [];

  for (const [key, next] of afterMap) {
    const previous = beforeMap.get(key);
    if (!previous) {
      changes.push({ area: 'Tenor Instruments', kind: 'added', title: `${next.side} ${next.bucketCode} · ${next.instrument.securityId}`, detail: next.instrument.instrumentType });
      continue;
    }
    const fields = changedFields([
      ['instrumentType', previous.instrument.instrumentType, next.instrument.instrumentType],
      ['displayOrder', previous.instrument.displayOrder, next.instrument.displayOrder],
      ['description', previous.instrument.description, next.instrument.description],
      ['cusip', previous.instrument.cusip, next.instrument.cusip],
    ]);
    if (fields.length) changes.push({ area: 'Tenor Instruments', kind: 'modified', title: `${next.side} ${next.bucketCode} · ${next.instrument.securityId}`, fields });
  }

  for (const [key, previous] of beforeMap) {
    if (!afterMap.has(key)) changes.push({ area: 'Tenor Instruments', kind: 'removed', title: `${previous.side} ${previous.bucketCode} · ${previous.instrument.securityId}`, detail: previous.instrument.instrumentType });
  }

  return changes;
}

function diffRuleSets(before: WaterfallRuleSet[], after: WaterfallRuleSet[]): WaterfallAuditChange[] {
  const beforeMap = new Map(before.map((ruleSet) => [ruleSetKey(ruleSet), ruleSet]));
  const afterMap = new Map(after.map((ruleSet) => [ruleSetKey(ruleSet), ruleSet]));
  const changes: WaterfallAuditChange[] = [];

  for (const [key, next] of afterMap) {
    const previous = beforeMap.get(key);
    if (!previous) {
      changes.push({ area: 'Rule Sets', kind: 'added', title: ruleSetLabel(next), detail: next.matchType });
      continue;
    }
    const fields = changedFields([
      ['name', previous.name, next.name],
      ['displayOrder', previous.displayOrder, next.displayOrder],
      ['rhsGroupCode', previous.rhsGroupCode, next.rhsGroupCode],
      ['matchType', previous.matchType, next.matchType],
    ]);
    if (fields.length) changes.push({ area: 'Rule Sets', kind: 'modified', title: ruleSetLabel(next), fields });
  }

  for (const [key, previous] of beforeMap) {
    if (!afterMap.has(key)) changes.push({ area: 'Rule Sets', kind: 'removed', title: ruleSetLabel(previous), detail: previous.matchType });
  }

  return changes;
}

function diffRuleSteps(before: WaterfallRuleSet[], after: WaterfallRuleSet[]): WaterfallAuditChange[] {
  const beforeMap = flattenSteps(before);
  const afterMap = flattenSteps(after);
  const changes: WaterfallAuditChange[] = [];

  for (const [key, next] of afterMap) {
    const previous = beforeMap.get(key);
    if (!previous) {
      changes.push({ area: 'Rule Steps', kind: 'added', title: next.title, detail: stepDetail(next.step) });
      continue;
    }
    const fields = changedFields([
      ['tenorBucket', previous.step.tenorBucketCode, next.step.tenorBucketCode],
      ['instrumentType', previous.step.instrumentType, next.step.instrumentType],
      ['stepOrder', previous.step.stepOrder, next.step.stepOrder],
    ]);
    if (fields.length) changes.push({ area: 'Rule Steps', kind: 'modified', title: next.title, fields });
  }

  for (const [key, previous] of beforeMap) {
    if (!afterMap.has(key)) changes.push({ area: 'Rule Steps', kind: 'removed', title: previous.title, detail: stepDetail(previous.step) });
  }

  return changes;
}

function flattenInstruments(buckets: WaterfallTenorInstrumentBucket[]) {
  const map = new Map<string, { side: string; bucketCode: string; instrument: WaterfallTenorInstrument }>();
  for (const bucket of buckets) {
    for (const instrument of bucket.instruments ?? []) {
      map.set(`${norm(bucket.side)}|${norm(bucket.bucketCode)}|${norm(instrument.securityId)}`, {
        side: bucket.side,
        bucketCode: bucket.bucketCode,
        instrument,
      });
    }
  }
  return map;
}

function flattenSteps(ruleSets: WaterfallRuleSet[]) {
  const map = new Map<string, { title: string; step: WaterfallRuleStep }>();
  for (const ruleSet of ruleSets) {
    const rsKey = ruleSetKey(ruleSet);
    for (const row of ruleSet.rules ?? []) {
      for (const step of row.steps ?? []) {
        const title = `${ruleSetLabel(ruleSet)} · ${row.side} ${row.durationBucketCode} · Step ${step.stepOrder}`;
        map.set(`${rsKey}|${norm(row.side)}|${norm(row.durationBucketCode)}|${step.stepOrder}`, { title, step });
      }
    }
  }
  return map;
}

function changedFields(rows: Array<[string, unknown, unknown]>) {
  return rows
    .filter(([, before, after]) => valueText(before) !== valueText(after))
    .map(([field, before, after]) => ({ field, before: valueText(before), after: valueText(after) }));
}

function countByArea(changes: WaterfallAuditChange[]) {
  const counts = Object.fromEntries(AREAS.map((area) => [area, 0])) as Record<WaterfallAuditChangeArea, number>;
  for (const change of changes) counts[change.area] += 1;
  return counts;
}

function ruleSetKey(ruleSet: WaterfallRuleSet): string {
  if (ruleSet.ruleSetId != null) return `id:${ruleSet.ruleSetId}`;
  return `${norm(ruleSet.matchType)}|${norm(ruleSet.rhsGroupCode)}|${ruleSet.displayOrder}|${norm(ruleSet.name)}`;
}

function ruleSetLabel(ruleSet: WaterfallRuleSet): string {
  return ruleSet.matchType === 'CATCH_ALL' ? ruleSet.name || 'Catch-All' : `${ruleSet.name || 'RHS Rule'} (${ruleSet.rhsGroupCode ?? '—'})`;
}

function bucketRange(bucket: WaterfallBucket): string {
  return `${valueText(bucket.minDuration)} <= duration < ${valueText(bucket.maxDuration)}`;
}

function stepDetail(step: WaterfallRuleStep): string {
  return `${step.tenorBucketCode} · ${step.instrumentType}`;
}

function norm(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

function valueText(value: unknown): string {
  if (value == null || value === '') return '—';
  return String(value);
}
