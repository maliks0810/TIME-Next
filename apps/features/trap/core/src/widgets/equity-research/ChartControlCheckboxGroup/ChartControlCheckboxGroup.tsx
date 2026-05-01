import { useGetWidgetValue, useSetWidgetValue } from '../../../state/Widgets/hooks';
import { WidgetComponentProps } from '../../../types/widget';
import { useState, useMemo, useEffect } from 'react';
import { CHART_CONTROL_KEY } from '../../constants';
import { CheckboxGroupBase } from '../../common/checkbox-group/CheckboxGroup';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { AnalystLinesEnum } from '../../types';

export const ChartControlCheckboxGroup = ({ widgetInstance }: WidgetComponentProps) => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const activeTab = useGetActiveTab();
    const setWidgetValueToChannel = useSetWidgetValue();
    const chartControlStoredValues = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: CHART_CONTROL_KEY,
    });

    useEffect(() => {
        if (chartControlStoredValues) {
            setSelectedValues(chartControlStoredValues as string[]);
        }
    }, [chartControlStoredValues]);

    const handleChange = (selected: string[]) => {
        setWidgetValueToChannel({
            key: CHART_CONTROL_KEY,
            channelId: widgetInstance?.config?.params?.channel,
            value: selected,
            activeTab,
        });
        setSelectedValues(selected);
    };

    const layout = widgetInstance.config?.params?.['layout'] || 'vertical';

    const items = useMemo(
        () => [
            {
                label: 'Performance',
                defaultChecked: selectedValues.includes(AnalystLinesEnum.ANALYST_PERFORMANCE),
                key: AnalystLinesEnum.ANALYST_PERFORMANCE,
            },
            {
                label: 'Benchmark',
                defaultChecked: selectedValues.includes(AnalystLinesEnum.BENCHMARK_PERFORMANCE),
                key: AnalystLinesEnum.BENCHMARK_PERFORMANCE,
            },
            {
                label: 'Excess Return',
                defaultChecked: selectedValues.includes(AnalystLinesEnum.EXCESS_RETURN),
                key: AnalystLinesEnum.EXCESS_RETURN,
            },
        ],
        [selectedValues]
    );

    return <CheckboxGroupBase items={items} onChange={handleChange} layout={layout} />;
};
