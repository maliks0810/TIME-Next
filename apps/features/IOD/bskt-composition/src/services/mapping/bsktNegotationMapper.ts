import { toLocalDateTimeString, toDateTimeString } from "../dateService";
import { BasketProposal } from "../domain-objects/basketProposal";
import { BasketState } from "../domain-objects/basketState";
import { BasketNegotiationResponse } from "../domain-objects/response/bsktNegotiationsResponse";

export const mapToBsktProposal = (bn: BasketNegotiationResponse): BasketProposal => {
    const result: BasketProposal = {
        id: bn.basketNegotiationId,
        basketName: bn.bbgProposalId,
        broker: bn.bbgCounterParty,
        status: toBasketState(bn.state),
        dateProposed: toLocalDateTimeString(bn.bbgRetrievedDate),
        tradeDate: toLocalDateTimeString(bn.tradeDate),
        settleDate: toLocalDateTimeString(bn.settleDate),
        conditions: [],
        basketInformation: {
            basketId: bn.bbgProposalId,
            dealerDesk: bn.bbgDealerDesk,
            dealerEmail: bn.bbgDealerEmail,
            securitiesCount: bn.bbgSecuritiesCount,
            timestamp: toDateTimeString(bn.bbgCreatedTime),
            totalShares: bn.bbgTotalShares,
            units: bn.bbgUnits,
            unitSize: bn.bbgUnitSize
        },
        composition: []
    }

    return result;
}

const toBasketState = (input: string): BasketState => {
    switch (input) {
        case "Proposed": return "Proposed";
        case "In Aladdin": return "In Aladdin";
        case "Published": return "Published";
        case "Retracted": return "Retracted";
        case "Rejected": return "Rejected";
        default:
            throw new Error(`Invalid BasketState value: ${input}`)
    }
}

