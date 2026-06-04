import { KpiTone } from "../api/types";

export function asNumber(value: number | null | undefined): number {
  return typeof value === "number" ? value : 0;
}

export function formatPct(value: number | null | undefined, digits = 2): string {
  if (typeof value !== "number") {
    return "—";
  }

  return `${value.toFixed(digits)}%`;
}

export function getSpread(
  gross: number | null | undefined,
  net: number | null | undefined,
): number | null {
  if (typeof gross !== "number" || typeof net !== "number") {
    return null;
  }

  return gross - net;
}

export function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function getTone(value: number): KpiTone {
  if (value > 0) return "success";
  if (value < 0) return "error";
  return "default";
}

export function getToneColor(tone: KpiTone): string {
  switch (tone) {
    case "success":
      return "#389e0d";
    case "error":
      return "#cf1322";
    default:
      return "#595959";
  }
}
