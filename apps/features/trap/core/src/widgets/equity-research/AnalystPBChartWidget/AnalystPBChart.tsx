/* eslint-disable @typescript-eslint/no-explicit-any */

import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { WidgetComponentProps } from '../../../types/widget';
import { ECharts, EChartsOption, init } from 'echarts';
import { useCallback, useEffect, useRef } from 'react';

import { ANALYSTS_KEY } from '../AnalystsCheckboxGroup/constants';
import { CHART_CONTROL_KEY, PERIOD_RADIO_STORE_KEY } from '../../constants';

export enum DateFormatEnum {
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
}
export const formatNegativeNumber = (value: any) => {
    const number = Number(value);
    if (number < 0) {
        return `(${Math.abs(number).toFixed(2)})`;
    }
    return number.toFixed(2);
};

export default function AnalystPBChart({
    chartData,
    dateFormat = 'month',
    isAnnualChart = true,
}: any) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<ECharts | null>(null);

    const formatXAxis = useCallback(
        (displayItem: string) => {
            if (isAnnualChart) return String(displayItem);

            const date = new Date(displayItem);
            switch (true) {
                case dateFormat === DateFormatEnum.DAY:
                    return date.toLocaleDateString('en-US');
                case dateFormat === DateFormatEnum.MONTH:
                    return `${date.getMonth() + 1}/${date.getFullYear()}`;
                default:
                    return date.getFullYear().toString();
            }
        },
        [dateFormat, isAnnualChart]
    );

    const dates = chartData?.dates ?? [];
    const N = dates.length;
    const maxLabels = 12;
    const step = Math.max(1, Math.ceil((N - 1) / (maxLabels - 1)));

    useEffect(() => {
        if (!chartRef.current) {
            return;
        }

        if (!chartInstance.current) {
            chartInstance.current = init(chartRef.current);
        }

        const option: EChartsOption = {
            tooltip: {
                trigger: 'axis',
                confine: true,
                appendToBody: true,
                extraCssText: 'max-width: 400px; white-space: normal; word-wrap: break-word;',
                formatter: (params: any) => {
                    if (!Array.isArray(params) || params.length === 0) return '';
                    if (params[0]?.dataIndex === 0 && !isAnnualChart) return '';

                    const date = new Date(params[0].axisValue).toLocaleDateString('en-US', {
                        timeZone: 'UTC',
                    });
                    let result = '<div style="min-width: 100px; max-width: 400px">';
                    result += `<div style="font-weight: bold; margin-bottom: 8px;">${date}</div>`;

                    params.forEach((param: any) => {
                        if (param.value !== null && param.value !== undefined) {
                            result +=
                                '<div style="margin: 2px 0; display: flex; align-items: center; white=space: nowrap;">';
                            result += `<span style="display: inline-block; margin-right: 4px; border-radius:50%; width:10px; height: 10px; background-color: ${param.color}; flex-shrink: 0;"></span> `;
                            result += `<span style="flex: 1; overflow: hidden; text-overflow: ellipsis; max-width: 100ppx;">${param.seriesName}:</span>`;
                            result += `<span style="margin-left: 2px; font-weight: bold; flex-shrink: 0;">${formatNegativeNumber(param.value)}%</span>`;
                            result += '</div>';
                        }
                    });

                    result += '</div>';
                    return result;
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#ccc',
                borderWidth: 1,
                padding: 12,
                textStyle: {
                    color: '#333',
                },
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '5%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: chartData.dates,
                boundaryGap: isAnnualChart ? true : false,

                axisLabel: {
                    interval: (index: number) => {
                        if (isAnnualChart) return true;
                        if (index === 0) return false;
                        return (index - 1) % step === 0;
                    },
                    formatter: (value: string, index: number) => {
                        if (isAnnualChart) {
                            return (
                                chartData?.labels?.[index] ??
                                new Date(value).getUTCFullYear().toString()
                            );
                        }
                        return index === 0 ? '' : formatXAxis(value);
                    },
                    hideOverlap: true,
                },

                splitLine: { show: true },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: (value: number) => `${value.toFixed(2)}%`,
                },
                splitLine: {
                    show: true,
                },
            },
            series: chartData.series,
        };

        chartInstance.current.setOption(option, true);
    }, [chartData, formatXAxis]);
    return (
        <div
            ref={chartRef}
            style={{
                width: '100%',
                height: '37vh',
            }}
        />
    );
}

export const AnalystPBChartWidget = ({ result, widgetInstance, execute }: WidgetComponentProps) => {
    const { config } = widgetInstance;

    const chartControl = useGetWidgetValue({
        channelId: config?.params?.channel,
        key: CHART_CONTROL_KEY,
    });
    const analystsControl = useGetWidgetValue({
        channelId: config?.params?.channel,
        key: ANALYSTS_KEY,
    });
    const periodControl = useGetWidgetValue({
        channelId: config?.params?.channel,
        key: PERIOD_RADIO_STORE_KEY,
    });

    useEffect(() => {
        const formattedNames = (analystsControl as string[])?.map((el: string) =>
            el.toUpperCase().replaceAll(' ', '_')
        );
        execute?.({ chartControl, analystsControl: formattedNames, periodControl });
    }, [chartControl, periodControl, analystsControl]);
    if (!result) {
        return (
            <WidgetCardShell>
                <div style={{ padding: 12, fontSize: 12 }}>No data available.</div>
            </WidgetCardShell>
        );
    }

    return (
        <WidgetCardShell>
            <h3 style={{ textAlign: 'start' }}>Excess Returns</h3>
            <AnalystPBChart chartData={result.data} />
        </WidgetCardShell>
    );
};
