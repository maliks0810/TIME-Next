import { AnalyticResultRow, AnalyticsResponse } from "../../lib/services";
import { ApiColumnConfig, GridConfigResponse, PeriodConfig, PrimitiveCellValue } from "../dram-grid";
import { AttribConfigSelectionState, FrequencyModeId } from "./types";
export interface SelectOption {
  value: string;
  label: string;
}

export interface ColumnChooserItem {
  id: string;
  label: string;
  group: string;
  format: string;
  frozen: boolean;
  order: number;
  columnGroupKey: string;
  columnGroupLabel: string;
  columnGroupOrder: number;
}
type GridRow = Record<string, PrimitiveCellValue>;
export const toGridRows = (rows: AnalyticResultRow[]): GridRow[] => {
  return rows.map((row) => ({ ...row })) as GridRow[];
};

function getAllVisiblePeriods(config: GridConfigResponse): PeriodConfig[] {
  return config.periods.flat().filter((item) => item.visible);
}

export function getFrequencyModeOptions(config: GridConfigResponse): SelectOption[] {
  return config.frequencyMode.map((item) => ({
    value: item.id,
    label: item.label,
  }));
}

export function getPeriodOptions(
  config: GridConfigResponse,
  frequencyMode: FrequencyModeId
): SelectOption[] {
  return getAllVisiblePeriods(config)
    .filter((item) => item.frequency_mode === frequencyMode)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      value: item.id,
      label: item.label,
    }));
}

export function getBreakdownOptions(config: GridConfigResponse): SelectOption[] {
  return config.breakdownMode.map((item) => ({
    value: item.id,
    label: item.label,
  }));
}

export function getSelectableColumns(config: GridConfigResponse): ApiColumnConfig[] {
  return config.columnConfigs.all
    .filter((metric) => metric.visible)
    .sort((a, b) => {
      const groupOrderA = a.columnGroupOrder ?? 999;
      const groupOrderB = b.columnGroupOrder ?? 999;
      if (groupOrderA !== groupOrderB) {
        return groupOrderA - groupOrderB;
      }
      return a.order - b.order;
    })
    .map((metric: ApiColumnConfig) => ({
      id: metric.id,
      label: metric.label,
      group: metric.group,
      format: metric.format,
      frozen: metric.frozen,
      order: metric.order,
      columnGroupKey: metric.columnGroupKey,
      columnGroupLabel: metric.columnGroupLabel ?? "",
      columnGroupOrder: metric.columnGroupOrder ?? 999,
      visible:metric.visible,
    }));
}

export function getDefaultSelectedColumnIds(config: GridConfigResponse): string[] {
  return getSelectableColumns(config).map((item) => item.id);
}

export function getDefaultFrequencyMode(config: GridConfigResponse): FrequencyModeId {
  const first = config.frequencyMode[0];
  return first?.id ?? "monthly";
}

export function getDefaultPeriodIds(
  config: GridConfigResponse,
  frequencyMode: FrequencyModeId
): string[] {
  return getPeriodOptions(config, frequencyMode)
    .slice(0, frequencyMode === "daily" ? 1 : 3)
    .map((item) => item.value);
}

export function getDefaultBreakdownModeId(config: GridConfigResponse): string | null {
  return config.breakdownMode[0]?.id ?? null;
}

export function getDefaultWizardSelection(
  config: GridConfigResponse
): AttribConfigSelectionState {
  const frequencyMode = getDefaultFrequencyMode(config);

  return {
  periodIds: getDefaultPeriodIds(config, frequencyMode),
  breakdownModeId: getDefaultBreakdownModeId(config),
  selectedColumnIds: getDefaultSelectedColumnIds(config),
  frequencyMode: "monthly",
  asOfDate: "",
  startDate: "",
  endDate: "",
  portfolio: "",
  benchmark: ""
};
}

export function reorderSelectedIds(
  selectedIds: string[],
  activeId: string | null,
  direction: "up" | "down"
): string[] {
  if (!activeId) {
    return selectedIds;
  }

  const index = selectedIds.indexOf(activeId);
  if (index < 0) {
    return selectedIds;
  }

  const next = [...selectedIds];

  if (direction === "up" && index > 0) {
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
  }

  if (direction === "down" && index < next.length - 1) {
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
  }

  return next;
}

export function buildConfiguredColumns(
  config: GridConfigResponse,
  selectedMetricIds: string[]
): ApiColumnConfig[] {
  const allColumns = config.columnConfigs.all.filter((item) => item.visible);

  const selectedSet = new Set(selectedMetricIds);

  const dynamicMetricColumns = config.columnConfigs.all
    .filter((item) => {
      const isAllDuplicate = allColumns.some((all) => all.id === item.id);
      return !isAllDuplicate && selectedSet.has(item.id) && item.visible;
    })
    .sort((a, b) => {
      const aGroup = a.columnGroupOrder ?? 999;
      const bGroup = b.columnGroupOrder ?? 999;
      if (aGroup !== bGroup) {
        return aGroup - bGroup;
      }
      return a.order - b.order;
    });

  const selectedOrderMap = new Map<string, number>(
    selectedMetricIds.map((id, index) => [id, index])
  );

  dynamicMetricColumns.sort((a, b) => {
    const aIndex = selectedOrderMap.get(a.id) ?? 999;
    const bIndex = selectedOrderMap.get(b.id) ?? 999;
    return aIndex - bIndex;
  });

  return [...allColumns, ...dynamicMetricColumns];
}

export const extractAnalysisRows = (apiResp: AnalyticsResponse): AnalyticResultRow[] => {
  return Array.isArray(apiResp.data?.grids)
  ? apiResp.data.grids.flatMap((g) => (Array.isArray(g.rows) ? g.rows : []))
  : [];
};