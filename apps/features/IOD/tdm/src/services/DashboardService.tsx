import axios, { AxiosError } from 'axios';
import { ISecurityRequest, ISecurityRequestDocument, securityRequestsMockData } from "../pages/dashboard/lib/SecurityRequest";

export const transformApiSecurityRequestDocument = (apiData: any): ISecurityRequestDocument => {
  return {
    fileName: apiData.fileName,
    filePath: apiData.filePath,
  }
}

export const transformApiSecurityRequestsDashboard = (apiData: any): ISecurityRequest => {
    return {
        id: Number(apiData.securitySetupRequestsId),
        description: apiData.description,
        identifier: apiData.identifier,
        createdDate: apiData.createdDate,
        createdBy: apiData.createdBy,
        setupStatus: apiData.setupStatus,
        riskAnalyticsStatus: apiData.riskAnalyticsStatus,
        readyForTradingStatus: apiData.readyForTradingStatus,
        processTime: Number(apiData.processTime),
        securityRequestDetails: {
          identifierType: apiData.identifierType,
          identifierValue: apiData.identifierValue,
          privateDeal: apiData.privateDeal,
          ssapPassword: apiData.ssapPassword,
          marketSector: apiData.marketSector,
          yellowKey: apiData.yellowKey,
          aladdinCdiId: apiData.aladdinCdiId,
          cusip: apiData.cusip,
          description: apiData.description,
          newIssue: apiData.newIssue,
          euSecurity: apiData.euSecurity,
          euSecuritizationTipId: apiData.euSecuritizationTipId,
          callDate: apiData.callDate,
          price: apiData.price,
        },
        securityRequestEsgFields: {
          tcwEsg: apiData.tcwEsg,
          esgCollateralType: apiData.esgCollateralType,
          tcwEsgType: apiData.tcwEsgType,
        },
        securityRequestTradeFields: {
          slicerType: apiData.slicerType,
          mbsType: apiData.mbsType,
          loanCredit: apiData.loanCredit,
          mbsCollateral: apiData.mbsCollateral,
          mbsCollateralSub: apiData.mbsCollateralSub,
          srMostCashFlow: apiData.srMostCashFlow,
          trancheType: apiData.trancheType,
          loanCategory: apiData.loanCategory,
          collateral: apiData.collateral,
          ffiecQual: apiData.ffiecQual,
        },
        securityRequestDocuments:
          apiData.documents.map(transformApiSecurityRequestDocument),
    };
};

export const getSecurityRequestsDashboard = async () : Promise<ISecurityRequest[]> => {
  let securityRequests : ISecurityRequest[] = []
  
  try {
    //const response = await axios.get("");
    //securityRequests = response.data.map(transformApiSecurityRequestsDashboard);
    securityRequests = securityRequestsMockData;
  }
  catch (err) {
    const error = err as AxiosError;
  }

  return securityRequests;
};