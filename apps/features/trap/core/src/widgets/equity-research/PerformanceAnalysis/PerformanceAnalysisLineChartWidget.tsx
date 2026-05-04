import { useEffect } from 'react';
import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import WidgetErrorState from '../../../components/widget-shell/WidgetErrorState';
import LineChart from './LineChartComponent';
import { getDateFormat } from '../../utils';

import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { ANALYSTS_KEY } from '../AnalystsCheckboxGroup/constants';
import { ChartData } from '../../../state/Widgets/types';
import { CHART_CONTROL_KEY, PERIOD_RADIO_STORE_KEY } from '../../constants';

export default function PerformanceAnalysisLineChartWidget({ result, widgetInstance, execute, loading, error }: WidgetComponentProps) {

    const chartControlValues = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: CHART_CONTROL_KEY,
    });
    const analystControlValues = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: ANALYSTS_KEY,
    });

    const periodControlValue = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: PERIOD_RADIO_STORE_KEY,
    });

    useEffect(() => {
        execute?.({
            period: periodControlValue,
            analystNames: analystControlValues,
            chartControls: chartControlValues,
        })
    }, [chartControlValues, analystControlValues, periodControlValue]);

    if (loading) {
        return (
            <WidgetCardShell>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    if (error) {
        return (
            <WidgetCardShell>
                <WidgetErrorState message={error} />
            </WidgetCardShell>
        );
    }

    if (!((result?.data as ChartData)?.series?.length) || !((result?.data as ChartData)?.dates?.length)) {
        return (
            <WidgetCardShell>
                <div style={{ padding: 12, fontSize: 12 }}>No chart data available.</div>
            </WidgetCardShell>
        );
    }

    return (
        <>
            <WidgetCardShell>
                <h3 style={{ textAlign: 'start' }}>Performance Comparisons</h3>
                <LineChart chartData={(result?.data ?? []) as ChartData} dateFormat={getDateFormat(periodControlValue as string)} />
            </WidgetCardShell>
        </>
    );
}
