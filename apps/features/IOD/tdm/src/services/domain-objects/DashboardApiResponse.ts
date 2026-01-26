export interface DashboardItems {
  securitySetupRequestCollection: SecuritySetupRequest[];
}
export interface SecuritySetupRequestDocument {
  securitySetupDocumentId: number;
  fileName: string;
  filePath: string;
}

export interface SecuritySetupRequest {
  securitySetupRequestId: number;
  description: string;
  identifierType: string,
  identifierValue: string,
  createdDate: string;
  createdBy: string;
  setupStatus: string;
  riskAnalyticsStatus: string;
  readyForTradingStatus: string;
  processTime: number | null;
  privateDeal: string,
  ssapPassword: string,
  marketSector: string,
  yellowKey: string,
  aladdinCdiId: string;
  cusip: string;
  newIssue: string;
  euSecurityVerificationRequired: string;
  euSecuritizationTipId: string;
  callDate: string;
  price: number;
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
  documents: SecuritySetupRequestDocument[];
}

export const mockApiData = {
  "dashboard": {
    "securitySetupRequestCollection": [
      {
        "securitySetupRequestId": 1,
        "description": "XYZ",
        "identifierType": "FIGI",
        "identifierValue": "BBG000BLNNV0",
        "createdDate": "2026-01-01T08:00:00-08:00",
        "createdBy": "John Doe",
        "setupStatus": "Draft - Duplicate Request",
        "riskAnalyticsStatus": "Not Started",
        "readyForTradingStatus": "Not Ready",
        "processTime": null,
        "privateDeal": "No",
        "ssapPassword": "N/A",
        "marketSector": "",
        "yellowKey": "MTGE",
        "aladdinCdiId": "BDL123456",
        "cusip": "61779KAA4",
        "newIssue": "No",
        "euSecurityVerificationRequired": "No",
        "euSecuritizationTipId": "n/a",
        "callDate": "2029-09-25T00:00:00-07:00",
        "price": 99.3,
        "tcwEsg": "No",
        "esgCollateralType": "n/a",
        "tcwEsgType": "xxxxxxxxx",
        "slicerType": "MBS",
        "mbsType": "Non-Agency",
        "loanCredit": "Non-QM",
        "mbsCollateral": "Fixed",
        "mbsCollateralSub": "Other",
        "srMostCashFlow": "Non-Qualifying Mortgage",
        "trancheType": "SEQ",
        "loanCategory": "Non-QM",
        "collateral": "Non-Agency",
        "ffiecQual": "",
        "documents": [
          {
            "securitySetupDocumentId": 1,
            "fileName": "Offering Memorandum",
            "filePath": "filename.extension"
          }
        ]
      },
      {
        "securitySetupRequestId": 2,
        "description": "XYZ",
        "identifierType": "FIGI",
        "identifierValue": "BBG000BLNNV0",
        "createdDate": "2026-01-01T08:00:00-08:00",
        "createdBy": "John Doe",
        "setupStatus": "Request Initiated",
        "riskAnalyticsStatus": "Not Started",
        "readyForTradingStatus": "Not Ready",
        "processTime": null,
        "privateDeal": "No",
        "ssapPassword": "N/A",
        "marketSector": "",
        "yellowKey": "MTGE",
        "aladdinCdiId": "BDL123456",
        "cusip": "61779KAA4",
        "newIssue": "No",
        "euSecurityVerificationRequired": "No",
        "euSecuritizationTipId": "n/a",
        "callDate": "2029-09-25T00:00:00-07:00",
        "price": 99.3,
        "tcwEsg": "No",
        "esgCollateralType": "n/a",
        "tcwEsgType": "xxxxxxxxx",
        "slicerType": "MBS",
        "mbsType": "Non-Agency",
        "loanCredit": "Non-QM",
        "mbsCollateral": "Fixed",
        "mbsCollateralSub": "Other",
        "srMostCashFlow": "Non-Qualifying Mortgage",
        "trancheType": "SEQ",
        "loanCategory": "Non-QM",
        "collateral": "Non-Agency",
        "ffiecQual": "",
        "documents": [
          {
            "securitySetupDocumentId": 1,
            "fileName": "Offering Memorandum",
            "filePath": "filename.extension"
          }
        ]
      },
      {
        "securitySetupRequestId": 3,
        "description": "XYZ",
        "identifierType": "Cusip",
        "identifierValue": "123ABC456",
        "createdDate": "2026-01-14T08:00:00-08:00",
        "createdBy": "John Doe",
        "setupStatus": "Pending Trader Details",
        "riskAnalyticsStatus": "Not Started",
        "readyForTradingStatus": "Not Ready",
        "processTime": null,
        "privateDeal": "No",
        "ssapPassword": "N/A",
        "marketSector": "",
        "yellowKey": "MTGE",
        "aladdinCdiId": "BDL123456",
        "cusip": "123ABC456",
        "newIssue": "No",
        "euSecurityVerificationRequired": "No",
        "euSecuritizationTipId": "n/a",
        "callDate": "2029-09-25T00:00:00-07:00",
        "price": 99.3,
        "tcwEsg": "No",
        "esgCollateralType": "n/a",
        "tcwEsgType": "xxxxxxxxx",
        "slicerType": "MBS",
        "mbsType": "Non-Agency",
        "loanCredit": "Non-QM",
        "mbsCollateral": "Fixed",
        "mbsCollateralSub": "Other",
        "srMostCashFlow": "Non-Qualifying Mortgage",
        "trancheType": "SEQ",
        "loanCategory": "Non-QM",
        "collateral": "Non-Agency",
        "ffiecQual": "",
        "documents": [
          {
            "securitySetupDocumentId": 1,
            "fileName": "Offering Memorandum",
            "filePath": "filename.extension"
          }
        ]
      },
      {
        "securitySetupRequestId": 4,
        "description": "XYZ",
        "identifierType": "Cusip",
        "identifierValue": "123ABC456",
        "createdDate": "2026-01-14T08:00:00-08:00",
        "createdBy": "John Doe",
        "setupStatus": "Pending DM Review",
        "riskAnalyticsStatus": "Not Started",
        "readyForTradingStatus": "Not Ready",
        "processTime": null,
        "privateDeal": "No",
        "ssapPassword": "N/A",
        "marketSector": "",
        "yellowKey": "MTGE",
        "aladdinCdiId": "BDL123456",
        "cusip": "123ABC456",
        "newIssue": "No",
        "euSecurityVerificationRequired": "No",
        "euSecuritizationTipId": "n/a",
        "callDate": "2029-09-25T00:00:00-07:00",
        "price": 99.3,
        "tcwEsg": "No",
        "esgCollateralType": "n/a",
        "tcwEsgType": "xxxxxxxxx",
        "slicerType": "MBS",
        "mbsType": "Non-Agency",
        "loanCredit": "Non-QM",
        "mbsCollateral": "Fixed",
        "mbsCollateralSub": "Other",
        "srMostCashFlow": "Non-Qualifying Mortgage",
        "trancheType": "SEQ",
        "loanCategory": "Non-QM",
        "collateral": "Non-Agency",
        "ffiecQual": "",
        "documents": [
          {
            "securitySetupDocumentId": 1,
            "fileName": "Offering Memorandum",
            "filePath": "filename.extension"
          }
        ]
      },
      {
        "securitySetupRequestId": 5,
        "description": "XYZ",
        "identifierType": "Cusip",
        "identifierValue": "123ABC456",
        "createdDate": "2026-01-14T08:00:00-08:00",
        "createdBy": "John Doe",
        "setupStatus": "Aladdin Setup (Native Fields) In Progress",
        "riskAnalyticsStatus": "Not Started",
        "readyForTradingStatus": "Not Ready",
        "processTime": null,
        "privateDeal": "No",
        "ssapPassword": "N/A",
        "marketSector": "",
        "yellowKey": "MTGE",
        "aladdinCdiId": "BDL123456",
        "cusip": "123ABC456",
        "newIssue": "No",
        "euSecurityVerificationRequired": "No",
        "euSecuritizationTipId": "n/a",
        "callDate": "2029-09-25T00:00:00-07:00",
        "price": 99.3,
        "tcwEsg": "No",
        "esgCollateralType": "n/a",
        "tcwEsgType": "xxxxxxxxx",
        "slicerType": "MBS",
        "mbsType": "Non-Agency",
        "loanCredit": "Non-QM",
        "mbsCollateral": "Fixed",
        "mbsCollateralSub": "Other",
        "srMostCashFlow": "Non-Qualifying Mortgage",
        "trancheType": "SEQ",
        "loanCategory": "Non-QM",
        "collateral": "Non-Agency",
        "ffiecQual": "",
        "documents": [
          {
            "securitySetupDocumentId": 1,
            "fileName": "Offering Memorandum",
            "filePath": "filename.extension"
          }
        ]
      },
      {
        "securitySetupRequestId": 6,
        "description": "XYZ",
        "identifierType": "Cusip",
        "identifierValue": "123ABC456",
        "createdDate": "2026-01-14T08:00:00-08:00",
        "createdBy": "John Doe",
        "setupStatus": "Aladdin Setup (Native Fields) Complete",
        "riskAnalyticsStatus": "Analytics Requested",
        "readyForTradingStatus": "Not Ready",
        "processTime": null,
        "privateDeal": "No",
        "ssapPassword": "N/A",
        "marketSector": "",
        "yellowKey": "MTGE",
        "aladdinCdiId": "BDL123456",
        "cusip": "123ABC456",
        "newIssue": "No",
        "euSecurityVerificationRequired": "No",
        "euSecuritizationTipId": "n/a",
        "callDate": "2029-09-25T00:00:00-07:00",
        "price": 99.3,
        "tcwEsg": "No",
        "esgCollateralType": "n/a",
        "tcwEsgType": "xxxxxxxxx",
        "slicerType": "MBS",
        "mbsType": "Non-Agency",
        "loanCredit": "Non-QM",
        "mbsCollateral": "Fixed",
        "mbsCollateralSub": "Other",
        "srMostCashFlow": "Non-Qualifying Mortgage",
        "trancheType": "SEQ",
        "loanCategory": "Non-QM",
        "collateral": "Non-Agency",
        "ffiecQual": "",
        "documents": [
          {
            "securitySetupDocumentId": 1,
            "fileName": "Offering Memorandum",
            "filePath": "filename.extension"
          }
        ]
      },
      {
        "securitySetupRequestId": 7,
        "description": "XYZ",
        "identifierType": "Cusip",
        "identifierValue": "123ABC456",
        "createdDate": "2026-01-14T08:00:00-08:00",
        "createdBy": "John Doe",
        "setupStatus": "CDF Setup In Progress",
        "riskAnalyticsStatus": "Not Started",
        "readyForTradingStatus": "Not Ready",
        "processTime": null,
        "privateDeal": "No",
        "ssapPassword": "N/A",
        "marketSector": "",
        "yellowKey": "MTGE",
        "aladdinCdiId": "BDL123456",
        "cusip": "123ABC456",
        "newIssue": "No",
        "euSecurityVerificationRequired": "No",
        "euSecuritizationTipId": "n/a",
        "callDate": "2029-09-25T00:00:00-07:00",
        "price": 99.3,
        "tcwEsg": "No",
        "esgCollateralType": "n/a",
        "tcwEsgType": "xxxxxxxxx",
        "slicerType": "MBS",
        "mbsType": "Non-Agency",
        "loanCredit": "Non-QM",
        "mbsCollateral": "Fixed",
        "mbsCollateralSub": "Other",
        "srMostCashFlow": "Non-Qualifying Mortgage",
        "trancheType": "SEQ",
        "loanCategory": "Non-QM",
        "collateral": "Non-Agency",
        "ffiecQual": "",
        "documents": [
          {
            "securitySetupDocumentId": 1,
            "fileName": "Offering Memorandum",
            "filePath": "filename.extension"
          }
        ]
      },
      {
        "securitySetupRequestId": 8,
        "description": "XYZ",
        "identifierType": "Cusip",
        "identifierValue": "123ABC456",
        "createdDate": "2026-01-14T08:00:00-08:00",
        "createdBy": "John Doe",
        "setupStatus": "CDF Setup Complete",
        "riskAnalyticsStatus": "Analytics Verified In Aladdin",
        "readyForTradingStatus": "Ready",
        "processTime": 20,
        "privateDeal": "No",
        "ssapPassword": "N/A",
        "marketSector": "",
        "yellowKey": "MTGE",
        "aladdinCdiId": "BDL123456",
        "cusip": "123ABC456",
        "newIssue": "No",
        "euSecurityVerificationRequired": "No",
        "euSecuritizationTipId": "n/a",
        "callDate": "2029-09-25T00:00:00-07:00",
        "price": 99.3,
        "tcwEsg": "No",
        "esgCollateralType": "n/a",
        "tcwEsgType": "xxxxxxxxx",
        "slicerType": "MBS",
        "mbsType": "Non-Agency",
        "loanCredit": "Non-QM",
        "mbsCollateral": "Fixed",
        "mbsCollateralSub": "Other",
        "srMostCashFlow": "Non-Qualifying Mortgage",
        "trancheType": "SEQ",
        "loanCategory": "Non-QM",
        "collateral": "Non-Agency",
        "ffiecQual": "",
        "documents": [
          {
            "securitySetupDocumentId": 1,
            "fileName": "Offering Memorandum",
            "filePath": "filename.extension"
          }
        ]
      },
      {
        "securitySetupRequestId": 9,
        "description": "XYZ",
        "identifierType": "Cusip",
        "identifierValue": "123ABC456",
        "createdDate": "2026-01-14T08:00:00-08:00",
        "createdBy": "John Doe",
        "setupStatus": "CDF Setup Partially Complete",
        "riskAnalyticsStatus": "Analytics Verified In Aladdin",
        "readyForTradingStatus": "Ready For Prelim",
        "processTime": null,
        "privateDeal": "No",
        "ssapPassword": "N/A",
        "marketSector": "",
        "yellowKey": "MTGE",
        "aladdinCdiId": "BDL123456",
        "cusip": "123ABC456",
        "newIssue": "No",
        "euSecurityVerificationRequired": "No",
        "euSecuritizationTipId": "n/a",
        "callDate": "2029-09-25T00:00:00-07:00",
        "price": 99.3,
        "tcwEsg": "No",
        "esgCollateralType": "n/a",
        "tcwEsgType": "xxxxxxxxx",
        "slicerType": "MBS",
        "mbsType": "Non-Agency",
        "loanCredit": "Non-QM",
        "mbsCollateral": "Fixed",
        "mbsCollateralSub": "Other",
        "srMostCashFlow": "Non-Qualifying Mortgage",
        "trancheType": "SEQ",
        "loanCategory": "Non-QM",
        "collateral": "Non-Agency",
        "ffiecQual": "",
        "documents": [
          {
            "securitySetupDocumentId": 1,
            "fileName": "Offering Memorandum",
            "filePath": "filename.extension"
          }
        ]
      }
    ]
  }
}