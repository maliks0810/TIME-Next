export interface BasketDetailsResponse {
  basketDetails: BasketDetailsObj;
}

export interface BasketDetailsObj {
  basketId: string;
  dealerDesk: string;
  totalShares: number;
  securitiesCount: number;
  timestamp: string;
  proposalId: string;
  dealerEmail: string;
  unitSize: number;
  totalMarketvalue: number;
  securities: BasketSecurity[];
  previousCloseNavPerShare: number;
  orderTotalValue: number;
  inKindPercent: number;
  bloombergSecuritiesMarketValue: number;
  bloombergCash: number;
  aladdinSecuritiesMarketValue: number;
  aladdinCash: number;
  aladdinCashPercent: number;
  aladdinSecuritiesCount: number;
}

export interface BasketSecurity {
  isin: string;
  sedol: string;
  currency: string;
  basketAmount: number;
  marketValueUsd: number;
}
