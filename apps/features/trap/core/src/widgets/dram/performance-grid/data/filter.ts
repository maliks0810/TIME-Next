import { ENT_EQ, PMAP, ME, AUMBANDS } from './portfolios';
import { BENCH } from './universe';
import type { Portfolio, FilterState, Group } from './types';

/** Predicate for the faceted portfolio browser (C1). Equity-only, entitled universe. */
export function matchFilter(p: Portfolio, f: FilterState): boolean {
    if (!p.eq) return false;
    if (f.me && p.manager !== ME) return false;
    if (f.fav && !p.fav) return false;
    if (f.recent && !p.recent) return false;
    if (f.strategies.size && !f.strategies.has(p.strategy)) return false;
    if (f.benches.size && !f.benches.has(p.bench)) return false;
    if (f.regions.size && !f.regions.has(p.region)) return false;
    if (f.accts.size && !f.accts.has(p.acct)) return false;
    if (f.abands.size && !f.abands.has(p.aband)) return false;
    if (f.search) {
        const q = f.search.toLowerCase();
        if (
            !(
                p.name.toLowerCase().includes(q) ||
                p.id.toLowerCase().includes(q) ||
                p.strategy.toLowerCase().includes(q) ||
                BENCH[p.bench].name.toLowerCase().includes(q)
            )
        )
            return false;
    }
    return true;
}

export function filtered(f: FilterState, resSort: string): Portfolio[] {
    const a = ENT_EQ.filter((p) => matchFilter(p, f));
    a.sort((x, y) =>
        resSort === 'aum'
            ? y.aum - x.aum
            : ('' + (x as unknown as Record<string, unknown>)[resSort]).localeCompare(
                  '' + (y as unknown as Record<string, unknown>)[resSort]
              )
    );
    return a;
}

const DIM_FIELD: Record<string, keyof Portfolio> = {
    strategies: 'strategy',
    benches: 'bench',
    regions: 'region',
    accts: 'acct',
    abands: 'aband',
};

/** Count of portfolios matching `val` within the other active filters. */
export function facetCount(dim: string, val: string, f: FilterState): number {
    const base = ENT_EQ.filter((p) => {
        const g = { ...f, [dim]: new Set<string>() } as FilterState;
        return matchFilter(p, g);
    });
    return base.filter((p) => p[DIM_FIELD[dim]] === val).length;
}

export const FACET_LABEL: Record<string, string> = {
    strategies: 'Strategy',
    benches: 'Benchmark',
    regions: 'Region',
    accts: 'Account',
    abands: 'AUM',
};

export function facetValues(dim: string): [string, string][] {
    if (dim === 'strategies')
        return [...new Set(ENT_EQ.map((p) => p.strategy))].sort().map((v) => [v, v]);
    if (dim === 'benches')
        return [...new Set(ENT_EQ.map((p) => p.bench))].map((v) => [v, BENCH[v].name]);
    if (dim === 'regions')
        return [
            ['US', 'US'],
            ['Global', 'Global'],
            ['Intl', 'International'],
            ['Sector', 'Sector'],
        ];
    if (dim === 'accts') return [...new Set(ENT_EQ.map((p) => p.acct))].sort().map((v) => [v, v]);
    if (dim === 'abands') return AUMBANDS.map((b) => [b[0], b[0]]);
    return [];
}

/** Resolve a group's live membership: smart groups run their filter; static use `ports`. */
export function resolveGroup(g: Group): string[] {
    if (g.smart) return ENT_EQ.filter((p) => matchFilter(p, g.filter!)).map((p) => p.id);
    return (g.ports || []).filter((id) => PMAP[id] && PMAP[id].eq);
}

export function emptyFilter(): FilterState {
    return {
        search: '',
        me: false,
        fav: false,
        recent: false,
        strategies: new Set(),
        benches: new Set(),
        regions: new Set(),
        accts: new Set(),
        abands: new Set(),
    };
}
