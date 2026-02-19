export interface IDashboardSecuritySetupRequest {
    id: number;
    description: string;
    identifier: string;
    createdDate: Date;
    createdBy: string;
    setupStatus: string;
    riskAnalyticsStatus: string;
    readyForTradingStatus: string;
    processTime: number | null;
    securityRequestDetails: IDashboardSecuritySetupRequestDetails;
    securityRequestEsgFields: IDashboardSecuritySetupRequestEsgFields;
    securityRequestTradeFields: IDashboardSecuritySetupRequestTradeFields;
    securityRequestDocuments: IDashboardSecuritySetupRequestAttachment[];
}

export interface IDashboardSecuritySetupRequestDetails {
    identifierType: string;
    identifierValue: string;
    isPrivateDeal: string;
    ssapIdPassword: string;
    marketSectorType: string;
    yellowKey: string;
    aladdinCdiId: string;
    cusip: string;
    description: string;
    tranche: string;
    isNewIssue: string;
    isEuSecuritizationRequired: string;
    euSecuritizationTipEuId: string;
    callDate: Date | null;
    price: string;
}

export interface IDashboardSecuritySetupRequestEsgFields {
    tcwEsg: string;
    esgCollateralType: string;
    tcwEsgType: string;
}

export interface IDashboardSecuritySetupRequestTradeFields {
    slicerType: string;
    mbsType: string;
    loanCredit: string;
    mbsCollateral: string;
    mbsCollateralSub: string;
    srMostCashFlow: string;
    trancheType: string;
    loanCategory: string;
    collateral: string;
    ffiecQual: string;
}

export interface IDashboardSecuritySetupRequestAttachment {
    id: number;
    fileName: string;
    filePath: string;
}
