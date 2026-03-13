export interface Recommendation {
  id: number;
  sector: string;
  industry: string;
  analyst: string;
  securityId: number;
  ticker: string;
  isin: string;
  securityName: string;
  marketCap: number;
  currentPrice: number;
  ytdPerformance: number;
  targetPrice: number;
  buyRecDate: string;
  upside: number;
  esgScore: number;
  portfolioCount: number;
  tcwDollarExposure: number;
  portfolios: string;
  droppedDate?: string
}

export interface RecommendationResults {
  results: Recommendation[];
  totalCount?: number;
  pageNbr?: number;
  status?: string;
  message?: string;
}

export interface EquitiesAnalystBuyListGql {
  results: RecommendationResults;
}
export interface EquitiesAnalystBuyListQuery {
  equitiesAnalystBuyList: EquitiesAnalystBuyListGql;
}


export interface RecommendationItem {
  sector: string;
  industry: string;
  analyst: string;
  ticker: string;
  securityName: string;
  marketCap: string;
  currentPrice: string;
  ytdPerformance: number;
  targetPrice: string;
  buyRecDate: string;
  droppedDate: string;
  upside: number;
  esgScore: number;
  portfolioCount: number;
  tcwDollarExposure: string;
  portfolios: string;
}

export interface BuyListSector {
  id: number;
  sector: string;
  industries: BuyListIndustry[];
  rowSpan: number;
}

export interface BuyListIndustry {
  id: number;
  industry: string;
  rowSpan: number;
  items: RecommendationItem[];
}