export const CURRENT_YEAR = new Date().getFullYear();
export const REPORT_TYPE = 'Buy and Maintain';
export const EXCLUDED_KEYWORDS = ['validation', 'Low Rated'];

export const PORTFOLIO_LIST = [
  '13700T', '13725T', '13728T', '13795T', '13809T',
  '19000T', '19020T', '19033T', '19042T', '19050T',
  '19059T', '19066T', '19075T', '19084T', '19100T',
  '19110T', '19120T', '19126T', '19132T', '19137T',
  '19138T', '19999T',
] as const;

export type Portfolio = (typeof PORTFOLIO_LIST)[number];

export enum ReportSectionStatus {
  LOADING = 'loading',
  NO_REPORTS = 'no-reports',
  HAS_REPORTS = 'has-reports'
}
