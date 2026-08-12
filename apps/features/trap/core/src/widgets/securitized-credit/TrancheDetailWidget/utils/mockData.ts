export interface TrancheRow {
    id: string; // internal key
    name: string; // e.g. "7A2"
    cusip: string; // e.g. "007036QT6"
    isin: string | null; // e.g. "US007036QT62" (from TR_ISIN_LIST[0]; null if none)
    coupon: number;
    type: string; // e.g. "SEN_SPR_FLT"
    currency: string;
    origBalance: number;
    currBalance: number;
    factor: number;
    origRatings: string; // "Aaa/AAA/AAA"
    currRatings: string; // "WR/-/AA(high)"
}

export interface TrancheDetail extends TrancheRow {
    figi: string;
    bloombergTicker: string;
    group: string;
    groundGroup: string;
    supportGroup: string;
    crossoverPrinDist: string;
    crossoverPrinDistWith: string;
    impliedWritedown: string;
    targetEnhancement: string;
    statedMaturity: string;
    creditSupportFormula: string;
    creditSupportFormulaNum: string;
    delay: string;
    accrualDate: string;
    floaterFormula: string;
    floaterIndexCSA: string;
    floaterFloor: string;
    floaterCap: string;
    floaterMarginSteps: string;
    couponCap: string;
    businessDay: string;
    daycount: string;
    frequency: string;
    reportedCoupon: string;
    accumIntShortfall: string;
    accumWritedown: string;
    accumUnrealizedWritedown: string;
    accumGroupDirUnrWD: string;
    impliedBalance: string;
    groupDirImpliedBalance: string;
    accumCoupCapShortfall: string;
    floaterIndex: string;
    floaterSpread: string;
}