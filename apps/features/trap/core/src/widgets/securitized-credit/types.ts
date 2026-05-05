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
