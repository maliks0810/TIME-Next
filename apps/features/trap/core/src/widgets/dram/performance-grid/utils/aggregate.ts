import type { Security, EngineContext, Agg, PeriodAgg } from '../data/types';

/**
 * The ONLY math in the app (hard constraint):
 *   contribution        = weight × return
 *   activeWeight        = portWeight − benchWeight
 *   activeContribution  = portContribution − benchContribution
 * plus weighted roll-ups of return / beta / divYld / pe. Nothing else.
 * Contribution values are expressed in bps.
 */
export function aggregate(secs: Security[], ctx: EngineContext): Agg {
    const pr: Record<string, { pc: number; bc: number }> = {};
    ctx.periods.forEach((p) => (pr[p] = { pc: 0, bc: 0 }));

    let pw = 0,
        bw = 0,
        wb = 0,
        wd = 0,
        wp = 0;

    secs.forEach((s) => {
        const w = ctx.portWeight(s);
        const b = ctx.benchWeight(s);
        pw += w;
        bw += b;
        wb += w * s.beta;
        wd += w * s.divYld;
        wp += w * s.pe;
        ctx.periods.forEach((p) => {
            const rt = ctx.returnOf(s, p);
            pr[p].pc += (w * rt) / 100;
            pr[p].bc += (b * rt) / 100;
        });
    });

    const byPeriod: Record<string, PeriodAgg> = {};
    ctx.periods.forEach((p) => {
        const { pc, bc } = pr[p];
        const R = pw ? (pc / pw) * 100 : 0;
        const B = bw ? (bc / bw) * 100 : 0;
        byPeriod[p] = {
            retP: R,
            benchRet: B,
            activeRet: R - B,
            contrib: pc * 100,
            activeCon: (pc - bc) * 100,
        };
    });

    return {
        count: secs.length,
        weight: pw,
        benchWt: bw,
        activeWt: pw - bw,
        beta: pw ? wb / pw : 0,
        divYld: pw ? wd / pw : 0,
        pe: pw ? wp / pw : 0,
        byPeriod,
    };
}
