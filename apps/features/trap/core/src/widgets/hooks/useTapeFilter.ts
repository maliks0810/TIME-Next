import { useMemo } from 'react';
import { useGetWidgetValueArray, useSetWidgetValue } from '../../state/Widgets/hooks';
import type { ChannelId } from '../../state/Widgets/types';
import { useGetActiveTab } from '../../state/Tabs/hooks';
import {
    COLLATERAL_DIMS,
    COLLATERAL_FILTER_KEYS,
    COLLATERAL_STAGE_KEYS,
    FILTER_PREFIX,
    STAGE_PREFIX,
} from '../constants';

/**
 * useTapeFilter
 * -------------
 * Single source of truth for the collateral-tape APPLY / COMMIT cross-filter.
 *
 * Two parallel channel namespaces per dimension:
 *   stage.<dim>  — pending multi-select, written by emitters (geo map, charts)
 *   filter.<dim> — applied, read by data widgets; committed from stage on Apply
 *
 * Emitters call toggleStage(); the FilterBar calls apply()/reset() and renders
 * the applied chips + pending count. Data widgets keep reading filter.* — they
 * only re-query when Apply commits, never on a raw stage click.
 */

type StringArray = string[];

export type TapeFilter = {
    applied: Record<string, StringArray>;
    staged: Record<string, StringArray>;
    pendingCount: number;
    hasPending: boolean;
    appliedActive: Array<{ dim: string; key: string; values: StringArray }>;
    isStaged: (dimension: string, value: string) => boolean;
    isApplied: (dimension: string, value: string) => boolean;
    /** Universe-locked: once a dim is applied you can only toggle within it. */
    toggleStage: (dimension: string, value: string) => void;
    apply: () => void;
    reset: () => void;
    removeApplied: (dimension: string) => void;
};

function toArray(value: unknown): StringArray {
    if (value === null || value === undefined || value === '') return [];
    if (Array.isArray(value)) return value.map((item) => String(item));
    return [String(value)];
}

function sameSet(a: StringArray, b: StringArray): boolean {
    if (a.length !== b.length) return false;
    const set = new Set(a);
    return b.every((item) => set.has(item));
}

export function useTapeFilter(channelId: ChannelId = '1'): TapeFilter {
    const activeTab = useGetActiveTab();
    const setValueToChannel = useSetWidgetValue();

    const keys = useMemo(() => [...COLLATERAL_FILTER_KEYS, ...COLLATERAL_STAGE_KEYS], []);

    const bag = useGetWidgetValueArray({ channelId, keys }) as Record<string, unknown>;

    const applied = useMemo(() => {
        const out: Record<string, StringArray> = {};
        for (const dimension of COLLATERAL_DIMS) {
            out[dimension] = toArray(bag[`${FILTER_PREFIX}${dimension}`]);
        }
        return out;
    }, [bag]);

    const staged = useMemo(() => {
        const out: Record<string, StringArray> = {};
        for (const dimension of COLLATERAL_DIMS) {
            out[dimension] = toArray(bag[`${STAGE_PREFIX}${dimension}`]);
        }
        return out;
    }, [bag]);

    const pendingCount = useMemo(
        () =>
            COLLATERAL_DIMS.filter((dimension) => !sameSet(staged[dimension], applied[dimension]))
                .length,
        [staged, applied]
    );

    const appliedActive = useMemo(
        () =>
            COLLATERAL_DIMS.filter((dimension) => applied[dimension].length > 0).map(
                (dimension) => ({
                    dim: dimension,
                    key: `${FILTER_PREFIX}${dimension}`,
                    values: applied[dimension],
                })
            ),
        [applied]
    );

    const setChannel = (key: string, value: StringArray | null) =>
        setValueToChannel({ key, value, activeTab, channelId });

    const isApplied = (dimension: string, value: string) =>
        (applied[dimension] ?? []).indexOf(value) >= 0;

    const isStaged = (dimension: string, value: string) =>
        (staged[dimension] ?? []).indexOf(value) >= 0;

    const toggleStage = (dimension: string, value: string) => {
        const appliedValues = applied[dimension] ?? [];
        // Universe lock: once applied, only values inside the applied set may be
        // toggled (to deselect); adding one from outside is ignored.
        if (appliedValues.length > 0 && appliedValues.indexOf(value) < 0) {
            return;
        }

        const current = staged[dimension] ?? [];
        const next =
            current.indexOf(value) >= 0
                ? current.filter((item) => item !== value)
                : [...current, value];

        setChannel(`${STAGE_PREFIX}${dimension}`, next.length ? next : null);
    };

    const apply = () => {
        for (const dimension of COLLATERAL_DIMS) {
            if (sameSet(staged[dimension], applied[dimension])) continue;
            setChannel(
                `${FILTER_PREFIX}${dimension}`,
                staged[dimension].length ? staged[dimension] : null
            );
        }
    };

    const reset = () => {
        for (const dimension of COLLATERAL_DIMS) {
            if (applied[dimension].length) {
                setChannel(`${FILTER_PREFIX}${dimension}`, null);
            }
            if (staged[dimension].length) {
                setChannel(`${STAGE_PREFIX}${dimension}`, null);
            }
        }
    };

    const removeApplied = (dimension: string) => {
        setChannel(`${FILTER_PREFIX}${dimension}`, null);
        setChannel(`${STAGE_PREFIX}${dimension}`, null);
    };

    return {
        applied,
        staged,
        pendingCount,
        hasPending: pendingCount > 0,
        appliedActive,
        isStaged,
        isApplied,
        toggleStage,
        apply,
        reset,
        removeApplied,
    };
}
