/**
 * Scenario Matrix — pure helpers for describing a scenario (audit, export, the
 * summary emitted to downstream widgets). No React, no side effects.
 */
import type { Scenario } from '../types';

export const SCENARIO_USER = 'current.user';

export function nowStamp(): string {
    return new Date().toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** "Prepay 1.3CPR · Default 2CDR · Severity 45%" — only the enabled rows. */
export function assumptionString(
    rows: Array<{ id: string; label: string; on: boolean }>,
    unit: Record<string, string>,
    scenario: Scenario
): string {
    return rows
        .filter((r) => r.on)
        .map((r) => `${r.label} ${scenario.vals[r.id]}${unit[r.id] ?? ''}`)
        .join(' · ');
}

function createAssumptionObject(
    rows: Array<{ id: string; label: string; on: boolean }>,
    unit: Record<string, string>,
    scenario: Scenario
) {
    return rows
        .filter((row) => row.on)
        .reduce(
            (acc, { id }) => ({ ...acc, [id]: { type: unit[id], value: scenario.vals[id] } }),
            {}
        );
}

export type ScenarioSummary = {
    scenario: string;
    color: string;
    tranche: string;
    price: number;
    assumptions: { [key: string]: { type: string; value: number } };
    periods: number;
    user: string;
    timestamp: string;
    severity?: number;
};

/** The summary published on `scenario.selectedSummary` (as JSON). */
export function buildScenarioSummary(
    scenario: Scenario,
    trancheName: string,
    rows: Array<{ id: string; label: string; on: boolean }>,
    unit: Record<string, string>
): ScenarioSummary {
    return {
        scenario: scenario.name,
        color: scenario.color,
        tranche: trancheName,
        price: scenario.price,
        severity: scenario.results?.severity,
        assumptions: createAssumptionObject(rows, unit, scenario),
        periods: scenario.cashflow?.length ?? 0,
        user: SCENARIO_USER,
        timestamp: nowStamp(),
    };
}
