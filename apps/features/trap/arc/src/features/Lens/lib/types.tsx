export type CharacteristicsItem = {
    aladdinId: string;
    assetAnalyticsSetupId: number;
    assetType: string | null;
    assetSubType: string | null;
};

export type AssumptionsItem = {
    collateralType: string | null;
    price: number;
    interestRateScenario: string | null;
    modelFamilyOverrideForScenario: string | null;
    modelFamilyOverrideForAnalytics: string | null;
    acceptModelOutputs: string | boolean | null;
    analysisDate: string | null;
    callable: string;
    prepaymentType: string | null;
    prepaymentSpeed: string | null;
    defaultType: string | null;
    severity: string | null;
    delinquency: string | null;
    callDate: string | null;
};

export type AnalyticsItem = {
    riskDate: string | null;
    krdDate: string | null;
    createdDate: string;
    currency: string | null;
    assetIdType: string | null;
    curveType: string | null;
    krdBenchCusip: string | null;
    krdSource: string | null;
    fileProcessingStatus: string | null;
    brsFileName: string | null;
    createdBy: string | null;
    lastModifiedBy: string | null;
    oad: number | null;
    modelOad: number | null;
    modDur: number | null;
    modDurToWorst: number | null;
    volDur: number | null;
    inflDuration: number | null;
    realDuration: number | null;
    oac: number | null;
    modelOac: number | null;
    oas: number | null;
    oas1: number | null;
    oav: number | null;
    price: number | null;
    spdDur: number | null;
    spreadToWorst: number | null;
    wal: number | null;
    walToWorst: number | null;
    zvWal: number | null;
    yieldToMaturity: number | null;
    yieldToWorst: number | null;
    zvYield: number | null;
    staticYield: number | null;
    volatility: number | null;
    volConv: number | null;
    realYield: number | null;
    rorCbe: number | null;
    sprdOffWal: number | null;
    krd3M: number | null;
    krd1Y: number | null;
    krd2Y: number | null;
    krd3Y: number | null;
    krd5Y: number | null;
    krd7Y: number | null;
    krd10Y: number | null;
    krd15Y: number | null;
    krd20Y: number | null;
    krd25Y: number | null;
    krd30Y: number | null;
    krd40Y: number | null;
    krd50Y: number | null;
    lastModifiedDate: string;
};

export type TimelineItem = {
    action: string;
    timestamp: string;
    author: string;
    comment: string | null;
    payloadDelta: string | null;
    assumptions: AssumptionsItem;
    analytics: AnalyticsItem | null;
};

export type AnalyticsHistory = {
    characteristics: CharacteristicsItem;
    timeline: TimelineItem[];
};

export type AnalyticsHistoryApiResponse = {
    response: AnalyticsHistory[];
}

export type MergedTimelineItem = TimelineItem & {
    sourceKey: string;
    sourceIndex: number;
};

export interface Block {
    title: string;
    content: string;
}