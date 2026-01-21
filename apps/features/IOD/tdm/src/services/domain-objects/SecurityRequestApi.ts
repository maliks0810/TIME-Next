export interface ISecurityRequestDocumentApi {
  id: number;
  fileName: string;
  filePath: string;
}

export interface ISecurityRequestApi {
  securitySetupRequestsId: number;
  description: string;
  identifier: string;
  createdDate: Date;
  createdBy: string;
  setupStatus: string;
  riskAnalyticsStatus: string;
  readyForTradingStatus: string;
  processTime: number | null;
  identifierType: string,
  identifierValue: string,
  privateDeal: string,
  ssapPassword: string,
  marketSector: string,
  yellowKey: string,
  aladdinCdiId: string;
  cusip: string;
  newIssue: string;
  euSecurity: string;
  euSecuritizationTipId: string;
  callDate: string;
  price: string;
  tcwEsg: string;
  esgCollateralType: string;
  tcwEsgType: string;
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