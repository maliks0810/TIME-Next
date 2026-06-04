import type { ColumnsType } from "antd/es/table";
import { AnalyticResultRow, WorkflowState } from "../lib/services";

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

export function getDynamicColumns(data: AnalyticResultRow[], breakdown: string): string[] {
  if (!data.length) return [];

  return Object.keys(data[0]).filter((key) =>
    key.startsWith(breakdown)
  );
}



export function buildColumns(data: AnalyticResultRow[], breakdown: string): ColumnsType<AnalyticResultRow> {
  const gicsCols = getDynamicColumns(data, breakdown);

  return [
    {
      title: "Security",
      dataIndex: "SecurityName",
      key: "SecurityName",
      fixed: "left",
    },

    //  dynamic breakdown columns
    ...gicsCols.map((gicsKey) => ({
      title: gicsKey,
      dataIndex: gicsKey,
      key: gicsKey,
      render: (val: string | null) => val ?? "-",
    })),

    //  PF group
    {
      title: "Portfolio",
      children: [
        { title: "Avg Weight", dataIndex: "PFAvgWeight", key: "PFAvgWeight" },
        { title: "Total Return", dataIndex: "PFTotalRet", key: "PFTotalRet" },
        { title: "Contribution", dataIndex: "PFContToRet", key: "PFContToRet" },
      ],
    },

    //  BM group
    {
      title: "Benchmark",
      children: [
        { title: "Avg Weight", dataIndex: "BMAvgWeight", key: "BMAvgWeight" },
        { title: "Total Return", dataIndex: "BMTotalRet", key: "BMTotalRet" },
        { title: "Contribution", dataIndex: "BMContToRet", key: "BMContToRet" },
      ],
    },

    //  Effects
    {
      title: "Effects",
      children: [
        { title: "Allocation", dataIndex: "AllocEffect", key: "AllocEffect" },
        { title: "Selection", dataIndex: "SelectEffect", key: "SelectEffect" },
        { title: "Interaction", dataIndex: "InterEffect", key: "InterEffect" },
      ],
    },
  ];
}


export function buildDynamicColumns(
  state: WorkflowState
): ColumnsType<AnalyticResultRow> {
  const groupingCols: ColumnsType<AnalyticResultRow> = [
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

  const benchmarkCol: ColumnsType<AnalyticResultRow>[number] = {
    title: "Bench. Avg Wt",
    dataIndex: "benchmarkWeight",
    key: "BMAvgWeight",
    width: 100,
  };

  const portfolios = state.portfolios ?? [];

  /* ---------------------------------- */
  /*  SINGLE PORTFOLIO */
  /* ---------------------------------- */

  if (portfolios.length <= 1) {
    const portfolio = portfolios[0] ?? "Portfolio";

    const portWeightCol: ColumnsType<AnalyticResultRow>[number] = {
      title: "Port.Wt",
      dataIndex: `${portfolio}|portfolioWeight`,
      key: `${portfolio}|PFAvgWeight`,
      width: 100,
    };

    // const periodCols: ColumnsType<AnalyticResultRow> = state.periods.map(
    //   (period) => ({
    //     title: period,
    //     key: period,
    //     children: state.metrics.map((metric) => ({
    //       title: metric,
    //       dataIndex: `${portfolio}|${period}_${metric}`,
    //       key: `${portfolio}|${period}_${metric}`,
    //       width: 110,
    //     })),
    //   })
    // );

    return [
      ...groupingCols,
      benchmarkCol,
      portWeightCol,
      //...periodCols,
    ];
  }

  /* ---------------------------------- */
  /*  MULTI PORTFOLIO */
  /* ---------------------------------- */

  const portfolioBands: ColumnsType<AnalyticResultRow> =
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
              key: `${portfolio}|PFAvgWeight`,
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
