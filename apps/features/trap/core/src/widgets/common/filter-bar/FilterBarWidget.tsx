/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import type { WidgetComponentProps } from '../../../types/widget';
import {
    useGetAllContext,
    useGetWidgetValue,
    useSetWidgetValue,
} from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { DEAL_NAME_KEY } from '../../constants';
import styles from './FilterBarWidget.module.scss';

/**
 * FilterBarWidget
 * ----------------
 * Displays and removes active filter.* channel values.
 *
 * Filters are scoped to the current context value. When the selected deal
 * changes, all filter.* values on the channel are cleared before the new deal
 * is displayed. The scope marker is deliberately not a filter.* key so it
 * never appears as a chip.
 */

const FILTER_PREFIX = 'filter.';

/**
 * Internal channel marker identifying the deal to which the current filters
 * belong. This must not begin with "filter." because FilterBar renders all
 * filter.* keys as visible chips.
 */
const FILTER_SCOPE_KEY = 'filterScope.deal.name';

function prettify(dimension: string): string {
    return dimension
        .replace(/[._-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (character) => character.toUpperCase())
        .trim();
}

function display(value: unknown): string {
    if (Array.isArray(value)) {
        return value.join(', ');
    }

    return String(value);
}

export function FilterBarWidget({
    widgetInstance,
    widgetDefinition,
}: WidgetComponentProps) {
    const params = widgetInstance?.config?.params ?? {};

    const properties = (
        widgetDefinition?.configSchema?.properties ?? {}
    ) as Record<string, any>;

    const getDefault = (key: string) =>
        properties?.[key]?.['default'];

    const channelId = params.channel;
    const contextKey: string =
        params.contextKey ??
        getDefault('contextKey') ??
        DEAL_NAME_KEY;

    const activeTab = useGetActiveTab();
    const setValueToChannel = useSetWidgetValue();

    const contextValue = useGetWidgetValue({
        channelId,
        key: contextKey,
    });

    const filterScopeValue = useGetWidgetValue({
        channelId,
        key: FILTER_SCOPE_KEY,
    });

    const bag = (
        useGetAllContext({ channelId }) ?? {}
    ) as Record<string, unknown>;

    const labels: Record<string, string> = (
        params.dimensionLabels &&
        typeof params.dimensionLabels === 'object'
            ? params.dimensionLabels
            : {}
    ) as Record<string, string>;

    const emptyText = String(
        params.emptyText ??
            getDefault('emptyText') ??
            'No filters — full universe'
    );

    const showClearAll =
        params.showClearAll ??
        getDefault('showClearAll') ??
        true;

    const active = Object.keys(bag)
        .filter((key) => key.startsWith(FILTER_PREFIX))
        .filter((key) => {
            const value = bag[key];

            return (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                !(
                    Array.isArray(value) &&
                    value.length === 0
                )
            );
        })
        .map((key) => ({
            key,
            dimension: key.slice(FILTER_PREFIX.length),
            value: bag[key],
        }));

    /**
     * Clear stale collateral filters whenever the selected deal changes.
     *
     * The channel scope marker makes this robust even if FilterBarWidget is
     * unmounted and remounted. A simple useRef comparison would lose the
     * previous deal during a remount and could leave stale filters behind.
     */
    useEffect(() => {
        if (
            contextValue === null ||
            contextValue === undefined ||
            contextValue === ''
        ) {
            return;
        }

        const currentContext = String(contextValue);
        const storedScope =
            filterScopeValue === null ||
            filterScopeValue === undefined
                ? ''
                : String(filterScopeValue);

        if (storedScope === currentContext) {
            return;
        }

        for (const key of Object.keys(bag)) {
            if (!key.startsWith(FILTER_PREFIX)) {
                continue;
            }

            const value = bag[key];

            if (
                value === null ||
                value === undefined ||
                value === '' ||
                (Array.isArray(value) && value.length === 0)
            ) {
                continue;
            }

            setValueToChannel({
                key,
                value: null,
                activeTab,
                channelId,
            });
        }

        setValueToChannel({
            key: FILTER_SCOPE_KEY,
            value: currentContext,
            activeTab,
            channelId,
        });
    }, [
        contextValue,
        filterScopeValue,
        activeTab,
        channelId,
        bag,
        setValueToChannel,
    ]);

    const clear = (key: string) => {
        setValueToChannel({
            key,
            value: null,
            activeTab,
            channelId,
        });
    };

    const clearAll = () => {
        for (const filter of active) {
            clear(filter.key);
        }
    };

    return (
        <div className={styles.bar}>
            <FilterOutlined className={styles.icon} />

            {active.length === 0 ? (
                <span className={styles.empty}>
                    {emptyText}
                </span>
            ) : (
                <div className={styles.chips}>
                    {active.map((filter) => (
                        <span
                            key={filter.key}
                            className={styles.chip}
                        >
                            <span>
                                {labels[filter.key] ??
                                    prettify(
                                        filter.dimension
                                    )}
                                :{' '}
                                {display(filter.value)}
                            </span>

                            <CloseOutlined
                                className={styles.remove}
                                onClick={() =>
                                    clear(filter.key)
                                }
                                aria-label={`Remove ${filter.dimension} filter`}
                            />
                        </span>
                    ))}
                </div>
            )}

            {showClearAll && active.length > 0 && (
                <button
                    type="button"
                    className={styles.clearAll}
                    onClick={clearAll}
                >
                    Clear all
                </button>
            )}
        </div>
    );
}

export default FilterBarWidget;