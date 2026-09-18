export type PerformancePeriod = | 'WTD' | 'MTD' | 'QTD' | 'YTD' | '1Y';

export interface PerformanceGridRow {
  allocEffect?: number;
  bmAvgWeight?: number;
  bmContToRet?: number;
  bmTotalRet?: number;
  hierarchy: string;
  hierarchyLevel: number;
  interEffect?: number;
  pfAvgWeight?: number;
  pfContToRet?: number;
  pfTotalRet: number;
  securityGroup: string;
  securityName: string;
  selectEffect?: number;
  totalEffect?: number;
  rowKey: string;
  [key: string]: unknown;
}

export interface PerformanceGrid {
  title: string;
  period: PerformancePeriod | string;
  rowCount: number;
  rows: PerformanceGridRow[];
}

export interface PerformanceGraphQLResponse {
  result: {
    grids: PerformanceGrid[];
  }
}

// Transformed structure used by devextreme treelist
export interface PerformanceTreeRow {
  id: string;
  parentId: string | null;
  name: string;
  rowKey: string;
  hierarchy: string;
  hierarchyLevel: number;
  securityGroup: string;
  securityName: string;
  pfAvgWeight?: number;
  bmAvgWeight?: number;
  periods: Record<string, PerformanceGridRow>
}