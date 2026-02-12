import axios from 'axios';
import {
    UpdateStatusRequest,
    AnalyticsInputRequestCollection,
    StatusResponse,
    VerifyAnalyticsRequest,
    PublishAnalyticsInputResponse,
    PublishAnalyticsRequest,
    RequestNewAssetPayload,
    NewAsset,
    NewAssetAnalyticsRepsonse,
    ClaimAssetPayload,
    AnalyticsByIdResponse,
    AnalyticsRequest,
    NoteType,
    FilePreviewRequestCollection,
} from './types';

const DEFAULT_CONTENT_TYPE = 'application/json';
const DEFAULT_TIMEOUT = 120000; // 2 min

const statusCheckUrl =
    import.meta.env.VITE_R2_TRAP_PRISM_SERVICE + '/api/v1/new-asset/status?user=gatska';

const downloadFileUrl =
    import.meta.env.VITE_R2_TRAP_PRISM_SERVICE + '/api/v1/document/download-file/session/';

const requestNewAssetUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/request-analytics';

const getNewAssetAnalyticsInputUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/get-analytics-summary';
const updateStatusUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/update-status';
const publishAnalyticsInputUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/publish-analytics-input';

const previewBondFeaturesUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/preview-bond-features';

const previewStaticScenariosUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/preview-static-scenarios';

const previewAnalyticsOverrideUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/preview-analytics';

const downloadBondFeaturesUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/download-bond-features';

const downloadStaticScenariosUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/download-static-scenarios';

const downloadAnalyticsOverrideUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/download-analytics-override';

const newAssetAnalyticsRequestUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/analytics';

const updateAnalyticsRequestUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/update-analytics';
const updateAnalyticsInputRequestUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/update-analytics-input';

const getAnalyticsByIdUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/get-analytics-by-request-id';

const getNotesUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/get-notes';
const publishAnalyticsUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/publish-analytics';

const getModelInputByIdUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/get-analytics-input-by-id';

const claimAssetUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/claim-asset?';

export const generateUUID = (): string => crypto.randomUUID();

export const serviceRequest =
    (
        baseURL: string,
        contentType: string = DEFAULT_CONTENT_TYPE,
        timeout: number = DEFAULT_TIMEOUT
    ) =>
    () =>
        axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': contentType,
                'X-Correlation-ID': generateUUID(),
            },
        });

export const fetchStatus = () => serviceRequest(statusCheckUrl)().post<StatusResponse>('');

export const downloadFile = () => serviceRequest(downloadFileUrl)().get('');

export const submitTranche = () => {
    //TODO: implement
};

export const getNewAssets = () => serviceRequest(getNewAssetAnalyticsInputUrl)().post('');

export const postNewAssetStatus = (payload: UpdateStatusRequest) =>
    serviceRequest(updateStatusUrl)().post('', payload);

export const publishAnalyticsInput = (
    payload: AnalyticsInputRequestCollection
): Promise<PublishAnalyticsInputResponse> =>
    serviceRequest(publishAnalyticsInputUrl)().post('', payload);

export const previewBondFeaturesAPI = (payload: FilePreviewRequestCollection) =>
    serviceRequest(previewBondFeaturesUrl)().post('', payload);

export const previewStaticScenariosAPI = (payload: FilePreviewRequestCollection) =>
    serviceRequest(previewStaticScenariosUrl)().post('', payload);

export const previewAnalyticsOverrideAPI = (payload: FilePreviewRequestCollection) =>
    serviceRequest(previewAnalyticsOverrideUrl)().post('', payload);

export const downloadBondFeaturesAPI = (payload: FilePreviewRequestCollection) =>
    serviceRequest(downloadBondFeaturesUrl)().post('', payload);

export const downloadStaticScenariosAPI = (payload: FilePreviewRequestCollection) =>
    serviceRequest(downloadStaticScenariosUrl)().post('', payload);

export const downloadAnalyticsOverrideAPI = (payload: FilePreviewRequestCollection) =>
    serviceRequest(downloadAnalyticsOverrideUrl)().post('', payload);

export const postVerifyAnalytics = (payload: VerifyAnalyticsRequest) =>
    serviceRequest(updateStatusUrl)().post('', {
        ...payload,
        status: 'ANALYTICS SENT TO ALADDIN',
    });

export const publishAnalytics = (payload: PublishAnalyticsRequest) =>
    serviceRequest(publishAnalyticsUrl)().post('', {
        ...payload,
    });

export const postVerifyAnalyticsOnAladdin = (payload: VerifyAnalyticsRequest) =>
    serviceRequest(updateStatusUrl)().post('', {
        ...payload,
        status: 'ANALYTICS VERIFIED IN ALADDIN',
    });

export const getAnalyticsById = (
    assetAnalyticsSetupId: number
): Promise<{ data: AnalyticsByIdResponse }> =>
    serviceRequest(getAnalyticsByIdUrl)().post('', { assetAnalyticsSetupId });

export const getNewAssetAnalytics = () => serviceRequest(newAssetAnalyticsRequestUrl)().post('');

export const getModelInputById = (
    assetAnalyticsSetupId: number
): Promise<{ data: NewAssetAnalyticsRepsonse }> =>
    serviceRequest(getModelInputByIdUrl)().post('', { assetAnalyticsSetupId });

export const requestNewAsset = (
    payload: RequestNewAssetPayload
): Promise<{ data: { response: NewAsset[] } }> =>
    serviceRequest(requestNewAssetUrl)().post('', payload);

export const claimAsset = (
    payload: ClaimAssetPayload
): Promise<{ data: { response: NewAsset[] } }> => serviceRequest(claimAssetUrl)().post('', payload);

export const updateAnalyticsOverrides = (payload: {
    assets: AnalyticsRequest[];
}): Promise<{ data: { response: NewAsset[] } }> =>
    serviceRequest(updateAnalyticsRequestUrl)().post('', payload);

export const updateAnalyticsInputOverrides = (payload: {
    assets: AnalyticsRequest[];
}): Promise<{ data: { response: NewAsset[] } }> =>
    serviceRequest(updateAnalyticsInputRequestUrl)().post('', payload);

export const getNotes = (
    assetAnalyticsSetupId: number
): Promise<{ data: { response: NoteType[] } }> =>
    serviceRequest(getNotesUrl)().post('', { assetAnalyticsSetupId });
