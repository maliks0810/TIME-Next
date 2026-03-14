import { NoteType } from '../../../shared/types';

export type RowDataType = {
    key: string;
    label: string;
    anser?: string;
    override?: string;
    valueToPublish?: string;
    dataType?: 'number' | 'text' | 'date';
    isEditingDisabled?: boolean;
};

export type AnalyticsByIdResponse = {
    notes: { response: NoteType[] };
    response: NewAssetAnalytics;
};

export type NewAssetAnalytics = {
    // Identifiers
    analyticsOverrideId: number;
    assetAnalyticsSetupId: number;
    aladdinId: string;
    newRequestId: string;
    krdBenchCusip: string;

    // Analytics and Auditing
    riskDate: string;
    krdDate: string;
    assetIdType: string;
    currency: string;
    curveType: string;
    krdSource: string;
    oad: number | null;
    modDur: number | null;
    modDurToWorst: number | null;
    oac: number | null;
    oas: number | null;
    oas1: number | null;
    price: number | null;
    spdDur: number | null;
    spreadToWorst: number | null;
    wal: number | null;
    walToWorst: number | null;
    yieldToMaturity: number | null;
    yieldToWorst: number | null;
    zvWal: number | null;
    zvYield: number | null;
    fileProcessingStatus: string;
    retryCount: number | null;
    lastAttemptDate: string;
    brsFileName: string;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    status: string;

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

    noteType?: string;
    noteText?: string;

    // new fields
    staticYield: number | null;
    modelOad: number | null;
    modelOac: number | null;
    volDur: number | null;
    assetId: string | null;
    claimedBy: string | null;
    claimedAt: string | null;
    oav: number | null;
    inflDuration: number | null;
    realDuration: number | null;
    sprdOffWal: number | null;
    volatility: number | null;
    volConv: number | null;
    realYield: number | null;
    rorCbe: number | null;
};
