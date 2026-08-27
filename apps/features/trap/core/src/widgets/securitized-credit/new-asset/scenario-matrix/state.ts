/**
 * Scenario Matrix — state machine (pure reducer).
 *
 * Encodes the behavioural contract from the prototype: the dirty rule
 * (`onCalc && (stale || !results)`), staleness vs clearing (edit/unit/toggle →
 * stale; deal/tranche change → cleared), the run lifecycle, and the preset
 * waterfall (Desk default → Last run → Template). No fake analytics live here —
 * results/cash flow arrive from the dataset (`run`).
 */

import { SCENARIO_PALETTE } from "./constants";
import type {
    AnalyticsGroup,
    AssumptionRow,
    BootstrapResult,
    PendingPreset,
    PresetSnapshotBody,
    PresetSource,
    RunResult,
    Scenario,
    ScenarioTemplate,
    TrancheOption,
} from "./types";

export type MatrixState = {
    ready: boolean;
    assetClass: string;
    profileKey: string;
    maxColumns: number;
    rows: Array<AssumptionRow & { on: boolean }>;
    unit: Record<string, string>;
    groups: AnalyticsGroup[];
    templates: ScenarioTemplate[];
    tranches: TrancheOption[];
    scenarios: Scenario[];
    /** Bound cash-flow scenario key (null = none). */
    sel: string | null;
    /** Counter for naming/colouring custom scenarios. */
    custN: number;
    /** Has the user edited anything on this bond. */
    touched: boolean;
    presetSrc: PresetSource;
    pending: PendingPreset | null;
    /** Preset version this bond is synced to. */
    appliedVer: number;
};

export const EMPTY_STATE: MatrixState = {
    ready: false,
    assetClass: "",
    profileKey: "",
    maxColumns: 8,
    rows: [],
    unit: {},
    groups: [],
    templates: [],
    tranches: [],
    scenarios: [],
    sel: null,
    custN: 0,
    touched: false,
    presetSrc: { kind: "template" },
    pending: null,
    appliedVer: 0,
};

export type MatrixAction =
    | { type: "BOOTSTRAP"; payload: BootstrapResult }
    | { type: "EDIT_CELL"; key: string; rowId: string; value: number }
    | { type: "EDIT_PRICE"; key: string; value: number }
    | { type: "SET_UNIT"; rowId: string; unit: string }
    | { type: "TOGGLE_ROW"; rowId: string; on: boolean }
    | { type: "TOGGLE_SCENARIO"; key: string; on: boolean }
    | { type: "RENAME_SCENARIO"; key: string; name: string }
    | { type: "ADD_SCENARIO" }
    | { type: "REMOVE_SCENARIO"; key: string }
    | { type: "RUN_BEGIN"; keys: string[] }
    | { type: "RUN_COMPLETE"; result: RunResult }
    | { type: "RUN_FAIL"; keys: string[] }
    | { type: "CLEAR_RESULTS" }
    | { type: "BIND_CF"; key: string }
    | { type: "APPLY_SNAPSHOT"; body: PresetSnapshotBody; src: PresetSource; ver: number }
    | { type: "SET_PENDING"; pending: PendingPreset | null }
    | { type: "MARK_SYNCED"; ver: number; src?: PresetSource }
    | { type: "SET_SOURCE"; src: PresetSource };

// ── Builders ──────────────────────────────────────────────────────────────────
function scenarioFromTemplate(t: ScenarioTemplate, index: number): Scenario {
    return {
        key: `p${index + 1}`,
        name: t.name,
        color: t.color,
        onCalc: true,
        vals: { ...t.seeds },
        price: t.price,
        status: "idle",
        stale: false,
        resultId: null,
        results: null,
        cashflow: null,
    };
}

/** A scenario that is dirty: included in the run and needs (re)pricing. */
export function isDirty(s: Scenario): boolean {
    return s.onCalc && (s.stale || !s.results);
}

export function dirtyScenarios(state: MatrixState): Scenario[] {
    return state.scenarios.filter(isDirty);
}

/** Capture the current assumptions as a preset snapshot. */
export function takeSnapshot(state: MatrixState): PresetSnapshotBody {
    const rowsOn: Record<string, boolean> = {};
    state.rows.forEach((r) => {
        rowsOn[r.id] = r.on;
    });
    return {
        rowsOn,
        units: { ...state.unit },
        scenarios: state.scenarios.map((s) => ({
            name: s.name,
            color: s.color,
            price: s.price,
            vals: { ...s.vals },
        })),
    };
}

function scenariosFromSnapshot(body: PresetSnapshotBody): Scenario[] {
    return body.scenarios.map((s, i) => ({
        key: `p${i + 1}`,
        name: s.name,
        color: s.color,
        onCalc: true,
        vals: { ...s.vals },
        price: s.price,
        status: "idle",
        stale: false,
        resultId: null,
        results: null,
        cashflow: null,
    }));
}

// ── Reducer ─────────────────────────────────────────────────────────────────
export function matrixReducer(state: MatrixState, action: MatrixAction): MatrixState {
    switch (action.type) {
        case "BOOTSTRAP": {
            const p = action.payload;
            const rows = p.assumptionRows.map((r) => ({ ...r, on: r.defaultOn }));
            const unit: Record<string, string> = {};
            rows.forEach((r) => {
                unit[r.id] = r.units[0] ?? "";
            });
            return {
                ...EMPTY_STATE,
                ready: true,
                assetClass: p.assetClass,
                profileKey: p.profileKey,
                maxColumns: p.maxScenarioColumns,
                rows,
                unit,
                groups: p.analyticsGroups,
                templates: p.scenarioTemplates,
                tranches: p.tranches ?? [],
                scenarios: p.scenarioTemplates.map(scenarioFromTemplate),
                presetSrc: { kind: "template" },
            };
        }

        case "EDIT_CELL": {
            return {
                ...state,
                touched: true,
                scenarios: state.scenarios.map((s) =>
                    s.key === action.key
                        ? {
                              ...s,
                              vals: { ...s.vals, [action.rowId]: action.value },
                              stale: s.status === "done" ? true : s.stale,
                          }
                        : s,
                ),
            };
        }

        case "EDIT_PRICE": {
            return {
                ...state,
                touched: true,
                scenarios: state.scenarios.map((s) =>
                    s.key === action.key
                        ? { ...s, price: action.value, stale: s.status === "done" ? true : s.stale }
                        : s,
                ),
            };
        }

        case "SET_UNIT": {
            // A unit change changes meaning globally → stale every priced column.
            return {
                ...state,
                touched: true,
                unit: { ...state.unit, [action.rowId]: action.unit },
                scenarios: staleAllPriced(state.scenarios),
            };
        }

        case "TOGGLE_ROW": {
            // A row toggle changes meaning globally → stale every priced column.
            return {
                ...state,
                touched: true,
                rows: state.rows.map((r) => (r.id === action.rowId ? { ...r, on: action.on } : r)),
                scenarios: staleAllPriced(state.scenarios),
            };
        }

        case "TOGGLE_SCENARIO": {
            return {
                ...state,
                touched: true,
                scenarios: state.scenarios.map((s) =>
                    s.key === action.key ? { ...s, onCalc: action.on } : s,
                ),
            };
        }

        case "RENAME_SCENARIO": {
            const name = action.name.trim();
            if (!name) return state;
            return {
                ...state,
                touched: true,
                scenarios: state.scenarios.map((s) =>
                    s.key === action.key ? { ...s, name } : s,
                ),
            };
        }

        case "ADD_SCENARIO": {
            if (state.scenarios.length >= state.maxColumns) return state;
            const custN = state.custN + 1;
            const color = SCENARIO_PALETTE[(custN - 1) % SCENARIO_PALETTE.length];
            const base = state.templates[0]?.seeds ?? {};
            const next: Scenario = {
                key: `c${custN}`,
                name: `Scenario ${state.scenarios.length + 1}`,
                color,
                onCalc: true,
                vals: { ...base },
                price: state.templates[0]?.price ?? 98.5,
                status: "idle",
                stale: false,
                resultId: null,
                results: null,
                cashflow: null,
            };
            return { ...state, touched: true, custN, scenarios: [...state.scenarios, next] };
        }

        case "REMOVE_SCENARIO": {
            const scenarios = state.scenarios.filter((s) => s.key !== action.key);
            return {
                ...state,
                touched: true,
                scenarios,
                sel: state.sel === action.key ? null : state.sel,
            };
        }

        case "RUN_BEGIN": {
            const set = new Set(action.keys);
            return {
                ...state,
                touched: true,
                scenarios: state.scenarios.map((s) =>
                    set.has(s.key) ? { ...s, status: "running" } : s,
                ),
            };
        }

        case "RUN_COMPLETE": {
            const byId = new Map(action.result.results.map((r) => [r.scenarioId, r]));
            let sel = state.sel;
            const scenarios = state.scenarios.map((s) => {
                const r = byId.get(s.key);
                if (!r) {
                    // Was running but not returned → leave as it was (revert to idle).
                    return s.status === "running" ? { ...s, status: "idle" as const } : s;
                }
                if (sel === null) sel = s.key; // first completed run auto-binds CF
                return {
                    ...s,
                    status: "done" as const,
                    stale: false,
                    resultId: r.resultId,
                    results: r.analytics,
                    cashflow: r.cashflow.periods,
                };
            });
            return { ...state, scenarios, sel };
        }

        case "RUN_FAIL": {
            const set = new Set(action.keys);
            return {
                ...state,
                scenarios: state.scenarios.map((s) =>
                    set.has(s.key) && s.status === "running"
                        ? { ...s, status: s.results ? "done" : "idle" }
                        : s,
                ),
            };
        }

        case "CLEAR_RESULTS": {
            // Deal/tranche change: results + cash flow cleared outright (not dimmed),
            // binding released. Assumptions survive.
            return {
                ...state,
                sel: null,
                scenarios: state.scenarios.map((s) => ({
                    ...s,
                    status: "idle",
                    stale: false,
                    resultId: null,
                    results: null,
                    cashflow: null,
                })),
            };
        }

        case "BIND_CF": {
            return { ...state, sel: action.key };
        }

        case "APPLY_SNAPSHOT": {
            const rows = state.rows.map((r) => ({
                ...r,
                on: action.body.rowsOn[r.id] ?? r.on,
            }));
            const unit = { ...state.unit };
            Object.entries(action.body.units).forEach(([id, u]) => {
                if (id in unit) unit[id] = u;
            });
            return {
                ...state,
                rows,
                unit,
                scenarios: scenariosFromSnapshot(action.body),
                sel: null,
                custN: 0,
                touched: false,
                presetSrc: action.src,
                pending: null,
                appliedVer: action.ver,
            };
        }

        case "SET_PENDING": {
            return { ...state, pending: action.pending };
        }

        case "MARK_SYNCED": {
            return {
                ...state,
                appliedVer: action.ver,
                pending: null,
                presetSrc: action.src ?? state.presetSrc,
            };
        }

        case "SET_SOURCE": {
            return { ...state, presetSrc: action.src };
        }

        default:
            return state;
    }
}

function staleAllPriced(scenarios: Scenario[]): Scenario[] {
    return scenarios.map((s) => (s.status === "done" ? { ...s, stale: true } : s));
}