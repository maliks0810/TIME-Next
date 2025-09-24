import * as echarts from 'echarts/core';
export * from 'echarts/core';
export * from 'echarts/charts';

import { LineChart } from 'echarts/charts';

export const timeColors = {
    primary: '#003e7e',
    secondary: '#00B0AD',

    background: '#ffffff',

    chartColors: [
        '#003e7e'
    ]
};

const timeEchartsTheme = {
    color: timeColors.chartColors,
    backgroundColor: 'transparent',
    textStyle: {
        fontFamily: 'Lato'
    }
}
    echarts.use([
        LineChart
    ]);


    echarts.registerTheme('time-echarts-theme', timeEchartsTheme);


    const originalEchartInit = echarts.init;
    (echarts as any).init = function(dom: any, theme?: any, opts?: any) {
        if (!theme) {
            theme = 'time-echarts-theme';
        }
        return originalEchartInit.call(this, dom, theme, opts);
    };

export default echarts;

