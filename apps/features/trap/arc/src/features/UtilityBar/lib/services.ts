import { serviceRequest } from '../../../lib/serviceUtils';
import {  AcceptAssetPayload,  RejectAssetPayload,AbandonAssetPayload, DownloadBRSRequestCollection, FilePreviewRequestCollection } from './types';

const abandonAssetUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/abandon';
const acceptAssetUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/accept-correction';
const rejectAssetUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/reject-correction';

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

const downloadBrsFileUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/download-brs-file';


export const abandonAsset = (payload: AbandonAssetPayload): Promise<void> =>
    serviceRequest(abandonAssetUrl)().post('', payload);

export const acceptAsset = (payload: AcceptAssetPayload): Promise<void> =>
    serviceRequest(acceptAssetUrl)().post('', payload);

export const rejectAsset = (payload: RejectAssetPayload): Promise<void> =>
    serviceRequest(rejectAssetUrl)().post('', payload);


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

export const downloadBrsFileAPI = (payload: DownloadBRSRequestCollection) =>
    serviceRequest(downloadBrsFileUrl)().post('', payload, {
        responseType: 'blob',
    });
