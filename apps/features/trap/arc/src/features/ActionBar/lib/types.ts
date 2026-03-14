export type UpdateStatusRequest = {
    assetAnalyticsSetupId: number;
    status: string;
    updatedBy: string;
};

export type PublishRequestPayload = {
    assetAnalyticsSetupId: number;
    updatedBy: string;
};
