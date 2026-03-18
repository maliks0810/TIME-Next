export interface IDashboardSecuritySetupRequest {
    id: number;
    description: string;
    identifier: string;
    createdDate: Date;
    createdBy: string;
    setupStatus: string;
    riskAnalyticsStatus: string;
    readyForTradingStatus: string;
    euSecuritizationStatus: string;
    erisaStatus: string;
    processTime: number | null;
    securityRequestDetails: IDashboardSecuritySetupRequestDetails;
    securityRequestEsgFields: IDashboardSecuritySetupRequestEsgFields;
    securityRequestTradeFields: IDashboardSecuritySetupRequestTradeFields;
    securityRequestIntexFields: IDashboardSecuritySetupRequestIntexFields;
    securityRequestArcFields: IDashboardSecuritySetupRequestArcFields;
    securityRequestDocuments: IDashboardSecuritySetupRequestAttachment[];
}

export interface IDashboardSecuritySetupRequestDetails {
    identifierType: string;
    identifierValue: string;
    isPrivateDeal: boolean;
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
    callableValue: string;
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

export interface IDashboardSecuritySetupRequestIntexFields {
    intexDealName: string;
    intexPassword: string;
    dealName: string;
}

export interface IDashboardSecuritySetupRequestArcFields {
    prepaymentTypeValue: string;
    defaultTypeValue: string;
    prepaymentSpeed: number;
    defaultSpeed: number;
    severity: number;
    delinquency: number;
}

export interface IDashboardSecuritySetupRequestAttachment {
    id: number;
    fileName: string;
    filePath: string;
}
