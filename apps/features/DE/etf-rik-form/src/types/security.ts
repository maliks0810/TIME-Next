export interface SecurityOption {
  aladdin_id: string;     // CUSIP (primary identifier)
  isin?: string | null;
  sedol?: string | null;
  security_name?: string | null;
  ticker: string;
}

export interface SecuritiesResponse {
  data: SecurityOption[];
  total: number;
}