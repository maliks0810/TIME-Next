import { DealData } from './mockData';

export const normaliseDeal = (result: Record<string, unknown> | undefined): DealData | null => {
    if (result && typeof result === 'object' && result.intexDealName) {
        return result as unknown as DealData;
    }
    // No result from server yet — show empty state
    return null;
};
