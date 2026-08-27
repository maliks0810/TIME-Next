import { toLocalDateTimeString, toDateTimeString } from "../dateService";
import { BasketProposal } from "../domain-objects/basketProposal";
import { BasketState } from "../domain-objects/basketState";
import { BasketNegotiationResponse } from "../domain-objects/response/bsktNegotiationsResponse";
import { BbgBasketOrderSnapshot as  BbgBasketOrderSnapshotResponse} from "../domain-objects/response/BbgBasketOrderSnapshot";
import { BbgBasketOrderSnapshot as  BbgBasketOrderSnapshotResponseDM} from "../domain-objects/bbgBasketOrderSnapshot";
import { BbgBasketOrder as BbgBasketOrderResponse} from "../domain-objects/response/BbgBasketOrder";
import { BbgBasketOrder as  BbgBasketOrderDM} from "../domain-objects/bbgBasketOrder";


export const mapToBsktOrderSnapshot = (source: BbgBasketOrderSnapshotResponse): BbgBasketOrderSnapshotResponseDM => {
    const result: BbgBasketOrderSnapshotResponseDM = {
        bbgBasketId: source.bbgBasketId,
        fundTickerAndExch: source.fundTickerAndExch,
        lastUpdateTime: source.lastUpdateTime,
        orderStatus: source.orderStatus
    }

    return result;
}

export const mapToBsktOrder = (source: BbgBasketOrderResponse): BbgBasketOrderDM => {
    const result: BbgBasketOrderDM = {
        version: source.version
    }

    return result;
}

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
            bbgTicker: bn.bbgTicker,
            dealerDesk: bn.bbgDealerDesk,
            dealerEmail: bn.bbgDealerEmail,
            securitiesCount: bn.bbgSecuritiesCount,
            timestamp: toDateTimeString(bn.bbgCreatedTime),
            totalShares: bn.bbgTotalShares,
            units: bn.bbgUnits,
            creationUnitSize: bn.bbgUnitSize,
            securitiesMv: null,
            isLoadingMv: false,
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
