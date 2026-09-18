/**
 * DRAM 2.0 — typed data model.
 * Ports the shapes implied by the vanilla-JS prototype into an explicit domain model.
 */

export type Region = 'N. America' | 'Europe' | 'Asia Pac';
export type PortfolioRegion = 'US' | 'Global' | 'Intl' | 'Sector';
export type Currency = 'USD' | 'EUR' | 'TWD';
export type BenchKey = 'SPX' | 'R1G' | 'MSCI' | 'EAFE';
export type DrawerTab = 'breakdown' | 'metrics' | 'periods' | 'display';
/** A single security in the base universe (holdings are drawn from here). */
export interface Security {
    id: string;
    name: string;
    sector: string;
    industry: string;
    gicsGroup: string;
    region: Region;
    currency: Currency;
    mktcap: number; // $B
    beta: number;
    divYld: number; // %
    pe: number;
    spxElig: boolean;
    worldElig: boolean;
    idx: number;
    /** Seeded returns per standard period, in %. */
    ret: Partial<Record<string, number>>;
}

export interface Benchmark {
    key: BenchKey;
    name: string;
    /** Eligibility predicate over the universe. */
    elig: (s: Security) => boolean;
}

/** A firm-master portfolio with entitlement metadata (C1 / C15). */
export interface Portfolio {
    id: string;
    name: string;
    strategy: string;
    region: PortfolioRegion;
    bench: BenchKey;
    assetClass: 'Equity' | 'Fixed Income' | 'Emerging Mkts';
    manager: string;
    team: string;
    acct: string;
    aum: number; // $B
    aband: string;
    ent: boolean; // entitled to the current user
    me: boolean; // managed by the current user
    fav: boolean;
    recent: boolean;
    seed: number;
    names: number;
    tilt: number;
    eq: boolean; // selectable (equity)
}

/* ===================== breakdown levels (discriminated union) ===================== */

export type CompareOp = '≤' | '<' | '≥' | '>' | '=' | 'between';

export interface Band {
    label: string;
    op: CompareOp;
    val: number | string;
    val2?: number | string;
    color: string;
}

export interface Rule {
    attr: string;
    op: CompareOp;
    val: number | string;
    join?: 'AND' | 'OR';
}

export interface RuleGroup {
    name: string;
    color: string;
    rules: Rule[];
}

export type UnmatchedPolicy = 'bucket' | 'exclude';

/** Stable per-level id (assigned lazily by the store) so drag-reorder can track
 *  items by identity, not by array index. Optional on the type; guaranteed present
 *  on the active levels via ensureLevelIds. */
export interface AttributeLevel {
    id?: string;
    cls: 'attribute';
    config: { field: string; label: string };
}
export interface BandLevel {
    id?: string;
    cls: 'band';
    config: { attr: string; bands: Band[]; unmatched?: UnmatchedPolicy };
}
export interface NtileLevel {
    id?: string;
    cls: 'ntile';
    config: { attr: string; n: number; dir: 'asc' | 'desc' };
}
export interface ConditionalLevel {
    id?: string;
    cls: 'conditional';
    config: { groups: RuleGroup[]; unmatched?: UnmatchedPolicy };
}

export interface TaxonomyLevel {
    id?: string;
    cls: 'taxonomy';
    config: { label: string; value: string; level: string };
}
export type BreakdownLevel =
    | AttributeLevel
    | BandLevel
    | NtileLevel
    | ConditionalLevel
    | TaxonomyLevel;

/* ===================== periods ===================== */

export type CustomKind = 'range' | 'trailing' | 'itd';

export interface CustomPeriod {
    key: string;
    label: string;
    kind: CustomKind;
    start?: string;
    end?: string;
    dur?: number | string;
    unit?: 'D' | 'M' | 'Y';
    factor: number;
    seed: number;
}

/* ===================== per-group view config (C11) ===================== */

export interface SortState {
    col: string | null;
    dir: 1 | -1;
}

export interface ViewConfig {
    levels: BreakdownLevel[];
    periods: string[];
    staticM: Record<string, boolean>;
    periodM: Record<string, boolean>;
    showBench: boolean;
    showBars: boolean;
    sort: SortState;
}

/** A named saved view within a group — its own breakdown / periods / metrics / display. */
export interface SavedView {
    id: string;
    name: string;
    cfg: ViewConfig;
}

/** Facet filter snapshot used by Smart groups + the browser. */
export interface FilterState {
    search: string;
    me: boolean;
    fav: boolean;
    recent: boolean;
    strategies: Set<string>;
    benches: Set<string>;
    regions: Set<string>;
    accts: Set<string>;
    abands: Set<string>;
}

/** A user portfolio group — static (hand-picked) or smart (auto-updating filter).
 *  A group has NO benchmark of its own — the benchmark is a property of each
 *  Portfolio (portfolio.bench), so the comparator follows the selected portfolio. */
export interface Group {
    name: string;
    ports?: string[]; // static members
    smart?: boolean;
    filter?: FilterState; // smart definition
    views?: SavedView[]; // named saved views (breakdown / periods / metrics / display)
    activeViewId?: string; // which view is currently applied to the grid
    /** @deprecated legacy single view — migrated into `views` on first access. */
    cfg?: ViewConfig;
}

/* ===================== comparator / selection model (v2) ===================== */
/*
 * v2 redesign: analysis is a symmetric comparison of two sides (subject vs
 * comparator), each a resolvable entity at a point in time. Every entity kind
 * resolves to a weight map (securityId → weight %); that is the ONLY thing that
 * differs between them, which keeps the roll-up math unchanged (no attribution
 * math — see docs/architecture-v2.md).
 */

/** A user-authored "target" / model portfolio used as a comparator. */
export interface ModelPortfolio {
    id: string;
    name: string;
    weights: Record<string, number>; // securityId → weight %
}

/** Something a side of the comparison can point at; all resolve to a weight map. */
export type EntityRef =
    | { kind: 'portfolio'; id: string }
    | { kind: 'composite'; ids: string[] } // group → AUM-weighted blend of members
    | { kind: 'index'; key: BenchKey } // SPX, R1G, MSCI, EAFE …
    | { kind: 'model'; id: string }; // user-authored target weights

/** One side of the comparison — an entity resolved as-of a business date. */
export interface Side {
    entity: EntityRef;
    asOf: string; // ISO month-end date
}

/** The full selection emitted by the Selector widget over the Zustand bus. */
export interface Selection {
    subject: Side; // "A" — the portfolio(s) being analysed
    comparator: Side; // "B" — index / portfolio / composite / model / itself@date
    linkAsOf: boolean; // true → one date drives both; false → independent (drift)
}

/* ===================== engine outputs ===================== */

export interface PeriodAgg {
    retP: number;
    benchRet: number;
    activeRet: number;
    contrib: number; // bps
    activeCon: number; // bps
}

export interface Agg {
    count: number;
    weight: number;
    benchWt: number;
    activeWt: number;
    beta: number;
    divYld: number;
    pe: number;
    byPeriod: Record<string, PeriodAgg>;
}

export interface TreeNode {
    /** Globally-unique id built from the ancestor path (drives React keys + drill-down set). */
    id: string;
    leaf: boolean;
    name: string;
    sub?: string;
    color?: string | null;
    order: number;
    unclass?: boolean;
    agg: Agg;
    sec?: Security;
    children?: TreeNode[];
    _list?: Security[];
}

/** Context threaded into the pure engine (replaces the prototype's global reads). */
export interface EngineContext {
    port: string;
    bench: BenchKey;
    periods: string[];
    customPeriods: CustomPeriod[];
    showBench: boolean;
    portWeight: (s: Security) => number;
    benchWeight: (s: Security) => number;
    returnOf: (s: Security, period: string) => number;
}
