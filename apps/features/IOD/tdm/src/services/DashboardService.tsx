import axios from "axios"
import { IDashboardDeleteSecuritySetupRequest, IDashboardSecuritySetupRequest, IDashboardSecuritySetupRequestAttachment, ISecuritySetupDashboardResponse, IDashboardStats } from "../pages/dashboard/lib/DashboardSecuritySetupRequest";
import { IDashboardDetailsDeleteParameters, IDashboardSearchParameters, IDuplicateSecuritySetupRequestParameters } from "../pages/dashboard/lib/DashboardSearchParameters";
import { DeleteSecuritySetupRequest, SecuritySetupRequest, SecuritySetupRequestAttachment } from './domain-objects/DashboardApiResponse';
import { API_BASE_URL } from "../constants/environmentConstants";
import { getDateFromString, getLocalDateTimeOffsetIsoString } from "../utils/DateTimeHelper";

interface IDmAssignmentPayload {
  securitySetupRequestId: number;
  name: string;
  email: string;
  updatedBy: string;
}

interface IDmAssignmentResponse {
  isDmAssignmentUpdated: boolean;
}

export const transformDashboardSecuritySetupRequestDocument = (apiData: SecuritySetupRequestAttachment): IDashboardSecuritySetupRequestAttachment => {
  return {
    id: apiData.attachmentId,
    fileName: apiData.fileName,
    sharepointWebUrl: apiData.sharepointWebUrl,
  }
}

export const transformDashboardDeleteSecuritySetupRequest = (apiData: DeleteSecuritySetupRequest): IDashboardDeleteSecuritySetupRequest => {
  return {
    id: Number(apiData.securitySetupRequest.securitySetupRequestId),
    description: apiData.securitySetupRequest.description,
    identifier: apiData.securitySetupRequest.identifierValue,
    createdDate: new Date(apiData.securitySetupRequest.createdDate),
    createdBy: apiData.securitySetupRequest.createdBy,
    setupStatus: apiData.securitySetupRequest.setupStatus,
    riskAnalyticsStatus: apiData.securitySetupRequest.riskAnalyticsStatus,
    readyForTradingStatus: apiData.securitySetupRequest.readyForTradingStatus,
    euSecuritizationStatus: apiData.securitySetupRequest.euSecuritizationStatus,
    erisaStatus: apiData.securitySetupRequest.erisaStatus,
    processTime: Number(apiData.securitySetupRequest.processTime),
    securityRequestDetails: {
      identifierType: apiData.securitySetupRequest.identifierType,
      identifierValue: apiData.securitySetupRequest.identifierValue,
      isPrivateDeal: apiData.securitySetupRequest.isPrivateDeal ? 'Yes' : 'No',
      ssapIdPassword: apiData.securitySetupRequest.ssapIdPassword,
      marketSectorType: apiData.securitySetupRequest.marketSectorType,
      yellowKey: apiData.securitySetupRequest.yellowKey,
      aladdinCdiId: apiData.securitySetupRequest.aladdinCdiId,
      cusip: apiData.securitySetupRequest.cusip,
      description: apiData.securitySetupRequest.description,
      tranche: apiData.securitySetupRequest.tranche,
      isNewIssue: apiData.securitySetupRequest.isNewIssue ? 'Yes' : 'No',
      isEuSecuritizationRequired: apiData.securitySetupRequest.isEuSecuritizationRequired ? 'Yes' : 'No',
      euSecuritizationTipEuId: apiData.securitySetupRequest.euSecuritizationTipEuId,
      callDate: getDateFromString(apiData.securitySetupRequest.callDate),
      price: apiData.securitySetupRequest.price ? apiData.securitySetupRequest.price.toFixed(2) : '',
      callableValue: apiData.securitySetupRequest.callableValue,
    },
    securityRequestEsgFields: {
      tcwEsg: apiData.securitySetupRequest.tcwEsg,
      esgCollateralType: apiData.securitySetupRequest.esgCollateralType,
      tcwEsgType: apiData.securitySetupRequest.tcwEsgType,
    },
    securityRequestTradeFields: {
      slicerType: apiData.securitySetupRequest.slicerType,
      mbsType: apiData.securitySetupRequest.mbsType,
      loanCredit: apiData.securitySetupRequest.loanCredit,
      mbsCollateral: apiData.securitySetupRequest.mbsCollateral,
      mbsCollateralSub: apiData.securitySetupRequest.mbsCollateralSub,
      srMostCashFlow: apiData.securitySetupRequest.seniorMostCashFlow,
      trancheType: apiData.securitySetupRequest.trancheType,
      loanCategory: apiData.securitySetupRequest.loanCategory,
      collateral: apiData.securitySetupRequest.collateral,
      ffiecQual: apiData.securitySetupRequest.ffiecQual,
    },
    securityRequestIntexFields: {
      intexDealName: apiData.securitySetupRequest.intexDealName,
      intexPassword: apiData.securitySetupRequest.intexPassword,
      dealName: apiData.securitySetupRequest.dealName
    },
    securityRequestArcFields: {
      prepaymentTypeValue: apiData.securitySetupRequest.prepaymentTypeValue,
      defaultTypeValue: apiData.securitySetupRequest.defaultTypeValue,
      prepaymentSpeed: apiData.securitySetupRequest.prepaymentSpeed,
      defaultSpeed: apiData.securitySetupRequest.defaultSpeed,
      severity: apiData.securitySetupRequest.severity,
      delinquency: apiData.securitySetupRequest.delinquency,
    },
    isCancelled: apiData.isCancelled,
  };
};

export const transformDashboardSecuritySetupRequest = (apiData: SecuritySetupRequest): IDashboardSecuritySetupRequest => {
  return {
    id: Number(apiData.securitySetupRequestId),
    description: apiData.setupStatus.toLowerCase() === 'request initiated' ? apiData.dealName : apiData.description,
    tranche: apiData.tranche,
    identifier: apiData.identifierValue,
    createdDate: new Date(apiData.createdDate),
    createdBy: apiData.createdBy,
    setupStatus: apiData.setupStatus,
    riskAnalyticsStatus: apiData.riskAnalyticsStatus,
    readyForTradingStatus: apiData.readyForTradingStatus,
    euSecuritizationStatus: apiData.euSecuritizationStatus,
    erisaStatus: apiData.erisaStatus,
    processTime: Number(apiData.processTime),
    dmAnalystName: apiData.dmAnalystName,
    dmAnalystEmail: apiData.dmAnalystEmail,
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
      tranche: apiData.tranche,
      isNewIssue: apiData.isNewIssue ? 'Yes' : 'No',
      isEuSecuritizationRequired: apiData.isEuSecuritizationRequired ? 'Yes' : 'No',
      euSecuritizationTipEuId: apiData.euSecuritizationTipEuId,
      callDate: getDateFromString(apiData.callDate),
      price: apiData.price ? apiData.price.toFixed(2) : '',
      callableValue: apiData.callableValue,
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
    noteInstructions: apiData.noteInstructions,
  };
};

export const getSecurityRequestsDashboard = async (
  parameters: IDashboardSearchParameters
): Promise<ISecuritySetupDashboardResponse> => {
  let securityRequests: IDashboardSecuritySetupRequest[] = [];
  let dashboardStats: IDashboardStats = {
    totalRequests: 0,
    averageSetupTime: 0,
    securitySetupStatusData: [],
    riskAnalyticsStatusData: []
  };

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

    const { dashboardStats: responseStats } = data.dashboard;
    dashboardStats = responseStats;

    securityRequests = mappedSecuritySetupRequests;
  }
  catch {

  }
  finally {
    return {
      dashboardStats,
      securityRequests
    };
  }
};

export const deleteSecurityRequests = async (
  parameters: IDashboardDetailsDeleteParameters
): Promise<IDashboardDeleteSecuritySetupRequest> => {
  let delSecurityRequests = {} as IDashboardDeleteSecuritySetupRequest;
  try {
    const baseUrl = API_BASE_URL;
    const endpoint = "securitysetuprequests/deletesecuritysetup";

    const params = {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: {
        securitySetupRequestId: parameters.securitySetupRequestId ?? "",
        updatedBy: parameters.updatedBy ?? "",
        canCancelRequestAfterSubmission: parameters.canCancelRequestAfterSubmission ?? false
      }
    }

    const response = await axios.delete(baseUrl + endpoint, params);
    const data = response.data;
    const deleteSecuritySetupRequests: DeleteSecuritySetupRequest = {
      securitySetupRequest: data.securitySetupRequest,
      isCancelled: data.isCancelled,
    };
    const mappedSecuritySetupRequests = transformDashboardDeleteSecuritySetupRequest(deleteSecuritySetupRequests);

    delSecurityRequests = mappedSecuritySetupRequests;
  }
  catch {

  }
  finally {
    return delSecurityRequests;
  }
}

export const duplicateSecuritySetupRequest = async (
  parameters: IDuplicateSecuritySetupRequestParameters
) => {
  try {
    const baseUrl = API_BASE_URL;
    const endpoint = "securitysetuprequests/clone";

    const payload = {
      securitySetupRequestId: parameters.securitySetupRequestId,
      userName: parameters.userName
    }

    await axios.post(baseUrl + endpoint, payload)
  }
  catch {

  }
}

export const setDmAssignment = async (payload: IDmAssignmentPayload): Promise<IDmAssignmentResponse> => {
  const response = await axios.post(`${API_BASE_URL}securitysetuprequests/dmassignment`, payload);
  return response.data;
}
