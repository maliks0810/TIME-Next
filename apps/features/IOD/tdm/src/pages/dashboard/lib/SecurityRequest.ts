export interface ISecurityRequest {
  id: number;
  description: string;
  identifier: string;
  createdDate: Date;
  createdBy: string;
  setupStatus: string;
  riskAnalyticsStatus: string;
  readyForTradingStatus: string;
  processTime: number | null;
  securityRequestDetails: ISecurityRequestDetails;
  securityRequestEsgFields: ISecurityRequestEsgFields;
  securityRequestTradeFields: ISecurityRequestTradeFields;
  securityRequestDocuments: ISecurityRequestDocument[];
}

export interface ISecurityRequestDetails {
  identifierType: string,
  identifierValue: string,
  privateDeal: string,
  ssapPassword: string,
  marketSector: string,
  yellowKey: string,
  aladdinCdiId: string;
  cusip: string;
  description: string;
  newIssue: string;
  euSecurity: string;
  euSecuritizationTipId: string;
  callDate: string;
  price: number;
}

export interface ISecurityRequestEsgFields {
  tcwEsg: string;
  esgCollateralType: string;
  tcwEsgType: string;
}

export interface ISecurityRequestTradeFields {
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

export interface ISecurityRequestDocument {
  id: number;
  fileName: string;
  filePath: string;
}

// remove after we can pull data from webservice
export const securityRequestsMockData : ISecurityRequest[] = [
  {
    id: 1,
    description: 'XYZ',
    identifier: 'BBG000BLNNV0',
    createdDate: new Date('2026-01-01T08:00:00-08:00'),
    createdBy: 'John Doe',
    setupStatus: 'Draft - Duplicate Request',
    riskAnalyticsStatus: 'Not Started',
    readyForTradingStatus: 'Not Ready',
    processTime: null,
    securityRequestDetails: {
      identifierType: 'FIGI',
      identifierValue: 'BBG000BLNNV0',
      privateDeal: 'No',
      ssapPassword: 'N/A',
      marketSector: '',
      yellowKey: 'MTGE',
      aladdinCdiId: 'BDL123456',
      cusip: '61779KAA4',
      description: 'MSRM 2025-NQM7 A1',
      newIssue: 'No',
      euSecurity: 'No',
      euSecuritizationTipId: 'n/a',
      callDate: '9/25/2029',
      price: 99.30,
    },
    securityRequestEsgFields: {
      tcwEsg: 'No',
      esgCollateralType: 'n/a',
      tcwEsgType: 'xxxxxxxxx',
    },
    securityRequestTradeFields: {
      slicerType: 'MBS',
      mbsType: 'Non-Agency',
      loanCredit: 'Non-QM',
      mbsCollateral: 'Fixed',
      mbsCollateralSub: 'Other',
      srMostCashFlow: 'Non-Qualifying Mortgage',
      trancheType: 'SEQ',
      loanCategory: 'Non-QM',
      collateral: 'Non-Agency',
      ffiecQual: '',
    },
    securityRequestDocuments: [
      {
        id: 1,
        fileName: 'Offering Memorandum',
        filePath: 'filename.extension',
      }
    ]
  },
  {
    id: 2,
    description: 'XYZ',
    identifier: 'BBG000BLNNV0',
    createdDate: new Date('2026-01-01T08:00:00-08:00'),
    createdBy: 'John Doe',
    setupStatus: 'Request Initiated',
    riskAnalyticsStatus: 'Not Started',
    readyForTradingStatus: 'Not Ready',
    processTime: null,
    securityRequestDetails: {
      identifierType: 'FIGI',
      identifierValue: 'BBG000BLNNV0',
      privateDeal: 'No',
      ssapPassword: 'N/A',
      marketSector: '',
      yellowKey: 'MTGE',
      aladdinCdiId: 'BDL123456',
      cusip: '61779KAA4',
      description: 'MSRM 2025-NQM7 A1',
      newIssue: 'No',
      euSecurity: 'No',
      euSecuritizationTipId: 'n/a',
      callDate: '9/25/2029',
      price: 99.30,
    },
    securityRequestEsgFields: {
      tcwEsg: 'No',
      esgCollateralType: 'n/a',
      tcwEsgType: 'xxxxxxxxx',
    },
    securityRequestTradeFields: {
      slicerType: 'MBS',
      mbsType: 'Non-Agency',
      loanCredit: 'Non-QM',
      mbsCollateral: 'Fixed',
      mbsCollateralSub: 'Other',
      srMostCashFlow: 'Non-Qualifying Mortgage',
      trancheType: 'SEQ',
      loanCategory: 'Non-QM',
      collateral: 'Non-Agency',
      ffiecQual: '',
    },
    securityRequestDocuments: [
      {
        id: 1,
        fileName: 'Offering Memorandum',
        filePath: 'filename.extension',
      }
    ]
  },
  {
    id: 3,
    description: 'XYZ',
    identifier: '123ABC456',
    createdDate: new Date('2026-01-14T08:00:00-08:00'),
    createdBy: 'John Doe',
    setupStatus: 'Pending Trader Details',
    riskAnalyticsStatus: 'Not Started',
    readyForTradingStatus: 'Not Ready',
    processTime: null,
    securityRequestDetails: {
      identifierType: 'FIGI',
      identifierValue: 'BBG000BLNNV0',
      privateDeal: 'No',
      ssapPassword: 'N/A',
      marketSector: '',
      yellowKey: 'MTGE',
      aladdinCdiId: 'BDL123456',
      cusip: '61779KAA4',
      description: 'MSRM 2025-NQM7 A1',
      newIssue: 'No',
      euSecurity: 'No',
      euSecuritizationTipId: 'n/a',
      callDate: '9/25/2029',
      price: 99.30,
    },
    securityRequestEsgFields: {
      tcwEsg: 'No',
      esgCollateralType: 'n/a',
      tcwEsgType: 'xxxxxxxxx',
    },
    securityRequestTradeFields: {
      slicerType: 'MBS',
      mbsType: 'Non-Agency',
      loanCredit: 'Non-QM',
      mbsCollateral: 'Fixed',
      mbsCollateralSub: 'Other',
      srMostCashFlow: 'Non-Qualifying Mortgage',
      trancheType: 'SEQ',
      loanCategory: 'Non-QM',
      collateral: 'Non-Agency',
      ffiecQual: '',
    },
    securityRequestDocuments: [
      {
        id: 1,
        fileName: 'Offering Memorandum',
        filePath: 'filename.extension',
      }
    ]
  },
  {
    id: 4,
    description: 'XYZ',
    identifier: '123ABC456',
    createdDate: new Date('2026-01-14T08:00:00-08:00'),
    createdBy: 'John Doe',
    setupStatus: 'Pending DM Review',
    riskAnalyticsStatus: 'Not Started',
    readyForTradingStatus: 'Not Ready',
    processTime: null,
    securityRequestDetails: {
      identifierType: 'FIGI',
      identifierValue: 'BBG000BLNNV0',
      privateDeal: 'No',
      ssapPassword: 'N/A',
      marketSector: '',
      yellowKey: 'MTGE',
      aladdinCdiId: 'BDL123456',
      cusip: '61779KAA4',
      description: 'MSRM 2025-NQM7 A1',
      newIssue: 'No',
      euSecurity: 'No',
      euSecuritizationTipId: 'n/a',
      callDate: '9/25/2029',
      price: 99.30,
    },
    securityRequestEsgFields: {
      tcwEsg: 'No',
      esgCollateralType: 'n/a',
      tcwEsgType: 'xxxxxxxxx',
    },
    securityRequestTradeFields: {
      slicerType: 'MBS',
      mbsType: 'Non-Agency',
      loanCredit: 'Non-QM',
      mbsCollateral: 'Fixed',
      mbsCollateralSub: 'Other',
      srMostCashFlow: 'Non-Qualifying Mortgage',
      trancheType: 'SEQ',
      loanCategory: 'Non-QM',
      collateral: 'Non-Agency',
      ffiecQual: '',
    },
    securityRequestDocuments: [
      {
        id: 1,
        fileName: 'Offering Memorandum',
        filePath: 'filename.extension',
      }
    ]
  },
  {
    id: 5,
    description: 'XYZ',
    identifier: '123ABC456',
    createdDate: new Date('2026-01-14T08:00:00-08:00'),
    createdBy: 'John Doe',
    setupStatus: 'Aladdin Setup (Native Fields) In Progress',
    riskAnalyticsStatus: 'Not Started',
    readyForTradingStatus: 'Not Ready',
    processTime: null,
    securityRequestDetails: {
      identifierType: 'FIGI',
      identifierValue: 'BBG000BLNNV0',
      privateDeal: 'No',
      ssapPassword: 'N/A',
      marketSector: '',
      yellowKey: 'MTGE',
      aladdinCdiId: 'BDL123456',
      cusip: '61779KAA4',
      description: 'MSRM 2025-NQM7 A1',
      newIssue: 'No',
      euSecurity: 'No',
      euSecuritizationTipId: 'n/a',
      callDate: '9/25/2029',
      price: 99.30,
    },
    securityRequestEsgFields: {
      tcwEsg: 'No',
      esgCollateralType: 'n/a',
      tcwEsgType: 'xxxxxxxxx',
    },
    securityRequestTradeFields: {
      slicerType: 'MBS',
      mbsType: 'Non-Agency',
      loanCredit: 'Non-QM',
      mbsCollateral: 'Fixed',
      mbsCollateralSub: 'Other',
      srMostCashFlow: 'Non-Qualifying Mortgage',
      trancheType: 'SEQ',
      loanCategory: 'Non-QM',
      collateral: 'Non-Agency',
      ffiecQual: '',
    },
    securityRequestDocuments: [
      {
        id: 1,
        fileName: 'Offering Memorandum',
        filePath: 'filename.extension',
      }
    ]
  },
  {
    id: 6,
    description: 'XYZ',
    identifier: '123ABC456',
    createdDate: new Date('2026-01-14T08:00:00-08:00'),
    createdBy: 'John Doe',
    setupStatus: 'Aladdin Setup (Native Fields) Complete',
    riskAnalyticsStatus: 'Analytics Requested',
    readyForTradingStatus: 'Not Ready',
    processTime: null,
    securityRequestDetails: {
      identifierType: 'FIGI',
      identifierValue: 'BBG000BLNNV0',
      privateDeal: 'No',
      ssapPassword: 'N/A',
      marketSector: '',
      yellowKey: 'MTGE',
      aladdinCdiId: 'BDL123456',
      cusip: '61779KAA4',
      description: 'MSRM 2025-NQM7 A1',
      newIssue: 'No',
      euSecurity: 'No',
      euSecuritizationTipId: 'n/a',
      callDate: '9/25/2029',
      price: 99.30,
    },
    securityRequestEsgFields: {
      tcwEsg: 'No',
      esgCollateralType: 'n/a',
      tcwEsgType: 'xxxxxxxxx',
    },
    securityRequestTradeFields: {
      slicerType: 'MBS',
      mbsType: 'Non-Agency',
      loanCredit: 'Non-QM',
      mbsCollateral: 'Fixed',
      mbsCollateralSub: 'Other',
      srMostCashFlow: 'Non-Qualifying Mortgage',
      trancheType: 'SEQ',
      loanCategory: 'Non-QM',
      collateral: 'Non-Agency',
      ffiecQual: '',
    },
    securityRequestDocuments: [
      {
        id: 1,
        fileName: 'Offering Memorandum',
        filePath: 'filename.extension',
      }
    ]
  },
  {
    id: 7,
    description: 'XYZ',
    identifier: '123ABC456',
    createdDate: new Date('2026-01-14T08:00:00-08:00'),
    createdBy: 'John Doe',
    setupStatus: 'CDF Setup In Progress',
    riskAnalyticsStatus: 'Not Started',
    readyForTradingStatus: 'Not Ready',
    processTime: null,
    securityRequestDetails: {
      identifierType: 'FIGI',
      identifierValue: 'BBG000BLNNV0',
      privateDeal: 'No',
      ssapPassword: 'N/A',
      marketSector: '',
      yellowKey: 'MTGE',
      aladdinCdiId: 'BDL123456',
      cusip: '61779KAA4',
      description: 'MSRM 2025-NQM7 A1',
      newIssue: 'No',
      euSecurity: 'No',
      euSecuritizationTipId: 'n/a',
      callDate: '9/25/2029',
      price: 99.30,
    },
    securityRequestEsgFields: {
      tcwEsg: 'No',
      esgCollateralType: 'n/a',
      tcwEsgType: 'xxxxxxxxx',
    },
    securityRequestTradeFields: {
      slicerType: 'MBS',
      mbsType: 'Non-Agency',
      loanCredit: 'Non-QM',
      mbsCollateral: 'Fixed',
      mbsCollateralSub: 'Other',
      srMostCashFlow: 'Non-Qualifying Mortgage',
      trancheType: 'SEQ',
      loanCategory: 'Non-QM',
      collateral: 'Non-Agency',
      ffiecQual: '',
    },
    securityRequestDocuments: [
      {
        id: 1,
        fileName: 'Offering Memorandum',
        filePath: 'filename.extension',
      }
    ]
  },
  {
    id: 8,
    description: 'XYZ',
    identifier: '123ABC456',
    createdDate: new Date('2026-01-14T08:00:00-08:00'),
    createdBy: 'John Doe',
    setupStatus: 'CDF Setup Complete',
    riskAnalyticsStatus: 'Analytics Verified In Aladdin',
    readyForTradingStatus: 'Ready',
    processTime: 20,
    securityRequestDetails: {
      identifierType: 'FIGI',
      identifierValue: 'BBG000BLNNV0',
      privateDeal: 'No',
      ssapPassword: 'N/A',
      marketSector: '',
      yellowKey: 'MTGE',
      aladdinCdiId: 'BDL123456',
      cusip: '61779KAA4',
      description: 'MSRM 2025-NQM7 A1',
      newIssue: 'No',
      euSecurity: 'No',
      euSecuritizationTipId: 'n/a',
      callDate: '9/25/2029',
      price: 99.30,
    },
    securityRequestEsgFields: {
      tcwEsg: 'No',
      esgCollateralType: 'n/a',
      tcwEsgType: 'xxxxxxxxx',
    },
    securityRequestTradeFields: {
      slicerType: 'MBS',
      mbsType: 'Non-Agency',
      loanCredit: 'Non-QM',
      mbsCollateral: 'Fixed',
      mbsCollateralSub: 'Other',
      srMostCashFlow: 'Non-Qualifying Mortgage',
      trancheType: 'SEQ',
      loanCategory: 'Non-QM',
      collateral: 'Non-Agency',
      ffiecQual: '',
    },
    securityRequestDocuments: [
      {
        id: 1,
        fileName: 'Offering Memorandum',
        filePath: 'filename.extension',
      }
    ]
  },
  {
    id: 8,
    description: 'XYZ',
    identifier: '123ABC456',
    createdDate: new Date('2026-01-14T08:00:00-08:00'),
    createdBy: 'John Doe',
    setupStatus: 'CDF Setup Partially Complete',
    riskAnalyticsStatus: 'Analytics Verified In Aladdin',
    readyForTradingStatus: 'Ready For Prelim',
    processTime: null,
    securityRequestDetails: {
      identifierType: 'FIGI',
      identifierValue: 'BBG000BLNNV0',
      privateDeal: 'No',
      ssapPassword: 'N/A',
      marketSector: '',
      yellowKey: 'MTGE',
      aladdinCdiId: 'BDL123456',
      cusip: '61779KAA4',
      description: 'MSRM 2025-NQM7 A1',
      newIssue: 'No',
      euSecurity: 'No',
      euSecuritizationTipId: 'n/a',
      callDate: '9/25/2029',
      price: 99.30,
    },
    securityRequestEsgFields: {
      tcwEsg: 'No',
      esgCollateralType: 'n/a',
      tcwEsgType: 'xxxxxxxxx',
    },
    securityRequestTradeFields: {
      slicerType: 'MBS',
      mbsType: 'Non-Agency',
      loanCredit: 'Non-QM',
      mbsCollateral: 'Fixed',
      mbsCollateralSub: 'Other',
      srMostCashFlow: 'Non-Qualifying Mortgage',
      trancheType: 'SEQ',
      loanCategory: 'Non-QM',
      collateral: 'Non-Agency',
      ffiecQual: '',
    },
    securityRequestDocuments: [
      {
        id: 1,
        fileName: 'Offering Memorandum',
        filePath: 'filename.extension',
      }
    ]
  },
];