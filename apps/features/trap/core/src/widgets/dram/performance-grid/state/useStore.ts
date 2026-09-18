/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { mockDataProvider as dp } from '../data/DataProvider';
import { ENT_EQ, ME, PMAP } from '../data/portfolios';
import { resolveGroup, emptyFilter } from '../data/filter';
import { activeView, uniqueViewName } from '../data/views';
import { STATIC_METRICS, PERIOD_METRICS } from '../data/catalog';
import { defaultConfig, computeFactor } from '../data/breakdownDefaults';
import { makeContext } from '../utils/context';
import { buildTree, sortNodes, activeSecs } from '../utils/tree';
import { orderedPeriods, insertPeriodCanonical } from '../grid/columns';
import type {
    Group,
    BenchKey,
    BreakdownLevel,
    ViewConfig,
    SavedView,
    SortState,
    CustomPeriod,
    FilterState,
    EngineContext,
    ModelPortfolio,
    EntityRef,
    TreeNode,
} from '../data/types';

/** Seed a demo target/model portfolio: equal-weight the 15 largest S&P names. */
function seedModels(): ModelPortfolio[] {
    const top = [...benchWeightsSeed()].sort((a, b) => b[1] - a[1]).slice(0, 15);
    const w = +(100 / (top.length || 1)).toFixed(2);
    return [
        {
            id: 'MODEL_EWT',
            name: 'Target — Equal-Weight Top 15',
            weights: Object.fromEntries(top.map(([id]) => [id, w])),
        },
    ];
}
function benchWeightsSeed(): Map<string, number> {
    return dp.benchWeights('SPX');
}

type DrawerTab = 'groups' | 'portfolios' | 'breakdown' | 'metrics' | 'periods' | 'display';
type SaveState = 'saved' | 'saving';

function metricDefaults(defs: Record<string, { def: boolean }>): Record<string, boolean> {
    return Object.fromEntries(Object.entries(defs).map(([k, m]) => [k, m.def]));
}

export function defaultCfg(): ViewConfig {
    return {
        // Default = no breakdown: a flat grid of all securities. Add levels to group.
        levels: [],
        periods: ['WTD', 'MTD', 'QTD', 'YTD', '1Y', '3Y', '5Y', '10Y'],
        staticM: metricDefaults(STATIC_METRICS),
        periodM: metricDefaults(PERIOD_METRICS),
        showBench: true,
        showBars: true,
        sort: { col: null, dir: -1 },
    };
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// Stable ids for breakdown levels (so drag-reorder tracks by identity, not index).
let _levelSeq = 0;
const newLevelId = () => 'lv' + ++_levelSeq;

// Stable ids for user-authored models.
let _modelSeq = 0;

// Stable ids for saved views.
let _viewSeq = 0;
const newViewId = () => 'vw' + ++_viewSeq;
export const mkView = (name: string, cfg: ViewConfig): SavedView => ({
    id: newViewId(),
    name,
    cfg,
});

/**
 * Guarantee a group carries a non-empty `views` array + a valid `activeViewId`,
 * migrating a legacy single `cfg` into one real "Default view". Returns a NEW
 * group object (never mutates); callers write it back into `groups`.
 */
function withViews(group: Group): Group {
    if (group.views && group.views.length) {
        const activeViewId = group.views.some((v) => v.id === group.activeViewId)
            ? group.activeViewId
            : group.views[0].id;
        return activeViewId === group.activeViewId ? group : { ...group, activeViewId };
    }
    const view = mkView('Default view', group.cfg ?? defaultCfg());
    const { cfg: _legacy, ...rest } = group;
    return { ...rest, views: [view], activeViewId: view.id };
}
/** Assign a stable id to any level that lacks one (ids travel with the level). */
const ensureLevelIds = (levels: BreakdownLevel[]): BreakdownLevel[] =>
    levels.map((l) => (l.id ? l : { ...l, id: newLevelId() }));

/** All entitled equity portfolios, sorted by name — the quick-run universe. */
export const allEntitled = () => [...ENT_EQ].sort((a, b) => a.name.localeCompare(b.name));

export type Metric = {
    accessor: string;
    columnGroupKey: string;
    columnGroupLabel: string;
    columnGroupOrder: number;
    displayName: string;
    format: string;
    frozen: boolean;
    group: string;
    isVisible: boolean;
    metricId: string;
    metricType: string;
    order: number;
    enabled?: boolean;
};

export type RunMode = 'quick' | 'group';
export type Taxonomy = {
    taxonomyName: string;
    taxonomyCode: string;
    shortLabel: string;
    levelNumber: number;
    displayName: string;
    description: string;
    capabilityKey: string;
    attributeDisplayName: string;
    levelLabels: string;
};
export interface StoreState {
    // selection
    groups: Group[];
    activeGroup: number;
    /** "quick" = ad-hoc run over all entitled portfolios (no group); "group" = a saved group. */
    mode: RunMode;
    port: string;
    bench: BenchKey;
    date: string;

    // active view (belongs to the active group; auto-saved back into it)
    levels: BreakdownLevel[];
    periods: string[];
    staticM: Record<string, boolean>;
    periodM: Record<string, boolean>;
    showBench: boolean;
    showBars: boolean;
    sort: SortState;
    customPeriods: CustomPeriod[];

    /** v2: user-authored model/target portfolios available as comparators. */
    models: ModelPortfolio[];
    addModel: (m: ModelPortfolio) => void;
    updateModel: (id: string, patch: Partial<ModelPortfolio>) => void;
    deleteModel: (id: string) => void;
    /** id gen for freshly authored models (kept unique across a session). */
    newModelId: () => string;
    /** model editor modal: null = closed; "" = new; else the model id being edited. */
    modelEditorId: string | null;
    openModelEditor: (id: string | null) => void;
    closeModelEditor: () => void;

    // grid interaction
    expanded: Set<string>;
    editLevel: number;

    // drawer + browser
    drawerOpen: boolean;
    drawerTab: DrawerTab;
    flt: FilterState;
    resSort: string;
    favTick: number;
    addTarget: number;
    openFacet: string | null;

    // custom-period form
    custOpen: boolean;
    custDraft: Partial<CustomPeriod> | null;
    custSeq: number;

    // auto-save affordance
    saveState: SaveState;

    // transient animation signals (group-card bump when members are added)
    bumpSeq: number;
    bumpGi: number;

    // ---- actions ----
    boot: () => void;
    ctx: () => EngineContext;
    seedExpand: () => void;
    saveCfg: (groupIndex: number) => void;
    loadCfg: (groupIndex: number) => void;
    switchActive: (groupIndex: number) => void;
    /** multiple views per group */
    switchView: (groupIndex: number, id: string) => void;
    addView: (groupIndex: number) => void;
    renameView: (groupIndex: number, id: string, name: string) => void;
    deleteView: (groupIndex: number, id: string) => void;
    enterQuickRun: () => void;
    markDirty: () => void;

    setPort: (pid: string) => void;
    /** v2: comparator override (portfolio/model/composite). null = use the group'state index. */
    comparatorOverride: EntityRef | null;
    setComparatorOverride: (c: EntityRef | null) => void;
    /** v2: comparator'state own as-of. Used only when linkAsOf is false (drift compare). */
    comparatorAsOf: string;
    linkAsOf: boolean;
    setComparatorAsOf: (d: string) => void;
    setLinkAsOf: (v: boolean) => void;
    setDate: (d: string) => void;
    toggleExpand: (id: string) => void;
    expandAll: () => void;
    collapseAll: () => void;
    setSort: (col: string) => void;

    openDrawer: (tab: DrawerTab) => void;
    closeDrawer: () => void;
    setDrawerTab: (tab: DrawerTab) => void;

    /** v2: which tab the Selector'state slide-out shows (Groups / Portfolios). */
    selectorTab: 'groups' | 'portfolios';
    setSelectorTab: (t: 'groups' | 'portfolios') => void;
    /** v2: the Selector'state management slide-out (Groups/Portfolios/Share) open state. */
    managerOpen: boolean;
    openManager: () => void;
    closeManager: () => void;
    toggleManager: () => void;

    /** Share is a sub-view of the Selector widget (not its own drawer). */
    sharing: boolean;
    startShare: () => void;
    endShare: () => void;

    // breakdown builder
    setEditLevel: (i: number) => void;
    updateLevels: (fn: (draft: BreakdownLevel[]) => BreakdownLevel[] | void) => void;
    setLevels: (levels: BreakdownLevel[]) => void;
    addLevel: () => void;
    removeLevel: (i: number) => void;
    setLevelClass: (i: number, cls: BreakdownLevel['cls']) => void;
    reorderLevel: (from: number, to: number) => void;
    moveLevel: (from: number, to: number) => void;
    resetView: () => void;

    setTaxonomiesCatalog: (values: Record<string, Taxonomy[]>) => void;
    taxanomiesCatalog: Record<string, Taxonomy[]>;
    setAttributionCatalog: (values: Record<string, [string, string][]>) => void;
    attributionCatalog: Record<string, [string, string][]>;

    // metrics + display
    toggleMetric: (kind: 'static' | 'period', k: string) => void;
    setShowBench: (v: boolean) => void;
    setShowBars: (v: boolean) => void;
    setMetrics: (metrics: Metric[]) => void;
    metrics: Metric[];

    // periods
    togglePeriod: (p: string) => void;
    movePeriod: (from: number, to: number) => void;
    addCustomPeriod: (d: Partial<CustomPeriod>) => void;
    removeCustomPeriod: (key: string) => void;
    setCustOpen: (v: boolean) => void;
    setCustDraft: (d: Partial<CustomPeriod> | null) => void;

    // portfolio browser + groups
    setSearch: (v: string) => void;
    toggleQuick: (k: 'me' | 'fav' | 'recent') => void;
    toggleFacetVal: (dim: string, val: string) => void;
    clearFilters: () => void;
    setFacetOpen: (dim: string | null) => void;
    setResSort: (v: string) => void;
    setAddTarget: (groupIndex: number) => void;
    toggleMember: (groupIndex: number, pid: string) => void;
    addFilteredToTarget: (ids: string[]) => void;
    newGroup: () => void;
    deleteGroup: (groupIndex: number) => void;
    renameGroup: (groupIndex: number, name: string) => void;
    showOnGrid: (groupIndex: number) => void;
    toggleFav: (id: string) => void;
    syncSmartIfTarget: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useAttributionStore = create<StoreState>((set, get) => ({
    groups: [],
    activeGroup: 0,
    mode: 'quick',
    port: '',
    bench: 'SPX',
    date: '2026-06-30',

    metrics: [],

    levels: [],
    periods: ['YTD', 'QTD', 'MTD'],
    staticM: metricDefaults(STATIC_METRICS),
    periodM: metricDefaults(PERIOD_METRICS),
    showBench: true,
    showBars: true,
    sort: { col: null, dir: -1 },
    customPeriods: [],

    models: [],
    modelEditorId: null,
    comparatorOverride: null,
    comparatorAsOf: '2026-06-30',
    linkAsOf: true,

    expanded: new Set(),
    editLevel: 0,

    drawerOpen: false,
    drawerTab: 'breakdown' as const,
    selectorTab: 'groups',
    managerOpen: false,
    flt: { ...emptyFilter(), me: true },
    resSort: 'name',
    favTick: 0,
    addTarget: 0,
    openFacet: null,

    custOpen: false,
    custDraft: null,
    custSeq: 1,

    saveState: 'saved',
    bumpSeq: 0,
    bumpGi: -1,
    setTaxonomiesCatalog: (values: Record<string, Taxonomy[]>) => {
        set({ taxanomiesCatalog: values });
    },
    setAttributionCatalog: (values: Record<string, [string, string][]>) => {
        set({ attributionCatalog: values });
    },
    setMetrics: (metrics: Metric[]) => {
        set({ metrics });
    },
    taxanomiesCatalog: {},
    attributionCatalog: {},
    ctx: () => {
        const state = get();
        // v2: subject = the selected portfolio, comparator = its index. As selection
        // state lands, these become composite/model/portfolio + independent as-of.
        return makeContext(dp, {
            subject: { kind: 'portfolio', id: state.port },
            comparator: state.comparatorOverride ?? { kind: 'index', key: state.bench },
            subjectAsOf: state.date,
            comparatorAsOf: state.linkAsOf ? state.date : state.comparatorAsOf,
            periods: state.periods,
            customPeriods: state.customPeriods,
            showBench: state.showBench,
            models: state.models,
        });
    },

    // First run is intentionally empty: no groups. Land in a "quick run" over all
    // entitled TCW portfolios so the user can pick one and analyze immediately.
    boot: () => {
        const customPeriods: CustomPeriod[] = [
            { key: 'CUST1', label: 'Since Inception', kind: 'itd', factor: 3.2, seed: 11 },
        ];
        set({ groups: [], customPeriods, custSeq: 1, activeGroup: 0, models: seedModels() });
        get().enterQuickRun();
    },

    // Quick run = ad-hoc analysis of a single entitled portfolio with a default view,
    // not tied to any group. View changes apply live but are not saved.
    enterQuickRun: () => {
        if (get().mode === 'group') get().saveCfg(get().activeGroup);
        const dc = defaultCfg();
        const cur = get().port;
        const first = allEntitled()[0];
        const port = PMAP[cur] && PMAP[cur].eq ? cur : first ? first.id : '';
        set({
            mode: 'quick',
            levels: ensureLevelIds(clone(dc.levels)),
            periods: [...dc.periods],
            staticM: { ...dc.staticM },
            periodM: { ...dc.periodM },
            showBench: dc.showBench,
            showBars: dc.showBars,
            sort: { ...dc.sort },
            editLevel: 0,
            expanded: new Set(),
            port,
            bench: PMAP[port] ? PMAP[port].bench : 'SPX',
            comparatorOverride: null, // new scope → back to the index comparator
        });
        get().seedExpand();
    },

    seedExpand: () => {
        const state = get();
        const secs = activeSecs(dp.securities(), state.ctx());
        const top = sortNodes(buildTree(secs, state.levels, state.ctx()), state.sort).slice(0, 2);
        const expanded = new Set<string>();
        top.forEach((n) => expanded.add(n.id));
        set({ expanded });
    },

    saveCfg: (groupIndex) => {
        const state = get();
        const g0 = state.groups[groupIndex];
        if (!g0) return;
        const group = withViews(g0);
        const cfg: ViewConfig = {
            levels: clone(state.levels),
            periods: [...state.periods],
            staticM: { ...state.staticM },
            periodM: { ...state.periodM },
            showBench: state.showBench,
            showBars: state.showBars,
            sort: { ...state.sort },
        };
        const views = group.views!.map((v) => (v.id === group.activeViewId ? { ...v, cfg } : v));
        const groups = state.groups.slice();
        groups[groupIndex] = { ...group, views };
        set({ groups });
    },

    loadCfg: (groupIndex) => {
        const state = get();
        const g0 = state.groups[groupIndex];
        const group = g0 ? withViews(g0) : undefined;
        // Persist the migration/normalization so activeViewId sticks.
        if (group && group !== g0) {
            const groups = state.groups.slice();
            groups[groupIndex] = group;
            set({ groups });
        }
        const c = (group && activeView(group)?.cfg) || defaultCfg();
        set({
            levels: ensureLevelIds(clone(c.levels)),
            periods: [...c.periods],
            staticM: { ...c.staticM },
            periodM: { ...c.periodM },
            showBench: c.showBench !== false,
            showBars: c.showBars !== false,
            sort: { ...c.sort },
            editLevel: 0,
        });
    },

    // ---- multiple views per group ----
    switchView: (groupIndex, id) => {
        const state = get();
        const onGrid = state.mode === 'group' && groupIndex === state.activeGroup;
        if (onGrid) state.saveCfg(groupIndex); // persist edits to the outgoing view first
        const group = withViews(get().groups[groupIndex]);
        if (!group.views!.some((v) => v.id === id)) return;
        const groups = get().groups.slice();
        groups[groupIndex] = { ...group, activeViewId: id };
        set({ groups });
        if (onGrid) {
            get().loadCfg(groupIndex);
            set({ expanded: new Set() });
            get().seedExpand();
        }
        get().markDirty();
    },

    addView: (groupIndex) => {
        const state = get();
        const onGrid = state.mode === 'group' && groupIndex === state.activeGroup;
        if (onGrid) state.saveCfg(groupIndex); // capture current edits before branching a new view
        const group = withViews(get().groups[groupIndex]);
        const base = activeView(group)?.cfg ?? defaultCfg();
        const view = mkView(uniqueViewName(group, 'New view'), clone(base));
        const groups = get().groups.slice();
        groups[groupIndex] = { ...group, views: [...group.views!, view], activeViewId: view.id };
        set({ groups });
        if (onGrid) {
            get().loadCfg(groupIndex);
            set({ expanded: new Set() });
            get().seedExpand();
        }
        get().markDirty();
    },

    renameView: (groupIndex, id, name) => {
        const group = withViews(get().groups[groupIndex]);
        const views = group.views!.map((v) => (v.id === id ? { ...v, name } : v));
        const groups = get().groups.slice();
        groups[groupIndex] = { ...group, views };
        set({ groups });
        get().markDirty();
    },

    deleteView: (groupIndex, id) => {
        const state = get();
        const group = withViews(get().groups[groupIndex]);
        if (group.views!.length <= 1) return; // always keep at least one view
        const views = group.views!.filter((v) => v.id !== id);
        const activeViewId = group.activeViewId === id ? views[0].id : group.activeViewId;
        const groups = get().groups.slice();
        groups[groupIndex] = { ...group, views, activeViewId };
        set({ groups });
        if (
            state.mode === 'group' &&
            groupIndex === state.activeGroup &&
            group.activeViewId === id
        ) {
            get().loadCfg(groupIndex);
            set({ expanded: new Set() });
            get().seedExpand();
        }
        get().markDirty();
    },

    switchActive: (groupIndex) => {
        const state = get();
        if (state.mode === 'group') state.saveCfg(state.activeGroup);
        set({ activeGroup: groupIndex, mode: 'group' });
        get().loadCfg(groupIndex);
        const group = get().groups[groupIndex];
        const mem = resolveGroup(group);
        {
            const p = mem[0] || get().port;
            set({
                port: p,
                bench: PMAP[p] ? PMAP[p].bench : 'SPX',
                expanded: new Set(),
                comparatorOverride: null,
            });
        }
        get().seedExpand();
    },

    markDirty: () => {
        const state = get();
        // Quick run isn't tied to a group, so there'state nothing to persist.
        if (state.mode !== 'group') return;
        state.saveCfg(state.activeGroup);
        set({ saveState: 'saving' });
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => set({ saveState: 'saved' }), 600);
    },

    setPort: (pid) => {
        // Benchmark is always the selected portfolio'state own — it follows the portfolio.
        set({ port: pid, bench: PMAP[pid] ? PMAP[pid].bench : get().bench, expanded: new Set() });
        get().seedExpand();
    },
    setDate: (d) => set({ date: d }),
    setComparatorOverride: (c) => set({ comparatorOverride: c }),

    addModel: (m) => set((state) => ({ models: [...state.models, m] })),
    updateModel: (id, patch) =>
        set((state) => ({
            models: state.models.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
    deleteModel: (id) =>
        set((state) => {
            const co = state.comparatorOverride;
            // if the deleted model was the live comparator, fall back to the index bench
            const cleared = co && co.kind === 'model' && co.id === id ? null : co;
            return { models: state.models.filter((m) => m.id !== id), comparatorOverride: cleared };
        }),
    newModelId: () => 'MODEL_U' + ++_modelSeq,
    openModelEditor: (id) => set({ modelEditorId: id }),
    closeModelEditor: () => set({ modelEditorId: null }),

    setComparatorAsOf: (d) => set({ comparatorAsOf: d }),
    setLinkAsOf: (v) => set({ linkAsOf: v, ...(v ? { comparatorAsOf: get().date } : {}) }),

    toggleExpand: (id) => {
        const expanded = new Set(get().expanded);
        if (expanded.has(id)) expanded.delete(id);
        else expanded.add(id);
        set({ expanded });
    },
    expandAll: () => {
        const state = get();
        const tree = sortNodes(
            buildTree(activeSecs(dp.securities(), state.ctx()), state.levels, state.ctx()),
            state.sort
        );
        const expanded = new Set<string>();
        const walk = (nodes: TreeNode[]) =>
            nodes.forEach((n) => {
                if (!n.leaf) {
                    expanded.add(n.id);
                    if (n.children) walk(n.children);
                }
            });
        walk(tree);
        set({ expanded });
    },
    collapseAll: () => set({ expanded: new Set() }),

    setSort: (col) => {
        const { sort } = get();
        let next: SortState;
        if (sort.col === col) {
            next = sort.dir < 0 ? { col, dir: 1 } : { col: null, dir: -1 };
        } else {
            next = { col, dir: -1 };
        }
        set({ sort: next });
        get().markDirty();
    },

    openDrawer: (tab) => {
        if (tab === 'groups') set({ openFacet: null, addTarget: get().activeGroup });
        set({ drawerOpen: true, drawerTab: tab, sharing: false });
    },
    closeDrawer: () => set({ drawerOpen: false, openFacet: null }),
    setDrawerTab: (tab) => set({ drawerTab: tab, openFacet: null }),

    setSelectorTab: (t) =>
        set({
            selectorTab: t,
            managerOpen: true,
            openFacet: null,
            sharing: false,
            addTarget: get().activeGroup,
        }),
    openManager: () => set({ managerOpen: true }),
    closeManager: () => set({ managerOpen: false, sharing: false, openFacet: null }),
    toggleManager: () => set({ managerOpen: !get().managerOpen, sharing: false, openFacet: null }),

    sharing: false,
    startShare: () => set({ sharing: true, managerOpen: true }),
    endShare: () => set({ sharing: false }),

    // ---- breakdown builder ----
    setEditLevel: (i) => set({ editLevel: i }),
    updateLevels: (fn) => {
        const draft = clone(get().levels);
        const res = fn(draft);
        set({ levels: res ?? draft });
        get().markDirty();
    },
    setLevels: (levels: BreakdownLevel[]) => {
        set({ levels });
    },
    addLevel: () => {
        const levels = clone(get().levels);
        levels.push({
            id: newLevelId(),
            cls: 'attribute',
            config: defaultConfig('attribute'),
        } as BreakdownLevel);
        set({ levels, editLevel: levels.length - 1 });
        get().markDirty();
    },
    removeLevel: (i) => {
        const levels = clone(get().levels);
        levels.splice(i, 1);
        // Zero levels is valid — a flat, ungrouped security grid. Keep editLevel in range.
        set({ levels, editLevel: Math.max(0, Math.min(get().editLevel, levels.length - 1)) });
        get().markDirty();
    },
    setLevelClass: (i, cls) => {
        const levels = clone(get().levels);
        // keep the level'state id so the drag identity is stable across a class change
        levels[i] = {
            id: levels[i].id ?? newLevelId(),
            cls,
            config: defaultConfig(cls),
        } as BreakdownLevel;

        set({ levels });
        get().markDirty();
    },
    reorderLevel: (from, to) => {
        const levels = clone(get().levels);
        const editedRef = get().editLevel;
        const editedItem = levels[editedRef];
        const [it] = levels.splice(from, 1);
        let t = to;
        if (from < t) t--;
        t = Math.max(0, Math.min(t, levels.length));
        levels.splice(t, 0, it);
        set({ levels, editLevel: Math.max(0, levels.indexOf(editedItem)) });
        get().markDirty();
    },
    // arrayMove semantics (both args are item indices) — used by the dnd-kit sortable.
    // Shallow copy preserves item references so the edit selection follows its level.
    moveLevel: (from, to) => {
        const editedItem = get().levels[get().editLevel];
        const arr = [...get().levels];
        const [it] = arr.splice(from, 1);
        arr.splice(to, 0, it);
        set({ levels: arr, editLevel: Math.max(0, arr.indexOf(editedItem)) });
        get().markDirty();
    },
    resetView: () => {
        set({
            levels: [], // reset = default = flat (no breakdown)
            editLevel: 0,
            periods: ['YTD', 'QTD', 'MTD'],
        });
        get().markDirty();
    },

    // ---- metrics + display ----
    toggleMetric: (_, key: string) => {
        const metrics = get().metrics.map((el) =>
            el.metricId === key ? { ...el, enabled: !el.enabled } : el
        );
        set({ metrics });
        get().markDirty();
    },
    setShowBench: (v) => {
        set({ showBench: v });
        get().markDirty();
    },
    setShowBars: (v) => {
        set({ showBars: v });
        get().markDirty();
    },

    // ---- periods ----
    togglePeriod: (p) => {
        const cur = get().periods;
        let periods: string[];
        if (cur.includes(p)) {
            if (cur.length <= 1) return; // keep at least one period
            periods = cur.filter((x) => x !== p);
        } else {
            periods = insertPeriodCanonical(cur, p);
        }
        set({ periods });
        get().markDirty();
    },
    movePeriod: (from, to) => {
        const ordered = orderedPeriods(get().periods, get().customPeriods);
        if (from < 0 || to < 0 || from >= ordered.length || to >= ordered.length) return;
        const [it] = ordered.splice(from, 1);
        ordered.splice(to, 0, it);
        set({ periods: ordered });
        get().markDirty();
    },
    addCustomPeriod: (date) => {
        const seq = get().custSeq + 1;
        const key = 'CUST' + seq;
        const label =
            (date.label || '').trim() ||
            (
                {
                    range: 'Custom range',
                    trailing: `Trailing ${date.dur}${date.unit}`,
                    itd: 'Since inception',
                } as Record<string, string>
            )[date.kind || 'range'];
        const cp: CustomPeriod = {
            key,
            label,
            kind: date.kind || 'range',
            start: date.start,
            end: date.end,
            dur: date.dur,
            unit: date.unit,
            factor: 1,
            seed: seq * 13 + label.length,
        };
        cp.factor = computeFactor(cp);
        set({
            customPeriods: [...get().customPeriods, cp],
            periods: [...get().periods, key],
            custSeq: seq,
            custOpen: false,
            custDraft: null,
        });
        get().markDirty();
    },
    removeCustomPeriod: (key) => {
        set({
            customPeriods: get().customPeriods.filter((c) => c.key !== key),
            periods: get().periods.filter((p) => p !== key),
        });
        get().markDirty();
    },
    setCustOpen: (v) => set({ custOpen: v }),
    setCustDraft: (d) => set({ custDraft: d }),

    // ---- portfolio browser + groups ----
    setSearch: (v) => {
        set({ flt: { ...get().flt, search: v } });
        get().syncSmartIfTarget();
    },
    toggleQuick: (k) => {
        set({ flt: { ...get().flt, [k]: !get().flt[k] } });
        get().syncSmartIfTarget();
    },
    toggleFacetVal: (dim, val) => {
        const flt = { ...get().flt };
        const state = new Set(flt[dim as keyof FilterState] as Set<string>);
        if (state.has(val)) state.delete(val);
        else state.add(val);
        (flt as unknown as Record<string, Set<string>>)[dim] = state;
        set({ flt });
        get().syncSmartIfTarget();
    },
    clearFilters: () => {
        set({ flt: { ...emptyFilter(), search: get().flt.search } });
        get().syncSmartIfTarget();
    },
    setFacetOpen: (dim) => set({ openFacet: dim }),
    setResSort: (v) => set({ resSort: v }),
    setAddTarget: (groupIndex) => {
        const group = get().groups[groupIndex];
        if (group && group.smart && group.filter) {
            set({
                addTarget: groupIndex,
                flt: {
                    search: group.filter.search || '',
                    me: !!group.filter.me,
                    fav: !!group.filter.fav,
                    recent: !!group.filter.recent,
                    strategies: new Set(group.filter.strategies),
                    benches: new Set(group.filter.benches),
                    regions: new Set(group.filter.regions),
                    accts: new Set(group.filter.accts),
                    abands: new Set(group.filter.abands),
                },
            });
        } else {
            set({ addTarget: groupIndex });
        }
    },
    // Direct membership toggle from the Portfolios browser: checked row = in group.
    toggleMember: (groupIndex, pid) => {
        const state = get();
        const group = state.groups[groupIndex];
        if (!group || group.smart) return; // smart membership is filter-defined, not manual
        const ports = group.ports || [];
        const has = ports.includes(pid);
        const groups = state.groups.slice();
        groups[groupIndex] = {
            ...group,
            ports: has ? ports.filter((x) => x !== pid) : [...ports, pid],
        };
        set({ groups, bumpGi: groupIndex, bumpSeq: has ? state.bumpSeq : state.bumpSeq + 1 });
        get().markDirty();
    },
    // Bulk "add all filtered" — union the given ids into the target group.
    addFilteredToTarget: (ids) => {
        const state = get();
        const groupIndex = state.addTarget;
        const group = state.groups[groupIndex];
        if (!group || group.smart) return;
        const union = new Set(group.ports || []);
        ids.forEach((id) => union.add(id));
        const groups = state.groups.slice();
        groups[groupIndex] = { ...group, ports: [...union] };
        set({ groups, bumpGi: groupIndex, bumpSeq: state.bumpSeq + 1 });
        get().markDirty();
    },
    newGroup: () => {
        // seed a default view so the group'state summary is meaningful and round-trips
        const view = mkView('Default view', defaultCfg());
        const groups = [
            ...get().groups,
            { name: 'Untitled group', ports: [], views: [view], activeViewId: view.id },
        ];
        set({ groups });
        get().setAddTarget(groups.length - 1);
        get().markDirty();
    },
    deleteGroup: (groupIndex) => {
        const state = get();
        const activeRef = state.groups[state.activeGroup];
        const groups = state.groups.slice();
        groups.splice(groupIndex, 1);
        let addTarget = state.addTarget;
        if (addTarget >= groups.length) addTarget = Math.max(0, groups.length - 1);
        // Deleting the last group returns to quick run.
        if (!groups.length) {
            set({ groups, addTarget: 0, activeGroup: 0 });
            get().enterQuickRun();
            return;
        }
        let idx = groups.indexOf(activeRef);
        if (idx < 0) idx = Math.min(state.activeGroup, groups.length - 1);
        if (idx < 0) idx = 0;
        set({ groups, addTarget, activeGroup: idx });
        // Only re-point the grid if a group is currently on it.
        if (state.mode === 'group') {
            get().loadCfg(idx);
            const group = groups[idx];
            const mem = resolveGroup(group);
            {
                const p = mem[0] || get().port;
                set({ port: p, bench: PMAP[p] ? PMAP[p].bench : 'SPX', expanded: new Set() });
            }
            get().seedExpand();
        }
        get().markDirty();
    },
    renameGroup: (groupIndex, name) => {
        const groups = get().groups.slice();
        groups[groupIndex] = { ...groups[groupIndex], name };
        set({ groups });
        get().markDirty();
    },
    showOnGrid: (groupIndex) => {
        if (!resolveGroup(get().groups[groupIndex]).length) return;
        get().switchActive(groupIndex);
    },
    toggleFav: (id) => {
        const p = PMAP[id];
        if (p) p.fav = !p.fav;
        // p.fav is a mutation on the shared universe object (outside store state), so
        // bump a dedicated tick to notify subscribers and force a re-render.
        set({ favTick: get().favTick + 1 });
    },

    // internal: keep a smart target'state filter in sync with the live facet state
    syncSmartIfTarget: () => {
        const state = get();
        const group = state.groups[state.addTarget];
        if (group && group.smart) {
            const groups = state.groups.slice();
            groups[state.addTarget] = { ...group, filter: { ...state.flt } };
            set({ groups });
        }
    },
}));
