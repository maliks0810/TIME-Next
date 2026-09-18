/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { Divider } from 'antd';

import { WidgetComponentProps } from '../../../types/widget';
import styles from './PerformanceGrid.module.scss';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { useGetWidgetValueArray, useSetWidgetValue } from '../../../state/Widgets/hooks';

import { PerformanceGridHeader } from './PerformanceGridHeader';
import { PerformanceTable } from './PerformanceTable.tsx/PerformanceTable';
import { GridDrawer } from './Drawer/GridDrawer';
import { Metric, Taxonomy, useAttributionStore } from './state/useStore';
import { mapPerformanceGrids } from './PerformanceTable.tsx/performance.mapper';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { PERF_GRID_OPERATIONS, perfGridSchemaKey } from './constants';

const DRAM_BREAKDOWN_KEY = 'dram.attribution.breakdown';
export const PerformanceGridTable = ({
    widgetInstance: { config = {}, id },
    defaultValue,
    execute,
}: WidgetComponentProps) => {
    const setAttributionCatalog = useAttributionStore((store) => store.setAttributionCatalog);
    const setLevels = useAttributionStore((store) => store.setLevels);

    const metrics = useAttributionStore((store) => store.metrics);
    const setMetrics = useAttributionStore((store) => store.setMetrics);
    const levels = useAttributionStore((store) => store.levels);
    const activeTab = useGetActiveTab();
    const setWidgetValue = useSetWidgetValue();

    const setTaxonomiesCatalog = useAttributionStore((store) => store.setTaxonomiesCatalog);
    const [grids, setGrids] = useState<any>(undefined);
    const listensToKeys = useMemo(
        () =>
            Array.isArray(config?.params?.listensToKeys)
                ? config?.params?.listensToKeys
                : [config?.params?.listensToKeys],
        [config?.params?.listensToKeys]
    );

    const context = useGetWidgetValueArray({
        channelId: config.params?.channel,
        keys: listensToKeys,
    });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const subscribedValues = useMemo(
        () =>
            listensToKeys
                ? listensToKeys.reduce(
                      (acc: any, cur: string) => ({ ...acc, [cur]: context?.[cur] || null }),
                      {}
                  )
                : {},
        [context, listensToKeys]
    );

    const onBreakdownSave = () => {
        setWidgetValue({
            activeTab,
            value: {
                breakdown: levels,
                metrics,
            },
            key: DRAM_BREAKDOWN_KEY,
            widgetId: id,
        });
    };

    useEffect(() => {
        if (defaultValue) {
            if (defaultValue[DRAM_BREAKDOWN_KEY]) {
                const defaultLevels = defaultValue[DRAM_BREAKDOWN_KEY].value.breakdown;
                const defaultMetrics = defaultValue[DRAM_BREAKDOWN_KEY].value.metrics;

                setLevels(defaultLevels);
                setMetrics(defaultMetrics);
            }
        }
    }, [defaultValue]);

    useEffect(() => {
        const capabilities = levels
            .map((el: any) => el.config.field)
            .filter((el) => el !== 'Default');
        if (capabilities.length > 0)
            execute?.(
                {
                    ...subscribedValues.pacInputs,
                    capabilityKey: capabilities[0],
                    operation: PERF_GRID_OPERATIONS.ATTRIBUTION,
                },
                {
                    ...subscribedValues.pacInputs,
                    capabilityKey: capabilities[0],
                    operation: PERF_GRID_OPERATIONS.ATTRIBUTION,
                }
            );
    }, [levels]);
    const fetchValues = async (subscribedValues: any) => {
        if (!subscribedValues.pacInputs) return;
        const result: any = await execute?.(
            {
                ...subscribedValues.pacInputs,
                schemaKey: perfGridSchemaKey,
                operation: PERF_GRID_OPERATIONS.ATTRIBUTION,
            },
            {
                ...subscribedValues.pacInputs,
                schemaKey: perfGridSchemaKey,
                operation: PERF_GRID_OPERATIONS.ATTRIBUTION,
            }
        );

        setGrids(result?.grids);
    };
    useEffect(() => {
        if (subscribedValues && listensToKeys) {
            fetchValues(subscribedValues);
        }
    }, [subscribedValues, listensToKeys]);

    const fetchBreakdownAndMetrics = async () => {
        const breakdowns = await execute?.(
            { ...subscribedValues.pacInputs, operation: PERF_GRID_OPERATIONS.BREAKDOWN },
            { ...subscribedValues.pacInputs, operation: PERF_GRID_OPERATIONS.BREAKDOWN }
        );

        setBreakdowns(breakdowns || {});

        const metricsResult: any = await execute?.(
            { ...subscribedValues.pacInputs, operation: PERF_GRID_OPERATIONS.METRICS },
            { ...subscribedValues.pacInputs, operation: PERF_GRID_OPERATIONS.METRICS }
        );

        if (metrics) {
            const metricsStateEnabled: Record<string, boolean> = metrics.reduce(
                (acc, cur) => ({ ...acc, [cur.metricId]: cur.enabled }),
                {}
            );
            setMetrics(
                metricsResult?.items.map((el: Metric) => ({
                    ...el,
                    enabled: metricsStateEnabled[el.metricId],
                }))
            );
        } else {
            setMetrics(
                metricsResult?.items.map((el: Metric) => ({
                    ...el,
                    enabled: true,
                }))
            );
        }

        // This is required for sandbox debug for now
        console.log('breakdown and metrics', breakdowns, metricsResult);
    };

    useEffect(() => {
        if (grids) fetchBreakdownAndMetrics();
    }, [grids]);

    const setBreakdowns = (result?: Record<string, any>) => {
        if (!result) return null;
        const { breakdowns } = result;
        const catalogItems = breakdowns?.attributes.reduce((acc: any, cur: any) => {
            if (acc[cur.capabilityGroupName]) {
                if (cur.isActive)
                    return {
                        ...acc,
                        [cur.capabilityGroupName]: [
                            ...acc[cur.capabilityGroupName],
                            [cur.capabilityKey, cur.attributeDisplayName],
                        ],
                    };
                else return acc;
            }
            return {
                ...acc,
                [cur.capabilityGroupName]: [[cur.capabilityKey, cur.attributeDisplayName]],
            };
        }, {});
        setAttributionCatalog(catalogItems);

        const taxonomies = breakdowns?.taxonomies.reduce((acc: any, cur: Taxonomy) => {
            const key = cur.taxonomyName;
            if (acc[key]) return { ...acc, [key]: [cur, ...acc[key]] };
            else return { ...acc, [key]: [cur] };
        }, {});
        setTaxonomiesCatalog(taxonomies);

        return true;
    };

    return (
        <WidgetCardShell>
            <div className={styles.performanceGrid}>
                <PerformanceGridHeader
                    portfolioName={subscribedValues.pacInputs?.portfolioName}
                    compareVsName={subscribedValues.pacInputs?.compareVsName}
                    startDate={subscribedValues.pacInputs?.startDate}
                    endDate={subscribedValues.pacInputs?.endDate}
                    linkAsOf={false}
                />

                <Divider />
                <GridDrawer onDoneCb={onBreakdownSave} />
                {/* Used any type here as from BE we are not receiving types with proper casing and we don't add types with such casing. */}
                <PerformanceTable grids={mapPerformanceGrids((grids ?? []) as any[])} />
            </div>
        </WidgetCardShell>
    );
};
