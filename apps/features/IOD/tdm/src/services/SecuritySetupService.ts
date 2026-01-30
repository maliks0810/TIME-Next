import { getApiBaseUrl } from '../constants/environments';
import { transformToApiDomain } from '../pages/security-setup/utils/securitySetupApiTransformer';
import {
    ISaveWizardResponse,
    ISecuritySetupWizardPayload,
} from './domain-objects/SecuritySetupRequestPayload';

const API_BASE_URL = getApiBaseUrl();
const SECURITY_SETUP_ENDPOINT = '/securitysetuprequests';

/**
 * Service for managing Security Setup wizard persistence
 */
export const SecuritySetupService = {
    /**
     * Upsert wizard data to the API (non-blocking)
     *
     * @param payload - Complete wizard data to save/update
     * @returns Promise resolving to save response with Presentation object
     */
    upsertWizardData: async (
        payload: ISecuritySetupWizardPayload
    ): Promise<ISaveWizardResponse> => {
        try {
            const domainPayload = transformToApiDomain(payload);
            const securitySetupPayload = {
                securitySetupRequests: [domainPayload],
            };

            const response = await fetch(`${API_BASE_URL}${SECURITY_SETUP_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(securitySetupPayload),
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => response.statusText);
                throw new Error(`Failed to save wizard data:( ${response.status}: ${errorText})`);
            }

            const results = await response.json();

            return {
                success: results.length > 0 && !!results[0],
                data: results[0],
                errors: results[0]?.errors,
            };
        } catch (error) {
            throw error;
        }
    },
};
