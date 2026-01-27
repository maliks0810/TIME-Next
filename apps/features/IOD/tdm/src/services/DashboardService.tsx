import axios from "axios"
import { ISecurityRequest, ISecurityRequestDocument } from "../pages/dashboard/lib/SecurityRequest";
import { SecuritySetupRequest, SecuritySetupRequestDocument } from './domain-objects/DashboardApiResponse';
import { API_BASE_URL } from "../constants/environmentConstants";

export const transformDashboardSecuritySetupRequestDocument = (apiData: SecuritySetupRequestDocument): ISecurityRequestDocument => {
  return {
    id: apiData.securitySetupDocumentId,
    fileName: apiData.fileName,
    filePath: apiData.filePath,
  }
}

export const transformDashboardSecuritySetupRequest = (apiData: SecuritySetupRequest): ISecurityRequest => {
    return {
        id: Number(apiData.securitySetupRequestId),
        description: apiData.description,
        identifier: apiData.identifierValue,
        createdDate: new Date(apiData.createdDate),
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
          euSecurity: apiData.euSecurityVerificationRequired,
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
        securityRequestDocuments: apiData.documents.map(transformDashboardSecuritySetupRequestDocument),
    };
};

export const getSecurityRequestsDashboard = async (
  searchTerm: string,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined
) : Promise<ISecurityRequest[]> => {
  let securityRequests : ISecurityRequest[] = []
  
  try {
    const baseUrl = API_BASE_URL;
    const endpoint = "dashboarditems";
    const params = {
      params: {
        searchTerm: searchTerm ?? "",
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        isPagingEnabled: false,
      }
    }

    const response = await axios.get(baseUrl + endpoint, params);
    
    const data = response.data;
    const securitySetupRequests : SecuritySetupRequest[] = data.dashboard.securitySetupRequestCollection;
    const mappedSecuritySetupRequests = securitySetupRequests.map(transformDashboardSecuritySetupRequest);

    securityRequests = mappedSecuritySetupRequests;
  }
  catch {
    
  }
  finally {
    return securityRequests;
  }
};