import type { ColumnFormatRule, GridCellPrimitive } from "../types/unifiedDriverAttribution";

export function formatGridValue(value: GridCellPrimitive, rule?: ColumnFormatRule): string {
  if (value === null || value === undefined || value === "") return "";
  if (!rule) return String(value);

  const numeric = typeof value === "number" ? value : Number(value);
  if (rule.showZeroAsDash && numeric === 0) return "—";

  if (rule.type === "text" || rule.type === "date") return String(value);
  if (!Number.isFinite(numeric)) return String(value);

  if (rule.type === "percent") return `${formatNumber(numeric * (rule.scale ?? 1), rule)}%`;
  if (rule.type === "bps") return `${formatNumber(numeric * (rule.scale ?? 10000), rule)} bps`;
  if (rule.type === "currency") {
    return numeric.toLocaleString("en-US", {
      style: "currency",
      currency: rule.currencyCode ?? "USD",
      minimumFractionDigits: rule.decimals ?? 0,
      maximumFractionDigits: rule.decimals ?? 0,
    });
  }
  return formatNumber(numeric, rule);
}

function formatNumber(value: number, rule: ColumnFormatRule): string {
  const decimals = rule.decimals ?? 2;
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (value < 0 && rule.negativeFormat === "parentheses") return `(${formatted})`;
  return value < 0 ? `-${formatted}` : formatted;
}

export function formatBps(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(2)} bps`;
}
