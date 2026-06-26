import { create } from 'zustand';
import { getWaterfallGraph, saveWaterfallGraph } from '../api/waterfallApi';
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
import {
    deriveTenorBucketFromInstrumentDuration,
    sortWaterfallBuckets,
} from '../model/waterfallClientResolver';

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
    moveInstrument: (
        side: WaterfallSide,
        bucketId: number,
        securityId: string,
        d: 'up' | 'down'
    ) => void;
    createRuleSet: (input: {
        name: string;
        matchType: WaterfallRuleMatchType;
        rhsGroupCode?: string | null;
    }) => string;
    deleteRuleSet: (key: string) => void;
    updateRuleSet: (
        key: string,
        patch: Partial<Pick<WaterfallRuleSet, 'name' | 'matchType' | 'rhsGroupCode'>>
    ) => void;
    addRuleStep: (key: string, side: WaterfallSide, bucketId: number) => void;
    updateRuleStep: (
        key: string,
        side: WaterfallSide,
        bucketId: number,
        order: number,
        patch: { tenorBucketId?: number; instrumentType?: WaterfallStepInstrumentType }
    ) => void;
    removeRuleStep: (key: string, side: WaterfallSide, bucketId: number, order: number) => void;
    moveRuleStep: (
        key: string,
        side: WaterfallSide,
        bucketId: number,
        order: number,
        d: 'left' | 'right'
    ) => void;
};
const SIDES: WaterfallSide[] = ['BUY', 'SELL'];
const EMPTY: WaterfallGraph = { buckets: [], tenorInstrumentBuckets: [], ruleSets: [] };
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const norm = (x: unknown) =>
    String(x ?? '')
        .trim()
        .toUpperCase();
const clientId = () => -Math.floor(Date.now() + Math.random() * 1000000);
function keyOf(rs: WaterfallRuleSet) {
    return String(
        rs.ruleSetId ??
            `${rs.matchType}:${rs.rhsGroupCode ?? 'CATCH_ALL'}:${rs.displayOrder}:${rs.name}`
    );
}
function ensure(graph: WaterfallGraph): WaterfallGraph {
    const buckets = sortWaterfallBuckets(graph.buckets ?? []);
    const byId = new Map(buckets.map((b) => [b.bucketId, b]));
    const inst = [...(graph.tenorInstrumentBuckets ?? [])];
    for (const side of SIDES)
        for (const b of buckets)
            if (!inst.some((x) => x.side === side && x.bucketId === b.bucketId))
                inst.push({
                    side,
                    bucketId: b.bucketId,
                    bucketCode: b.code,
                    bucketLabel: b.label,
                    instruments: [],
                });
    return {
        buckets,
        tenorInstrumentBuckets: inst
            .filter((x) => byId.has(x.bucketId))
            .map((x) => ({
                ...x,
                bucketCode: byId.get(x.bucketId)?.code ?? x.bucketCode,
                bucketLabel: byId.get(x.bucketId)?.label ?? x.bucketLabel,
                instruments: [...(x.instruments ?? [])].sort(
                    (a, b) => a.displayOrder - b.displayOrder
                ),
            })),
        ruleSets: [...(graph.ruleSets ?? [])]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((rs) => ({
                ...rs,
                rules: [...(rs.rules ?? [])]
                    .filter((r) => byId.has(r.durationBucketId))
                    .map((r) => ({
                        ...r,
                        durationBucketCode:
                            byId.get(r.durationBucketId)?.code ?? r.durationBucketCode,
                        durationBucketLabel:
                            byId.get(r.durationBucketId)?.label ?? r.durationBucketLabel,
                        steps: [...(r.steps ?? [])]
                            .filter((s) => byId.has(s.tenorBucketId))
                            .sort((a, b) => a.stepOrder - b.stepOrder)
                            .map((s, i) => ({
                                ...s,
                                stepOrder: i + 1,
                                tenorBucketCode:
                                    byId.get(s.tenorBucketId)?.code ?? s.tenorBucketCode,
                                tenorBucketLabel:
                                    byId.get(s.tenorBucketId)?.label ?? s.tenorBucketLabel,
                            })),
                    })),
            })),
    };
}
function markDirty(set: (p: Partial<State>) => void, g: WaterfallGraph) {
    set({ graph: ensure(g), dirty: true, error: null, saveStatus: 'idle' });
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
        } catch (e) {
            set({
                isLoading: false,
                error: e instanceof Error ? e.message : 'Failed to load waterfall.',
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
        } catch (e) {
            set({
                isSaving: false,
                error: e instanceof Error ? e.message : 'Failed to save waterfall.',
                saveStatus: 'error',
            });
        }
    },
    resetDraft: () => {
        const g = get().originalGraph;
        if (g) set({ graph: clone(g), dirty: false, error: null, saveStatus: 'idle' });
    },
    addBucket: () => {
        const g = clone(get().graph);
        const n = g.buckets.length + 1;
        g.buckets.push({
            bucketId: clientId(),
            code: `NEW${n}`,
            label: `New ${n}`,
            displayOrder: n,
            minDuration: null,
            maxDuration: null,
        });
        markDirty(set, g);
    },
    updateBucket: (id, patch) => {
        const g = clone(get().graph);
        g.buckets = g.buckets.map((b) => (b.bucketId === id ? { ...b, ...patch } : b));
        markDirty(set, g);
    },
    removeBucket: (id) => {
        const g = clone(get().graph);
        const ref =
            g.tenorInstrumentBuckets.some((b) => b.bucketId === id && b.instruments.length > 0) ||
            g.ruleSets.some((rs) =>
                rs.rules.some(
                    (r) => r.durationBucketId === id || r.steps.some((s) => s.tenorBucketId === id)
                )
            );
        if (ref) {
            set({
                error: 'Bucket is referenced by instruments or rules. Remove references before deleting.',
                saveStatus: 'error',
            });
            return;
        }
        g.buckets = g.buckets
            .filter((b) => b.bucketId !== id)
            .map((b, i) => ({ ...b, displayOrder: i + 1 }));
        g.tenorInstrumentBuckets = g.tenorInstrumentBuckets.filter((b) => b.bucketId !== id);
        markDirty(set, g);
    },
    moveBucket: (id, d) => {
        const g = clone(get().graph);
        const a = sortWaterfallBuckets(g.buckets);
        const i = a.findIndex((b) => b.bucketId === id),
            j = d === 'up' ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= a.length) return;
        [a[i], a[j]] = [a[j], a[i]];
        g.buckets = a.map((b, i) => ({ ...b, displayOrder: i + 1 }));
        markDirty(set, g);
    },
    addInstrumentFromTreasury: (side, input) => {
        const g = ensure(clone(get().graph));
        const b = deriveTenorBucketFromInstrumentDuration(input.duration, g.buckets);
        if (!b) {
            set({
                error: `No bucket range matches duration ${input.duration ?? '—'}.`,
                saveStatus: 'error',
            });
            return;
        }
        const target = g.tenorInstrumentBuckets.find(
            (x) => x.side === side && x.bucketId === b.bucketId
        );
        if (!target) return;
        if (target.instruments.some((i) => norm(i.securityId) === norm(input.securityId))) return;
        target.instruments.push({
            tenorInstrumentId: null,
            securityId: input.securityId,
            cusip: input.cusip ?? null,
            description: input.description ?? null,
            instrumentType: input.instrumentType,
            displayOrder: target.instruments.length + 1,
        });
        markDirty(set, g);
    },
    removeInstrument: (side, bucketId, securityId) => {
        const g = clone(get().graph);
        const t = g.tenorInstrumentBuckets.find((b) => b.side === side && b.bucketId === bucketId);
        if (!t) return;
        t.instruments = t.instruments
            .filter((i) => norm(i.securityId) !== norm(securityId))
            .map((i, n) => ({ ...i, displayOrder: n + 1 }));
        markDirty(set, g);
    },
    moveInstrument: (side, bucketId, securityId, d) => {
        const g = clone(get().graph);
        const t = g.tenorInstrumentBuckets.find((b) => b.side === side && b.bucketId === bucketId);
        if (!t) return;
        const i = t.instruments.findIndex((x) => norm(x.securityId) === norm(securityId)),
            j = d === 'up' ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= t.instruments.length) return;
        [t.instruments[i], t.instruments[j]] = [t.instruments[j], t.instruments[i]];
        t.instruments = t.instruments.map((x, n) => ({ ...x, displayOrder: n + 1 }));
        markDirty(set, g);
    },
    createRuleSet: (input) => {
        const g = ensure(clone(get().graph));
        const key = `client-${Date.now()}`;
        const rs: WaterfallRuleSet = {
            ruleSetId: null,
            name:
                input.name.trim() ||
                (input.matchType === 'CATCH_ALL'
                    ? 'Catch-All Rule'
                    : `${norm(input.rhsGroupCode)} Rule`),
            matchType: input.matchType,
            rhsGroupCode: input.matchType === 'CATCH_ALL' ? null : norm(input.rhsGroupCode),
            displayOrder: g.ruleSets.length + 1,
            rules: SIDES.flatMap((side) =>
                g.buckets.map((b) => ({
                    durationBucketId: b.bucketId,
                    durationBucketCode: b.code,
                    durationBucketLabel: b.label,
                    side,
                    steps: [],
                }))
            ),
        };
        g.ruleSets.push(rs);
        markDirty(set, g);
        set({ selectedRuleSetKey: key });
        return key;
    },
    deleteRuleSet: (key) => {
        const g = clone(get().graph);
        g.ruleSets = g.ruleSets
            .filter((rs) => keyOf(rs) !== key)
            .map((rs, i) => ({ ...rs, displayOrder: i + 1 }));
        markDirty(set, g);
    },
    updateRuleSet: (key, patch) => {
        const g = clone(get().graph);
        g.ruleSets = g.ruleSets.map((rs) =>
            keyOf(rs) === key
                ? {
                      ...rs,
                      ...patch,
                      rhsGroupCode:
                          patch.matchType === 'CATCH_ALL'
                              ? null
                              : (patch.rhsGroupCode ?? rs.rhsGroupCode),
                  }
                : rs
        );
        markDirty(set, g);
    },
    addRuleStep: (key, side, bucketId) => {
        const g = clone(get().graph);
        const rs = g.ruleSets.find((x) => keyOf(x) === key);
        const r = rs?.rules.find((x) => x.side === side && x.durationBucketId === bucketId);
        if (!r || r.steps.length >= 3) return;
        const b = g.buckets.find((x) => x.bucketId === bucketId) ?? g.buckets[0];
        if (!b) return;
        r.steps.push({
            ruleStepId: null,
            stepOrder: r.steps.length + 1,
            tenorBucketId: b.bucketId,
            tenorBucketCode: b.code,
            tenorBucketLabel: b.label,
            instrumentType: 'BOTH',
        });
        markDirty(set, g);
    },
    updateRuleStep: (key, side, bucketId, order, patch) => {
        const g = clone(get().graph);
        const by = new Map(g.buckets.map((b) => [b.bucketId, b]));
        const r = g.ruleSets
            .find((x) => keyOf(x) === key)
            ?.rules.find((x) => x.side === side && x.durationBucketId === bucketId);
        if (!r) return;
        r.steps = r.steps.map((s) => {
            if (s.stepOrder !== order) return s;
            const b = patch.tenorBucketId ? by.get(patch.tenorBucketId) : null;
            return {
                ...s,
                ...patch,
                tenorBucketCode: b?.code ?? s.tenorBucketCode,
                tenorBucketLabel: b?.label ?? s.tenorBucketLabel,
            };
        });
        markDirty(set, g);
    },
    removeRuleStep: (key, side, bucketId, order) => {
        const g = clone(get().graph);
        const r = g.ruleSets
            .find((x) => keyOf(x) === key)
            ?.rules.find((x) => x.side === side && x.durationBucketId === bucketId);
        if (!r) return;
        r.steps = r.steps
            .filter((s) => s.stepOrder !== order)
            .map((s, i) => ({ ...s, stepOrder: i + 1 }));
        markDirty(set, g);
    },
    moveRuleStep: (key, side, bucketId, order, d) => {
        const g = clone(get().graph);
        const r = g.ruleSets
            .find((x) => keyOf(x) === key)
            ?.rules.find((x) => x.side === side && x.durationBucketId === bucketId);
        if (!r) return;
        const a = [...r.steps].sort((x, y) => x.stepOrder - y.stepOrder);
        const i = a.findIndex((s) => s.stepOrder === order),
            j = d === 'left' ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= a.length) return;
        [a[i], a[j]] = [a[j], a[i]];
        r.steps = a.map((s, i) => ({ ...s, stepOrder: i + 1 }));
        markDirty(set, g);
    },
}));
export function getWaterfallRuleSetKey(ruleSet: WaterfallRuleSet): string {
    return keyOf(ruleSet);
}
