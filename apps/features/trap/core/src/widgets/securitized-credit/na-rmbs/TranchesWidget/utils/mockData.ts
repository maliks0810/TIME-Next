export interface TrancheRow {
    id: string; // internal key
    name: string; // e.g. "7A2"
    cusip: string; // e.g. "007036QT6"
    coupon: number;
    type: string; // e.g. "SEN_SPR_FLT"
    currency: string;
    origBalance: number;
    currBalance: number;
    factor: number;
    origRatings: string; // "Aaa/AAA/AAA"
    currRatings: string; // "WR/-/AA(high)"
    ratingAgency: string;
}
