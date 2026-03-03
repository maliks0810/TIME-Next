import { NoteType } from '../../../lib/types';

export type NewAssetType = {
    assetAnalyticsSetupId: number | null;
    newAssetRequestId: number | null;
    aladdinId: string | null;
    price: number;
    assetType: string;
    assetSubType: string | null;
    status: string;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    cdiCduBlob: string;
    payload: string;
    assetClass: string;
    instrumentType: string;
    analysisDate: string;

    //Requested to add new fields for this endpoint
    claimedBy: string | null;
    claimedAt: string | null;
};

export type NewAssetAnalyticsRepsonse = {
    notes: { response: NoteType[] };
    response: NewAssetType;
};
