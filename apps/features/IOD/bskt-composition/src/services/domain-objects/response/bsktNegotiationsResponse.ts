export interface BasketNegotiationsResponse  {
    basketNegotiations: BasketNegotiationResponse[];
}

export interface BasketNegotiationResponse {
    basketNegotiationId: string;
    bbgProposalId: string;
    bbgTicker: string;
    bbgSide: string;
    bbgReflectedIn: string;
    bbgUnits: number;
    bbgUnitSize: number;
    bbgTotalShares: number;
    bbgSecuritiesCount: number;
    bbgCounterParty: string;
    bbgCreatedTime: Date;
    bbgStatus: string;
    bbgDealerDesk: string;
    bbgDealerEmail: string;
    state: string;
    bbgRetrievedDate: Date;
    createdDate: Date;
    createdBy?: string | null;
    modifiedDate: Date;
    modifiedBy?: string | null;
    aladdinPostedDate: Date | null;
    bbgPostedDate: Date | null;
    settleDate: Date;
    tradeDate: Date;
}