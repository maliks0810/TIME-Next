import { serviceRequest } from '../../../lib/serviceUtils';
import { SecuritySettingsType } from './types';

const getSecuritySettingsUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/new-asset/get-security-settings-by-id';

export const getSecuritySettings = (
    assetAnalyticsSetupId: number
): Promise<{ data: { response: SecuritySettingsType[] } }> =>
    serviceRequest(getSecuritySettingsUrl)().post('', { assetAnalyticsSetupId });
