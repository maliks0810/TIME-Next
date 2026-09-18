import type { DataProvider } from '../data/DataProvider';
import type { EntityRef, ModelPortfolio, EngineContext, CustomPeriod } from '../data/types';
import { resolveWeights, type ResolveCtx } from './comparator';

export interface ContextInput {
    /** "A" side — the portfolio(s)/entity being analysed. */
    subject: EntityRef;
    /** "B" side — index / portfolio / composite / model to compare against. */
    comparator: EntityRef;
    /** Subject side's as-of date. */
    subjectAsOf: string;
    /** Comparator side's as-of date (differs from subject when the as-of is unlinked). */
    comparatorAsOf: string;
    periods: string[];
    customPeriods: CustomPeriod[];
    showBench: boolean;
    /** User-authored model portfolios available as comparators. */
    models: ModelPortfolio[];
}

/**
 * Build a pure EngineContext by resolving both sides of the comparison to weight
 * maps (via the comparator resolver) and binding returns to the data provider.
 * `portWeight` = subject side, `benchWeight` = comparator side — the roll-up math
 * (aggregate.ts) is unchanged; only the weight source generalised. See
 * docs/architecture-v2.md.
 */
export function makeContext(dp: DataProvider, input: ContextInput): EngineContext {
    const rctx: ResolveCtx = {
        // guard invalid/empty ids so quick-run (no portfolio yet) resolves to empty
        portWeights: (id) => (id && dp.portfolio(id) ? dp.portWeights(id) : new Map()),
        benchWeights: dp.benchWeights,
        aumOf: (id) => dp.portfolio(id)?.aum ?? 0,
        modelWeights: (id) => {
            const m = input.models.find((x) => x.id === id);
            return m ? new Map(Object.entries(m.weights)) : new Map();
        },
    };
    const subjectW = resolveWeights(input.subject, input.subjectAsOf, rctx);
    const comparatorW = resolveWeights(input.comparator, input.comparatorAsOf, rctx);
    return {
        // informational only (nothing downstream reads these); best-effort from the sides
        port: input.subject.kind === 'portfolio' ? input.subject.id : '',
        bench: input.comparator.kind === 'index' ? input.comparator.key : 'SPX',
        periods: input.periods,
        customPeriods: input.customPeriods,
        showBench: input.showBench,
        portWeight: (s) => subjectW.get(s.id) || 0,
        benchWeight: (s) => comparatorW.get(s.id) || 0,
        returnOf: (s, p) => dp.returnOf(s, p, input.customPeriods),
    };
}
