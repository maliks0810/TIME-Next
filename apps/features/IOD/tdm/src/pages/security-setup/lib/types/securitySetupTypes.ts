// Flow type
export type SecuritySetupFlowType = 'private' | 'non-private';

// Step definitions
export type SecuritySetupStep =
    | 'enter-identifier'
    | 'ssap-confirmation'
    | 'review-details'
    | 'confirm-details';

// Step definitions
export type EnterIdentifierStep =
    | 'new-issue' // Step 1: New Issue question
    | 'upload-cdi' // Upload CDI & Aladdin CDI ID
    | 'private-deal' // Step 3a: Private Deal question
    | 'ssap-password' // Step 3b: Enter SSAP ID/Password (if private)
    | 'sapi-login' // Step 3c: Request DM Release (if private)
    | 'ssap-confirmation' // Step 3d: SSAP Confirmation (if private)
    | 'bloomberg-identifier'; // Step 4: Enter Bloomberg Identifier

export enum SecuritySetupStatus {
    RequestInitiated = 1,
    PendingDmSsapReview = 2,
    PendingTraderDetails = 3,
    RequestSubmitted = 4,
    SecurityReviewComplete = 5,
    SecuritySetupComplete = 6,
    ReadyForTrading = 7,
    Cancelled = 8,
}

// Enter Identifier
export interface IEnterIdentifierFormValues {
    // Step tracking
    currentStep?: EnterIdentifierStep;
    completedSteps?: EnterIdentifierStep[];

    // Identifier row
    identifierType?: string; // FIGI dropdown
    identifierValue?: string; // BBGZ000BLNNV0

    // Market Sector row
    marketSector?: string; // Select... dropdown
    yellowKey?: string; // MTGE text

    // Private Deal row
    isPrivateDeal?: boolean; // Select... dropdown
    ssapIdPassword?: string; // Sample_Code text
    isSsapReleaseRequestSentToDm?: boolean; // SSAP Request Sent to DM
    isSsapReleasedByDm?: boolean; // SSAP Released

    // New Issue row
    newIssue?: string; // Select... dropdown
    cdiFileUploadedToAnser?: string; // Select... dropdown
    aladdinCDIId?: string; // BDL123456 text

    // EU Security row
    isEuSecuritizationRequired?: boolean; // Select... dropdown
    euSecuritizationTipEuId?: string; // x text

    // Deal Name row
    intexDealName?: string;
    intexPassword?: string;
    dealName?: string;
    euSecuritizationStatus?: string;
    erisaStatus?: string;
}

// Review Details - Security Details
export interface ISecurityDetails {
    aladdinCDIId?: string;
    identifier?: string;
    description?: string;
    tranche?: string;
    sectorValue?: string;
    callDate?: string; // ISO 8601 date string
    price?: string; // Display as string, sent as number to API
    cusip?: string;
    callableValue?: string;
    euSecuritizationStatus?: string;
    erisaStatus?: string;
}

// Review Details - ESG Fields
// All fields are dropdown values that map to API
export interface IESGFields {
    tcwEsgValue?: string; // TCW ESG dropdown value → API: TcwEsgValue
    tcwEsgTypeValue?: string; // TCW ESG Type dropdown value → API: TcwEsgTypeValue
    esgCollateralType?: string; // ESG Collateral Type (CLO Only) → API: EsgCollateralType
}

// Review Details - Speed Overrides
export interface ISpeedOverrides {
    prepaymentTypeValue?: string;
    defaultTypeValue?: string;
    prepaymentSpeed?: number | null;
    defaultSpeed?: number | null;
    severity?: number | null;
    delinquency?: number | null;
}

// Review Details - Trade Fields
// All fields are dropdown values that map to API
export interface ITradeFields {
    slicerTypeValue?: string; // Slicer Type dropdown → API: SlicerTypeValue
    mbsTypeValue?: string; // MBS Type dropdown → API: MbsTypeValue
    loanCreditValue?: string; // Loan Credit dropdown → API: LoanCreditValue
    mbsCollateralValue?: string; // MBS Collateral dropdown → API: MbsCollateralValue
    mbsCollateralSubValue?: string; // MBS Collateral Sub dropdown → API: MbsCollateralSubValue
    seniorMostCashFlowValue?: string; // Senior Most Cash Flow dropdown → API: SeniorMostCashFlowValue
    trancheTypeValue?: string; // Tranche Type dropdown → API: TrancheTypeValue
    loanCategoryValue?: string; // Loan Category dropdown → API: LoanCategoryValue
    collateralValue?: string; // Collateral dropdown → API: CollateralValue
    ffiecQual?: string; // FFIEC Qualification → API: FfiecQual
}

// All form values combined
export interface IReviewDetailsFormValues {
    securityDetails: ISecurityDetails;
    esgFields: IESGFields;
    tradeFields: ITradeFields;
    speedOverrides: ISpeedOverrides;
    notesInstructions?: string; // Textarea at bottom
    attachments?: ISecurityAttachmentData[];
}

export interface ISecurityAttachmentData {
    attachmentId: number;
    securitySetupRequestId: number;
    sharepointWebUrl: string;
    fileName: string;
}

// Confirm Details (read-only review of all data)
export interface IConfirmDetailsData {
    uploadedFile?: string; // "file.file_extension"
    ssapIdPassword?: string; // SSAP ID/Password from Step 1
    securityDetails: ISecurityDetails;
    esgFields: IESGFields;
    tradeFields: ITradeFields;
    speedOverrides: ISpeedOverrides;
    notesInstructions?: string;
    attachments?: ISecurityAttachmentData[];
}

// Complete wizard data
export interface ISecuritySetupWizardData {
    securitySetupRequestId?: number | null;
    step1: IEnterIdentifierFormValues;
    step2: IReviewDetailsFormValues;
    step3?: IConfirmDetailsData;
    reviewedDate?: string | null;
    isReviewed?: boolean | null;
    reviewedBy?: string | null;
    updatedBy?: string | null;
    updatedDate?: string | null;
    createdBy?: string | null;
    createdDate?: string | null;
}

// Success messages for Step 2
export interface ISecurityFoundMessages {
    bloombergRetrieved: boolean;
    aladdinExists: boolean;
    aladdinCDIId?: string;
}
