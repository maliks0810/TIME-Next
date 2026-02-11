import { getApiBaseUrl } from '../constants/environments';
import type {
    IGetReferenceDataResponse,
    INormalizedReferenceData,
    ReferenceDataCollection,
} from '../pages/security-setup/lib/types/referenceDataTypes';

const API_BASE_URL = getApiBaseUrl();
const REFERENCE_DATA_ENDPOINT = '/referencedata';

/**
 * Service for fetching reference data for dropdowns
 */
export const ReferenceDataService = {
    fetchReferenceData: async (): Promise<INormalizedReferenceData> => {
        try {
            const queryParams = new URLSearchParams({
                isPagingEnabled: 'true',
                pageCursor: '0',
            });

            const url = `${API_BASE_URL}${REFERENCE_DATA_ENDPOINT}?${queryParams}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => response.statusText);
                throw new Error(
                    `Failed to fetch reference data (${response.status}): ${errorText}`
                );
            }

            const data: IGetReferenceDataResponse = await response.json();

            // Validate response structure
            if (!data.referenceData || !Array.isArray(data.referenceData)) {
                throw new Error('Invalid reference data response: missing referenceData array');
            }

            // Normalize data for easy lookup
            return ReferenceDataService.normalizeReferenceData(data);
        } catch (error) {
            // Re-throw with context
            if (error instanceof Error) {
                throw new Error(`ReferenceDataService.fetchReferenceData: ${error.message}`);
            }
            throw error;
        }
    },

    normalizeReferenceData: (response: IGetReferenceDataResponse): INormalizedReferenceData => {
        const byKey: ReferenceDataCollection = {};

        response.referenceData.forEach((refData) => {
            byKey[refData.FieldDropdownKey] = refData;
        });

        return {
            byKey,
            all: response.referenceData,
            fetchedAt: new Date().toISOString(),
        };
    },
};
