import { BasketState } from "./basketState";


export interface BasketInformation {
    basketId: string;
    dealerDesk: string;
    dealerEmail: string;
    totalShares: number;
    securitiesCount: number;
    timestamp: string;
    unitSize: number;
    units: number;
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