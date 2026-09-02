import { GridConfigResponse } from "../components/dram-grid";
import { DEFAULT_DAILY_PERIODS, DEFAULT_MONTHLY_PERIODS, referencePeriods } from "./constants";
import { PeriodCode } from "./periods";
import { WorkflowState } from "./services";
import { AttributionDispersionResponse, PortBenchRow, SelectOption } from "./types";
import { Dayjs } from "dayjs";

export function isMonthEnd(date: Dayjs | null | undefined): boolean {
  if (!date) return false;
  return date.date() === date.daysInMonth();
}
export const getMonthEnd = (date: Date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() - 1, 0);
};

export const getPreviousMonthEnd = () => {
  const today = new Date();
  const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  return getMonthEnd(prevMonth);
};
export function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function getPreviousBusinessDay(
  date: Date = new Date()): string {
  const d = new Date(date);

  do {
    d.setDate(d.getDate() - 1);

    const day = d.getDay(); // 0=Sun, 6=Sat
    const formatted = formatDate(d);

    if (day !== 0 && day !== 6) {
      return formatted;
    }
  } while (true);
}

export function getFirstDayOfCurrentMonth(): string {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return formatDate(firstDay);
}

export function getBusinessDates() {
  return {
    firstDayOfMonth: getFirstDayOfCurrentMonth(),
    previousBusinessDay: getPreviousBusinessDay(new Date()),
  };
}


export function buildPortfolioOptions(rows: PortBenchRow[]): SelectOption[] {
  const map = new Map<string, SelectOption>();

  for (const r of rows) {
    if (!map.has(r.PORTFOLIO_KEY)) {
      map.set(r.PORTFOLIO_KEY, {
        value: r.PORTFOLIO_KEY,
        label: `${r.PORTFOLIO_NAME} (${r.PORTFOLIO_KEY})`,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}
export function buildBenchmarkOptions(
  rows: PortBenchRow[],
  selectedPortfolios: string[]
): SelectOption[] {
  if (selectedPortfolios.length === 0) return [];

  const selected = new Set(selectedPortfolios);
  const map = new Map<string, SelectOption>();

  for (const r of rows) {
    if (!selected.has(r.PORTFOLIO_KEY)) continue;

    const add = (code: string | null, name: string | null) => {
      const value = code ?? name;
      if (!value) return;

      const label = name ? `${name}${code ? ` (${code})` : ""}` : value;

      if (!map.has(value)) map.set(value, { value, label });
    };

    add(r.PORTFOLIO_BENCHMARK_CODE, r.PORTFOLIO_BENCHMARK_NAME);
    // add(
    //   r.PORTFOLIO_SECONDARY_BENCHMARK_CODE,
    //   r.PORTFOLIO_SECONDARY_BENCHMARK_NAME
    // );
  }

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

export function normalizeWorkflowState(raw: Partial<WorkflowState>): WorkflowState {
  return {
    frequencyMode: raw.frequencyMode ?? "Daily",

    portfolios: raw.portfolios ?? [],
    benchmarks: raw.benchmarks ?? [],

    asOfDate: raw.asOfDate ?? "",
    startDate: raw.startDate ?? "",
    endDate: raw.endDate ?? "",

    baseCurrency: raw.baseCurrency ?? "",
    carveOut: raw.carveOut ?? "",

    periods: raw.periods ?? [],
    filters: raw.filters ?? [],

    primaryGrouping: raw.primaryGrouping ?? "GICS1",
    secondaryGrouping: raw.secondaryGrouping ?? "",
    tertiaryGrouping: raw.tertiaryGrouping ?? "",

    metrics: raw.metrics ?? [],

    layoutMode: raw.layoutMode ?? "Grouped Grid",
    detailPanels: raw.detailPanels ?? [],
  };
}

  export const periodOptions: { label: string; value: PeriodCode }[] = referencePeriods.map((p) => ({
    label: p,
    value: p as PeriodCode,
  }));
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;


export const isGridConfigResponse = (value: unknown): value is GridConfigResponse => {
  if (!isRecord(value)) return false;

  return (
	"columnConfigs" in value &&
	"metrics" in value &&
	"periods" in value &&
	"breakdownMode" in value
  );
};

/**
 * Accepts real backend payloads in any of these shapes:
 * 1) payload.columnConfigs / metrics / periods / breakdownMode
 * 2) payload.data.columnConfigs / metrics / periods / breakdownMode
 * 3) payload.gridConfig where gridConfig is the full GridConfigResponse
 * 4) payload.data.gridConfig where gridConfig is the full GridConfigResponse
 */
export const extractGridConfig = (payload: unknown): GridConfigResponse | null => {
  if (isGridConfigResponse(payload)) {
  return payload;
  }

  if (!isRecord(payload)) {
  return null;
  }

  if ("gridConfig" in payload && isGridConfigResponse(payload.gridConfig)) {
  return payload.gridConfig;
  }

  if ("data" in payload && isRecord(payload.data)) {
  if (isGridConfigResponse(payload.data)) {
    return payload.data;
  }

  if ("gridConfig" in payload.data && isGridConfigResponse(payload.data.gridConfig)) {
    return payload.data.gridConfig;
  }
  }

  return null;
};
export function formatDateOnly(value: string | Date): string {
  // If already YYYY-MM-DD, return as-is
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const d = typeof value === "string" ? new Date(value) : value;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export
function isAttributionDispersionResponse(
  obj: unknown
): obj is AttributionDispersionResponse {
  if (
    typeof obj !== "object" ||
    obj === null
  ) return false;

  const o = obj as AttributionDispersionResponse;

  return (
    typeof o.message === "string" &&
    typeof o.data === "object" &&
    o.data !== null &&
    typeof o.data.metadata === "object"
  );
}
export function normalizeDispersionResponse(
  input: unknown
): AttributionDispersionResponse | undefined {
  if (!input) return undefined;

  if (
    typeof input === "object" &&
    input !== null &&
    "data" in input
  ) {
    const candidate = (input as { data: unknown }).data;

    if (isAttributionDispersionResponse(candidate)) {
      return candidate;
    }
  }

  if (isAttributionDispersionResponse(input)) {
    return input;
  }

  return undefined;
}

export const getDefaultPeriodsForFrequency = (
  frequencyMode: string,
): string[] => {
  return frequencyMode === "daily"
    ? [...DEFAULT_DAILY_PERIODS]
    : [...DEFAULT_MONTHLY_PERIODS];
};
