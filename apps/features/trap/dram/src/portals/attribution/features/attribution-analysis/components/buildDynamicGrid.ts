import { AnalyticsRow } from "../lib/attributionRowModel";
import type { ColumnsType } from "antd/es/table";

/* ---------------------------------- */
/*  State Input Type */
/* ---------------------------------- */

export interface DynamicGridState {
  primaryGrouping: string;
  secondaryGrouping: string;
  tertiaryGrouping?: string;

  periods: string[];
  metrics: string[];
  portfolios: string[];
}

/* ---------------------------------- */
/*  Helpers */
/* ---------------------------------- */

export function sortPeriods(periods: string[]): string[] {
  const order = [
    "DAILY",
    "MTD",
    "QTD",
    "YTD",
    "1Y",
    "2Y",
    "3Y",
    "4Y",
    "5Y",
    "6Y",
    "7Y",
    "8Y",
    "9Y",
    "10Y",
    "15Y",
    "20Y",
    "SI",
  ];

  return [...periods].sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  );
}
/* ---------------------------------- */
/*  Build Columns */
/* ---------------------------------- */

export function buildDynamicColumns(
  state: DynamicGridState
): ColumnsType<AnalyticsRow> {
  const groupingCols: ColumnsType<AnalyticsRow> = [
    state.primaryGrouping,
    state.secondaryGrouping,
    state.tertiaryGrouping,
  ]
    .filter((g): g is string => Boolean(g))
    .map((label, index) => ({
      title: label,
      dataIndex: label,
      key: label,
      fixed: "left",
      width: index === 0 ? 170 : 150,
    }));

  const benchmarkCol: ColumnsType<AnalyticsRow>[number] = {
    title: "Bench.Wt",
    dataIndex: "benchmarkWeight",
    key: "benchmarkWeight",
    width: 100,
  };

  const portfolios = state.portfolios ?? [];

  /* ---------------------------------- */
  /*  SINGLE PORTFOLIO */
  /* ---------------------------------- */

  if (portfolios.length <= 1) {
    const portfolio = portfolios[0] ?? "Portfolio";

    const portWeightCol: ColumnsType<AnalyticsRow>[number] = {
      title: "Port.Wt",
      dataIndex: `${portfolio}|portfolioWeight`,
      key: `${portfolio}|portfolioWeight`,
      width: 100,
    };

    const periodCols: ColumnsType<AnalyticsRow> = state.periods.map(
      (period) => ({
        title: period,
        key: period,
        children: state.metrics.map((metric) => ({
          title: metric,
          dataIndex: `${portfolio}|${period}_${metric}`,
          key: `${portfolio}|${period}_${metric}`,
          width: 110,
        })),
      })
    );

    return [
      ...groupingCols,
      benchmarkCol,
      portWeightCol,
      ...periodCols,
    ];
  }

  /* ---------------------------------- */
  /*  MULTI PORTFOLIO */
  /* ---------------------------------- */

  const portfolioBands: ColumnsType<AnalyticsRow> =
    portfolios.map((portfolio) => ({
      title: portfolio,
      key: portfolio,
      children: [
        {
          title: "Weights",
          key: `${portfolio}-weights`,
          children: [
            {
              title: "Port.Wt",
              dataIndex: `${portfolio}|portfolioWeight`,
              key: `${portfolio}|portfolioWeight`,
              width: 100,
            },
          ],
        },
        ...state.periods.map((period) => ({
          title: period,
          key: `${portfolio}-${period}`,
          children: state.metrics.map((metric) => ({
            title: metric,
            dataIndex: `${portfolio}|${period}_${metric}`,
            key: `${portfolio}|${period}_${metric}`,
            width: 110,
          })),
        })),
      ],
    }));

  return [...groupingCols, benchmarkCol, ...portfolioBands];
}
