import { AborVsIborDailyRow, AborVsIborMtdRow } from "./aborVsIbor";

export const DAILY_BP_TOLERANCE = 5;

function safeNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function weightedAverage<T>(
  rows: T[],
  valueSelector: (row: T) => number,
  weightSelector: (row: T) => number,
): number {
  const denominator = rows.reduce((sum, row) => sum + safeNumber(weightSelector(row)), 0);

  if (denominator === 0) {
    return 0;
  }

  const numerator = rows.reduce(
    (sum, row) => sum + safeNumber(valueSelector(row)) * safeNumber(weightSelector(row)),
    0,
  );

  return numerator / denominator;
}

export function buildMtdTotalRow(rows: AborVsIborMtdRow[]): AborVsIborMtdRow | null {
  const detailRows = rows.filter((row) => !row.isTotalRow);

  if (!detailRows.length) {
    return null;
  }

  const totalBomNav = detailRows.reduce((sum, row) => sum + safeNumber(row.bomNav), 0);
  const totalMtdCf = detailRows.reduce((sum, row) => sum + safeNumber(row.mtdCf), 0);

  return {
    portfolioId: "TOTAL",
    portfolioName: "Total",
    mtdAbor: weightedAverage(detailRows, (r) => r.mtdAbor, (r) => r.bomNav),
    mtdAborCfAdj: weightedAverage(detailRows, (r) => r.mtdAborCfAdj, (r) => r.bomNav),
    mtdIbor: weightedAverage(detailRows, (r) => r.mtdIbor, (r) => r.bomNav),
    bomNav: totalBomNav,
    mtdCf: totalMtdCf,
    mtdCfBomNavPct: totalBomNav === 0 ? 0 : totalMtdCf / totalBomNav,
    mtdAborMinusMtdAborCfAdj: weightedAverage(
      detailRows,
      (r) => r.mtdAborMinusMtdAborCfAdj,
      (r) => r.bomNav,
    ),
    mtdAborCfAdjMinusMtdIbor: weightedAverage(
      detailRows,
      (r) => r.mtdAborCfAdjMinusMtdIbor,
      (r) => r.bomNav,
    ),
    tolerance: Math.max(...detailRows.map((r) => safeNumber(r.tolerance))),
    flag: detailRows.some((r) => r.flag === 1) ? 1 : 0,
    gridTitle: detailRows[0].gridTitle,
    isTotalRow: true,
  };
}

export function buildDailyTotalRow(rows: AborVsIborDailyRow[]): AborVsIborDailyRow | null {
  const detailRows = rows.filter((row) => !row.isTotalRow);

  if (!detailRows.length) {
    return null;
  }

  const totalMv = detailRows.reduce((sum, row) => sum + safeNumber(row.mv), 0);
  const totalBodNav = detailRows.reduce((sum, row) => sum + safeNumber(row.bodNav), 0);
  const totalEodNav = detailRows.reduce((sum, row) => sum + safeNumber(row.eodNav), 0);
  const totalEodTotCf = detailRows.reduce((sum, row) => sum + safeNumber(row.eodTotCf), 0);
  const totalEodNavCfAdj = detailRows.reduce((sum, row) => sum + safeNumber(row.eodNavCfAdj), 0);

  return {
    portfolioId: "TOTAL",
    asOfDate: "",
    mv: totalMv,
    mtdIbor: weightedAverage(detailRows, (r) => r.mtdIbor, (r) => r.mv),
    dayIbor: weightedAverage(detailRows, (r) => r.dayIbor, (r) => r.mv),
    bodNav: totalBodNav,
    eodNav: totalEodNav,
    eodTotCf: totalEodTotCf,
    eodNavCfAdj: totalEodNavCfAdj,
    mtdAbor: weightedAverage(detailRows, (r) => r.mtdAbor, (r) => r.mv),
    dayAbor: weightedAverage(detailRows, (r) => r.dayAbor, (r) => r.mv),
    mtdAborMinusIborBp: weightedAverage(detailRows, (r) => r.mtdAborMinusIborBp, (r) => r.mv),
    dayAborMinusIborBp: weightedAverage(detailRows, (r) => r.dayAborMinusIborBp, (r) => r.mv),
    gridTitle: detailRows[0].gridTitle,
    isTotalRow: true,
  };
}

export function withMtdTotalRow(rows: AborVsIborMtdRow[]): AborVsIborMtdRow[] {
  const detailRows = rows.filter((row) => !row.isTotalRow);
  const totalRow = buildMtdTotalRow(detailRows);
  return totalRow ? [...detailRows, totalRow] : detailRows;
}

export function withDailyTotalRow(rows: AborVsIborDailyRow[]): AborVsIborDailyRow[] {
  const detailRows = rows.filter((row) => !row.isTotalRow);
  const totalRow = buildDailyTotalRow(detailRows);
  return totalRow ? [...detailRows, totalRow] : detailRows;
}

export function isMtdToleranceBreak(row: AborVsIborMtdRow): boolean {
  if (row.isTotalRow) {
    return false;
  }

  return (
    row.flag === 1 ||
    Math.abs(safeNumber(row.mtdAborCfAdjMinusMtdIbor)) > Math.abs(safeNumber(row.tolerance))
  );
}

export function isDailyToleranceBreak(
  row: AborVsIborDailyRow,
  toleranceBp: number = DAILY_BP_TOLERANCE,
): boolean {
  if (row.isTotalRow) {
    return false;
  }

  return (
    Math.abs(safeNumber(row.mtdAborMinusIborBp)) > toleranceBp ||
    Math.abs(safeNumber(row.dayAborMinusIborBp)) > toleranceBp
  );
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number | null | undefined): string {
  return currencyFormatter.format(safeNumber(value));
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(safeNumber(value));
}

export function formatPercent(value: number | null | undefined, digits = 4): string {
  const numericValue = safeNumber(value);
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(numericValue)}%`;
}

export function formatBp(value: number | null | undefined, digits = 1): string {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(safeNumber(value))} bp`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US");
}

export function getMtdRowClassName(row: AborVsIborMtdRow): string {
  if (row.isTotalRow) {
    return "abor-ibor-row-total";
  }

  if (isMtdToleranceBreak(row)) {
    return "abor-ibor-row-break";
  }

  return "";
}

export function getDailyRowClassName(row: AborVsIborDailyRow): string {
  if (row.isTotalRow) {
    return "abor-ibor-row-total";
  }

  if (isDailyToleranceBreak(row)) {
    return "abor-ibor-row-break";
  }

  return "";
}

export function getBreakTextStyle(shouldHighlight: boolean, isStrong = false): React.CSSProperties {
  if (!shouldHighlight) {
    return {};
  }

  return {
    color: isStrong ? "#a8071a" : "#cf1322",
    fontWeight: isStrong ? 700 : 600,
  };
}

export function getFlagPillStyle(flag: number, isTotalRow?: boolean): React.CSSProperties {
  if (flag !== 1 || isTotalRow) {
    return {};
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
    padding: "0 8px",
    borderRadius: 999,
    background: "#ffccc7",
    color: "#a8071a",
    fontWeight: 700,
  };
}
