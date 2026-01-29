import axios from "axios"
import { ISecuritySetupRequest, ISecuritySetupRequestAttachment } from "../pages/dashboard/lib/SecurityRequest";
import { SecuritySetupRequest, SecuritySetupRequestAttachment } from './domain-objects/DashboardApiResponse';
import { API_BASE_URL } from "../constants/environmentConstants";

export const transformDashboardSecuritySetupRequestDocument = (apiData: SecuritySetupRequestAttachment): ISecuritySetupRequestAttachment => {
  return {
    id: apiData.attachmentId,
    fileName: apiData.fileName,
    filePath: apiData.fileName + '.' + apiData.fileExtension,
  }
}

export const transformDashboardSecuritySetupRequest = (apiData: SecuritySetupRequest): ISecuritySetupRequest => {
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
          isPrivateDeal: apiData.isPrivateDeal ? 'Yes' : 'No',
          ssapIdPassword: apiData.ssapIdPassword,
          marketSectorType: apiData.marketSectorType,
          yellowKey: apiData.yellowKey,
          aladdinCdiId: apiData.aladdinCdiId,
          cusip: apiData.cusip,
          description: apiData.description,
          isNewIssue: apiData.isNewIssue ? 'Yes' : 'No',
          isEuSecuritizationRequired: apiData.isEuSecuritizationRequired ? 'Yes' : 'No',
          euSecuritizationTipEuId: apiData.euSecuritizationTipEuId,
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
          srMostCashFlow: apiData.seniorMostCashFlow,
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
) : Promise<ISecuritySetupRequest[]> => {
  let securityRequests : ISecuritySetupRequest[] = []
  
  try {
    const baseUrl = API_BASE_URL;
    const endpoint = "dashboarditems";
    const params = {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
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