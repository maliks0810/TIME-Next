import type { DriverMetric } from "../driverTypes";
import type { DriverColumnConfigItem, DriverColumnConfigState } from "../columnConfigTypes";

export interface SelectOption {
  label: string;
  value: string;
}

export interface GroupedSelectOption {
  label: string;
  options: SelectOption[];
}

export type AttributionAssetClass =
  | "equity"
  | "globalEquity"
  | "fixedIncome"
  | "globalFixedIncome"
  | "emfi"
  | "alternatives"
  | "multiAsset";

export interface AttributionDimensionOption {
  key: string;
  label: string;
  category: string;
  description?: string;
  assetClasses: AttributionAssetClass[];
  defaultSelected?: boolean;
}

export interface DriverAnalysisConfigResponse {
  version: string;
  portfolioOptions: SelectOption[];
  periodOptions: SelectOption[];
  groupByOptions: SelectOption[];
  metricOptions: DriverMetric[];
  metricFormatOptions: SelectOption[];
  componentOptions: SelectOption[];
  datasetSourceOptions: SelectOption[];
  endpointMethodOptions: SelectOption[];
  endpointAuthModeOptions: SelectOption[];
  attributionAssetClassOptions: SelectOption[];
  attributionEffectOptions: SelectOption[];
  attributionDimensionCatalog: AttributionDimensionOption[];
  defaultAttributionDimensionsByAssetClass: Record<AttributionAssetClass, string[]>;
  filterOptions: {
    assetClass: SelectOption[];
    currency: SelectOption[];
    country: SelectOption[];
    sector: SelectOption[];
  };
  columnCatalog: DriverColumnConfigItem[];
  defaultControlSectionOrder: string[];
  defaultExpandedControlSections: string[];
  defaults: {
    portfolioIds: string[];
    asOfDate: string;
    periods: string[];
    groupBy: string[];
    metricName: string;
    attributionAssetClass: AttributionAssetClass;
    attributionEffects: string[];
  };
}

const API_BASE_URL = import.meta.env.VITE_R2_TRAP_DRAM_2_SERVICE ?? "http://localhost:3100";

export async function loadDriverAnalysisConfig(): Promise<DriverAnalysisConfigResponse> {
  const response = await fetch(`${API_BASE_URL}/api/performance/analytics/drivers/config/`);
  if (!response.ok) {
    throw new Error(`Unable to load driver analysis configuration: ${response.statusText}`);
  }
  return response.json();
}

export function buildDefaultColumnConfigFromCatalog(
  columnCatalog: DriverColumnConfigItem[]
): DriverColumnConfigState {
  const selectedColumns = columnCatalog.filter((column) => column.defaultSelected);
  const selectedKeys = new Set(selectedColumns.map((column) => column.key));
  const availableColumns = columnCatalog.filter((column) => !selectedKeys.has(column.key));
  return { availableColumns, selectedColumns };
}

export function getMetricByName(
  config: DriverAnalysisConfigResponse,
  metricName: string
): DriverMetric {
  return (
    config.metricOptions.find((metric) => metric.name === metricName) ??
    config.metricOptions[0]
  );
}

export function getDefaultAttributionDimensionsFromConfig(
  config: DriverAnalysisConfigResponse,
  assetClass: AttributionAssetClass
): string[] {
  return config.defaultAttributionDimensionsByAssetClass[assetClass] ?? [];
}

export function buildGroupedDimensionSelectOptionsFromConfig(
  config: DriverAnalysisConfigResponse,
  assetClass: AttributionAssetClass
): GroupedSelectOption[] {
  const groups = config.attributionDimensionCatalog
    .filter((dimension) => dimension.assetClasses.includes(assetClass))
    .reduce<Record<string, SelectOption[]>>((result, dimension) => {
      if (!result[dimension.category]) {
        result[dimension.category] = [];
      }
      result[dimension.category].push({ label: dimension.label, value: dimension.key });
      return result;
    }, {});

  return Object.entries(groups).map(([label, options]) => ({ label, options }));
}
