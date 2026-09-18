import { Column } from 'devextreme-react/tree-list';

interface PeriodColumnProps {
    period: string;
    enabledMetrics: string[];
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

export function PeriodColumns({ period, enabledMetrics }: PeriodColumnProps) {
    const periodCaption = period.split(':')[0];
    return (
        <>
            <Column key={period} caption={periodCaption} alignment="center">
                {enabledMetrics?.includes('AllocEffect') && (
                    <Column
                        dataField={`periods.${period}.allocEffect`}
                        caption="Alloc Effect"
                        width={92}
                        alignment="right"
                        format={{ type: 'fixedPoint', precision: 2 }}
                    />
                )}
                {enabledMetrics?.includes('PFContToRet') && (
                    <Column
                        dataField={`periods.${period}.pfContToRet`}
                        caption="PF CONTRIB"
                        width={85}
                        alignment="right"
                        format={{ type: 'fixedPoint', precision: 2 }}
                    />
                )}
                {enabledMetrics?.includes('BMContToRet') && (
                    <Column
                        dataField={`periods.${period}.bmContToRet`}
                        caption="BM CONTRIB"
                        width={85}
                        alignment="right"
                        format={{ type: 'fixedPoint', precision: 2 }}
                    />
                )}
                {enabledMetrics?.includes('PFTotalRet') && (
                    <Column
                        dataField={`periods.${period}.pfTotalRet`}
                        caption="PF RETURN"
                        width={85}
                        alignment="right"
                        format={{ type: 'fixedPoint', precision: 2 }}
                    />
                )}
                {enabledMetrics?.includes('BMTotalRet') && (
                    <Column
                        dataField={`periods.${period}.bmTotalRet`}
                        caption="BM Return"
                        width={85}
                        alignment="right"
                        format={{ type: 'fixedPoint', precision: 2 }}
                    />
                )}
                {enabledMetrics?.includes('InterEffect') && (
                    <Column
                        dataField={`periods.${period}.interEffect`}
                        caption="Inter Effect"
                        width={85}
                        alignment="right"
                        format={{ type: 'fixedPoint', precision: 2 }}
                    />
                )}
                {enabledMetrics?.includes('SelectEffect') && (
                    <Column
                        dataField={`periods.${period}.selectEffect`}
                        caption="Select Effect"
                        width={85}
                        alignment="right"
                        format={{ type: 'fixedPoint', precision: 2 }}
                    />
                )}
                {enabledMetrics?.includes('TotalEffect') && (
                    <Column
                        dataField={`periods.${period}.totalEffect`}
                        caption="Total Effect"
                        width={85}
                        alignment="right"
                        format={{ type: 'fixedPoint', precision: 2 }}
                    />
                )}
            </Column>
        </>
    );
}
