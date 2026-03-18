/**
 * Security Setup Payload Mapper
 */

import {
    ISecuritySetupWizardPayload,
    WizardStep,
} from '../../../services/domain-objects/SecuritySetupRequestPayload';
import {
    IEnterIdentifierFormValues,
    IReviewDetailsFormValues,
} from '../lib/types/securitySetupTypes';

/**
 * Maps Enter Identifier form values to payload fields
 */
export const mapEnterIdentifierToPayload = (
    formValues: IEnterIdentifierFormValues
): Partial<ISecuritySetupWizardPayload> => {
    return {
        // New Issue
        newIssue: formValues.newIssue || null,

        // CDI Upload
        cdiFileUploadedToAnser: formValues.cdiFileUploadedToAnser || null,
        aladdinCDIId: formValues.aladdinCDIId || null,

        // Private Deal
        isPrivateDeal: formValues.isPrivateDeal || false,
        ssapIdPassword: formValues.ssapIdPassword || null,
        isSsapReleaseRequestSentToDm: formValues.isSsapReleaseRequestSentToDm,
        isSsapReleasedByDm: formValues.isSsapReleasedByDm,

        // Bloomberg Identifier
        identifierType: formValues.identifierType || null,
        identifierValue: formValues.identifierValue || null,
        marketSector: formValues.marketSector || null,
        yellowKey: formValues.yellowKey || null,

        // EU Security Verification
        isEuSecuritizationRequired: formValues.isEuSecuritizationRequired || null,
        euSecuritizationTipEuId: formValues.euSecuritizationTipEuId || null,
        euSecuritizationStatus: formValues.euSecuritizationStatus || null,
        erisaStatus: formValues.erisaStatus || null,
        // Deal Name
        intexDealName: formValues.intexDealName || null,
        intexPassword: formValues.intexPassword || null,
        dealName: formValues.dealName || null,
    };
};

/**
 * Maps Review Details form values to payload fields
 */
export const mapReviewDetailsToPayload = (
    formValues: IReviewDetailsFormValues
): Partial<ISecuritySetupWizardPayload> => {
    return {
        // Nested objects matching the payload interface
        securityDetails: formValues.securityDetails,
        esgFields: formValues.esgFields,
        tradeFields: formValues.tradeFields,
        notesInstructions: formValues.notesInstructions,
    };
};

/**
 * Main mapper function that combines all form data into a complete payload
 *
 * @param wizardData - Accumulated wizard form data from all steps
 * @param currentStep - Current wizard step
 * @param currentStepNumber - Current step number (1-4)
 * @param saveType - 'partial' or 'complete'
 * @returns Complete payload ready for API submission
 */
export const mapWizardDataToPayload = (
    wizardData: {
        enterIdentifierValues?: IEnterIdentifierFormValues;
        reviewDetailsValues?: IReviewDetailsFormValues;
    },
    currentStep: WizardStep,
    currentStepNumber: number,
    saveType: 'partial' | 'complete' = 'partial'
): ISecuritySetupWizardPayload => {
    const enterIdentifierPayload = wizardData.enterIdentifierValues
        ? mapEnterIdentifierToPayload(wizardData.enterIdentifierValues)
        : {};

    const reviewDetailsPayload = wizardData.reviewDetailsValues
        ? mapReviewDetailsToPayload(wizardData.reviewDetailsValues)
        : {};

    return {
        // Required wizard metadata
        currentStep,
        currentStepNumber,
        savedAt: new Date().toISOString(),
        saveType,

        // Merge all step data
        ...enterIdentifierPayload,
        ...reviewDetailsPayload,
    };
};

/**
 * Maps API response data back to frontend form values (for loading saved state)
 * This is the reverse operation of the mapping functions above
 */
export const mapPayloadToFormValues = (
    payload: Partial<ISecuritySetupWizardPayload>
): {
    enterIdentifierValues: Partial<IEnterIdentifierFormValues>;
    reviewDetailsValues: Partial<IReviewDetailsFormValues>;
} => {
    return {
        enterIdentifierValues: {
            newIssue: payload.newIssue || undefined,
            cdiFileUploadedToAnser: payload.cdiFileUploadedToAnser || undefined,
            aladdinCDIId: payload.aladdinCDIId || undefined,
            isPrivateDeal: payload.isPrivateDeal || undefined,
            ssapIdPassword: payload.ssapIdPassword || undefined,
            isSsapReleaseRequestSentToDm: payload.isSsapReleaseRequestSentToDm,
            isSsapReleasedByDm: payload.isSsapReleasedByDm,
            identifierType: payload.identifierType || undefined,
            identifierValue: payload.identifierValue || undefined,
            marketSector: payload.marketSector || undefined,
            yellowKey: payload.yellowKey || undefined,
            isEuSecuritizationRequired: payload.isEuSecuritizationRequired || undefined,
            euSecuritizationTipEuId: payload.euSecuritizationTipEuId || undefined,
            euSecuritizationStatus: payload.euSecuritizationStatus|| undefined,
            erisaStatus: payload.erisaStatus || undefined,
            intexDealName: payload.intexDealName || undefined,
            intexPassword: payload.intexPassword || undefined,
            dealName: payload.dealName || undefined,
        },
        reviewDetailsValues: {
            securityDetails: payload.securityDetails,
            esgFields: payload.esgFields,
            tradeFields: payload.tradeFields,
            notesInstructions: payload.notesInstructions,
        },
    };
};
