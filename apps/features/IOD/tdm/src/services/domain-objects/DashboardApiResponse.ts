// TODO: dashboard items to contain subset of SecuritySetupRequest
// load data for Request Details flyout on demand

export interface DashboardItems {
    securitySetupRequestCollection: SecuritySetupRequest[];
}
export interface SecuritySetupRequestAttachment {
    attachmentId: number;
    fileName: string;
    sharepointWebUrl: string;
}

export interface SecuritySetupRequest {
    securitySetupRequestId: number;
    description: string;
    identifierType: string;
    identifierValue: string;
    createdDate: string;
    createdBy: string;
    setupStatus: string;
    riskAnalyticsStatus: string;
    readyForTradingStatus: string;
    euSecuritizationStatus: string;
    erisaStatus: string;
    processTime: number | null;
    isPrivateDeal: boolean;
    ssapIdPassword: string;
    marketSectorType: string;
    yellowKey: string;
    aladdinCdiId: string;
    cusip: string;
    isNewIssue: boolean;
    isEuSecuritizationRequired: boolean;
    euSecuritizationTipEuId: string;
    dmAnalystName: string;
    dmAnalystEmail: string;
    callDate: string;
    tranche: string;
    price: number;
    callableValue: string;
    tcwEsg: string;
    esgCollateralType: string;
    tcwEsgType: string;
    slicerType: string;
    mbsType: string;
    loanCredit: string;
    mbsCollateral: string;
    mbsCollateralSub: string;
    seniorMostCashFlow: string;
    trancheType: string;
    loanCategory: string;
    collateral: string;
    ffiecQual: string;
    intexDealName: string;
    intexPassword: string;
    dealName: string;
    prepaymentTypeValue: string;
    defaultTypeValue: string;
    prepaymentSpeed: number;
    defaultSpeed: number;
    severity: number;
    delinquency: number;
    documents: SecuritySetupRequestAttachment[];
    noteInstructions: string;
    arcAnalyticsRequestedDates: string[];
}

export interface DelSecuritySetupRequest {
    securitySetupRequestId: number;
    description: string;
    identifierType: string;
    identifierValue: string;
    createdDate: string;
    createdBy: string;
    setupStatus: string;
    riskAnalyticsStatus: string;
    readyForTradingStatus: string;
    euSecuritizationStatus: string;
    erisaStatus: string;
    processTime: number | null;
    isPrivateDeal: boolean;
    ssapIdPassword: string;
    marketSectorType: string;
    yellowKey: string;
    aladdinCdiId: string;
    cusip: string;
    isNewIssue: boolean;
    isEuSecuritizationRequired: boolean;
    euSecuritizationTipEuId: string;
    callDate: string;
    tranche: string;
    price: number;
    callableValue: string;
    tcwEsg: string;
    esgCollateralType: string;
    tcwEsgType: string;
    slicerType: string;
    mbsType: string;
    loanCredit: string;
    mbsCollateral: string;
    mbsCollateralSub: string;
    seniorMostCashFlow: string;
    trancheType: string;
    loanCategory: string;
    collateral: string;
    ffiecQual: string;
    intexDealName: string;
    intexPassword: string;
    dealName: string;
    prepaymentTypeValue: string;
    defaultTypeValue: string;
    prepaymentSpeed: number;
    defaultSpeed: number;
    severity: number;
    delinquency: number;
}

export interface DeleteSecuritySetupRequest {
    securitySetupRequest: DelSecuritySetupRequest;
    isCancelled: boolean;
}
