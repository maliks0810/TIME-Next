export type AnalystPerformanceResultType = {
    name: string;
    performanceMetrics: {
        asOfDate: Date;
        periods: PeriodMetrics[];
        series: PerformanceSeries;
        errorMessage: string;
    }
    stats: {
        mtd: number;
        qtd: number;
        ytd: number;
        cagr: number;
        excessReturn: number;
    };
    returns: {
        date: string;
        analystPerformance: number;
        benchmarkPerformance: number;
        excessReturn: number;
    }[];
    annualizedReturns: {
        date: string;
        analystPerformance: number;
        benchmarkPerformance: number;
        excessReturn: number;
    }[];
};

export type PeriodMetrics = {
    label: string;
    start: Date;
    end: Date;
    observations: number;
    portfolio: SideMetrics;
    benchmark: SideMetrics;
    excess: {
        diff: number;
        relative: number;
    }

}
export type SideMetrics = {
    totalReturn: number;
    cagr: number;
    volAnn: number;
    sharpeAnn: number;
    maxDrawdown: number;
}
type SeriesPoint = {
    date: Date;
    value: number;
}
type PerformanceSeries = {
    cumulativePortfolio: SeriesPoint;
    cumulativeBenchmark: SeriesPoint;
    cumulativeExcessRel: SeriesPoint;
    drawdownPortfolio: SeriesPoint;
    drawdownBenchmark: SeriesPoint;
}

export enum DateFormatEnum {
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
}

export enum AnalystLinesEnum {
    ANALYST_PERFORMANCE = 'ap',
    BENCHMARK_PERFORMANCE = 'bp',
    EXCESS_RETURN = 'er',
}
export interface Coverage {
    coverageDate: string,
    securityKey: string,
    ticker: string,
    isin: string,
    companyName: string,
    sectorName: string,
    groupName: string,
    industryName: string,
    subIndustryName: string,
    benchmarkWeight: number,
    onBuyList: boolean,
    marketCap: string,
    mtd: number,
    qtd: number,
    ytd: number,
    analystName: string,
}

export interface Recommendation {
    id: number,
    sector: string,
    industry: string,
    analyst: string,
    securityId: number,
    ticker: string,
    isin: string,
    securityName: string,
    marketCap: number,
    currentPrice: number,
    ytdPerformance: number,
    targetPrice: number,
    buyRecDate: string,
    upside: number,
    esgScore: number,
    portfolioCount: number,
    tcwDollarExposure: number,
    portfolios: string,
}
export interface BuyList {
    results: Recommendation[];
}

export interface RecommendationItem {
    sector: string,
    industry: string,
    analyst: string,
    ticker: string,
    securityName: string,
    marketCap: string,
    currentPrice: string,
    ytdPerformance: number,
    targetPrice: string,
    buyRecDate: string,
    droppedDate: string,
    upside: number,
    esgScore: number,
    portfolioCount: number,
    tcwDollarExposure: string,
    portfolios: string,
}
export interface BuyListSector {
    id : number,
    sector: string,
    industries: BuyListIndustry[],
    rowSpan: number,
}

export interface BuyListIndustry {
    id: number,
    industry: string,
    rowSpan: number,
    items: RecommendationItem[],
}