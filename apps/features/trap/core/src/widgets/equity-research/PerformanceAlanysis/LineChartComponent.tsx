import { ECharts, init } from 'echarts';
import { useCallback, useEffect, useRef } from 'react';
import { DateFormatEnum } from '../../constants';
import { ChartData } from '../../../state/Widgets/types';
import { formatNegativeNumber } from '../../utils';

export type LineChartProps = {
    chartData: ChartData,
    dateFormat: DateFormatEnum;
};

export default function LineChart({ chartData, dateFormat }: LineChartProps) {

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<ECharts | null>(null);

    const formatXAxis = useCallback(
        (displayItem: string) => {
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
        [dateFormat]
    );

    const prepareLineChartOptions = ({ formatXAxis, step, chartData }: {
        formatXAxis: (displayItem: string) => string,
        step: number,
        chartData: LineChartProps["chartData"],
    }) => {
        return {
            tooltip: {
                trigger: 'axis',
                confine: true,
                appendToBody: true,
                extraCssText: 'max-width: 400px; white-space: normal; word-wrap: break-word;',
                formatter: (params: { dataIndex: number; axisValue: string; value: number; color: string; seriesName: string; }[]) => {
                    if (!Array.isArray(params) || params.length === 0) return '';

                    const date = new Date(params[0].axisValue).toLocaleDateString('en-US', { timeZone: 'UTC' });
                    let result = '<div style="min-width: 100px; max-width: 400px">';
                    result += `<div style="font-weight: bold; margin-bottom: 8px;">${date}</div>`;

                    params.forEach((param) => {
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
                data: chartData?.dates,
                boundaryGap: false,
                axisLabel: {
                    interval: (index: number) => {
                        if (index === 0) return false;
                        return ((index - 1) % step) === 0;
                    },
                    formatter: (value: string, index: number) => {
                        return index === 0 ? '' : formatXAxis(value);
                    },
                    hideOverlap: true,
                },
                splitLine: { show: true },
            },
            yAxis: {
                type: 'value',
                // min: (extent) => Math.min(0, extent.min),  // 0 unless data dips below 0
                axisLabel: {
                    formatter: (value: number) => `${value.toFixed(2)}%`,
                },
                splitLine: {
                    show: true,
                },
            },
            series: chartData?.series,
        };
    }

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

        const option = prepareLineChartOptions({ formatXAxis, step, chartData })
        chartInstance.current.setOption(option, true);
    }, [chartData, formatXAxis]);

    return (
        <div
            ref={chartRef}
            style={{
                width: '100%',
                height: '80%',
            }}
        />
    );
}
