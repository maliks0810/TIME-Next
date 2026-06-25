const DRAM_TIMEZONE = "America/Los_Angeles";

export const DRAM_DATE = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: DRAM_TIMEZONE,
});

export const DRAM_TS = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
  timeZone: DRAM_TIMEZONE,
});

export const DRAM_AUDIT_TS = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
  timeZone: DRAM_TIMEZONE,
});

export function formatAsOfDate(asOfDate: string): string {
  // YYYY-MM-DD (no timezone math)
  const [y, m, d] = asOfDate.split("-").map(Number);
  return DRAM_DATE.format(new Date(y, m - 1, d));
}

export function formatTimestampLA(utcIso: string): string {
  return DRAM_TS.format(new Date(utcIso));
}

export function formatAuditTimestampLA(utcIso: string): string {
  return DRAM_AUDIT_TS.format(new Date(utcIso));
}

// Helper: detect & parse date-ish values safely
export function tryParseDate(value: unknown): Date | null {
  if (!value) return null;

  if (typeof value === 'boolean')
    return null;

  // Already a Date
  if (value instanceof Date && !isNaN(value.getTime())) return value;

  // Epoch (ms) - common in grids
  if (typeof value === "number" && isFinite(value)) {
    // Heuristic: treat as ms since epoch if large enough
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }

  if (typeof value === "string") {
    const s = value.trim();

    // Accept ISO-ish strings only (avoid locale parsing)
    // Examples: 2026-03-12, 2026-03-12T15:30:00Z, 2026-03-12T15:30:00.000Z
    const isoLike =
      /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(
        s
      );

    if (!isoLike) return null;

    // If date-only, construct explicitly (prevents TZ drift)
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split("-").map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d)); // stable anchor
      return isNaN(dt.getTime()) ? null : dt;
    }

    // Date-time ISO
    const dt = new Date(s);
    return isNaN(dt.getTime()) ? null : dt;
  }

  return null;
}
