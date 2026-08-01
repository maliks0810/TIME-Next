import type { AttributionBreakdownRow, DriverAnalysisFormState, DriverAnalysisResult, DriverRow } from "./driverTypes";

const formatMetric = (value: number, format: string): string => {
  if (format === "bps") return `${(value * 10000).toFixed(2)} bps`;
  if (format === "percent") return `${(value * 100).toFixed(2)}%`;
  if (format === "usd") return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return value.toFixed(6);
};

const sampleDrivers = [
  "Technology",
  "Financials",
  "Health Care",
  "Energy",
  "Consumer Discretionary",
  "Industrials",
  "Communication Services",
  "Utilities"
];

const dimensionSampleValues: Record<string, string[]> = {
  assetClass: ["Equity", "Fixed Income", "EMFI", "FX Overlay"],
  sector: ["Technology", "Financials", "Health Care", "Energy", "Industrials", "Utilities"],
  industry: ["Software", "Banks", "Pharmaceuticals", "Integrated Energy", "Capital Goods", "Electric Utilities"],
  subIndustry: ["Application Software", "Regional Banks", "Biotechnology", "Oil & Gas", "Aerospace", "Renewable Utilities"],
  country: ["United States", "Mexico", "Brazil", "Germany", "India", "Indonesia"],
  region: ["North America", "Latin America", "Europe", "Asia Pacific", "Emerging Markets"],
  currency: ["USD", "MXN", "BRL", "EUR", "INR", "IDR"],
  issuer: ["Apple Inc.", "JPMorgan Chase", "Petrobras", "Mexico Sovereign", "Indonesia Sovereign", "Siemens AG"],
  security: ["AAPL", "JPM", "PETR4 BZ", "MEX 7.75 2034", "INDON 4.65 2032", "SIE GR"],
  rating: ["AAA", "AA", "A", "BBB", "BB", "B"],
  durationBucket: ["0-1Y", "1-3Y", "3-5Y", "5-7Y", "7-10Y", "10Y+"],
  maturityBucket: ["0-2Y", "2-5Y", "5-10Y", "10-20Y", "20Y+"],
  curveTenor: ["2Y", "5Y", "7Y", "10Y", "20Y", "30Y"],
  spreadBucket: ["0-100 bps", "100-200 bps", "200-350 bps", "350-500 bps", "500+ bps"],
  marketCapBucket: ["Mega Cap", "Large Cap", "Mid Cap", "Small Cap"],
  portfolioSleeve: ["Core", "Credit", "Rates", "Currency Overlay", "Cash"],
  strategy: ["Benchmark Aware", "Country Rotation", "Credit Selection", "FX Overlay", "Curve Positioning"],
  benchmarkMembership: ["In Benchmark", "Off Benchmark", "Portfolio Only", "Benchmark Only"],
  styleFactor: ["Value", "Growth", "Momentum", "Quality", "Low Volatility"],
  peForwardBucket: ["Low P/E", "Market P/E", "High P/E"],
  dividendYieldBucket: ["Low Yield", "Medium Yield", "High Yield"],
  developedEmergingMarket: ["Developed Market", "Emerging Market"],
  localReturn: ["Positive Local Return", "Flat Local Return", "Negative Local Return"],
  currencyReturn: ["Positive FX", "Flat FX", "Negative FX"],
  baseCurrencyReturn: ["Positive Base Return", "Flat Base Return", "Negative Base Return"],
  fiSector: ["Government", "Credit", "Securitized", "Local Rates", "Cash"],
  fiSubSector: ["Treasury", "Corporate", "MBS", "ABS", "Quasi-Sovereign"],
  securityType: ["Treasury", "Corporate Bond", "Sovereign Bond", "MBS", "Loan"],
  couponBucket: ["0-2%", "2-4%", "4-6%", "6%+"],
  fixedFloating: ["Fixed", "Floating"],
  callable: ["Callable", "Non-Callable"],
  inflationLinked: ["Nominal", "Inflation Linked"],
  seniority: ["Senior", "Subordinated", "Secured", "Unsecured"],
  hardLocalCurrency: ["Hard Currency", "Local Currency"],
  localHardCurrency: ["Hard Currency", "Local Currency"],
  fxHedgeStatus: ["Hedged", "Unhedged", "Partially Hedged"],
  baseCurrency: ["USD", "EUR", "GBP"],
  sovereignCorporate: ["Sovereign", "Corporate"],
  localRates: ["Front-End", "Belly", "Long-End"],
  localRatesBucket: ["Front-End", "Belly", "Long-End"],
  sovereignQuasiCorporate: ["Sovereign", "Quasi-Sovereign", "Corporate", "Supranational"],
  sovereignSpreadBucket: ["0-100 bps", "100-250 bps", "250-500 bps", "500+ bps"],
  issuerSpreadBucket: ["Tight", "Medium", "Wide", "Distressed"],
  externalLocalDebt: ["External Debt", "Local Debt"],
  commodityExporter: ["Commodity Exporter", "Commodity Importer"],
  fxReturnBucket: ["Positive FX", "Neutral FX", "Negative FX"],
  altStrategy: ["Hedge Fund", "Private Credit", "Real Estate", "Infrastructure"],
  subStrategy: ["Long/Short", "Macro", "Direct Lending", "Core Real Estate"],
  manager: ["Manager A", "Manager B", "Manager C", "Manager D"],
  fund: ["Fund I", "Fund II", "Co-Investment A", "Separate Account"],
  vintageYear: ["2019", "2020", "2021", "2022", "2023"],
  geography: ["US", "Europe", "Asia", "Global"],
  liquidityBucket: ["Daily", "Monthly", "Quarterly", "Illiquid"],
  exposureType: ["Direct", "Fund", "Co-Investment", "Overlay"],
  leverageBucket: ["Low", "Medium", "High"],
  valuationType: ["Market", "Model", "Appraisal"],
  riskFactor: ["Equity Beta", "Rates", "Credit", "FX"]
};

function getDimensionValues(dimension: string): string[] {
  return dimensionSampleValues[dimension] ?? sampleDrivers;
}


export async function runDriverAnalysis(request: DriverAnalysisFormState): Promise<DriverAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const portfolioIds = request.portfolioIds?.length ? request.portfolioIds : [request.portfolioId];
  const rows: DriverRow[] = [];
  const attributionBreakdown: AttributionBreakdownRow[] = [];

  portfolioIds.forEach((portfolioId, portfolioIndex) => {
    request.periods.forEach((period, periodIndex) => {
      sampleDrivers.forEach((driver, index) => {
        const direction = index < 4 ? "top" : "bottom";
        const sign = direction === "top" ? 1 : -1;
        const base = (8 - index) * 0.00045;
        const periodMultiplier = 1 + periodIndex * 0.35;
        const portfolioMultiplier = 1 + portfolioIndex * 0.12;
        const metricValue = sign * base * periodMultiplier * portfolioMultiplier;

        const allocationEffect = metricValue * 0.25;
        const selectionEffect = metricValue * 0.6;
        const interactionEffect = metricValue * 0.15;
        const totalEffect = allocationEffect + selectionEffect + interactionEffect;
        const portfolioWeight = 0.04 + index * 0.006 + portfolioIndex * 0.002;
        const benchmarkWeight = Math.max(0.005, portfolioWeight - 0.006 + index * 0.001);
        const portfolioReturn = 0.01 + sign * (0.006 + index * 0.0015) * periodMultiplier;
        const benchmarkReturn = portfolioReturn - sign * (0.0025 + periodIndex * 0.0006);

        rows.push({
          key: `${portfolioId}-${period}-${direction}-${driver}`,
          portfolioId,
          period,
          direction,
          rank: direction === "top" ? index + 1 : index - 3,
          driverName: driver,
          metricName: request.metric.name,
          metricLabel: request.metric.label,
          metricValue,
          metricDisplay: formatMetric(metricValue, request.metric.format),
          allocationEffect,
          selectionEffect,
          interactionEffect,
          portfolioContribution: metricValue * 1.3,
          benchmarkContribution: metricValue * 0.7,
          activeContribution: metricValue,
          pnlContributionUsd: metricValue * 12500000,
          trackingErrorContribution: Math.abs(metricValue) * 0.7,
          varContribution: Math.abs(metricValue) * 9500000
        });

        const selectedDimensions = request.attributionAnalysis?.dimensions?.length
          ? request.attributionAnalysis.dimensions
          : [request.groupBy[0] ?? "sector"];

        selectedDimensions.forEach((dimension, dimensionIndex) => {
          const dimensionValues = getDimensionValues(dimension);
          const dimensionName = dimensionValues[index % dimensionValues.length] ?? driver;
          const dimensionMultiplier = 1 + dimensionIndex * 0.045;

          attributionBreakdown.push({
            key: `attr-${portfolioId}-${period}-${dimension}-${driver}`,
            portfolioId,
            period,
            dimension,
            name: dimensionName,
            portfolioWeight: portfolioWeight * dimensionMultiplier,
            benchmarkWeight: benchmarkWeight * dimensionMultiplier,
            activeWeight: (portfolioWeight - benchmarkWeight) * dimensionMultiplier,
            portfolioReturn,
            benchmarkReturn,
            activeReturn: portfolioReturn - benchmarkReturn,
            allocationEffect: allocationEffect * dimensionMultiplier,
            selectionEffect: selectionEffect * dimensionMultiplier,
            interactionEffect: interactionEffect * dimensionMultiplier,
            totalEffect: totalEffect * dimensionMultiplier,
            currencyEffect: metricValue * 0.08 * dimensionMultiplier,
            spreadEffect: metricValue * 0.12 * dimensionMultiplier
          });
        });
      });
    });
  });

  return {
    runId: `DRV-${Date.now()}`,
    portfolioId: portfolioIds[0],
    portfolioIds,
    asOfDate: request.asOfDate,
    periods: request.periods,
    groupBy: request.groupBy,
    metric: request.metric,
    topDrivers: rows.filter((x) => x.direction === "top"),
    bottomDrivers: rows.filter((x) => x.direction === "bottom"),
    attributionBreakdown,
    attributionSummary: {
      allocationEffect: attributionBreakdown.reduce((sum, row) => sum + row.allocationEffect, 0),
      selectionEffect: attributionBreakdown.reduce((sum, row) => sum + row.selectionEffect, 0),
      interactionEffect: attributionBreakdown.reduce((sum, row) => sum + row.interactionEffect, 0),
      totalEffect: attributionBreakdown.reduce((sum, row) => sum + row.totalEffect, 0),
      currencyEffect: attributionBreakdown.reduce((sum, row) => sum + (row.currencyEffect ?? 0), 0),
      spreadEffect: attributionBreakdown.reduce((sum, row) => sum + (row.spreadEffect ?? 0), 0)
    },
    summary: {
      status: "Completed",
      inputRows: 2480 * portfolioIds.length,
      filteredRows: 2164 * portfolioIds.length,
      topCount: rows.filter((x) => x.direction === "top").length,
      bottomCount: rows.filter((x) => x.direction === "bottom").length,
      durationMs: 451,
      warnings: request.datasetSource.type === "endpoint" ? ["Endpoint dataset was validated successfully before analysis."] : []
    }
  };
}
