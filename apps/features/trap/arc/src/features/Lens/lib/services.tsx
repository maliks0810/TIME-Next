import { serviceRequest } from '../../../lib/serviceUtils';
import { AnalyticsHistoryApiResponse } from './types';

const getAnalyticsHistoryByAladdinIdUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/lens/audit';
const getSimilarAladdinIdUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/lens/search-suggestion';
const downloadBRSFileZipUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/lens/download-interface-files';
const getAladdinIdWithinDaysRangeUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/lens/aladdinId-within-days-range';

export const getAnalyticsHistory= (
    aladdinId: string
): Promise<{ data: AnalyticsHistoryApiResponse }> =>
    serviceRequest(getAnalyticsHistoryByAladdinIdUrl)().post('', { aladdinId });

export const getAladdinIdRecommendations= (
    aladdinId: string,
): Promise<{ data: string[] }> =>
    serviceRequest(getSimilarAladdinIdUrl)().post('', { aladdinId });

export const downloadBRSFileZip= (
    assetAnalyticsSetupId: number
) => serviceRequest(downloadBRSFileZipUrl)().post('', { assetAnalyticsSetupId }, {
        responseType: 'blob',
    });

export const getAladdinIdWithinDaysRange= (
    begin: number,
    end: number
): Promise<{ data: string[] }> =>
    serviceRequest(getAladdinIdWithinDaysRangeUrl)().post('', { begin, end });