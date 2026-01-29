export interface ISecuritySetupRequest {
  id: number;
  description: string;
  identifier: string;
  createdDate: Date;
  createdBy: string;
  setupStatus: string;
  riskAnalyticsStatus: string;
  readyForTradingStatus: string;
  processTime: number | null;
  securityRequestDetails: ISecuritySetupRequestDetails;
  securityRequestEsgFields: ISecuritySetupRequestEsgFields;
  securityRequestTradeFields: ISecuritySetupRequestTradeFields;
  securityRequestDocuments: ISecuritySetupRequestAttachment[];
}

export interface ISecuritySetupRequestDetails {
  identifierType: string,
  identifierValue: string,
  isPrivateDeal: string,
  ssapIdPassword: string,
  marketSectorType: string,
  yellowKey: string,
  aladdinCdiId: string;
  cusip: string;
  description: string;
  isNewIssue: string;
  isEuSecuritizationRequired: string;
  euSecuritizationTipEuId: string;
  callDate: string;
  price: number;
}

export interface ISecuritySetupRequestEsgFields {
  tcwEsg: string;
  esgCollateralType: string;
  tcwEsgType: string;
}

export interface ISecuritySetupRequestTradeFields {
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

export interface ISecuritySetupRequestAttachment {
  id: number;
  fileName: string;
  filePath: string;
}