// Currently Not deploying this functionality to production. Skip code review

export type ViewMode = 'security' | 'breakdown';

export type RowType = | 'security' | 'breakdown' | 'total';

export type PeriodKey = | 'wtd' | 'mtd' | 'qtd' | 'ytd' | '1y';

export interface PerformanceRow {
  id: string;
  parentId: string | null;
  name: string;
  rowType: RowType;

  /**
   * Characteristics
   */
  weight: number;
  benchmarkWeight: number;
  activeWeight: number;
  beta: number;
  dividendYeild: number;
  pe: number;

  /**
   * Allows perios fields to be dynamicaaly accessed by DevExtreme
   */
  [key: string]: string | number | null;
}


export const PERIOD_ORDER = ["WTD", "MTD", "QTD", "YTD", "ITD", "1M", "3M", "6M", "1Y", "3Y", "5Y", "10Y"];