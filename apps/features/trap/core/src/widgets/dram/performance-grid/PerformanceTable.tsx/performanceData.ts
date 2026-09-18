import type { PerformanceRow } from './types';

const createMetrics = (seed: number) : Record<string, number> => ({
  /**
   * WTD
   */
  wtd_contribution: seed * 0.12,
  wtd_activeContribution: seed * -0.08,
  wtd_return: seed * 0.35,
  wtd_benchmarkReturn: seed * 0.28,
  wtd_activeReturn: seed * 0.07,

  /**
   * MTD
   */
  mtd_contribution: seed * 0.12,
  mtd_activeContribution: seed * -0.08,
  mtd_return: seed * 0.35,
  mtd_benchmarkReturn: seed * 0.28,
  mtd_activeReturn: seed * 0.07,

  /**
   * QTD
   */
  qtd_contribution: seed * 0.12,
  qtd_activeContribution: seed * -0.08,
  qtd_return: seed * 0.35,
  qtd_benchmarkReturn: seed * 0.28,
  qtd_activeReturn: seed * 0.07,

  /**
   * YTD
   */
  ytd_contribution: seed * 0.12,
  ytd_activeContribution: seed * -0.08,
  ytd_return: seed * 0.35,
  ytd_benchmarkReturn: seed * 0.28,
  ytd_activeReturn: seed * 0.07,

  /**
   * ITD
   */
  itd_contribution: seed * 0.12,
  itd_activeContribution: seed * -0.08,
  itd_return: seed * 0.35,
  itd_benchmarkReturn: seed * 0.28,
  itd_activeReturn: seed * 0.07,

  /**
   * 1 Month
   */
  '1m_contribution': seed * 0.12,
  '1m_activeContribution': seed * -0.08,
  '1m_return': seed * 0.35,
  '1m_benchmarkReturn': seed * 0.28,
  '1m_activeReturn': seed * 0.07,

  /**
   * 3 Month
   */
  '3m_contribution': seed * 0.12,
  '3m_activeContribution': seed * -0.08,
  '3m_return': seed * 0.35,
  '3m_benchmarkReturn': seed * 0.28,
  '3m_activeReturn': seed * 0.07,

  /**
   * 6 Month
   */
  '6m_contribution': seed * 0.12,
  '6m_activeContribution': seed * -0.08,
  '6m_return': seed * 0.35,
  '6m_benchmarkReturn': seed * 0.28,
  '6m_activeReturn': seed * 0.07,

  /**
   * 1 Year
   */
  '1y_contribution': seed * 0.12,
  '1y_activeContribution': seed * -0.08,
  '1y_return': seed * 0.35,
  '1y_benchmarkReturn': seed * 0.28,
  '1y_activeReturn': seed * 0.07,

  /**
   * 3 Year
   */
  '3y_contribution': seed * 0.12,
  '3y_activeContribution': seed * -0.08,
  '3y_return': seed * 0.35,
  '3y_benchmarkReturn': seed * 0.28,
  '3y_activeReturn': seed * 0.07,

  /**
   * 5 Year
   */
  '5y_contribution': seed * 0.12,
  '5y_activeContribution': seed * -0.08,
  '5y_return': seed * 0.35,
  '5y_benchmarkReturn': seed * 0.28,
  '5y_activeReturn': seed * 0.07,

  /**
   * 10 Year
   */
  '10y_contribution': seed * 0.12,
  '10y_activeContribution': seed * -0.08,
  '10y_return': seed * 0.35,
  '10y_benchmarkReturn': seed * 0.28,
  '10y_activeReturn': seed * 0.07,
});


/**
 * Security View
 */

export const securityRows: PerformanceRow[] = [
  {
    id: 'MSFT',
    parentId: null,
    name: 'Microsoft',
    rowType: 'security',

    weight: 21.06,
    benchmarkWeight: 14.82,
    activeWeight: 6.24,
    beta: 0.98,
    dividendYeild: 0.70,
    pe: 34.0,

    ...createMetrics(1)
  },
  {
    id: 'AAPL',
    parentId: null,
    name: 'Apple',
    rowType: 'security',

    weight: 16.18,
    benchmarkWeight: 15.30,
    activeWeight: 0.88,
    beta: 1.24,
    dividendYeild: 0.50,
    pe: 31.0,

    ...createMetrics(1.4)
  },
  {
    id: 'AMZN',
    parentId: null,
    name: 'Amazon',
    rowType: 'security',

    weight: 12.06,
    benchmarkWeight: 9.08,
    activeWeight: 2.98,
    beta: 1.19,
    dividendYeild: 0.00,
    pe: 40.0,

    ...createMetrics(0.8)
  },
  {
    id: 'Total',
    parentId: null,
    name: 'Total',
    rowType: 'total',

    weight: 100,
    benchmarkWeight: 100,
    activeWeight: 0,
    beta: 1.18,
    dividendYeild: 0.48,
    pe: 35.5,

    ...createMetrics(3)
  }
];

/**
 * Breakdown View
 */
export const breakdownRows: PerformanceRow[] = [
  {
    id: 'information-technology',
    parentId: null,
    name: 'Information Technology',
    rowType: 'breakdown',

    weight: 53.34,
    benchmarkWeight: 61.54,
    activeWeight: -8.20,
    beta: 1.24,
    dividendYeild: 0.42,
    pe: 32.5,

    ...createMetrics(2.5)
  },
  {
    id: 'MSFT',
    parentId: 'information-technology',
    name: 'Microsoft',
    rowType: 'security',

    weight: 21.06,
    benchmarkWeight: 14.82,
    activeWeight: 6.24,
    beta: 0.98,
    dividendYeild: 0.70,
    pe: 34.0,

    ...createMetrics(1)
  },
  {
    id: 'AAPL',
    parentId: 'information-technology',
    name: 'Apple',
    rowType: 'security',

    weight: 16.18,
    benchmarkWeight: 15.30,
    activeWeight: 0.88,
    beta: 1.24,
    dividendYeild: 0.50,
    pe: 31.0,

    ...createMetrics(1.4)
  },
  {
    id: 'NVDA',
    parentId: 'information-technology',
    name: 'Nvidia',
    rowType: 'security',

    weight: 15.90,
    benchmarkWeight: 11.42,
    activeWeight: 4.48,
    beta: 1.61,
    dividendYeild: 0.03,
    pe: 45.0,

    ...createMetrics(1.8)
  },
  {
    id: 'industrials',
    parentId: null,
    name: 'Industrials',
    rowType: 'breakdown',

    weight: 1.00,
    benchmarkWeight: 2.53,
    activeWeight: -1.53,
    beta: 0.83,
    dividendYeild: 1.88,
    pe: 21.1,

    ...createMetrics(0.4)
  },
  {
    id: 'AMZN',
    parentId: 'industrials',
    name: 'Amazon',
    rowType: 'security',

    weight: 12.06,
    benchmarkWeight: 9.08,
    activeWeight: 2.98,
    beta: 1.19,
    dividendYeild: 0.00,
    pe: 40.0,

    ...createMetrics(0.8)
  },
  {
    id: 'CRM',
    parentId: null,
    name: 'Salesforce',
    rowType: 'security',

    weight: 1.08,
    benchmarkWeight: 1.00,
    activeWeight: 0.08,
    beta: 1.00,
    dividendYeild: 0.00,
    pe: 28.0,

    ...createMetrics(0.5)
  },
  {
    id: 'communication-services',
    parentId: null,
    name: 'Communication Services',
    rowType: 'breakdown',

    weight: 15.51,
    benchmarkWeight: 18.30,
    activeWeight: -2.79,
    beta: 1.18,
    dividendYeild: 0.62,
    pe: 25.4,

    ...createMetrics(1.8)
  },
  {
    id: 'consumer-discretionary',
    parentId: null,
    name: 'Consumenr Discretionary',
    rowType: 'breakdown',

    weight: 13.56,
    benchmarkWeight: 22.20,
    activeWeight: -8.64,
    beta: 0.62,
    dividendYeild: 0.31,
    pe: 29.6,

    ...createMetrics(1.2)
  },
  {
    id: 'financials',
    parentId: null,
    name: 'Financials',
    rowType: 'breakdown',

    weight: 3.89,
    benchmarkWeight: 4.73,
    activeWeight: -0.84,
    beta: 0.94,
    dividendYeild: 2.14,
    pe: 16.2,

    ...createMetrics(0.8)
  },
  {
    id: 'health-care',
    parentId: null,
    name: 'Health Care',
    rowType: 'breakdown',

    weight: 2.81,
    benchmarkWeight: 8.14,
    activeWeight: -5.33,
    beta: 0.69,
    dividendYeild: 1.52,
    pe: 22.4,

    ...createMetrics(0.7)
  },
  {
    id: 'Total',
    parentId: null,
    name: 'Total',
    rowType: 'total',

    weight: 100,
    benchmarkWeight: 100,
    activeWeight: 0,
    beta: 1.18,
    dividendYeild: 0.48,
    pe: 35.5,

    ...createMetrics(5)
  }
]