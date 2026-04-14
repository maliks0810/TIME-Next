import { BasketNegotiationResponse } from "./bsktNegotiationsResponse"

export interface AladdinBasketSecuritiesResponse {
    basketNegotiation: BasketNegotiationResponse;
    aladdinBasketSecurities: AladdinBasketSecurityResponse[];
    totalMarketValue: number;
}

export interface AladdinBasketSecurityResponse {
    bbgAladdinSecurityId: string;
    basketNegotiationId: string;
    orderTranType: string;
    aladdinId: string;
    orderDate: Date;
    settleDate: Date;
    portfolio: string;
    cusip: string,
    isin: string,
    sedol: string,
    orderQuantity: number;
    marketPrice: number;
    aladdinOrderId: string;
    isActive: boolean;
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
}
