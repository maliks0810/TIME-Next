import { useCallback, useEffect, useState } from 'react';
import type { RecentSearch } from '../types';

const KEY = 'sc.securityLookup.recents';
const MAX = 8;

// localStorage now; swap this hook's body for a User Preference API later.
export function useRecentSearches() {
    const [recents, setRecents] = useState<RecentSearch[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) setRecents(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    const persist = useCallback((next: RecentSearch[]) => {
        setRecents(next);
        try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    }, []);

    const addRecent = useCallback((r: RecentSearch) => {
        setRecents((prev) => {
            const deduped = prev.filter((p) => p.name !== r.name);
            const next = [r, ...deduped].slice(0, MAX);
            try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
            return next;
        });
    }, []);

    const clearRecents = useCallback(() => persist([]), [persist]);

    return { recents, addRecent, clearRecents };
}