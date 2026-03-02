import { getApiBaseUrl } from '../constants/environments';
import {
    transformFromApiPresentation,
    transformToApiDomain,
} from '../pages/security-setup/utils/securitySetupApiTransformer';
import { ISecuritySetupWizardPayload } from './domain-objects/SecuritySetupRequestPayload';

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
        payload: ISecuritySetupWizardPayload,
        securitySetupRequestId?: number | null
    ): Promise<Partial<ISecuritySetupWizardPayload>> => {
        const domainPayload = transformToApiDomain(payload);

        if (securitySetupRequestId) {
            domainPayload.SecuritySetupRequestId = securitySetupRequestId;
        }

        const securitySetupPayload = {
            securitySetupRequests: [domainPayload],
        };

        const method = securitySetupRequestId ? 'PUT' : 'POST';

        const response = await fetch(`${API_BASE_URL}${SECURITY_SETUP_ENDPOINT}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(securitySetupPayload),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => response.statusText);
            throw new Error(`Failed to save wizard data (${response.status}): ${errorText}`);
        }

        const rsponseData = await response.json();
        const rawResponse = rsponseData?.securitySetupRequestCollection?.[0];
        return transformFromApiPresentation(rawResponse);
    },

    getWizardData: async (
        securitySetupId: string
    ): Promise<Partial<ISecuritySetupWizardPayload>> => {
        const response = await fetch(
            `${API_BASE_URL}${SECURITY_SETUP_ENDPOINT}?securitySetupRequestIds=${securitySetupId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text().catch(() => response.statusText);
            throw new Error(`Failed to fetch wizard data: ( ${response.status}: ${errorText})`);
        }

        const presentationData = await response.json();
        return transformFromApiPresentation(presentationData?.securitySetupRequestCollection?.[0]);
    },
};
