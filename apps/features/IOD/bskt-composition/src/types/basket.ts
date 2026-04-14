export type BasketStatus = "Proposed" | "In Aladdin" | "Published";

export type BasketCondition = {
  label: string;
  value: string;
};

export type BasketCompositionSecurity = {
  id: string;
  ticker: string;
  securityName: string;
  shares: number;
  price: number;
  value: number;
  weight: number;
  assetType?: string;
  cusip?: string;
  isin?: string;
  sedol?: string;
};