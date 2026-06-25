import type { ColumnFormat, PrimitiveCellValue } from "./types";

export const NULL_DISPLAY = "—";

export const isNullish = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

export const isInvalidNumber = (value: unknown): boolean =>
  typeof value === "number" && (!Number.isFinite(value) || Number.isNaN(value));

export const formatPercent = (value: number): string =>
  `${(value * 100).toFixed(2)}%`;

export const formatBps = (value: number): string => `${value.toFixed(2)}`;

export const formatText = (value: unknown): string => String(value);

export const formatValue = (
  value: PrimitiveCellValue,
  format: ColumnFormat,
  nullDisplay: string = NULL_DISPLAY
): string => {
  if (isNullish(value)) return nullDisplay;
  if (isInvalidNumber(value)) return nullDisplay;

  if (typeof value !== "number") {
    return formatText(value);
  }

  switch (format) {
    case "percent":
      return formatPercent(value);
    case "bps":
      return formatBps(value);
    case "text":
    default:
      return formatText(value);
  }
};

export const getDefaultWidth = (
  format: ColumnFormat,
  label: string,
  frozen: boolean
): number => {
  if (frozen) {
    return Math.max(180, Math.min(320, label.length * 12));
  }

  switch (format) {
    case "percent":
    case "bps":
      return 150;
    case "text":
    default:
      return Math.max(140, Math.min(260, label.length * 11));
  }
};

export const getMinWidth = (format: ColumnFormat, frozen: boolean): number => {
  if (frozen) return 140;

  switch (format) {
    case "percent":
    case "bps":
      return 120;
    case "text":
    default:
      return 120;
  }
};
