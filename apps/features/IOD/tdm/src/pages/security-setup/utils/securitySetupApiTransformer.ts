/**
 * Security Setup API Transformer
 *
 * Handles transformations between frontend internal payload format and API contract formats.
 *
 * SEPARATION OF CONCERNS:
 * - securitySetupPayloadMapper.ts: Form data ↔ Frontend internal payload (UI layer)
 * - securitySetupApiTransformer.ts: Frontend payload ↔ API objects (API contract layer)
 * - securitySetupService.ts: Orchestration and HTTP calls (infrastructure layer)
 *
 * TRANSFORMATION RESPONSIBILITIES:
 * - Transform frontend payload to API Domain object (for requests)
 * - Transform API Presentation object to frontend payload (for responses)
 */

import {
    ISecuritySetupRequestDomain,
    ISecuritySetupRequestPresentation,
    ISecuritySetupWizardPayload,
    WizardStep,
} from '../../../services/domain-objects/SecuritySetupRequestPayload';

/**
 * Transform frontend payload to API Domain object format
 *
 * @param payload - Frontend internal payload
 * @returns API Domain object ready for request
 */
export const transformToApiDomain = (
    payload: ISecuritySetupWizardPayload
): ISecuritySetupRequestDomain => {
    const parsePrice = (price?: string | null): number | null => {
        if (!price) return null;
        const parsed = parseFloat(price);
        return isNaN(parsed) ? null : parsed;
    };

    return {
        // Map frontend fields to C# Domain Object properties
        IsNewIssue: payload.newIssue === 'yes' ? true : payload.newIssue === 'no' ? false : null,
        IsCdiFileUploadedToAnswer:
            payload.cdiFileUploadedToAnser === 'yes'
                ? true
                : payload.cdiFileUploadedToAnser === 'no'
                  ? false
                  : null,
        AladdinCdiId: payload.aladdinCDIId || '',
        IsPrivateDeal:
            payload.privateDeal === 'yes' ? true : payload.privateDeal === 'no' ? false : null,
        SsapIdPassword: payload.ssapIdPassword || '',
        IsSsapReleaseRequestSentToDm: payload.ssapApproved || null,
        IdentifierTypeValue: payload.identifierType || '',
        IdentifierValue: payload.identifierValue || '',
        MarketSectorTypeValue: payload.marketSector || '',
        YellowKey: payload.yellowKey || '',
        IsEuSecuritizationRequired: payload.securityDetails?.isEuSecuritizationRequired ?? null,
        EuSecuritizationTipEuId: payload.securityDetails?.euSecuritizationTipEuId || '',

        // Security Details
        Description: payload.securityDetails?.description || '',
        Sector: payload.securityDetails?.sector || '',
        CallDate: payload.securityDetails?.callDate || null,
        Tranche: payload.securityDetails?.tranche || '',
        Price: parsePrice(payload.securityDetails?.price),
        IsCallable: payload.securityDetails?.isCallable ?? false,
        Cusip: payload.securityDetails?.cusip || '',

        // ESG Fields (dropdown values)
        TcwEsgValue: payload.esgFields?.tcwEsgValue || '',
        TcwEsgTypeValue: payload.esgFields?.tcwEsgTypeValue || '',
        EsgCollateralType: payload.esgFields?.esgCollateralType || '',

        // Trade Fields (dropdown values)
        SlicerTypeValue: payload.tradeFields?.slicerTypeValue || '',
        LoanCreditValue: payload.tradeFields?.loanCreditValue || '',
        MbsCollateralSubValue: payload.tradeFields?.mbsCollateralSubValue || '',
        TrancheTypeValue: payload.tradeFields?.trancheTypeValue || '',
        CollateralValue: payload.tradeFields?.collateralValue || '',
        MbsTypeValue: payload.tradeFields?.mbsTypeValue || '',
        MbsCollateralValue: payload.tradeFields?.mbsCollateralValue || '',
        SeniorMostCashFlowValue: payload.tradeFields?.seniorMostCashFlowValue || '',
        LoanCategoryValue: payload.tradeFields?.loanCategoryValue || '',
        FfiecQual: payload.tradeFields?.ffiecQual || '',

        // Notes
        NoteInstructions: payload.notesInstructions || '',

        // Wizard metadata
        CurrentStepDescription: payload.currentStep,
        CurrentStepNumber: payload.currentStepNumber,
        SaveType: payload.saveType,
    };
};

/**
 * Transform API Presentation object to frontend payload format
 *
 * @param presentation - API Presentation object from response
 * @returns Frontend internal payload
 */
export const transformFromApiPresentation = (
    presentation: ISecuritySetupRequestPresentation
): Partial<ISecuritySetupWizardPayload> => {
    return {
        // ID for PUT calls
        securitySetupRequestId: presentation.securitySetupRequestId,

        // Wizard metadata
        currentStep: presentation.currentStepDescription as WizardStep,
        currentStepNumber: presentation.currentStepNumber || 1,
        savedAt: presentation.updatedDate || presentation.createdDate,
        saveType: (presentation.saveType as 'partial' | 'complete') || 'partial',

        // Step fields
        newIssue:
            presentation.isNewIssue === true
                ? 'yes'
                : presentation.isNewIssue === false
                  ? 'no'
                  : null,
        cdiFileUploadedToAnser:
            presentation.isCdiFileUploadedToAnswer === true
                ? 'yes'
                : presentation.isCdiFileUploadedToAnswer === false
                  ? 'no'
                  : null,
        aladdinCDIId: presentation.aladdinCdiId || null,
        privateDeal:
            presentation.isPrivateDeal === true
                ? 'yes'
                : presentation.isPrivateDeal === false
                  ? 'no'
                  : null,
        ssapIdPassword: presentation.ssapIdPassword || null,
        ssapApproved: presentation.isSsapReleasedByDm || undefined,
        identifierType: presentation.identifierTypeValue || null,
        identifierValue: presentation.identifierValue || null,
        marketSector: presentation.marketSectorTypeValue || null,
        yellowKey: presentation.yellowKey || null,
        euSecurityVerificationRequired: presentation.isEuSecuritizationRequired ? 'yes' : 'no',
        euSecuritizationTipEuId: presentation.euSecuritizationTipEuId || null,

        // Security details
        securityDetails: {
            aladdinCDIId: presentation.aladdinCdiId || undefined,
            description: presentation.description || undefined,
            tranche: presentation.tranche || undefined,
            sector: presentation.sector || undefined,
            callDate: presentation.callDate || undefined,
            price: presentation.price?.toString() || undefined,
            isCallable: presentation.isCallable ?? undefined,
            cusip: presentation.cusip || undefined,
            identifier: presentation.identifierValue || undefined,
        },

        // ESG fields (dropdown values)
        esgFields: {
            tcwEsgValue: presentation.tcwEsgValue || undefined,
            tcwEsgTypeValue: presentation.tcwEsgTypeValue || undefined,
            esgCollateralType: presentation.esgCollateralType || undefined,
        },

        // Trade fields (dropdown values)
        tradeFields: {
            slicerTypeValue: presentation.slicerTypeValue || undefined,
            loanCreditValue: presentation.loanCreditValue || undefined,
            mbsCollateralSubValue: presentation.mbsCollateralSubValue || undefined,
            trancheTypeValue: presentation.trancheTypeValue || undefined,
            collateralValue: presentation.collateralValue || undefined,
            mbsTypeValue: presentation.mbsTypeValue || undefined,
            mbsCollateralValue: presentation.mbsCollateralValue || undefined,
            seniorMostCashFlowValue: presentation.seniorMostCashFlowValue || undefined,
            loanCategoryValue: presentation.loanCategoryValue || undefined,
            ffiecQual: presentation.ffiecQual || undefined,
        },

        // Notes
        notesInstructions: presentation.noteInstructions || undefined,
    };
};
