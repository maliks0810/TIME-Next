import path from 'path';

export function getEChartsAliases(rootDir: string) {
    const echartsPath = path.resolve(rootDir, 'packages/ui/src/themes/configured-echarts.ts');

    return {
        'echarts': echartsPath,
        'echarts/core': echartsPath,
        'echarts/charts': echartsPath
    }
}