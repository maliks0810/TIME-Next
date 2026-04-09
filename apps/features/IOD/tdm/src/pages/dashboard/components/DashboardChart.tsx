import React from 'react';
import ReactECharts from 'echarts-for-react';
import { IChartData } from '../lib/ChartData'

type DashboardChartProps = {
  chartData: IChartData[] | undefined;
}

const DashboardChart: React.FC<DashboardChartProps> = ({chartData}) => {

  const chartOption = {
      title: {
        text: ''
      },
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

  if (!chartData)
  {
    return <></>
  }

  return (
    <ReactECharts
      style={{
        height:'150px'
      }}
      option={chartOption}
      
    />
  )
}

export default DashboardChart;