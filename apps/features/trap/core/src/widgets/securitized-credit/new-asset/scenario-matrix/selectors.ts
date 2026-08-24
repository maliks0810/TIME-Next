/**
 * Scenario Matrix — pure view selectors derived from state. Shared by the widget
 * and the sandbox so the run-button semantics never drift between them.
 */
import { dirtyScenarios } from "./state";
import type { MatrixState } from "./state";

export type RunState = {
    /** Count of dirty (included && stale-or-unrun) scenarios. */
    dirtyCount: number;
    onCalcCount: number;
    runLabel: string;
    runDisabled: boolean;
    allCurrent: boolean;
};

/**
 * The Run button carries the state as a single element (constant row height):
 * "All current ✓" when nothing is dirty, otherwise the run cost.
 */
export function deriveRunState(state: MatrixState): RunState {
    const dirtyCount = dirtyScenarios(state).length;
    const onCalcCount = state.scenarios.filter((s) => s.onCalc).length;
    const allCurrent = dirtyCount === 0 && onCalcCount > 0;
    const runLabel = allCurrent
        ? "All current ✓"
        : dirtyCount > 0 && dirtyCount !== onCalcCount
          ? `Run ${dirtyCount} Scenario${dirtyCount === 1 ? "" : "s"}`
          : "Run Scenarios";
    return { dirtyCount, onCalcCount, runLabel, runDisabled: dirtyCount === 0, allCurrent };
}