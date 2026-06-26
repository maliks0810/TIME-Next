import { create } from 'zustand';
import { getWaterfallGraph, saveWaterfallGraph } from '../api/waterfallApi';
import { deriveTenorBucketFromInstrumentDuration, sortWaterfallBuckets } from '../model/waterfallClientResolver';
import type {
  WaterfallBucket,
  WaterfallGraph,
  WaterfallInstrumentType,
  WaterfallManagerTab,
  WaterfallPreviewMode,
  WaterfallRuleMatchType,
  WaterfallRuleSet,
  WaterfallSide,
  WaterfallStepInstrumentType,
} from '../model/waterfallTypes';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type TreasuryInstrumentInput = {
  securityId: string;
  cusip?: string | null;
  description?: string | null;
  duration?: number | null;
  instrumentType: WaterfallInstrumentType;
};

type State = {
  selectedTab: WaterfallManagerTab;
  selectedSide: WaterfallSide;
  selectedRuleSetKey: string | null;
  previewMode: WaterfallPreviewMode;
  previewRhsGroupCode: string | null;
  previewPortfolioKey: string | null;
  graph: WaterfallGraph;
  originalGraph: WaterfallGraph | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  dirty: boolean;
  saveStatus: SaveStatus;
  setSelectedTab: (tab: WaterfallManagerTab) => void;
  setSelectedSide: (side: WaterfallSide) => void;
  setSelectedRuleSetKey: (key: string | null) => void;
  setPreviewMode: (mode: WaterfallPreviewMode) => void;
  setPreviewRhsGroupCode: (code: string | null) => void;
  setPreviewPortfolioKey: (key: string | null) => void;
  loadGraph: () => Promise<void>;
  saveGraph: (reason?: string | null) => Promise<void>;
  resetDraft: () => void;
  addBucket: () => void;
  updateBucket: (id: number, patch: Partial<WaterfallBucket>) => void;
  removeBucket: (id: number) => void;
  moveBucket: (id: number, d: 'up' | 'down') => void;
  addInstrumentFromTreasury: (side: WaterfallSide, input: TreasuryInstrumentInput) => void;
  removeInstrument: (side: WaterfallSide, bucketId: number, securityId: string) => void;
  moveInstrument: (side: WaterfallSide, bucketId: number, securityId: string, d: 'up' | 'down') => void;
  createRuleSet: (input: {
    name: string;
    matchType: WaterfallRuleMatchType;
    rhsGroupCode?: string | null;
  }) => string;
  deleteRuleSet: (key: string) => void;
  updateRuleSet: (
    key: string,
    patch: Partial<Pick<WaterfallRuleSet, 'name' | 'matchType' | 'rhsGroupCode'>>,
  ) => void;
  addRuleStep: (key: string, side: WaterfallSide, bucketId: number) => void;
  updateRuleStep: (
    key: string,
    side: WaterfallSide,
    bucketId: number,
    order: number,
    patch: { tenorBucketId?: number; instrumentType?: WaterfallStepInstrumentType },
  ) => void;
  removeRuleStep: (key: string, side: WaterfallSide, bucketId: number, order: number) => void;
  moveRuleStep: (key: string, side: WaterfallSide, bucketId: number, order: number, d: 'left' | 'right') => void;
};

const SIDES: WaterfallSide[] = ['BUY', 'SELL'];
const EMPTY: WaterfallGraph = { buckets: [], tenorInstrumentBuckets: [], ruleSets: [] };

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const norm = (x: unknown) => String(x ?? '').trim().toUpperCase();
const clientId = () => -Math.floor(Date.now() + Math.random() * 1000000);

function keyOf(rs: WaterfallRuleSet): string {
  return String(rs.ruleSetId ?? `${rs.matchType}:${rs.rhsGroupCode ?? 'CATCH_ALL'}:${rs.displayOrder}:${rs.name}`);
}

function ensure(graph: WaterfallGraph): WaterfallGraph {
  const buckets = sortWaterfallBuckets(graph.buckets ?? []);
  const byId = new Map(buckets.map((bucket) => [bucket.bucketId, bucket]));
  const inst = [...(graph.tenorInstrumentBuckets ?? [])];

  for (const side of SIDES) {
    for (const bucket of buckets) {
      if (!inst.some((candidate) => candidate.side === side && candidate.bucketId === bucket.bucketId)) {
        inst.push({
          side,
          bucketId: bucket.bucketId,
          bucketCode: bucket.code,
          bucketLabel: bucket.label,
          instruments: [],
        });
      }
    }
  }

  return {
    buckets,
    tenorInstrumentBuckets: inst
      .filter((bucket) => byId.has(bucket.bucketId))
      .map((bucket) => ({
        ...bucket,
        bucketCode: byId.get(bucket.bucketId)?.code ?? bucket.bucketCode,
        bucketLabel: byId.get(bucket.bucketId)?.label ?? bucket.bucketLabel,
        instruments: [...(bucket.instruments ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
      })),
    ruleSets: [...(graph.ruleSets ?? [])]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((ruleSet) => ({
        ...ruleSet,
        rules: [...(ruleSet.rules ?? [])]
          .filter((rule) => byId.has(rule.durationBucketId))
          .map((rule) => ({
            ...rule,
            durationBucketCode: byId.get(rule.durationBucketId)?.code ?? rule.durationBucketCode,
            durationBucketLabel: byId.get(rule.durationBucketId)?.label ?? rule.durationBucketLabel,
            steps: [...(rule.steps ?? [])]
              .filter((step) => byId.has(step.tenorBucketId))
              .sort((a, b) => a.stepOrder - b.stepOrder)
              .map((step, index) => ({
                ...step,
                stepOrder: index + 1,
                tenorBucketCode: byId.get(step.tenorBucketId)?.code ?? step.tenorBucketCode,
                tenorBucketLabel: byId.get(step.tenorBucketId)?.label ?? step.tenorBucketLabel,
              })),
          })),
      })),
  };
}

function markDirty(set: (patch: Partial<State>) => void, graph: WaterfallGraph) {
  set({ graph: ensure(graph), dirty: true, error: null, saveStatus: 'idle' });
}

export const useWaterfallManagerStore = create<State>((set, get) => ({
  selectedTab: 'bucketSetup',
  selectedSide: 'BUY',
  selectedRuleSetKey: null,
  previewMode: 'rhsGroup',
  previewRhsGroupCode: null,
  previewPortfolioKey: null,
  graph: EMPTY,
  originalGraph: null,
  isLoading: false,
  isSaving: false,
  error: null,
  dirty: false,
  saveStatus: 'idle',

  setSelectedTab: (selectedTab) => set({ selectedTab }),
  setSelectedSide: (selectedSide) => set({ selectedSide }),
  setSelectedRuleSetKey: (selectedRuleSetKey) => set({ selectedRuleSetKey }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setPreviewRhsGroupCode: (previewRhsGroupCode) => set({ previewRhsGroupCode }),
  setPreviewPortfolioKey: (previewPortfolioKey) => set({ previewPortfolioKey }),

  loadGraph: async () => {
    set({ isLoading: true, error: null });
    try {
      const graph = ensure(await getWaterfallGraph());
      set({
        graph,
        originalGraph: clone(graph),
        isLoading: false,
        dirty: false,
        saveStatus: 'idle',
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load waterfall.',
        saveStatus: 'error',
      });
    }
  },

  saveGraph: async (changeReason) => {
    const graph = ensure(get().graph);
    set({ isSaving: true, error: null, saveStatus: 'saving' });
    try {
      await saveWaterfallGraph({ changeReason, graph });
      set({
        graph,
        originalGraph: clone(graph),
        isSaving: false,
        dirty: false,
        saveStatus: 'saved',
      });
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to save waterfall.',
        saveStatus: 'error',
      });
    }
  },

  resetDraft: () => {
    const graph = get().originalGraph;
    if (graph) set({ graph: clone(graph), dirty: false, error: null, saveStatus: 'idle' });
  },

  addBucket: () => {
    const graph = clone(get().graph);
    const next = graph.buckets.length + 1;
    graph.buckets.push({
      bucketId: clientId(),
      code: `NEW${next}`,
      label: `New ${next}`,
      displayOrder: next,
      minDuration: null,
      maxDuration: null,
    });
    markDirty(set, graph);
  },

  updateBucket: (id, patch) => {
    const graph = clone(get().graph);
    graph.buckets = graph.buckets.map((bucket) => (bucket.bucketId === id ? { ...bucket, ...patch } : bucket));
    markDirty(set, graph);
  },

  removeBucket: (id) => {
    const graph = clone(get().graph);
    const referenced =
      graph.tenorInstrumentBuckets.some((bucket) => bucket.bucketId === id && bucket.instruments.length > 0) ||
      graph.ruleSets.some((ruleSet) =>
        ruleSet.rules.some(
          (rule) => rule.durationBucketId === id || rule.steps.some((step) => step.tenorBucketId === id),
        ),
      );

    if (referenced) {
      set({
        error: 'Bucket is referenced by instruments or rules. Remove references before deleting.',
        saveStatus: 'error',
      });
      return;
    }

    graph.buckets = graph.buckets
      .filter((bucket) => bucket.bucketId !== id)
      .map((bucket, index) => ({ ...bucket, displayOrder: index + 1 }));
    graph.tenorInstrumentBuckets = graph.tenorInstrumentBuckets.filter((bucket) => bucket.bucketId !== id);
    markDirty(set, graph);
  },

  moveBucket: (id, direction) => {
    const graph = clone(get().graph);
    const buckets = sortWaterfallBuckets(graph.buckets);
    const index = buckets.findIndex((bucket) => bucket.bucketId === id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= buckets.length) return;

    [buckets[index], buckets[targetIndex]] = [buckets[targetIndex], buckets[index]];
    graph.buckets = buckets.map((bucket, bucketIndex) => ({ ...bucket, displayOrder: bucketIndex + 1 }));
    markDirty(set, graph);
  },

  addInstrumentFromTreasury: (side, input) => {
    const graph = ensure(clone(get().graph));
    const bucket = deriveTenorBucketFromInstrumentDuration(input.duration, graph.buckets);

    if (!bucket) {
      set({
        error: `No bucket range matches duration ${input.duration ?? '—'}.`,
        saveStatus: 'error',
      });
      return;
    }

    const target = graph.tenorInstrumentBuckets.find(
      (candidate) => candidate.side === side && candidate.bucketId === bucket.bucketId,
    );
    if (!target) return;
    if (target.instruments.some((instrument) => norm(instrument.securityId) === norm(input.securityId))) return;

    target.instruments.push({
      tenorInstrumentId: null,
      securityId: input.securityId,
      cusip: input.cusip ?? null,
      description: input.description ?? null,
      instrumentType: input.instrumentType,
      displayOrder: target.instruments.length + 1,
    });
    markDirty(set, graph);
  },

  removeInstrument: (side, bucketId, securityId) => {
    const graph = clone(get().graph);
    const target = graph.tenorInstrumentBuckets.find((bucket) => bucket.side === side && bucket.bucketId === bucketId);
    if (!target) return;

    target.instruments = target.instruments
      .filter((instrument) => norm(instrument.securityId) !== norm(securityId))
      .map((instrument, index) => ({ ...instrument, displayOrder: index + 1 }));
    markDirty(set, graph);
  },

  moveInstrument: (side, bucketId, securityId, direction) => {
    const graph = clone(get().graph);
    const target = graph.tenorInstrumentBuckets.find((bucket) => bucket.side === side && bucket.bucketId === bucketId);
    if (!target) return;

    const index = target.instruments.findIndex((instrument) => norm(instrument.securityId) === norm(securityId));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= target.instruments.length) return;

    [target.instruments[index], target.instruments[targetIndex]] = [
      target.instruments[targetIndex],
      target.instruments[index],
    ];
    target.instruments = target.instruments.map((instrument, instrumentIndex) => ({
      ...instrument,
      displayOrder: instrumentIndex + 1,
    }));
    markDirty(set, graph);
  },

  createRuleSet: (input) => {
    const graph = ensure(clone(get().graph));
    const ruleSet: WaterfallRuleSet = {
      ruleSetId: null,
      name:
        input.name.trim() ||
        (input.matchType === 'CATCH_ALL' ? 'Catch-All Rule' : `${norm(input.rhsGroupCode)} Rule`),
      matchType: input.matchType,
      rhsGroupCode: input.matchType === 'CATCH_ALL' ? null : norm(input.rhsGroupCode),
      displayOrder: graph.ruleSets.length + 1,
      rules: SIDES.flatMap((side) =>
        graph.buckets.map((bucket) => ({
          durationBucketId: bucket.bucketId,
          durationBucketCode: bucket.code,
          durationBucketLabel: bucket.label,
          side,
          steps: [],
        })),
      ),
    };

    graph.ruleSets.push(ruleSet);
    markDirty(set, graph);

    const key = keyOf(ruleSet);
    set({ selectedRuleSetKey: key });
    return key;
  },

  deleteRuleSet: (key) => {
    const graph = clone(get().graph);
    graph.ruleSets = graph.ruleSets
      .filter((ruleSet) => keyOf(ruleSet) !== key)
      .map((ruleSet, index) => ({ ...ruleSet, displayOrder: index + 1 }));
    markDirty(set, graph);
  },

  updateRuleSet: (key, patch) => {
    const graph = clone(get().graph);
    graph.ruleSets = graph.ruleSets.map((ruleSet) =>
      keyOf(ruleSet) === key
        ? {
            ...ruleSet,
            ...patch,
            rhsGroupCode: patch.matchType === 'CATCH_ALL' ? null : patch.rhsGroupCode ?? ruleSet.rhsGroupCode,
          }
        : ruleSet,
    );
    markDirty(set, graph);
  },

  addRuleStep: (key, side, bucketId) => {
    const graph = clone(get().graph);
    const ruleSet = graph.ruleSets.find((candidate) => keyOf(candidate) === key);
    const bucket = graph.buckets.find((candidate) => candidate.bucketId === bucketId);

    if (!ruleSet || !bucket) return;

    let row = ruleSet.rules.find((candidate) => candidate.side === side && candidate.durationBucketId === bucketId);

    if (!row) {
      row = {
        durationBucketId: bucket.bucketId,
        durationBucketCode: bucket.code,
        durationBucketLabel: bucket.label,
        side,
        steps: [],
      };
      ruleSet.rules.push(row);
    }

    if (row.steps.length >= 3) return;

    row.steps.push({
      ruleStepId: null,
      stepOrder: row.steps.length + 1,
      tenorBucketId: bucket.bucketId,
      tenorBucketCode: bucket.code,
      tenorBucketLabel: bucket.label,
      instrumentType: 'BOTH',
    });
    markDirty(set, graph);
  },

  updateRuleStep: (key, side, bucketId, order, patch) => {
    const graph = clone(get().graph);
    const byId = new Map(graph.buckets.map((bucket) => [bucket.bucketId, bucket]));
    const row = graph.ruleSets
      .find((ruleSet) => keyOf(ruleSet) === key)
      ?.rules.find((rule) => rule.side === side && rule.durationBucketId === bucketId);

    if (!row) return;

    row.steps = row.steps.map((step) => {
      if (step.stepOrder !== order) return step;
      const bucket = patch.tenorBucketId ? byId.get(patch.tenorBucketId) : null;
      return {
        ...step,
        ...patch,
        tenorBucketCode: bucket?.code ?? step.tenorBucketCode,
        tenorBucketLabel: bucket?.label ?? step.tenorBucketLabel,
      };
    });
    markDirty(set, graph);
  },

  removeRuleStep: (key, side, bucketId, order) => {
    const graph = clone(get().graph);
    const row = graph.ruleSets
      .find((ruleSet) => keyOf(ruleSet) === key)
      ?.rules.find((rule) => rule.side === side && rule.durationBucketId === bucketId);

    if (!row) return;

    row.steps = row.steps
      .filter((step) => step.stepOrder !== order)
      .map((step, index) => ({ ...step, stepOrder: index + 1 }));
    markDirty(set, graph);
  },

  moveRuleStep: (key, side, bucketId, order, direction) => {
    const graph = clone(get().graph);
    const row = graph.ruleSets
      .find((ruleSet) => keyOf(ruleSet) === key)
      ?.rules.find((rule) => rule.side === side && rule.durationBucketId === bucketId);

    if (!row) return;

    const steps = [...row.steps].sort((a, b) => a.stepOrder - b.stepOrder);
    const index = steps.findIndex((step) => step.stepOrder === order);
    const targetIndex = direction === 'left' ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= steps.length) return;

    [steps[index], steps[targetIndex]] = [steps[targetIndex], steps[index]];
    row.steps = steps.map((step, stepIndex) => ({ ...step, stepOrder: stepIndex + 1 }));
    markDirty(set, graph);
  },
}));

export function getWaterfallRuleSetKey(ruleSet: WaterfallRuleSet): string {
  return keyOf(ruleSet);
}
