/**
 * Scenario Matrix — types shared by the widget, its state machine, and the
 * dataset contract (ds_scenario_matrix_01). Everything the matrix renders is
 * data-driven: assumption rows, analytics groups, scenario templates and unit
 * choices all arrive from `bootstrap`, keyed by asset class.
 */

// ── Dataset contract (bootstrap) ──────────────────────────────────────────────
export type AssumptionRow = {
    id: string;
    label: string;
    sublabel?: string;
    /** Allowed unit tokens; units[0] is the default. Passed to Compute untouched. */
    units: string[];
    defaultOn: boolean;
};

export type AnalyticsMetric = {
    key: string;
    label: string;
    unit: string;
    format: "price" | "percent" | "number" | "years" | "bp";
};

export type AnalyticsGroup = {
    id: string;
    label: string;
    dot: string;
    metrics: AnalyticsMetric[];
};

export type ScenarioTemplate = {
    id: string;
    name: string;
    color: string;
    seeds: Record<string, number>;
    price: number;
};

export type PresetSnapshot = {
    ver: number;
    by: string;
    when: string;
    snapshot: PresetSnapshotBody;
};

export type PresetSnapshotBody = {
    rowsOn: Record<string, boolean>;
    units: Record<string, string>;
    scenarios: Array<{
        name: string;
        color: string;
        price: number;
        vals: Record<string, number>;
    }>;
};

export type PresetDoc = {
    profileKey: string;
    default: PresetSnapshot | null;
    lastRun: PresetSnapshot | null;
};

export type TrancheOption = { id: string; name: string };

export type BootstrapResult = {
    assetClass: string;
    profileKey: string;
    maxScenarioColumns: number;
    assumptionRows: AssumptionRow[];
    analyticsGroups: AnalyticsGroup[];
    scenarioTemplates: ScenarioTemplate[];
    tranches: TrancheOption[];
    presetDoc: PresetDoc;
};

// ── Dataset contract (run) ────────────────────────────────────────────────────
/**
 * One amortization period. Mirrors the INTEX/desk cash-flow schedule columns:
 * Period · Date · Principal · Interest · Cashflow · Balance, plus the extra
 * default/recovery detail retained for the tooltip and export.
 *
 *   cashflow = principal + interest   (total remittance for the period)
 *   balance  = ending pool/tranche balance after the period (== endBal)
 *
 * `date` is a preformatted display string ("Sep 15, 2026") produced by the
 * Compute/mock layer — the UI never parses or reformats it.
 */
export type CashflowPeriod = {
    period: number;
    /** Preformatted payment date, e.g. "Sep 15, 2026". */
    date: string;
    beginBal: number;
    principal: number;
    interest: number;
    /** Derived: principal + interest. */
    cashflow: number;
    defaults: number;
    recovery: number;
    endBal: number;
    /** Ending balance for charting/table (alias of endBal for clarity). */
    balance: number;
};

export type ScenarioResult = {
    scenarioId: string;
    resultId: string;
    analytics: Record<string, number>;
    cashflow: { periods: CashflowPeriod[] };
    summary: Record<string, unknown>;
};

export type RunResult = {
    runId: string;
    results: ScenarioResult[];
};

export type AuditRow = {
    scenario: string;
    /** Scenario identity colour, for the audit chip + accent stripe. */
    color?: string;
    tranche: string;
    assumptions: string;
    results: string;
    user: string;
    timestamp: string;
};

// ── Widget state ──────────────────────────────────────────────────────────────
export type ScenarioStatus = "idle" | "queued" | "running" | "done";

export type Scenario = {
    /** Stable column key (p1..pN for seeded, c1..cN for custom). */
    key: string;
    name: string;
    color: string;
    /** Included in the run + cash flow. */
    onCalc: boolean;
    /** Assumption values keyed by row id. */
    vals: Record<string, number>;
    price: number;
    status: ScenarioStatus;
    /** Inputs changed since last run — results dimmed, re-run needed. */
    stale: boolean;
    resultId: string | null;
    results: Record<string, number> | null;
    cashflow: CashflowPeriod[] | null;
};

export type PresetKind = "template" | "lastrun" | "default";

export type PresetSource = {
    kind: PresetKind;
    by?: string;
    when?: string;
};

export type PendingPreset = {
    ver: number;
    kind: PresetKind;
    by: string;
    when: string;
    snapshot: PresetSnapshotBody;
};

export type CashFlowView = "chart" | "table";
