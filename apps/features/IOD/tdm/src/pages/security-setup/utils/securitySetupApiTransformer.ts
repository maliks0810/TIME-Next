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

export const getStepNumber = (step: WizardStep): number => {
    switch (step) {
        case 'enter-identifier':
            return 1;
        case 'ssap-confirmation':
            return 2;
        case 'review-details':
            return 3;
        case 'confirm-details':
            return 4;
        default:
            return 1;
    }
};

// For backwards compatibility for the legacy dynamic steps
const getStepFromPresentation = (
    stepDescription: string | null,
    stepNumber: number | null
): WizardStep => {
    switch (stepDescription) {
        case 'enter-identifier':
        case 'ssap-confirmation':
        case 'review-details':
        case 'confirm-details':
            return stepDescription;
        default:
            if (stepNumber === 1) {
                return 'enter-identifier';
            }
            if (stepNumber === 2) {
                return 'ssap-confirmation';
            }
            if (stepNumber === 3) {
                return 'review-details';
            }
            if (stepNumber != null && stepNumber >= 4) {
                return 'confirm-details';
            }
            return 'enter-identifier';
    }
};

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

    // helper to coerce string or number to number | null
    const toNumberOrNull = (value?: string | number | null): number | null => {
        if (!value) return null;

        if (typeof value === 'number') {
            return isNaN(value) ? null : value;
        }

        const parsed = parseFloat(value.toString().trim());
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
        IsPrivateDeal: payload.isPrivateDeal || false,
        SsapIdPassword: payload.ssapIdPassword || '',
        IsSsapReleaseRequestSentToDm: payload.isSsapReleaseRequestSentToDm || false,
        IsSsapReleasedByDm: payload.isSsapReleasedByDm || false,
        IdentifierTypeValue: payload.identifierType || '',
        IdentifierValue: payload.identifierValue || '',
        MarketSectorTypeValue: payload.marketSector || '',
        YellowKey: payload.yellowKey || '',
        IsEuSecuritizationRequired: payload.isEuSecuritizationRequired ?? null,
        EuSecuritizationTipEuId: payload.euSecuritizationTipEuId || '',
        IntexDealName: payload.intexDealName || '',
        IntexPassword: payload.intexPassword || '',
        DealName: payload.dealName || '',

        // Security Details
        Description: payload.securityDetails?.description || '',
        SectorValue: payload.securityDetails?.sectorValue || '',
        CallDate: payload.securityDetails?.callDate || null,
        Tranche: payload.securityDetails?.tranche || '',
        Price: parsePrice(payload.securityDetails?.price),
        CallableValue: payload.securityDetails?.callableValue || null,
        Cusip: payload.securityDetails?.cusip || '',

        PrepaymentTypeValue: payload.speedOverrides?.prepaymentTypeValue || null,
        DefaultTypeValue: payload.speedOverrides?.defaultTypeValue || null,
        PrepaymentSpeed: toNumberOrNull(payload.speedOverrides?.prepaymentSpeed) || null,
        DefaultSpeed: toNumberOrNull(payload.speedOverrides?.defaultSpeed) || null,
        Severity: toNumberOrNull(payload.speedOverrides?.severity) || null,
        Delinquency: toNumberOrNull(payload.speedOverrides?.delinquency) || null,

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

        IsReviewed: payload.isReviewed || null,
        ReviewedBy: payload.reviewedBy || undefined,
        ReviewedDate: payload.reviewedDate || null,
        CreatedBy: payload.createdBy || undefined,
        CreatedDate: payload.createdDate || undefined,
        UpdatedBy: payload.updatedBy || undefined,
        UpdatedDate: payload.updatedDate || undefined,

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
    presentation: ISecuritySetupRequestPresentation | null | undefined
): Partial<ISecuritySetupWizardPayload> => {
    if (!presentation) return {};
    const currentStep = getStepFromPresentation(
        presentation.currentStepDescription,
        presentation.currentStepNumber
    );

    return {
        // ID for PUT calls
        securitySetupRequestId: presentation.securitySetupRequestId,

        // Wizard metadata
        currentStep,
        currentStepNumber: getStepNumber(currentStep),
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
        isPrivateDeal: presentation.isPrivateDeal,
        ssapIdPassword: presentation.ssapIdPassword || null,
        isSsapReleaseRequestSentToDm: presentation.isSsapReleaseRequestSentToDm || false,
        isSsapReleasedByDm: presentation.isSsapReleasedByDm || false,
        identifierType: presentation.identifierTypeValue || null,
        identifierValue: presentation.identifierValue || null,
        marketSector: presentation.marketSectorTypeValue || null,
        yellowKey: presentation.yellowKey || null,
        isEuSecuritizationRequired: presentation.isEuSecuritizationRequired,
        euSecuritizationTipEuId: presentation.euSecuritizationTipEuId || null,
        intexDealName: presentation.intexDealName || null,
        intexPassword: presentation.intexPassword || null,
        dealName: presentation.dealName || null,

        // Security details
        securityDetails: {
            aladdinCDIId: presentation.aladdinCdiId || undefined,
            description: presentation.description || undefined,
            tranche: presentation.tranche || undefined,
            sectorValue: presentation.sectorValue || undefined,
            callDate: presentation.callDate || undefined,
            price: presentation.price?.toString() || undefined,
            callableValue: presentation.callableValue || undefined,
            cusip: presentation.cusip || undefined,
            identifier: presentation.identifierValue || undefined,
        },

        // ESG fields (dropdown values)
        esgFields: {
            tcwEsgValue: presentation.tcwEsgValue || undefined,
            tcwEsgTypeValue: presentation.tcwEsgTypeValue || undefined,
            esgCollateralType: presentation.esgCollateralType || undefined,
        },

        // Speed overrides
        speedOverrides: {
            prepaymentTypeValue: presentation.prepaymentTypeValue || undefined,
            defaultTypeValue: presentation.defaultTypeValue || undefined,
            prepaymentSpeed: presentation.prepaymentSpeed || undefined,
            defaultSpeed: presentation.defaultSpeed || undefined,
            severity: presentation.severity || undefined,
            delinquency: presentation.delinquency || undefined,
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

        // Review metadata
        isReviewed: presentation.isReviewed || undefined,
        reviewedBy: presentation.reviewedBy || undefined,
        reviewedDate: presentation.reviewedDate || undefined,

        // Audit metadata
        createdBy: presentation.createdBy || undefined,
        createdDate: presentation.createdDate || undefined,
        updatedBy: presentation.updatedBy || undefined,
        updatedDate: presentation.updatedDate || undefined,
    };
};
