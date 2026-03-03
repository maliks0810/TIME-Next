/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dayjs } from 'dayjs';

export enum StepsEnum {
    UPLOAD_CDI_FILE = 0,
    // VERIFICATION = 1,
    SELECT_TRANCHE = 1,
    PREPARE_PACKAGE = 2,
}

export type TrancheSelectionType = {
    name: string;
    type: string;
    cusip: string;
    isin?: string | null;
};
export type NIStatusData = {
    processing: ProcessingDeal[];
    completed: CompletedDeal[];
    failed: FailedDeal[];
};
export type StatusResponse = {
    message: string;
    pageNbr: number;
    results: Deal[];
    status: string;
    totalCount: number;
};

export type TableRow<T = any> = {
    key: string | number;
    assetAnalyticsSetupId?: number;
    aladdinId?: string;
    assetIdType?: string;
    status?: string;
    createdDate?: string;
    raw: T;
};

export type DealDetail = {
    message: string;
    operation: string; // potentially could be a separate type
    timestamp: string;
};

export type BaseDeal = {
    details: DealDetail[];
    fileName: string;
    uploadedAt: string;
    tranche: string;
    trackingId: string | number;
    r2Identifier: string;
};

export type ProcessingDeal = BaseDeal & {
    status: 'Processing';
};

export type CompletedDeal = BaseDeal & { completedAt: string; status: 'Completed' };
export type FailedDeal = BaseDeal & { failedAt: string; status: 'Failed' };
export type Deal = ProcessingDeal | CompletedDeal | FailedDeal;

export interface NewAsset {
    assetAnalyticsSetupId: number;
    newAssetRequestId: string;
    assetClass: string;
    instrumentType: string;
    aladdinId: string;
    price: number;
    assetType: string;
    status: string;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    cdiCduBlob: string;
    payload: string;
    claimedBy?: string;
    claimedAt?: string;
    analysisDate: string;

    assetSubType?: string | null;
}

export type AnalyticsByIdResponse = {
    notes: { response: NoteType[] };
    response: NewAssetAnalytics;
};

export type NewAssetAnalyticsRepsonse = {
    notes: { response: NoteType[] };
    response: NewAsset;
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

export type UpdateStatusRequest = {
    assetAnalyticsSetupId: number;
    status: string;
    updatedBy: string;
};

export type Scenario = {
    type: string;
    parameters: unknown | null;
};

export type AnalyticsInputRequest = {
    assetAnalyticsSetupId: number;
    aladdinId: string;
    assetType: string;
    price: number;
    updatedBy: string | undefined;
    payload: Scenario[];
};

export type AnalyticsRequest = {
    analyticsOverrideId: number | null;
    assetAnalyticsSetupId: number | null;
    aladdinId: string;
    newRequestId: string;
    riskDate: string;
    krdDate: string;
    assetIdType: string;
    currency: string;
    curveType: string;
    krdBenchCusip: string;
    krdSource: string;
    oad: number | null;

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
    modifiedBy: string;

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

    noteType?: string;
    noteText?: string;
};
export type PublishAnalyticsRequest = {
    analytics: AnalyticsRequest[];
};

export type AnalyticsInputRequestCollection = {
    analyticsInput: AnalyticsInputRequest[];
};

export type AnalyticsItem = {
    security: string;
    aladdinId: string;
    duration: string;
    price: number;
    yield: string;
    spread: string;
    oas: string;
};

export type AnalyticsStatus =
    | 'ANALYTICS REQUESTED'
    | 'ANALYTICS INPUT PENDING REVIEW'
    | 'ANALYTICS INPUT SENT TO ALADDIN'
    | 'ANALYTICS INPUT VERIFIED IN ALADDIN'
    | 'ANALYTICS CALCULATION IN PROGRESS'
    | 'ANALYTICS PENDING REVIEW'
    | 'ANALYTICS SENT TO ALADDIN'
    | 'ANALYTICS VERIFIED IN ALADDIN';

export type VerifyAnalyticsRequest = {
    assetAnalyticsSetupId: number;
    updatedBy: string;
};

export type PublishAnalyticsInputResponse = {
    response: NewAsset[];
    numberOfResults: number;
};

export type FilePreviewRequestCollection = {
    assetAnalyticsSetupId: number;
    aladdinId: string;
};

export type RequestedNewAsset = {
    aladdinId: string;
    price: number;
    assetType: string;
    requestedBy: string;
    cdiCduBlob: string;
    payload: Array<{ type: string; parameters: { callDate?: string; collateralType?: string } }>;

    assetClass: string;
    instrumentType: string;
    analysisDate: string;
};

export type RequestNewAssetPayload = {
    assets: Array<RequestedNewAsset>;
};
export type AbandonAssetPayload = {
    assetAnalyticsSetupId: number | null | undefined;
    updatedBy: string;
    noteText: string;
}
export type TRAPDatePickerProps = {
    id?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    format?: string;
    disabled?: boolean;
    allowClear?: boolean;

    value?: string | null;

    onChange?: (valueString: string, valueDayjs: Dayjs | null) => void;
};

// Claim Asset Payload
export type AnchorType = 'NAAID';

export type Claim = {
    anchorType: AnchorType;
    anchorId: number;
    claimedBy: string;
};

export type ClaimAssetPayload = {
    claims: Claim[];
};

export type NoteType = {
    anchorId: number;
    anchorType: string;
    createdBy: string;
    createdDate: string;
    noteText: string;
    noteType: string;
    reviewNoteId: number;
    lastModifiedBy: string;
    lastModifiedDate: string;
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
