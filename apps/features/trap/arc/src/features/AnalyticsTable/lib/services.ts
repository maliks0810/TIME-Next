import { serviceRequest } from '../../../lib/serviceUtils';
import { AnalyticsByIdResponse } from './types';

const getAnalyticsByIdUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/get-analytics-by-request-id';

export const getAnalyticsById = (
    assetAnalyticsSetupId: number
): Promise<{ data: AnalyticsByIdResponse }> =>
    serviceRequest(getAnalyticsByIdUrl)().post('', { assetAnalyticsSetupId });
