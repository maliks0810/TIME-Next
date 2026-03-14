import { serviceRequest } from '../lib/serviceUtils';
import { NewAssetAnalyticsResponse } from './types';

const getModelInputByIdUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/get-analytics-input-by-id';

export const getModelInputById = async (
    assetAnalyticsSetupId: number
): Promise<{ data: NewAssetAnalyticsResponse }> =>
    serviceRequest(getModelInputByIdUrl)().post('', { assetAnalyticsSetupId });
