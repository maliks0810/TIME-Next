import { serviceRequest } from '../../../lib/serviceUtils';
import { NewAssetAnalyticsRepsonse } from './types';

const getModelInputByIdUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/get-analytics-input-by-id';

export const getModelInputById = (
    assetAnalyticsSetupId: number
): Promise<{ data: NewAssetAnalyticsRepsonse }> =>
    serviceRequest(getModelInputByIdUrl)().post('', { assetAnalyticsSetupId });
