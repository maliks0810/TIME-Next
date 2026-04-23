export type AbandonAssetPayload = {
    assetAnalyticsSetupId: number | null | undefined;
    noteText: string;
};

export type FilePreviewRequestCollection = {
    assetAnalyticsSetupId: number;
    aladdinId: string;
};

export type PreviewBondResponseType = {
    feature: string;
    purpose: string;
    source: string;
    start_Date: string;
    value: string;
    cusip: string;
};

export type PreviewStaticScenariosResponseType = {
    cusip: string;
    starT_DATE: string;
    sceN_TYPE: string;
    purpose: string;
    model: string;
    scenario: string;
    scenariO_TEXT: string;
};

export type PreviewAnalyticsOverrideResponseType = {
    riskDate: string;
    krdDate: string;
    assetId: string;
    assetIdType: string;
    currency: string;
    curveType: string;
    krdBenchCusip: string;
    krdSource: string;
    price: number;
    staticYield: number;
    modelOad: number;
    modelOac: number;
    sprdOffWal: number;
    volDur: number;
    yieldToMaturity: number;
    yieldToWorst: number;
    zvYield: number;
    wal: number;
    walToWorst: number;
    zvWal: number;
    oad: number;
    modDur: number;
    modDurToWorst: number;
    oac: number;
    spdDur: number;
    oas: number;
    oas1: number;
    spreadToWorst: number;
    krd3M: number;
    krd1Y: number;
    krd2Y: number;
    krd3Y: number;
    krd5Y: number;
    krd7Y: number;
    krd10Y: number;
    krd15Y: number;
    krd20Y: number;
    krd25Y: number;
    krd30Y: number;
    krd40Y: number;
    krd50Y: number;
};
