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
    /** Callback on save error */
    onError?: (error: Error) => void;

    /** Callback on successful save */
    onSaved?: () => void;
}

interface UseSecuritySetupSaveReturn {
    /** Current save status */
    saveStatus: SaveStatus;

    /** Queue wizard data for saving */
    queueWizardSave: (
        step: WizardStep,
        stepNumber: number,
        accumulatedData: Record<string, unknown>,
        saveType?: 'partial' | 'complete'
    ) => void;

    /** Force immediate save (bypasses debounce) */
    forceSave: () => Promise<void>;

    /** Clear error state to allow retries */
    clearError: () => void;

    /** Last saved timestamp */
    lastSavedAt: Date | null;

    /** Any pending error */
    error: Error | null;
}

/**
 * Hook for managing save of Security Setup wizard data
 */
export const useSecuritySetupSave = (
    options: UseSecuritySetupSaveOptions = {}
): UseSecuritySetupSaveReturn => {
    const { onError, onSaved } = options;

    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [error, setError] = useState<Error | null>(null);

    // Refs for managing async operations
    const pendingPayloadRef = useRef<ISecuritySetupWizardPayload | null>(null);
    const isMountedRef = useRef(true);

    const onErrorRef = useRef(onError);
    const onSavedRef = useRef(onSaved);

    useEffect(() => {
        onErrorRef.current = onError;
        onSavedRef.current = onSaved;
    }, [onError, onSaved]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /**
     * Process background save - fire and forget pattern
     */
    const processBackgroundSave = useCallback(async (payload: ISecuritySetupWizardPayload) => {
        try {
            if (!isMountedRef.current) return;
            setSaveStatus('saving');
            setError(null);

            await SecuritySetupService.upsertWizardData(payload);

            if (!isMountedRef.current) return;

            setSaveStatus('saved');
            setLastSavedAt(new Date());
            onSavedRef.current?.();

            setTimeout(() => {
                if (isMountedRef.current) {
                    setSaveStatus('idle');
                }
            }, 2000);
        } catch (err) {
            if (!isMountedRef.current) return;

            const error = err instanceof Error ? err : new Error('Save failed');

            console.error('Save failed:', error.message);

            setSaveStatus('error');
            setError(error);
            onErrorRef.current?.(error);
        }
    }, []);

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
        ) => {
            const payload = {
                currentStep: step,
                currentStepNumber: stepNumber,
                savedAt: new Date().toISOString(),
                saveType,
                ...accumulatedData, // Spread all accumulated wizard data
            } as ISecuritySetupWizardPayload;

            processBackgroundSave(payload);
        },
        [processBackgroundSave]
    );

    /**
     * Force immediate save (bypasses debounce)
     */
    const forceSave = useCallback(async () => {
        if (pendingPayloadRef.current) {
            await processBackgroundSave(pendingPayloadRef.current);
        }
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
    };
};
