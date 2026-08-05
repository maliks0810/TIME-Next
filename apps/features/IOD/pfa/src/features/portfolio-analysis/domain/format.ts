const F6 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
});
const F3 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const MONEY0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function fmtContribution(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "";
  return `${value > 0 ? "+" : ""}${F6.format(value)}`;
}

export function fmtNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "";
  return F3.format(value);
}

export function fmtMoney(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "";
  return MONEY0.format(value);
}

export type DecimalMode = "round" | "truncate";
export type DecimalSettings = {
  money: number;
  contrib: number;
  qty: number;
  pct: number;
};

export const DEFAULT_DECIMAL_SETTINGS: DecimalSettings = {
  money: 0,
  contrib: 3,
  qty: 0,
  pct: 3,
};

export function normalizeDecimalPlaces(decimalPlaces: number): number {
  if (!Number.isFinite(decimalPlaces)) return 3;
  return Math.min(8, Math.max(0, Math.trunc(decimalPlaces)));
}

function truncateToDecimalPlaces(value: number, decimalPlaces: number): number {
  const scale = 10 ** normalizeDecimalPlaces(decimalPlaces);
  const truncated = Math.trunc(Math.abs(value) * scale) / scale;
  return value < 0 ? -truncated : truncated;
}

function dynamicDisplayValue(
  value: number,
  decimalPlaces: number,
  decimalMode: DecimalMode,
): number {
  return decimalMode === "truncate"
    ? truncateToDecimalPlaces(value, decimalPlaces)
    : value;
}

export function fmtDynamicNumber(
  value: number | null | undefined,
  decimalPlaces: number,
  decimalMode: DecimalMode,
): string {
  if (value == null || !Number.isFinite(value)) return "";
  const places = normalizeDecimalPlaces(decimalPlaces);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  }).format(dynamicDisplayValue(value, places, decimalMode));
}

export function fmtDynamicSignedNumber(
  value: number | null | undefined,
  decimalPlaces: number,
  decimalMode: DecimalMode,
): string {
  if (value == null || !Number.isFinite(value)) return "";
  return `${value > 0 ? "+" : ""}${fmtDynamicNumber(value, decimalPlaces, decimalMode)}`;
}

export function fmtDynamicPercent(
  value: number | null | undefined,
  decimalPlaces: number,
  decimalMode: DecimalMode,
): string {
  if (value == null || !Number.isFinite(value) || value === 0) return "";
  return `${fmtDynamicNumber(value * 100, decimalPlaces, decimalMode)}%`;
}

export function fmtDynamicSignedPercent(
  value: number | null | undefined,
  decimalPlaces: number,
  decimalMode: DecimalMode,
): string {
  if (value == null || !Number.isFinite(value)) return "";
  return `${value > 0 ? "+" : ""}${fmtDynamicNumber(value * 100, decimalPlaces, decimalMode)}%`;
}
