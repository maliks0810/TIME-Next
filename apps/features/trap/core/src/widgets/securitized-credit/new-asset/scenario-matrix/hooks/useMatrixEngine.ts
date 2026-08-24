/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Scenario Matrix — orchestration engine.
 *
 * Owns every side-effectful concern (bootstrap + preset waterfall, run lifecycle,
 * preset publish/pending, audit fetch, drawer state) and the effects that react to
 * deal / tranche / refresh changes. Data access is injected as `execute(op, params)`
 * so the SAME engine drives both the live widget (executeWidget → GraphQL) and the
 * standalone sandbox (local mock + localStorage). This keeps orchestration in one
 * place instead of duplicated per host.
 */
import React from "react";
import { dirtyScenarios, takeSnapshot } from "../state";
import type { MatrixAction, MatrixState } from "../state";
import type { AuditRow, PresetKind, PresetSnapshot } from "../types";
import { SCENARIO_USER, nowStamp } from "../utils/scenarioSummary";

export type MatrixOp = "bootstrap" | "run" | "audit" | "publishPreset";

export type MatrixExecute = (op: MatrixOp, params: Record<string, unknown>) => Promise<any>;

type EngineInput = {
    state: MatrixState;
    dispatch: React.Dispatch<MatrixAction>;
    execute: MatrixExecute;
    dealName: string | undefined;
    effectiveTrancheId: string | undefined;
    /** Bumping this (e.g. workflow.refresh) re-bootstraps. */
    refreshToken?: unknown;
    /** Called when the deal changes (e.g. to clear a local tranche override). */
    onDealChanged?: () => void;
};

export type MatrixEngine = {
    bootstrapping: boolean;
    running: boolean;
    hasDefault: boolean;
    justSaved: boolean;
    auditRows: AuditRow[];
    drawerOpen: boolean;
    openAudit: () => void;
    closeAudit: () => void;
    run: () => void;
    publishDefault: () => void;
    keepCurrent: () => void;
    loadPending: () => void;
};

function pickWaterfall(doc: {
    default?: PresetSnapshot | null;
    lastRun?: PresetSnapshot | null;
} | undefined): { snap: PresetSnapshot; kind: PresetKind } | null {
    if (doc?.default) return { snap: doc.default, kind: "default" };
    if (doc?.lastRun) return { snap: doc.lastRun, kind: "lastrun" };
    return null;
}

export function useMatrixEngine(input: EngineInput): MatrixEngine {
    const { state, dispatch, execute, dealName, effectiveTrancheId, refreshToken, onDealChanged } = input;

    const [bootstrapping, setBootstrapping] = React.useState(false);
    const [running, setRunning] = React.useState(false);
    const [hasDefault, setHasDefault] = React.useState(false);
    const [justSaved, setJustSaved] = React.useState(false);
    const [auditRows, setAuditRows] = React.useState<AuditRow[]>([]);
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    // ── Bootstrap + preset waterfall (Desk default → Last run → Template) ──
    const bootstrap = React.useCallback(async () => {
        if (!dealName) return;
        setBootstrapping(true);
        try {
            const boot = await execute("bootstrap", { dealName, trancheId: effectiveTrancheId });
            dispatch({ type: "BOOTSTRAP", payload: boot });
            setHasDefault(!!boot?.presetDoc?.default);
            const pick = pickWaterfall(boot?.presetDoc);
            if (pick) {
                dispatch({
                    type: "APPLY_SNAPSHOT",
                    body: pick.snap.snapshot,
                    src: { kind: pick.kind, by: pick.snap.by, when: pick.snap.when },
                    ver: pick.snap.ver,
                });
            }
        } catch {
            // Bootstrap failed — leave the empty scaffold; the host shows the empty state.
        } finally {
            setBootstrapping(false);
        }
    }, [dealName, effectiveTrancheId, execute, dispatch]);

    // Deal change / first load → reset override + bootstrap.
    const prevDealRef = React.useRef<string | undefined>(undefined);
    React.useEffect(() => {
        if (!dealName || dealName === prevDealRef.current) return;
        prevDealRef.current = dealName;
        onDealChanged?.();
        void bootstrap();
    }, [dealName]);

    // workflow.refresh → re-bootstrap.
    const prevRefreshRef = React.useRef(refreshToken);
    React.useEffect(() => {
        if (refreshToken === prevRefreshRef.current) return;
        prevRefreshRef.current = refreshToken;
        if (dealName) void bootstrap();
    }, [refreshToken]);

    // Tranche change (same deal) → clear results, keep assumptions.
    const prevTrancheRef = React.useRef<string | undefined>(effectiveTrancheId);
    React.useEffect(() => {
        if (effectiveTrancheId === prevTrancheRef.current) return;
        prevTrancheRef.current = effectiveTrancheId;
        if (state.ready) dispatch({ type: "CLEAR_RESULTS" });
    }, [effectiveTrancheId]);

    // ── Run (dirty subset only) ──
    const run = React.useCallback(async () => {
        if (running) return;
        const toRun = dirtyScenarios(state);
        if (!toRun.length) return;
        const keys = toRun.map((s) => s.key);
        const activeRows = state.rows.filter((r) => r.on);
        const scenarios = toRun.map((s) => ({
            scenarioId: s.key,
            name: s.name,
            color: s.color,
            price: s.price,
            assumptions: activeRows.map((r) => ({
                rowId: r.id,
                value: s.vals[r.id],
                unit: state.unit[r.id] ?? "",
            })),
        }));

        dispatch({ type: "RUN_BEGIN", keys });
        setRunning(true);
        try {
            const result = await execute("run", {
                dealName,
                trancheId: effectiveTrancheId,
                scenarios,
            });
            dispatch({ type: "RUN_COMPLETE", result });
            // Capture a last-run snapshot for the profile (best-effort).
            try {
                const res = await execute("publishPreset", {
                    profileKey: state.profileKey,
                    kind: "lastRun",
                    snapshot: takeSnapshot(state),
                    ver: Date.now(),
                    by: SCENARIO_USER,
                    when: nowStamp(),
                });
                const ver = res?.presetDoc?.lastRun?.ver;
                if (ver) dispatch({ type: "MARK_SYNCED", ver });
            } catch {
                /* non-fatal */
            }
        } catch {
            dispatch({ type: "RUN_FAIL", keys });
        } finally {
            setRunning(false);
        }
    }, [running, state, execute, dealName, effectiveTrancheId, dispatch]);

    // ── Presets ──
    const publishDefault = React.useCallback(async () => {
        const ver = Date.now();
        try {
            await execute("publishPreset", {
                profileKey: state.profileKey,
                kind: "default",
                snapshot: takeSnapshot(state),
                ver,
                by: SCENARIO_USER,
                when: nowStamp(),
            });
            setHasDefault(true);
            setJustSaved(true);
            dispatch({ type: "MARK_SYNCED", ver, src: { kind: "default", by: SCENARIO_USER, when: nowStamp() } });
            window.setTimeout(() => setJustSaved(false), 1600);
        } catch {
            /* non-fatal */
        }
    }, [state, execute, dispatch]);

    const keepCurrent = React.useCallback(() => {
        if (state.pending) dispatch({ type: "MARK_SYNCED", ver: state.pending.ver });
    }, [state.pending, dispatch]);

    const loadPending = React.useCallback(() => {
        if (!state.pending) return;
        dispatch({
            type: "APPLY_SNAPSHOT",
            body: state.pending.snapshot,
            src: { kind: state.pending.kind, by: state.pending.by, when: state.pending.when },
            ver: state.pending.ver,
        });
    }, [state.pending, dispatch]);

    // ── Audit (read-only, on drawer open) ──
    const openAudit = React.useCallback(async () => {
        setDrawerOpen(true);
        try {
            const res = await execute("audit", { dealName, trancheId: effectiveTrancheId });
            setAuditRows((res?.rows ?? []) as AuditRow[]);
        } catch {
            setAuditRows([]);
        }
    }, [execute, dealName, effectiveTrancheId]);
    const closeAudit = React.useCallback(() => setDrawerOpen(false), []);

    return {
        bootstrapping,
        running,
        hasDefault,
        justSaved,
        auditRows,
        drawerOpen,
        openAudit,
        closeAudit,
        run,
        publishDefault,
        keepCurrent,
        loadPending,
    };
}