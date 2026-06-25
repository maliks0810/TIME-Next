export function pct(value: number | null | undefined): string {
  const n = Number(value);
  return Number.isFinite(n) ? `${(n * 100).toFixed(2)}%` : "—";
}

export function pctAxis(value: number | null | undefined): string {
  const n = Number(value);
  return Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : "";
}

export function compact(value: number | null | undefined): string {
  const n = Number(value);
  return Number.isFinite(n)
    ? new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n)
    : "—";
}