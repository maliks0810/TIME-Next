export interface BbgBasketSecuritiesResponse {
    bbgBasketSecurities: BbgBasketSecurityResponse[];
}

export interface BbgBasketSecurityResponse {
    bbgBasketSecurityId: string;
    basketNegotiationId: string;
    bbgParseKey: string;
    bbgFigi: string;
    bbgCurrency: string;
    bbgAmount: number;
    isActive: boolean;
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
}