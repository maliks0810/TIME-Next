export type MetricMap = Record<string, number | null | undefined>;

export type PortfolioDateMetadata = {
  mv?: number | null;
  level1Cash?: number | null;
  level1CashPct?: number | null;
  [key: string]: unknown;
};

export type TargetSpec = {
  value?: number | null;
  operation?: string | null;
  [key: string]: unknown;
};

export type TargetMap = Record<string, TargetSpec | number | null | undefined>;

export type Snapshot = {
  asOfDate: string;
  tMinus?: number | null;
  metadata: PortfolioDateMetadata;
  portfolio: MetricMap;
  benchmark: MetricMap;
  target: TargetMap;
  ouBenchmark: MetricMap;
  ouTarget: MetricMap;
};

export type MonitorV2Trade = {
  tradeNum?: string | number | null;
  invNum?: string | number | null;
  asOfDate?: string | null;
  tradeDate?: string | null;
  settleDate?: string | null;
  portfolioKey?: string | null;
  portfolioNumber?: string | null;
  legacyPortfolioNumber?: string | null;
  securityKey?: string | null;
  aladdinId?: string | null;
  securityName?: string | null;
  ticker?: string | null;
  transactionType?: string | null;
  tradeStatus?: string | null;
  trader?: string | null;
  assetType?: string | null;
  secDuration?: number | null;
  tradeDuration?: number | null;
  tradePrice?: number | null;
  secPrice?: number | null;
  dur?: number | null;
  ctd?: number | null;
  durationContribution?: number | null;
  tradeNetMoneyBase?: number | null;
  tcwCoreLevel1?: string | null;
  tcwCoreLevel2?: string | null;
  tcwCoreLevel3?: string | null;
  tcwCoreLevel4?: string | null;
  tcwCoreLevel5?: string | null;
  tcwCoreLevel6?: string | null;
  tcwCoreLevel7?: string | null;
  [key: string]: unknown;
};

export type MonitorV2Cashflow = {
  asOfDate?: string | null;
  settleDate?: string | null;
  portfolioKey?: string | null;
  portfolioNumber?: string | null;
  legacyPortfolioNumber?: string | null;
  baseAmount?: number | null;
  cashType?: string | null;
  currency?: string | null;
  exchangeRate?: number | null;
  entryDate?: string | null;
  cashModifiedBy?: string | null;
  cashModifiedDate?: string | null;
  notation?: string | null;
  source?: string | null;
  [key: string]: unknown;
};

export type BenchmarkUniverseType = 'RETURNS' | 'STATS';
export type HoldingState =
  | 'portfolio-only'
  | 'benchmark-only'
  | 'both'
  | 'historical-only';
  
export type PortfolioAnalysisContext = {
  portfolioKey: string;
  portfolioName?: string;
  benchmarkCode?: string;
  legacyBenchmarkCode?: string;
  portfolioGroup?: string;
  rhsGroup?: string;
  futureEligible?: boolean | null;
  comparisonTMinus: number;
  dateLabels: Record<number, string>;
  snapshots: Record<number, Snapshot>;
  cachedTrades?: MonitorV2Trade[];
  cachedCashflows?: MonitorV2Cashflow[];
};

export type BenchmarkPositionAnalytics = {
  asOfDate: string;
  benchmarkKey?: string | null;
  legacyBenchmarkCode?: string | null;
  universeTypeCode?: string | null;
  securityKey: string;
  ticker?: string | null;
  currentFace: number | null;
  marketValuePercentage: number | null;
  usdMarketValue: number | null;
  durationContribution: number | null;
  tcwCoreLevel1?: string | null;
  tcwCoreLevel2?: string | null;
  tcwCoreLevel3?: string | null;
  tcwCoreLevel4?: string | null;
  tcwCoreLevel5?: string | null;
  tcwCoreLevel6?: string | null;
  tcwCoreLevel7?: string | null;
  [key: string]: unknown;
};

export type PortfolioPositionAnalytics = {
  asOfDate: string;
  portfolioKey: string;
  portfolioBaseCurrency: string;
  securityKey: string;
  ticker: string;
  coupon?: number | string | null;
  couponRate?: number | string | null;
  maturity?: string | null;
  maturityDate?: string | null;
  finalMaturity?: string | null;
  longShortFlag: string;
  originalFace: number | null;
  currentFace: number | null;
  currentFacePercent: number | null;
  marketValuePercent: number | null;
  notionalIndicator?: string | null;
  notionalValuePercent?: number | null;
  usdMarketValue: number | null;
  baseMarketValue: number | null;
  duration: number | null;
  durationContribution: number | null;
  durationDollars: number | null;
  krd2YrBucket: number | null;
  krd5YrBucket: number | null;
  krd10YrBucket: number | null;
  krd30YrBucket: number | null;
  spreadDuration: number | null;
  spreadDurationContribution: number | null;
  oas: number | null;
  yieldToWorst: number | null;
  avgLife: number | null;
  qualityRating: string;
  qualityRatingScore: number | null;
  tcwCoreLevel1: string;
  tcwCoreLevel2?: string;
  tcwCoreLevel3: string;
  tcwCoreLevel4: string;
  tcwCoreLevel5: string;
  tcwCoreLevel6: string;
  tcwCoreLevel7: string;
  securityGroup: string;
  securityType: string;
};

export type SecurityAnalytics = {
  asOfDate: string;
  securityKey: string | null;
  cusip: string | null;
  aladdinId: string | null;
  isin: string | null;
  ticker: string | null;
  coupon: number | null;
  maturityDate: string | null;
  countryOfRiskCode: string | null;
  duration: number | null;
  krd2YrBucket: number | null;
  krd5YrBucket: number | null;
  krd10YrBucket: number | null;
  krd30YrBucket: number | null;
  spreadDuration: number | null;
  averageLife: number | null;
  oas: number | null;
  yieldToWorst: number | null;
  qualityStandardRating: string | null;
  qualityStandardRatingScore: number | null;
  tcwCoreLevel1: string | null;
  tcwCoreLevel2: string | null;
  tcwCoreLevel3: string | null;
  tcwCoreLevel4: string | null;
  tcwCoreLevel5: string | null;
  tcwCoreLevel6: string | null;
  tcwCoreLevel7: string | null;
  priceSource: string | null;
  dirtyPrice: number | null;
  localPrice: number | null;
};

export type PortfolioAnalysisDayAttribution = {
  exposure: number | null;
  marketValue: number | null;
  marketValueDelta: number | null;
  par: number | null;
  parDelta: number | null;
  durationContribution: number | null;
  durationDelta: number | null;
  trades: number | null;
  cashflows: number | null;
  drift: number | null;
  benchmarkExposure: number | null;
  benchmarkMarketValue: number | null;
  benchmarkPar: number | null;
  benchmarkDurationContribution: number | null;
};

export type PortfolioAnalysisTradeMatchStatus = 'same-day-position' | 'bucket-only' | 'trade-only';

export type PortfolioAnalysisTradeEvent = MonitorV2Trade & { matchStatus?: PortfolioAnalysisTradeMatchStatus };

export type PortfolioAnalysisRowDiagnostics = {
  priorSecurity?: SecurityAnalytics | null;
  currentSecurity?: SecurityAnalytics | null;
  securityDurationDelta?: number | null;
  dirtyPriceDelta?: number | null;
  localPriceDelta?: number | null;
  oasDelta?: number | null;
  spreadDurationDelta?: number | null;
  mvMovedWithFlatPar?: boolean;
};

export type PortfolioAnalysisRowEventDetails = {
  trades?: PortfolioAnalysisTradeEvent[];
  cashflows?: MonitorV2Cashflow[];
};

export type PortfolioAnalysisTreeRow = {
  id: string;
  parentId: string | null;
  label: string;
  nodeType: 'root' | 'bucket' | 'position' | 'syntheticTrade';
  depth: number;
  portfolioKey: string;
  ticker?: string;
  securityKey?: string;
  longShortFlag?: string;
  securityGroup?: string;
  securityType?: string;
  holdingState?: HoldingState;
  day: Record<number, PortfolioAnalysisDayAttribution>;
  total: PortfolioAnalysisDayAttribution;
  diagnostics?: Record<number, PortfolioAnalysisRowDiagnostics>;
  events?: Record<number, PortfolioAnalysisRowEventDetails>;
};
