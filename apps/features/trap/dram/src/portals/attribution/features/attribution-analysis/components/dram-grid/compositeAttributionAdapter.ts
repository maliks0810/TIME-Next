import type {
  AnalyticResultRow,
} from "../../lib/services";
import { FrequencyModeId } from "../attrib-analysis-config/types";
import { GridConfigResponse, PeriodConfig } from "./types";

export type PeriodId = string;

export interface MultiPeriodSummaryRow {
  key: string;
  label: string;
  values: Record<PeriodId, number | null>;
  emphasis?: boolean;
  shaded?: boolean;
}

export interface MultiPeriodAttributionRow {
  key: string;
  label: string;
  level?: number;
  values: Record<PeriodId, number | null>;
  isTotal?: boolean;
  children?: MultiPeriodAttributionRow[];
}

export interface SinglePeriodAttributionRow {
  key: string;
  securityGroup: string;
  level?: number;

  portfolioAvgWeight: number | null;
  portfolioTotalReturn: number | null;
  portfolioContributionTotalReturn: number | null;

  benchmarkAvgWeight: number | null;
  benchmarkTotalReturn: number | null;
  benchmarkContributionTotalReturn: number | null;

  allocationEffect: number | null;
  selectionEffect: number | null;
  interactionEffect: number | null;

  children?: SinglePeriodAttributionRow[];
}

export interface CompositeAttributionViewData {
  title: string;
  asOfDateText: string;
  portfolioName: string;
  benchmarkName: string;
  periods: PeriodConfig[];
  singlePeriodRows: SinglePeriodAttributionRow[];
  summaryRows: MultiPeriodSummaryRow[];
  attributionRows: MultiPeriodAttributionRow[];
  contributionRows: MultiPeriodAttributionRow[];
}

type PeriodGridMap = Record<string, AnalyticResultRow[]>;

interface BuildCompositeInput {
  pageTitle: string;
  valueDate: string;
  portfolioName: string;
  benchmarkName: string;
  periods: PeriodConfig[];
  rowsByPeriod: PeriodGridMap;
}

const getNumber = (
  row: AnalyticResultRow | undefined,
  candidates: readonly string[],
): number | null => {
  if (!row) return null;

  for (const key of candidates) {
    const rawValue = row[key];

    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      return rawValue;
    }

    if (typeof rawValue === "string" && rawValue.trim() !== "") {
      const parsed = Number(rawValue);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};

const getText = (
  row: AnalyticResultRow,
  candidates: readonly string[],
  fallback: string,
): string => {
  for (const key of candidates) {
    const value = row[key];

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
};

const getLevel = (row: AnalyticResultRow): number => {
  const value = getNumber(row, [
    "level",
    "Level",
    "HierarchyLevel",
    "hierarchy_level",
  ]);

  return value ?? 0;
};

const toBps = (value: number | null): number | null => {
  if (value === null) return null;

  // If your backend already returns bps, change this to: return value;
  return Math.round(value * 10000);
};

const findTotalRow = (rows: AnalyticResultRow[]): AnalyticResultRow | undefined => {
  return rows.find(
    (row) =>
      String(row["SecurityGroup"] ?? row["securityGroup"] ?? "").toLowerCase() ===
      "total",
  );
};

export const toCompositePeriods = (
  periodKeys: string[],
  gridConfig: GridConfigResponse,
): PeriodConfig[] => {
  const defaultFrequency: FrequencyModeId =
    gridConfig.frequencyMode?.[0]?.id ?? "monthly";

  return periodKeys.map((period, index) => ({
    id: period,
    label: period.toUpperCase(),
    short_label: period.toUpperCase(),
    sort_order: index,
    visible: true,
    frequency_mode: defaultFrequency,
  }));
};

const buildMatrixRows = (
  visiblePeriods: PeriodConfig[],
  rowsByPeriod: PeriodGridMap,
  valueCandidates: readonly string[],
): MultiPeriodAttributionRow[] => {
  const firstPeriodId = visiblePeriods[0]?.id ?? "";
  const baseRows = rowsByPeriod[firstPeriodId] ?? [];

  const rows = baseRows
    .filter((row) => {
      const label = getText(row, ["SecurityGroup", "securityGroup"], "");
      return label !== "";
    })
    .map((baseRow, index) => {
      const label = getText(
        baseRow,
        ["SecurityGroup", "securityGroup"],
        `Row ${index + 1}`,
      );

      const isTotal = label.toLowerCase() === "total";
      const values: Record<string, number | null> = {};

      for (const period of visiblePeriods) {
        const periodRows = rowsByPeriod[period.id] ?? [];

        const matchingRow = periodRows.find(
          (row) =>
            getText(row, ["SecurityGroup", "securityGroup"], "") === label,
        );

        values[period.id] = toBps(getNumber(matchingRow, valueCandidates));
      }

      return {
        key: label,
        label,
        level: isTotal ? 0 : getLevel(baseRow),
        values,
        isTotal,
      };
    });

  return rows.sort((left, right) => {
    if (left.isTotal) return -1;
    if (right.isTotal) return 1;
    return 0;
  });
};
const buildAttributionRows = (
  visiblePeriods: PeriodConfig[],
  rowsByPeriod: PeriodGridMap,
): MultiPeriodAttributionRow[] => {
  const firstPeriodId = visiblePeriods[0]?.id ?? "";
  const baseRows = rowsByPeriod[firstPeriodId] ?? [];

  const rows = baseRows
    .filter((row) => {
      const label = getText(row, ["SecurityGroup", "securityGroup"], "");
      return label !== "";
    })
    .map((baseRow, index) => {
      const label = getText(
        baseRow,
        ["SecurityGroup", "securityGroup"],
        `Row ${index + 1}`,
      );

      const isTotal = label.toLowerCase() === "total";
      const values: Record<string, number | null> = {};

      for (const period of visiblePeriods) {
        const periodRows = rowsByPeriod[period.id] ?? [];

        const matchingRow = periodRows.find(
          (row) =>
            getText(row, ["SecurityGroup", "securityGroup"], "") === label,
        );

        const alloc = getNumber(matchingRow, [
          "AllocEffect",
          "allocationEffect",
          "AllocationEffect",
        ]);

        const select = getNumber(matchingRow, [
          "SelectEffect",
          "selectionEffect",
          "SelectionEffect",
        ]);

        const inter = getNumber(matchingRow, [
          "InterEffect",
          "interactionEffect",
          "InteractionEffect",
        ]);

        const totalEffect =
          alloc !== null || select !== null || inter !== null
            ? (alloc ?? 0) + (select ?? 0) + (inter ?? 0)
            : null;

        values[period.id] = toBps(totalEffect);
      }

      return {
        key: label,
        label,
        level: isTotal ? 0 : getLevel(baseRow),
        values,
        isTotal,
      };
    });

  return rows.sort((left, right) => {
    if (left.isTotal) return -1;
    if (right.isTotal) return 1;
    return 0;
  });
};
export const buildCompositeAttributionData = ({
  pageTitle,
  valueDate,
  portfolioName,
  benchmarkName,
  periods,
  rowsByPeriod,
}: BuildCompositeInput): CompositeAttributionViewData => {
  const visiblePeriods = periods
    .filter((period) => period.visible)
    .sort((left, right) => left.sort_order - right.sort_order);

  const portfolioValues: Record<string, number | null> = {};
  const benchmarkValues: Record<string, number | null> = {};
  const activeValues: Record<string, number | null> = {};

  for (const period of visiblePeriods) {
    const totalRow = findTotalRow(rowsByPeriod[period.id] ?? []);

    const portfolioReturn = getNumber(totalRow, [
      "PFTotalRet",
      "PF_Total_Return",
      "portfolioTotalReturn",
      "PortTotalReturn",
    ]);

    const benchmarkReturn = getNumber(totalRow, [
      "BMTotalRet",
      "BM_Total_Return",
      "benchmarkTotalReturn",
      "BenchTotalReturn",
    ]);

    portfolioValues[period.id] = portfolioReturn;
    benchmarkValues[period.id] = benchmarkReturn;
    activeValues[period.id] =
      portfolioReturn !== null && benchmarkReturn !== null
        ? portfolioReturn - benchmarkReturn
        : null;
  }
    const attributionRows = buildAttributionRows(
      visiblePeriods,
      rowsByPeriod,
    );

    const contributionRows = buildMatrixRows(
      visiblePeriods,
      rowsByPeriod,
      [
        "PFContribToRet",
        "PFContTotalReturn",
        "PortContTotalReturn",
        "portfolioContributionTotalReturn",
        "PortfolioContributionToReturn",
      ],
    );

  return {
    title: pageTitle,
    asOfDateText: valueDate ? `As of ${valueDate}` : "",
    portfolioName,
    benchmarkName,
    periods: visiblePeriods,
    singlePeriodRows: [],
    summaryRows: [
      {
        key: "portfolio",
        label: portfolioName || "Portfolio",
        values: portfolioValues,
        emphasis: true,
      },
      {
        key: "benchmark",
        label: benchmarkName || "Benchmark",
        values: benchmarkValues,
        shaded: true,
      },
      {
        key: "active",
        label: "Gross Out/Underperformance",
        values: activeValues,
        emphasis: true,
      },
    ],
    attributionRows,
    contributionRows,
  };
};
