export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export type RecentDeal = {
    dealId: string;
    dealName: string;
    sourceType: 'zip' | 'cdi';
    uploadedAt: string;
    uploadedBy: string;
    packagePath: string;
    sessionId: string;
};
export type DealFromIntex = {
    dealName: string;
    extractedPath: string;
    packagePath: string;
    hasCdi: boolean;
    hasCdu: boolean;
    blobPath: string;
    sourceType: 'intex-fetch';
    uploadedBy: string;
    uploadedAt: string;
};