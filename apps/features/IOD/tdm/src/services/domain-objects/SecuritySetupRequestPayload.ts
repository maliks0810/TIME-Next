import {
    ISecurityDetails,
    IESGFields,
    ITradeFields,
} from '../../pages/security-setup/lib/types/securitySetupTypes';

export type WizardStep =
    | 'enter-identifier'
    | 'ssap-confirmation'
    | 'review-details'
    | 'confirm-details';

// ============================================
// API Domain & Presentation Objects
// ============================================

/**
 * API Presentation Object (Response from API)
 */
export interface ISecuritySetupRequestPresentation {
    securitySetupRequestId: number | null;
    isNewIssue: boolean | null;
    isCdiFileUploadedToAnswer: boolean | null;
    aladdinCdiId: string | null;
    isPrivateDeal: boolean | null;
    ssapIdPassword: string | null;
    isSsapReleaseRequestSentToDm: boolean | null;
    isSsapReleasedByDm: boolean | null;
    identifierTypeValue: string | null;
    identifierValue: string | null;
    marketSectorTypeValue: string | null;
    yellowKey: string | null;
    isEuSecuritizationRequired: boolean | null;
    euSecuritizationTipEuId: string | null;
    description: string | null;
    sector: string | null;
    callDate: string | null; // ISO 8601 DateTimeOffset
    tranche: string | null;
    price: number | null; // decimal in C#
    isCallable: boolean | null;
    tcwEsgValue: string | null;
    tcwEsgTypeValue: string | null;
    esgCollateralType: string | null;
    slicerTypeValue: string | null;
    loanCreditValue: string | null;
    mbsCollateralSubValue: string | null;
    trancheTypeValue: string | null;
    collateralValue: string | null;
    mbsTypeValue: string | null;
    mbsCollateralValue: string | null;
    seniorMostCashFlowValue: string | null;
    loanCategoryValue: string | null;
    noteInstructions: string | null;
    isReviewed: boolean | null;
    reviewedBy: string | null;
    reviewedDate: string | null; // ISO 8601 DateTimeOffset
    securitySetupStatusId: number | null;
    riskAnalyticsStatusId: number | null;
    tradingStatusId: number | null;
    ffiecQual: string | null;
    cusip: string | null;
    processDate: string | null; // ISO 8601 DateTimeOffset
    currentStepDescription: string | null;
    currentStepNumber: number | null;
    saveType: string | null;
    isActive: boolean;
    createdBy: string;
    createdDate: string; // ISO 8601 DateTimeOffset
    updatedBy: string | null;
    updatedDate: string | null; // ISO 8601 DateTimeOffset
}

/**
 * API Domain Object (Request to API)
 * This is what we send to the API. Field names match the C# property names exactly.
 */
export interface ISecuritySetupRequestDomain {
    SecuritySetupRequestId?: number | null;
    IsNewIssue?: boolean | null;
    IsCdiFileUploadedToAnswer?: boolean | null;
    AladdinCdiId?: string;
    IsPrivateDeal?: boolean | null;
    SsapIdPassword?: string;
    IsSsapReleaseRequestSentToDm?: boolean | null;
    IsSsapReleasedByDm?: boolean | null;
    IdentifierTypeValue?: string;
    IdentifierValue?: string;
    MarketSectorTypeValue?: string;
    YellowKey?: string;
    IsEuSecuritizationRequired?: boolean | null;
    EuSecuritizationTipEuId?: string;
    Description?: string;
    Sector?: string;
    CallDate?: string | null; // ISO 8601 DateTimeOffset
    Tranche?: string;
    Price?: number | null; // decimal in C#
    IsCallable?: boolean | null;
    TcwEsgValue?: string;
    TcwEsgTypeValue?: string;
    EsgCollateralType?: string;
    SlicerTypeValue?: string;
    LoanCreditValue?: string;
    MbsCollateralSubValue?: string;
    TrancheTypeValue?: string;
    CollateralValue?: string;
    MbsTypeValue?: string;
    MbsCollateralValue?: string;
    SeniorMostCashFlowValue?: string;
    LoanCategoryValue?: string;
    NoteInstructions?: string;
    IsReviewed?: boolean | null;
    ReviewedBy?: string;
    ReviewedDate?: string | null; // ISO 8601 DateTimeOffset
    SecuritySetupStatusId?: number | null;
    RiskAnalyticsStatusId?: number | null;
    TradingStatusId?: number | null;
    FfiecQual?: string;
    Cusip?: string;
    ProcessDate?: string | null; // ISO 8601 DateTimeOffset
    CurrentStepDescription?: string;
    CurrentStepNumber?: number | null;
    SaveType?: string;
    IsActive?: boolean;
    CreatedBy?: string;
    CreatedDate?: string; // ISO 8601 DateTimeOffset
    UpdatedBy?: string;
    UpdatedDate?: string | null; // ISO 8601 DateTimeOffset
}

// ============================================
// Frontend Internal Types
// ============================================

/**
 * Unified Security Setup Wizard Payload
 *
 * Simple payload structure used for all saves throughout the wizard.
 * All step-specific fields are optional.
 */
export interface ISecuritySetupWizardPayload {
    securitySetupRequestId?: number | null;
    currentStep: WizardStep;
    currentStepNumber: number;
    savedAt: string; // ISO 8601 format
    saveType: 'partial' | 'complete';

    // ============================================
    // Step 1: Enter Identifier
    // ============================================
    newIssue?: string | null;
    cdiFileUploadedToAnser?: string | null;
    aladdinCDIId?: string | null;
    uploadedFileReference?: string;
    isPrivateDeal?: boolean | null;
    ssapIdPassword?: string | null;
    isSsapReleaseRequestSentToDm?: boolean;
    isSsapReleasedByDm?: boolean;
    approvalTimestamp?: string;
    confirmationAcknowledged?: boolean;
    userAction?: 'continue' | 'skip-to-bloomberg';
    identifierType?: string | null;
    identifierValue?: string | null;
    marketSector?: string | null;
    yellowKey?: string | null;
    euSecurityVerificationRequired?: string | null;
    euSecuritizationTipEuId?: string | null;

    // ============================================
    // Step 3: Review Details (Security Request Template)
    // ============================================
    securityDetails?: ISecurityDetails;
    esgFields?: IESGFields;
    tradeFields?: ITradeFields;
    notesInstructions?: string;
    uploadedFile?: string;
    isConfirmed?: boolean;

    isReviewed?: boolean;
    reviewedBy?: string;
    reviewedDate?: string;
}

/**
 * Response from wizard save/upsert operation
 */
export interface ISaveWizardResponse {
    success: boolean;
    data: ISecuritySetupRequestPresentation;
    errors?: string[];
}
