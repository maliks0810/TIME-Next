import type React from 'react';
import { Column } from 'devextreme-react/tree-list';

import { PeriodColumns } from './PeriodColumns';
import { Metric } from '../state/useStore';

interface Props {
    periods: string[];
    metrics: Metric[];
}

export const formatPercent = ({ value }: { value: unknown }) => {
    if (value === null || value == undefined) {
        return '-';
    }

    return `${Number(value).toFixed(2)}%`;
};

export const formatNumber = ({ value }: { value: unknown }) => {
    if (value === null || value == undefined) {
        return '-';
    }

    return Number(value).toFixed(2);
};

export function PerformanceColumns({ periods, metrics }: Props) {
    const enabledMetrics = metrics?.filter((el) => el.enabled).map((el) => el.metricId) || [];

    return (
        <>
            {/* Security Breakdown */}
            <Column
                dataField="name"
                caption="Security"
                width={220}
                fixed
                fixedPosition="left"
                alignment="left"
            />

            {/* Characteristics */}
            {/* Filtering out will change after intrudction of dynamic columns */}
            {(enabledMetrics.includes('PFAvgWeight') || enabledMetrics.includes('BMAvgWeight')) && (
                <Column caption="CHARACTERISTICS" alignment="center">
                    {enabledMetrics.includes('PFAvgWeight') && (
                        <Column
                            dataField="pfAvgWeight"
                            caption="PF Avg Weight"
                            width={92}
                            alignment="right"
                            format={{ type: 'fixedPoint', precision: 2 }}
                        />
                    )}
                    {enabledMetrics.includes('BMAvgWeight') && (
                        <Column
                            dataField="bmAvgWeight"
                            caption="BM Avg Weight"
                            width={120}
                            alignment="right"
                            format={{ type: 'fixedPoint', precision: 2 }}
                        />
                    )}
                </Column>
            )}

            {periods.map((period) => (
                <PeriodColumns key={period} period={period} enabledMetrics={enabledMetrics} />
            ))}
        </>
    );
}
