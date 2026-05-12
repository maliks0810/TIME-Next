export interface  PortfolioRow {
  portId: string,
  portfolioName: string,
  inceptionDate: string,   // ISO date
  perfStartDate: string,   // ISO date
  benchmark: string,
}

export interface  PortfolioHeader {
  inceptionDate: string,
  perfStartDate: string,
}

export interface HistoryRow {
  final?: string,
  endingMV?: number,
  endingDate?: string,
  month?: number,
  rollingQtr?: number,
  qtd?: number,
  ytd?: number,
  oneYear?: number,
  twoYear?: number,
  threeYear?: number,
  fourYear?: number,
  fiveYear?: number,
  sixYear?: number,
  sevenYear?: number,
  eightYear?: number,
  nineYear?: number,
  tenYear?: number,
  twentyYear?: number,
  sinceInceptionAnnualized?: number,
  sinceInceptionCumulative?: number,
  portfolioPerfStartDate?: string,
  fiscalYear?: number,
  //fee only view data
  investStyle?: string,
  benchmarkName?: string,
  feeDollars?: number,
  feeDollarStatus?: string,
  estimateAnnFee?: number,
  fundLevelMV?: number,
}
export interface PerformanceReturnsResultResponse {
    columns?: string,
    portfolioGrossRows?: HistoryRow[],
	  portfolioNetRows?: HistoryRow[],
    benchmarkRows?: HistoryRow[],
    netFeeRows?: HistoryRow[],
    header?: PortfolioHeader,
    portfolioRow?: PortfolioRow,
	  errorMessage?: string,
}

export interface HistorySummaryRow {
  asOfDate?: string,
  benchmark?: string,
  portfolioName?: string,
  portfolioNumber?: string,
  final?: string,
  investmentStyle?: string,
  marketValue?: number,
  monthGross?: number,
  monthNet?: number,
  monthIndex?: number,
  alpha?: number,
  qtdGross?: number,
  qtdNet?: number,
  qtdIndex?: number,
  qtdAlpha?: number,
  ytdGross?: number,
  ytdNet?: number,
  ytdIndex?: number,
  ytdAlpha?: number,
  perfStartDate?: string,
  inceptionDate?: string,
}