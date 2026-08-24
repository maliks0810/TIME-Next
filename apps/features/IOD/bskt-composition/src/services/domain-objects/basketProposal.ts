import { BasketState } from "./basketState";


export interface BasketInformation {
    basketId: string;
    bbgTicker: string;
    dealerDesk: string;
    dealerEmail: string;
    totalShares: number;
    securitiesCount: number;
    timestamp: string;
    creationUnitSize: number;
    units: number;
    securitiesMv: number | null;
    isLoadingMv: boolean;
};

export interface BasketProposal {
    id: string;
    basketName: string;
    broker: string;
    status: BasketState;
    dateProposed: string;
    tradeDate: string;
    settleDate: string;
    conditions: [];
    basketInformation: BasketInformation;
    composition: [];
}
