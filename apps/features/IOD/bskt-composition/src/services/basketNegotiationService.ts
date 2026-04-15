import { getBasketNegotiationsUrl, getSendToAladdinUrl } from "../config/environments";
import { BasketNegotiationsResponse } from "./domain-objects/response/bsktNegotiationsResponse"
import { fetchData, postData } from "./dataService"
import { BasketProposal } from "./domain-objects/basketProposal";
import { mapToBsktProposal } from "./mapping/bsktNegotationMapper";
import { AladdinBasketSecuritiesResponse } from "./domain-objects/response/AladdinBasketSecuritiesResponse";
import { SendBasketToAladdinRequest } from "./domain-objects/request/sendBasketToAladdinRequest";
import { toLocalDateTimeString } from "./dateService";

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
