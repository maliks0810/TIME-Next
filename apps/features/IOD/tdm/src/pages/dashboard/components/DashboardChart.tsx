import React from 'react';
import ReactECharts from 'echarts-for-react';
import { IChartData } from '../lib/DashboardSecuritySetupRequest';

type DashboardChartProps = {
  chartData: IChartData[] | undefined;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ chartData }) => {

  const CHART_COLORS = [
    '#6c1444',
    '#654d88',
    '#013d7d',
    '#db9f00',
    '#4b773d',
  ];

  const chartOption = {
    title: {
      text: ''
    },
    color: CHART_COLORS,
    legend: {
      type: 'plain',
      orient: 'vertical',
      align: 'left',
      top: 'middle',
      width: '55%',
      left: '45%',
    },
    series: [
      {
        name: "SetupStatus",
        type: "pie",
        data: chartData,
        radius: ["67%", "80%"],
        left: 0,
        label: {
          show: false,
        },
        width: '45%',
      }
    ]
  };

  if (!chartData) {
    return <></>
  }

  return (
    <ReactECharts
      style={{
        height: '180px'
      }}
      option={chartOption}

    />
  )
}

export default DashboardChart;
