import axios from "axios"
import { IDashboardSecuritySetupRequest, IDashboardSecuritySetupRequestAttachment } from "../pages/dashboard/lib/DashboardSecuritySetupRequest";
import { IDashboardSearchParameters } from "../pages/dashboard/lib/DashboardSearchParameters";
import { SecuritySetupRequest, SecuritySetupRequestAttachment } from './domain-objects/DashboardApiResponse';
import { API_BASE_URL } from "../constants/environmentConstants";
import { getDateFromString, getLocalDateTimeOffsetIsoString } from "../utils/DateTimeHelper";

export const transformDashboardSecuritySetupRequestDocument = (apiData: SecuritySetupRequestAttachment): IDashboardSecuritySetupRequestAttachment => {
  return {
    id: apiData.attachmentId,
    fileName: apiData.fileName,
    filePath: apiData.fileName + '.' + apiData.fileExtension,
  }
}

export const transformDashboardSecuritySetupRequest = (apiData: SecuritySetupRequest): IDashboardSecuritySetupRequest => {
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
      isPrivateDeal: apiData.isPrivateDeal,
      ssapIdPassword: apiData.ssapIdPassword,
      marketSectorType: apiData.marketSectorType,
      yellowKey: apiData.yellowKey,
      aladdinCdiId: apiData.aladdinCdiId,
      cusip: apiData.cusip,
      description: apiData.description,
      tranche: apiData.tranche,
      isNewIssue: apiData.isNewIssue ? 'Yes' : 'No',
      isEuSecuritizationRequired: apiData.isEuSecuritizationRequired ? 'Yes' : 'No',
      euSecuritizationTipEuId: apiData.euSecuritizationTipEuId,
      callDate: getDateFromString(apiData.callDate),
      price: apiData.price ? apiData.price.toFixed(2) : '',
      callableValue: apiData.callableValue?.toLowerCase() === "y" ? "Yes" : apiData.callableValue?.toLowerCase() === "n" ? "No" : "",
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
    securityRequestIntexFields: {
      intexDealName: apiData.intexDealName,
      intexPassword: apiData.intexPassword,
      dealName: apiData.dealName
    },
    securityRequestArcFields: {
      prepaymentTypeValue: apiData.prepaymentTypeValue,
      defaultTypeValue: apiData.defaultTypeValue,
      prepaymentSpeed: apiData.prepaymentSpeed,
      defaultSpeed: apiData.defaultSpeed,
      severity: apiData.severity,
      delinquency: apiData.delinquency,
    },
    securityRequestDocuments: apiData.documents.map(transformDashboardSecuritySetupRequestDocument),
  };
};

export const getSecurityRequestsDashboard = async (
  parameters: IDashboardSearchParameters
): Promise<IDashboardSecuritySetupRequest[]> => {
  let securityRequests: IDashboardSecuritySetupRequest[] = []

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
        searchTerm: parameters.searchTerm ?? "",
        startDate: parameters.startDate ? getLocalDateTimeOffsetIsoString(parameters.startDate) : null,
        endDate: parameters.endDate ? getLocalDateTimeOffsetIsoString(parameters.endDate) : null,
        isPagingEnabled: false,
      }
    }

    const response = await axios.get(baseUrl + endpoint, params);

    const data = response.data;
    const securitySetupRequests: SecuritySetupRequest[] = data.dashboard.securitySetupRequestCollection;
    const mappedSecuritySetupRequests = securitySetupRequests.map(transformDashboardSecuritySetupRequest);

    securityRequests = mappedSecuritySetupRequests;
  }
  catch {

  }
  finally {
    return securityRequests;
  }
};
