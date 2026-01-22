// Flow type
export type SecuritySetupFlowType = 'private' | 'non-private';

// Step definitions
export type SecuritySetupStep = 'enter-identifier' | 'review-details' | 'confirm-details';

// Sub-step definitions for Step 1 (Enter Identifier)
export type EnterIdentifierSubStep =
    | 'new-issue' // Sub-step 1: New Issue question
    | 'upload-cdi' // Sub-step 2: Upload CDI & Aladdin CDI ID
    | 'private-deal' // Sub-step 3: Private Deal question
    | 'ssap-password' // Sub-step 4: Enter SSAP ID/Password
    | 'sapi-login' // Sub-step 5: DM log into SAPI
    | 'bloomberg-identifier'; // Sub-step 6: Enter Bloomberg Identifier

// Step 1: Enter Identifier - NON-PRIVATE FLOW
export interface IEnterIdentifierFormValues {
    // Sub-step tracking
    currentSubStep?: EnterIdentifierSubStep;
    completedSubSteps?: EnterIdentifierSubStep[];

    // Identifier row
    identifierType?: string; // FIGI dropdown
    identifierValue?: string; // BBGZ000BLNNV0

    // Market Sector row
    marketSector?: string; // Select... dropdown
    yellowKey?: string; // MTGE text

    // Private Deal row
    privateDeal?: string; // Select... dropdown
    ssapIdPassword?: string; // Sample_Code text

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
    aladdinCDIId?: string; // Read-only
    identifier?: string; // Read-only
    description?: string; // Read-only
    tranche?: string; // Read-only
    sector?: string; // Read-only
    callable?: string; // Read-only
    callDate?: string; // Read-only
    price?: string; // Read-only
}

// Step 2: Review Details - ESG Fields
export interface IESGFields {
    tcwESG?: string; // Dropdown with green border
    esgCollateralType?: string; // "(KLO Only)" - red text, not editable
    tcwESGType?: string; // Dropdown
}

// Step 2: Review Details - Trade Fields
export interface ITradeFields {
    sliceType?: string; // MBS
    mbsType?: string; // Non-Agency
    loanCredit?: string; // Non-QM
    mbsCollateral?: string; // Fixed
    mbsCollateralSub?: string; // Other
    srMostCashFlow?: string; // Non-Qualifying Mortgage
    trancheType?: string; // SEQ
    loanCategory?: string; // Non-QM
    collateral?: string; // Non-Agency
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
    securityDetails: ISecurityDetails;
    esgFields: IESGFields;
    tradeFields: ITradeFields;
    notesInstructions?: string;
}

// Complete wizard data
export interface ISecuritySetupWizardData {
    step1: IEnterIdentifierFormValues;
    step2: IReviewDetailsFormValues;
    step3?: IConfirmDetailsData;
}

// Success messages for Step 2
export interface ISecurityFoundMessages {
    bloombergRetrieved: boolean;
    aladdinExists: boolean;
    aladdinCDIId?: string;
}
