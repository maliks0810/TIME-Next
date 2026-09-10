export interface ETFForm {
  id?: string;
  request_reference: string;
  order_id: string;
  created_by: string;
  status: string;
  status_display: string;
  error_message: string;
  created_at: string;
}

export type FormStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "FILE_GENERATED"
  | "FAILED";

export interface AllocationRow {
  tradeDate: string;
  portfolioNumber: string;
  cusip: string;
  isin: string;
  sedol: string;
  securityName: string;
  quantity: string;
  broker: string;
  brokerName: string;   // broker label
}

export interface AllocationInputRow {
  id?: string | null;
  orderId: string;
  orderStatus: OrderStatus;
  failedStep?: OrderStatus;
  tradeDate: string;
  portfolioNumber: string;
  cusip?: string;
  isin?: string;
  sedol?: string;
  securityName: string;
  quantity: string | number;
  broker?: string;
  brokerName?: string;
}

export interface AllocationOutputRow {
  id?: string | null;
  order_id: string;
  trade_date: string;
  portfolio_number: string;
  cusip?: string;
  isin?: string;
  sedol?: string;
  security_name: string;
  quantity: number;
  broker?: string;
  broker_name?: string;
}

export type AllocationRows = AllocationOutputRow[]