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
import { DEAL_NAME_KEY, FILTER_PREFIX, STAGE_PREFIX } from '../../constants';
import { useTapeFilter } from '../../hooks/useTapeFilter';
import styles from './FilterBarWidget.module.scss';

const FILTER_SCOPE_KEY = 'filterScope.deal.name';

function prettify(dimension: string): string {
    return dimension
        .replace(/[._-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (character) => character.toUpperCase())
        .trim();
}

export function FilterBarWidget({ widgetInstance, widgetDefinition }: WidgetComponentProps) {
    const params = widgetInstance?.config?.params ?? {};

    const properties = (widgetDefinition?.configSchema?.properties ?? {}) as Record<string, any>;

    const getDefault = (key: string) => properties?.[key]?.['default'];

    const channelId = params.channel;
    const contextKey: string = params.contextKey ?? getDefault('contextKey') ?? DEAL_NAME_KEY;

    const activeTab = useGetActiveTab();
    const setValueToChannel = useSetWidgetValue();

    const contextValue = useGetWidgetValue({ channelId, key: contextKey });
    const filterScopeValue = useGetWidgetValue({
        channelId,
        key: FILTER_SCOPE_KEY,
    });

    const bag = (useGetAllContext({ channelId }) ?? {}) as Record<string, unknown>;

    const tape = useTapeFilter(channelId);

    const labels: Record<string, string> = (
        params.dimensionLabels && typeof params.dimensionLabels === 'object'
            ? params.dimensionLabels
            : {}
    ) as Record<string, string>;

    const emptyText = String(
        params.emptyText ?? getDefault('emptyText') ?? 'No filters — full universe'
    );

    useEffect(() => {
        if (contextValue === null || contextValue === undefined || contextValue === '') {
            return;
        }

        const currentContext = String(contextValue);
        const storedScope =
            filterScopeValue === null || filterScopeValue === undefined
                ? ''
                : String(filterScopeValue);

        if (storedScope === currentContext) {
            return;
        }

        for (const key of Object.keys(bag)) {
            if (!key.startsWith(FILTER_PREFIX) && !key.startsWith(STAGE_PREFIX)) {
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
                widgetId: widgetInstance.id,
            });
        }

        setValueToChannel({
            key: FILTER_SCOPE_KEY,
            value: currentContext,
            activeTab,
            channelId,
            widgetId: widgetInstance.id,
        });
    }, [contextValue, filterScopeValue, activeTab, channelId, bag]);

    const chips = tape.appliedActive;
    const hasChips = chips.length > 0;
    const showActions = tape.hasPending || hasChips;

    return (
        <div className={styles.bar}>
            <FilterOutlined className={styles.icon} />

            <div className={styles.content}>
                {hasChips ? (
                    chips.map((chip) => (
                        <span key={chip.key} className={styles.chip}>
                            <span>
                                {(labels[chip.key] ?? prettify(chip.dim)) +
                                    ': ' +
                                    chip.values.join(', ')}
                            </span>

                            <CloseOutlined
                                className={styles.remove}
                                onClick={() => tape.removeApplied(chip.dim)}
                                aria-label={`Remove ${chip.dim} filter`}
                            />
                        </span>
                    ))
                ) : (
                    <span className={styles.empty}>{emptyText}</span>
                )}
            </div>

            {showActions && (
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.apply}
                        disabled={!tape.hasPending}
                        onClick={tape.apply}
                    >
                        Apply
                        {tape.hasPending && (
                            <span className={styles.badge}>{tape.pendingCount}</span>
                        )}
                    </button>

                    <button type="button" className={styles.reset} onClick={tape.reset}>
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}

export default FilterBarWidget;
