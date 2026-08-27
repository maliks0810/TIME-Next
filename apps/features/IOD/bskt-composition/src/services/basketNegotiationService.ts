import {
    getBasketNegotiationsUrl,
    getSendToAladdinUrl,
    getBbgBasketOrderSnapshotsUrl,
    getBbgBasketOrderUrl,
    getCreateTestDealerProposalUrl,
    isTestDealerProposalEnabled,
    getSendToBbgUrl,
    getBasketDetailsUrl
} from "../config/environments";
import { BasketNegotiationsResponse } from "./domain-objects/response/bsktNegotiationsResponse"
import { fetchData, postData } from "./dataService"
import { BasketProposal } from "./domain-objects/basketProposal";
import { mapToBsktProposal, mapToBsktOrderSnapshot } from "./mapping/bsktNegotationMapper";
import { AladdinBasketSecuritiesResponse } from "./domain-objects/response/AladdinBasketSecuritiesResponse";
import { SendBasketToAladdinRequest } from "./domain-objects/request/sendBasketToAladdinRequest";
import { BbgBasketOrderSnapshot } from "./domain-objects/bbgBasketOrderSnapshot";
import { toISODateString, toLocalDateTimeString } from "./dateService";
import { BbgBasketOrderSnapshotsResponse } from "./domain-objects/response/BbgBasketOrderSnapshotsResponse";
import { CreateTestDealerProposalResponse } from "./domain-objects/response/CreateTestDealerProposalResponse";
import { CreateBasketPostingRequest } from "./domain-objects/request/createBasketPostingRequest";
import { CreateTestDealerInventoryRequest } from "./domain-objects/request/createTestDealerInventoryRequest";
import { BasketDetailsResponse } from "./domain-objects/response/BasketDetailsResponse";
import { SendBasketDetailsRequest } from "./domain-objects/request/sendBasketDetailsRequest";

export const getBasketProposals = async (
    createdBy: string,
    asOfDate: Date = new Date(), 
    skipBbg: boolean = false,
    signal?: AbortSignal): Promise<BasketProposal[]> => {
        const asOfDateStr = toLocalDateTimeString(asOfDate);
        const baseUrl = getBasketNegotiationsUrl(asOfDateStr);
        const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}createdBy=${encodeURIComponent(createdBy)}&skipBloomberg=${skipBbg}`;

        const basketNegotiations = await fetchData<BasketNegotiationsResponse>(url, signal);
        return basketNegotiations.basketNegotiations.map(mapToBsktProposal);
}

export const sendToAladdin = async (basketNegotiationId: string, createdBy: string, signal?: AbortSignal): Promise<BasketProposal> => {
    const url = getSendToAladdinUrl();

    const response = 
        await postData<SendBasketToAladdinRequest, AladdinBasketSecuritiesResponse>(
            url, 
            { 
                basketNegotiationId: basketNegotiationId,
                createdBy: createdBy
            }, 
            signal
        );
    return mapToBsktProposal(response.basketNegotiation);
}

export const getAladdinBasketSecurities = async (
    basketNegotiationId: number,
    createdBy: string,
    signal?: AbortSignal
): Promise<AladdinBasketSecuritiesResponse> => {
    const baseUrl = getSendToAladdinUrl();
    const url = `${baseUrl}?basketNegotiationId=${basketNegotiationId}&createdBy=${encodeURIComponent(createdBy)}`;

    return await fetchData<AladdinBasketSecuritiesResponse>(url, signal);
}

export const getBbgBasketOrderSnapshots = async (
    tradeDate: Date,
    includeFutureTradeDates?: boolean,
    signal?: AbortSignal
): Promise<BbgBasketOrderSnapshot[]> => {
    const baseUrl = getBbgBasketOrderSnapshotsUrl();
    const url = `${baseUrl}?tradeDate=${toISODateString(tradeDate)}&includeFutureTradeDates=${includeFutureTradeDates}`;

    const response = await fetchData<BbgBasketOrderSnapshotsResponse>(url, signal);
    return response.bbgBasketOrderSnapshots.map(mapToBsktOrderSnapshot);
}

export const getBbgBasketOrder = async (
    orderId: string,
    signal?: AbortSignal
): Promise<string> => {
    const baseUrl = getBbgBasketOrderUrl();
    const url = `${baseUrl}/?orderId=${orderId}`;

    const response = await fetchData<string>(url, signal);
    return response;
}

export async function createTestDealerProposal(
    payload: CreateTestDealerInventoryRequest,
    signal?: AbortSignal
): Promise<CreateTestDealerProposalResponse> {
    if (!isTestDealerProposalEnabled()) {
        throw new Error("Test dealer proposal creation is disabled in this environment.");
    }

    return await postData<CreateTestDealerInventoryRequest, CreateTestDealerProposalResponse>(
        getCreateTestDealerProposalUrl(), payload, signal)

}

export async function publishToBbg(
    basketNegotiationId: number,
    createdBy: string,
    cashFeeOverride?: number | null,
    signal?: AbortSignal
): Promise<void> {
    const request: CreateBasketPostingRequest = {
        basketNegotiationId,
        createdBy: createdBy
    };

    if (cashFeeOverride !== null && cashFeeOverride !== undefined) {
        request.overrides = {
            cashFeeOverrideValue: cashFeeOverride,
        };
    }

    await postData<CreateBasketPostingRequest>(getSendToBbgUrl(), request, signal);
}

export const getBasketDetails = async (
    basketNegotiationId: number,
    signal?: AbortSignal
): Promise<BasketDetailsResponse> => {
    const baseUrl = getBasketDetailsUrl();
    const url = `${baseUrl}?basketNegotiationId=${basketNegotiationId}`;
    return await fetchData<BasketDetailsResponse>(url, signal);
}

export const sendBasketDetails = async (basketNegotiationId: number, InkindPercent: string, AladdinSecuritiesMarketValue: string | null ,modifiedBy: string,signal?: AbortSignal): Promise<BasketDetailsResponse> => {
    const url = getBasketDetailsUrl();

    const aladdinSecuritiesMarketValueToSend =
        AladdinSecuritiesMarketValue == null || AladdinSecuritiesMarketValue.trim() === "" ? null : Number(AladdinSecuritiesMarketValue.replace(/[$,]/g, ""));

    const response = 
        await postData<SendBasketDetailsRequest, BasketDetailsResponse>(
            url, 
            { 
                basketNegotiationId: basketNegotiationId,
                inkindPercent: InkindPercent,
                aladdinSecuritiesMarketValue:aladdinSecuritiesMarketValueToSend,
                modifiedBy: modifiedBy
            }, 
            signal
        );
    return response
}