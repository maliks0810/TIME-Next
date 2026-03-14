import { serviceRequest } from '../../../lib/serviceUtils';
import { PublishRequestPayload, UpdateStatusRequest } from './types';

const updateStatusUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/update-status';
const publishAnalyticsUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/publish-analytics';
const publishAnalyticsInputUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/publish-analytics-input';

export const postNewAssetStatus = (payload: UpdateStatusRequest) =>
    serviceRequest(updateStatusUrl)().post('', payload);

export const publishAnalyticsInput = (payload: PublishRequestPayload) =>
    serviceRequest(publishAnalyticsInputUrl)().post('', payload);

export const postVerifyAnalytics = (payload: PublishRequestPayload) =>
    serviceRequest(updateStatusUrl)().post('', {
        ...payload,
        status: 'ANALYTICS SENT TO ALADDIN',
    });

export const publishAnalytics = (payload: PublishRequestPayload) =>
    serviceRequest(publishAnalyticsUrl)().post('', {
        ...payload,
    });

export const postVerifyAnalyticsOnAladdin = (payload: PublishRequestPayload) =>
    serviceRequest(updateStatusUrl)().post('', {
        ...payload,
        status: 'ANALYTICS VERIFIED IN ALADDIN',
    });
