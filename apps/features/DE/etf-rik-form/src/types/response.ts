import { FormStatus, OrderStatus } from "./etfform";

export interface ETFTransferAllocation {
    id: string;

    tradeDate: string;
    portfolioNumber: string;

    cusip: string;
    isin: string;
    sedol: string;

    securityName: string;
    quantity: number;
    broker: string;
    brokerName: string;
}

export interface ETFTransferOrder {
    id: string;

    order_id: string;
    status: OrderStatus;
    failed_step?: OrderStatus;

    ssb_plf_file?: string;

    processing_at?: string;
    file_generated_at?: string;
    failed_at?: string;

    allocations: ETFTransferAllocation[];
}

export interface ETFTransferRequest {
    id: string;

    request_reference: string;
    reference_id: number;

    status: FormStatus;
    status_display: string;

    created_by?: string;

    created_at: string;
    draft_saved_at?: string;

    submitted_at?: string;
    processing_at?: string;
    completed_at?: string;
    file_generated_at?: string;
    failed_at?: string;
    failed_step: FormStatus | null;
    spir_file: string | null;

    orders: ETFTransferOrder[];
}