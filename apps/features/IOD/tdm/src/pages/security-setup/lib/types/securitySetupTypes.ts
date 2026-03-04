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
    | 'upload-cdi' // Step 2: Upload CDI & Aladdin CDI ID
    | 'private-deal' // Step 3a: Private Deal question
    | 'ssap-password' // Step 3b: Enter SSAP ID/Password (if private)
    | 'sapi-login' // Step 3c: Request DM Release (if private)
    | 'ssap-confirmation' // Step 3d: SSAP Confirmation (if private)
    | 'bloomberg-identifier'; // Step 4: Enter Bloomberg Identifier

// Step 1: Enter Identifier
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
    euSecurityVerificationRequired?: string; // Select... dropdown
    euSecuritizationTipEuId?: string; // x text
}

// Step 2: Review Details - Security Details
export interface ISecurityDetails {
    aladdinCDIId?: string;
    identifier?: string;
    description?: string;
    tranche?: string;
    sector?: string;
    callDate?: string; // ISO 8601 date string
    price?: string; // Display as string, sent as number to API
    cusip?: string;
    isCallable?: boolean | null;
    isEuSecuritizationRequired?: boolean | null;
    euSecuritizationTipEuId?: string;
}

// Step 2: Review Details - ESG Fields
// All fields are dropdown values that map to API
export interface IESGFields {
    tcwEsgValue?: string; // TCW ESG dropdown value → API: TcwEsgValue
    tcwEsgTypeValue?: string; // TCW ESG Type dropdown value → API: TcwEsgTypeValue
    esgCollateralType?: string; // ESG Collateral Type (CLO Only) → API: EsgCollateralType
}

// Step 2: Review Details - Trade Fields
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

// Step 2: All form values combined
export interface IReviewDetailsFormValues {
    securityDetails: ISecurityDetails;
    esgFields: IESGFields;
    tradeFields: ITradeFields;
    notesInstructions?: string; // Textarea at bottom
}

// Step 3: Confirm Details (read-only review of all data)
export interface IConfirmDetailsData {
    uploadedFile?: string; // "file.file_extension"
    ssapIdPassword?: string; // SSAP ID/Password from Step 1
    securityDetails: ISecurityDetails;
    esgFields: IESGFields;
    tradeFields: ITradeFields;
    notesInstructions?: string;
}

// Complete wizard data
export interface ISecuritySetupWizardData {
    securitySetupRequestId?: number | null;
    step1: IEnterIdentifierFormValues;
    step2: IReviewDetailsFormValues;
    step3?: IConfirmDetailsData;
    reviewedDate?: string;
    isReviewed?: boolean;
    reviewedBy?: string;
}

// Success messages for Step 2
export interface ISecurityFoundMessages {
    bloombergRetrieved: boolean;
    aladdinExists: boolean;
    aladdinCDIId?: string;
}
