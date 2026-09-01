import { describe, it, expect } from "vitest";
import {
    EMPTY_STATE,
    matrixReducer,
    isDirty,
    dirtyScenarios,
    takeSnapshot,
    type MatrixState,
} from "./state";
import type { BootstrapResult, RunResult } from "./types";

const BOOT: BootstrapResult = {
    assetClass: "ABS_AUTO",
    profileKey: "ABS Auto",
    maxScenarioColumns: 8,
    assumptionRows: [
        { id: "prepay", label: "Prepay", units: ["CPR", "PSA"], defaultOn: true },
        { id: "default", label: "Default", units: ["CDR"], defaultOn: true },
        { id: "delinquency", label: "Delinquency", units: ["%"], defaultOn: false },
    ],
    analyticsGroups: [
        {
            id: "priceYield",
            label: "Price / Yield",
            dot: "#7FA8D9",
            metrics: [{ key: "price", label: "Price", unit: "", format: "price" }],
        },
    ],
    scenarioTemplates: [
        { id: "base", name: "Base", color: "#6FAE8F", price: 99.5, seeds: { prepay: 1.3, default: 2.0, delinquency: 3 } },
        { id: "adverse", name: "Adverse", color: "#D6A25C", price: 98.5, seeds: { prepay: 1.0, default: 3.5, delinquency: 5 } },
    ],
    presetDoc: { profileKey: "ABS Auto", default: null, lastRun: null },
    tranches: []
};

function booted(): MatrixState {
    return matrixReducer(EMPTY_STATE, { type: "BOOTSTRAP", payload: BOOT });
}

function runResultFor(keys: string[]): RunResult {
    return {
        runId: "run_1",
        results: keys.map((k) => ({
            scenarioId: k,
            resultId: `run_1:${k}`,
            analytics: { price: 100 },
            cashflow: {
                periods: [
                    {
                        period: 1,
                        date: "Sep 15, 2026",
                        beginBal: 100,
                        principal: 5,
                        interest: 1,
                        cashflow: 6, // principal + interest
                        defaults: 0,
                        recovery: 0,
                        endBal: 95,
                        balance: 95, // == endBal
                    },
                ],
            },
            summary: {},
        })),
    };
}

describe("bootstrap", () => {
    it("builds rows (with defaultOn), default units, and scenarios from templates", () => {
        const s = booted();
        expect(s.ready).toBe(true);
        expect(s.rows.map((r) => r.on)).toEqual([true, true, false]);
        expect(s.unit).toEqual({ prepay: "CPR", default: "CDR", delinquency: "%" });
        expect(s.scenarios.map((x) => x.key)).toEqual(["p1", "p2"]);
        expect(s.scenarios[0].results).toBeNull();
    });
});

describe("dirty rule: onCalc && (stale || !results)", () => {
    it("a never-run, included scenario is dirty", () => {
        const s = booted();
        expect(dirtyScenarios(s)).toHaveLength(2);
    });

    it("an excluded scenario is never dirty", () => {
        let s = booted();
        s = matrixReducer(s, { type: "TOGGLE_SCENARIO", key: "p1", on: false });
        expect(isDirty(s.scenarios.find((x) => x.key === "p1")!)).toBe(false);
        expect(dirtyScenarios(s)).toHaveLength(1);
    });

    it("a priced, not-stale scenario is clean", () => {
        let s = booted();
        s = matrixReducer(s, { type: "RUN_BEGIN", keys: ["p1", "p2"] });
        s = matrixReducer(s, { type: "RUN_COMPLETE", result: runResultFor(["p1", "p2"]) });
        expect(dirtyScenarios(s)).toHaveLength(0);
    });
});

describe("staleness", () => {
    it("editing a cell stales only that column, and only if it was priced", () => {
        let s = booted();
        s = matrixReducer(s, { type: "RUN_BEGIN", keys: ["p1", "p2"] });
        s = matrixReducer(s, { type: "RUN_COMPLETE", result: runResultFor(["p1", "p2"]) });
        s = matrixReducer(s, { type: "EDIT_CELL", key: "p1", rowId: "prepay", value: 9 });
        expect(s.scenarios.find((x) => x.key === "p1")!.stale).toBe(true);
        expect(s.scenarios.find((x) => x.key === "p2")!.stale).toBe(false);
    });

    it("changing a unit stales EVERY priced column", () => {
        let s = booted();
        s = matrixReducer(s, { type: "RUN_BEGIN", keys: ["p1", "p2"] });
        s = matrixReducer(s, { type: "RUN_COMPLETE", result: runResultFor(["p1", "p2"]) });
        s = matrixReducer(s, { type: "SET_UNIT", rowId: "prepay", unit: "PSA" });
        expect(s.scenarios.every((x) => x.stale)).toBe(true);
    });

    it("toggling a row stales EVERY priced column", () => {
        let s = booted();
        s = matrixReducer(s, { type: "RUN_BEGIN", keys: ["p1", "p2"] });
        s = matrixReducer(s, { type: "RUN_COMPLETE", result: runResultFor(["p1", "p2"]) });
        s = matrixReducer(s, { type: "TOGGLE_ROW", rowId: "default", on: false });
        expect(s.scenarios.every((x) => x.stale)).toBe(true);
    });

    it("a stale, included column becomes dirty again", () => {
        let s = booted();
        s = matrixReducer(s, { type: "RUN_BEGIN", keys: ["p1", "p2"] });
        s = matrixReducer(s, { type: "RUN_COMPLETE", result: runResultFor(["p1", "p2"]) });
        s = matrixReducer(s, { type: "EDIT_CELL", key: "p1", rowId: "prepay", value: 9 });
        expect(dirtyScenarios(s).map((x) => x.key)).toEqual(["p1"]);
    });
});

describe("run lifecycle", () => {
    it("RUN_COMPLETE sets results, clears stale, and auto-binds the first column", () => {
        let s = booted();
        s = matrixReducer(s, { type: "RUN_BEGIN", keys: ["p1", "p2"] });
        s = matrixReducer(s, { type: "RUN_COMPLETE", result: runResultFor(["p1", "p2"]) });
        expect(s.scenarios[0].status).toBe("done");
        expect(s.scenarios[0].results).toEqual({ price: 100 });
        expect(s.scenarios[0].resultId).toBe("run_1:p1");
        expect(s.sel).toBe("p1"); // first completed run auto-binds cash flow
    });
});

describe("clearing vs staleness", () => {
    it("CLEAR_RESULTS wipes results + binding but KEEPS assumptions and rows", () => {
        let s = booted();
        s = matrixReducer(s, { type: "EDIT_CELL", key: "p1", rowId: "prepay", value: 7 });
        s = matrixReducer(s, { type: "RUN_BEGIN", keys: ["p1", "p2"] });
        s = matrixReducer(s, { type: "RUN_COMPLETE", result: runResultFor(["p1", "p2"]) });
        s = matrixReducer(s, { type: "CLEAR_RESULTS" });
        expect(s.sel).toBeNull();
        expect(s.scenarios.every((x) => x.results === null && x.cashflow === null)).toBe(true);
        expect(s.scenarios.every((x) => x.status === "idle" && !x.stale)).toBe(true);
        // assumptions survive
        expect(s.scenarios.find((x) => x.key === "p1")!.vals.prepay).toBe(7);
    });
});

describe("scenarios add/remove", () => {
    it("adds a custom scenario from template seeds, up to the cap", () => {
        let s = booted();
        s = matrixReducer(s, { type: "ADD_SCENARIO" });
        expect(s.scenarios).toHaveLength(3);
        expect(s.scenarios[2].key).toBe("c1");
        expect(s.scenarios[2].vals.prepay).toBe(1.3);
    });

    it("removing the bound scenario releases the binding", () => {
        let s = booted();
        s = matrixReducer(s, { type: "BIND_CF", key: "p1" });
        s = matrixReducer(s, { type: "REMOVE_SCENARIO", key: "p1" });
        expect(s.sel).toBeNull();
        expect(s.scenarios.map((x) => x.key)).toEqual(["p2"]);
    });
});

describe("presets", () => {
    it("APPLY_SNAPSHOT rebuilds scenarios, clears touched, and syncs version", () => {
        let s = booted();
        s = matrixReducer(s, { type: "EDIT_CELL", key: "p1", rowId: "prepay", value: 2 });
        expect(s.touched).toBe(true);
        const body = takeSnapshot(s);
        s = matrixReducer(s, { type: "APPLY_SNAPSHOT", body, src: { kind: "default", by: "u" }, ver: 42 });
        expect(s.touched).toBe(false);
        expect(s.appliedVer).toBe(42);
        expect(s.presetSrc.kind).toBe("default");
        expect(s.scenarios.find((x) => x.key === "p1")!.vals.prepay).toBe(2);
    });
});
