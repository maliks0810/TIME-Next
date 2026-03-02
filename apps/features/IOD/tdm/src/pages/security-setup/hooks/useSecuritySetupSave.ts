/**
 * useSecuritySetupSave Hook
 *
 * Custom React hook for managing non-blocking, debounced auto-saves
 * of Security Setup wizard data.
 *
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { SecuritySetupService } from '../../../services/SecuritySetupService';
import {
    ISecuritySetupWizardPayload,
    WizardStep,
} from '../../../services/domain-objects/SecuritySetupRequestPayload';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseSecuritySetupSaveOptions {
    onError?: (error: Error) => void;
    onSaved?: () => void;
    initialSecuritySetupRequestId?: number | null;
}

interface UseSecuritySetupSaveReturn {
    saveStatus: SaveStatus;

    /** Queue wizard data for saving */
    queueWizardSave: (
        step: WizardStep,
        stepNumber: number,
        accumulatedData: Record<string, unknown>,
        saveType?: 'partial' | 'complete'
    ) => Promise<Partial<ISecuritySetupWizardPayload> | null>;
    forceSave: () => Promise<Partial<ISecuritySetupWizardPayload> | null>;
    clearError: () => void;
    lastSavedAt: Date | null;
    error: Error | null;
    securitySetupRequestId: number | null;
}

/**
 * Hook for managing save of Security Setup wizard data
 */
export const useSecuritySetupSave = (
    options: UseSecuritySetupSaveOptions = {}
): UseSecuritySetupSaveReturn => {
    const { onError, onSaved, initialSecuritySetupRequestId } = options;

    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const [securitySetupRequestId, setSecuritySetupRequestId] = useState<number | null>(
        initialSecuritySetupRequestId ?? null
    );
    const securitySetupRequestIdRef = useRef<number | null>(initialSecuritySetupRequestId ?? null);

    // Refs for managing async operations
    const pendingPayloadRef = useRef<ISecuritySetupWizardPayload | null>(null);
    const isMountedRef = useRef(true);

    const onErrorRef = useRef(onError);
    const onSavedRef = useRef(onSaved);

    useEffect(() => {
        onErrorRef.current = onError;
        onSavedRef.current = onSaved;
    }, [onError, onSaved]);

    useEffect(() => {
        if (initialSecuritySetupRequestId != null) {
            securitySetupRequestIdRef.current = initialSecuritySetupRequestId;
            setSecuritySetupRequestId(initialSecuritySetupRequestId);
        }
    }, [initialSecuritySetupRequestId]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /**
     * Call the API and return the transformed response so callers can merge server
     * data into wizard state.  Also captures securitySetupRequestId from POST responses.
     */
    const processBackgroundSave = useCallback(
        async (
            payload: ISecuritySetupWizardPayload
        ): Promise<Partial<ISecuritySetupWizardPayload> | null> => {
            try {
                if (!isMountedRef.current) {
                    return null;
                }
                setSaveStatus('saving');
                setError(null);

                const savedData = await SecuritySetupService.upsertWizardData(
                    payload,
                    securitySetupRequestIdRef.current
                );

                if (!isMountedRef.current) {
                    return null;
                }

                // Capture the id from a POST so subsequent calls use PUT
                if (savedData.securitySetupRequestId && !securitySetupRequestIdRef.current) {
                    securitySetupRequestIdRef.current = savedData.securitySetupRequestId;
                    setSecuritySetupRequestId(savedData.securitySetupRequestId);
                }

                setSaveStatus('saved');
                setLastSavedAt(new Date());
                onSavedRef.current?.();

                setTimeout(() => {
                    if (isMountedRef.current) {
                        setSaveStatus('idle');
                    }
                }, 2000);

                return savedData;
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return null;
                if (!isMountedRef.current) return null;

                const error = err instanceof Error ? err : new Error('Save failed');
                console.error('Save failed:', error.message);
                setSaveStatus('error');
                setError(error);
                onErrorRef.current?.(error);
                return null;
            }
        },
        []
    );

    /**
     * Queue wizard data for background saving
     *
     * @param step - Current wizard step
     * @param stepNumber - Current step number (1-6)
     * @param accumulatedData - ALL accumulated wizard data (not just current step)
     * @param saveType - 'partial' for in-progress edits, 'complete' for step completion
     */
    const queueWizardSave = useCallback(
        (
            step: WizardStep,
            stepNumber: number,
            accumulatedData: Record<string, unknown>,
            saveType: 'partial' | 'complete' = 'partial'
        ): Promise<Partial<ISecuritySetupWizardPayload> | null> => {
            const payload = {
                currentStep: step,
                currentStepNumber: stepNumber,
                savedAt: new Date().toISOString(),
                saveType,
                ...accumulatedData, // Spread all accumulated wizard data
            } as ISecuritySetupWizardPayload;

            pendingPayloadRef.current = payload;
            return processBackgroundSave(payload);
        },
        [processBackgroundSave]
    );

    /**
     * Force immediate save (bypasses debounce)
     */
    const forceSave = useCallback((): Promise<Partial<ISecuritySetupWizardPayload> | null> => {
        if (pendingPayloadRef.current) {
            return processBackgroundSave(pendingPayloadRef.current);
        }
        return Promise.resolve(null);
    }, [processBackgroundSave]);

    const clearError = useCallback(() => {
        setError(null);
        setSaveStatus('idle');
    }, []);

    return {
        saveStatus,
        queueWizardSave,
        forceSave,
        clearError,
        lastSavedAt,
        error,
        securitySetupRequestId,
    };
};
