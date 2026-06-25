import type {
  DriverModeConfig,
  UnifiedDriverAttributionRequest,
  WizardApplyPayload,
} from "../types/unifiedDriverAttribution";

export function buildUnifiedDriverAttributionRequest(
  appliedConfig: WizardApplyPayload,
  driverConfig: DriverModeConfig
): UnifiedDriverAttributionRequest {
  return {
    portfolioId: appliedConfig.portfolioId,
    portfolioName: appliedConfig.portfolio,
    benchmarkId: appliedConfig.benchmarkId,
    benchmarkName: appliedConfig.benchmark,
    assetClass: appliedConfig.assetClass,
    frequencyMode: appliedConfig.frequencyMode,
    periodIds: appliedConfig.periodIds,
    breakdownModeId: appliedConfig.breakdownModeId,
    startDate: appliedConfig.startDate,
    endDate: appliedConfig.endDate,
    topN: driverConfig.topN,
    rankingMetric: driverConfig.rankingMetric,
    dataSource: {
      type: driverConfig.sourceType,
      datasetId: driverConfig.uploadedDataset?.datasetId,
      endpointUrl: driverConfig.modelEndpointUrl,
      modelId: driverConfig.modelId,
    },
    columnMapping: driverConfig.columnMapping,
    manualRows: driverConfig.sourceType === "manual" ? driverConfig.uploadedDataset?.rows : undefined,
  };
}
