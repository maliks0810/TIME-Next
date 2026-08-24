export interface SendBasketDetailsRequest {
    basketNegotiationId: number,
    inkindPercent: string,
    aladdinSecuritiesMarketValue: number | null,
    modifiedBy : string
}