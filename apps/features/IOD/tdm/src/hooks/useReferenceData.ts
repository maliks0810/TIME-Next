import { useState, useEffect, useCallback } from 'react';
import { INormalizedReferenceData } from '../pages/security-setup/lib/types/referenceDataTypes';
import { ReferenceDataService } from '../services/ReferenceDataService';

interface UseReferenceDataResult {
    data: INormalizedReferenceData | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

export const useReferenceData = (): UseReferenceDataResult  => {
    const [data, setData] = useState<INormalizedReferenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await ReferenceDataService.fetchReferenceData();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch reference data'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refresh = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    return { data, loading, error, refresh };
};
