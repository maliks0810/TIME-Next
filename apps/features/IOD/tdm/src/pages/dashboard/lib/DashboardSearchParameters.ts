import { SESSION_STORAGE_DASHBOARD_GRID_FILTERS, SESSION_STORAGE_DASHBOARD_SEARCH_PARAMETERS } from "../../../constants/dashboardConstants";

export interface IDashboardSearchParameters {
  searchTerm: string;
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
}

export interface IDashboardGridFilters {
  sortColumn: string | undefined;
  sortDirection: string | undefined;
  descriptionFilter: string[] | undefined;
  trancheFilter: string[] | undefined;
  identifierFilter: string[] | undefined;
  createdDateFilter: string[] | undefined;
  createdByFilter: string[] | undefined;
  setupStatusFilter: string[] | undefined;
  riskAnalyticsStatusFilter: string[] | undefined;
  euSecuritizationStatusFilter: string[] | undefined;
  erisaStatusFilter: string[] | undefined;
  readyForTradingStatusFilter: string[] | undefined;
}

export const defaultDashboardSearchParameters : IDashboardSearchParameters = {
  searchTerm: '',
  startDate: new Date(),
  endDate: new Date(),
}

export const defaultDashboardGridFilters : IDashboardGridFilters = {
  sortColumn: "createdDate",
  sortDirection: "desc",
  descriptionFilter: undefined,
  trancheFilter: undefined,
  identifierFilter: undefined,
  createdDateFilter: undefined,
  createdByFilter: undefined,
  setupStatusFilter: undefined,
  riskAnalyticsStatusFilter: undefined,
  euSecuritizationStatusFilter: undefined,
  erisaStatusFilter: undefined,
  readyForTradingStatusFilter: undefined,
}

export interface IDashboardDetailsDeleteParameters {
  securitySetupRequestId: string;
  updatedBy: string;
}

export const defaultDashboardDetailsDeleteParameters : IDashboardDetailsDeleteParameters = {
  securitySetupRequestId: '',
  updatedBy: '',
}

export interface IDuplicateSecuritySetupRequestParameters {
  securitySetupRequestId: number;
  userName: string;
}

export const clearDashboardGridFilters = () : IDashboardGridFilters => {
  let defaultGridFilters = defaultDashboardGridFilters;
  defaultGridFilters.sortColumn = 'createdDate';
  defaultGridFilters.sortDirection = 'desc';
  defaultGridFilters.descriptionFilter = [];
  defaultGridFilters.trancheFilter = [];
  defaultGridFilters.identifierFilter = [];
  defaultGridFilters.createdDateFilter = [];
  defaultGridFilters.createdByFilter = [];
  defaultGridFilters.setupStatusFilter = [];
  defaultGridFilters.riskAnalyticsStatusFilter = [];
  defaultGridFilters.euSecuritizationStatusFilter = [];
  defaultGridFilters.erisaStatusFilter = [];
  defaultGridFilters.readyForTradingStatusFilter = [];

  const sessionStorageRawJson = sessionStorage.getItem(SESSION_STORAGE_DASHBOARD_GRID_FILTERS);
  if (sessionStorageRawJson) {
    const sessionStorageGridFilters : IDashboardGridFilters = JSON.parse(sessionStorageRawJson);
    defaultGridFilters.sortColumn = sessionStorageGridFilters.sortColumn;
    defaultGridFilters.sortDirection = sessionStorageGridFilters.sortDirection;
  }

  // update session storage
  const jsonString = JSON.stringify(defaultGridFilters);
    sessionStorage.setItem(SESSION_STORAGE_DASHBOARD_GRID_FILTERS, jsonString);

  return defaultGridFilters;
}

export const getDefaultDashboardSearchParameters = () : IDashboardSearchParameters => {
  // set default values
  let defaultSearchParameters = defaultDashboardSearchParameters;

  // try to get data from session storage
  const sessionStorageRawJson = sessionStorage.getItem(SESSION_STORAGE_DASHBOARD_SEARCH_PARAMETERS);
  if (sessionStorageRawJson) {
    const sessionStorageSearchParameters = JSON.parse(sessionStorageRawJson);
    if (sessionStorageSearchParameters) {
      if ("searchTerm" in sessionStorageSearchParameters) {
        defaultSearchParameters.searchTerm = sessionStorageSearchParameters.searchTerm;
      }
      if ("startDate" in sessionStorageSearchParameters) {
        if (sessionStorageSearchParameters.startDate) {
          defaultSearchParameters.startDate = new Date(sessionStorageSearchParameters.startDate);
        }
      }
      if ("endDate" in sessionStorageSearchParameters) {
        if (sessionStorageSearchParameters.endDate) {
          defaultSearchParameters.endDate = new Date(sessionStorageSearchParameters.endDate);
        }
      }
    }
  }

  return defaultSearchParameters;
}

export const updateDashboardSearchParameter = (parameter: Partial<IDashboardSearchParameters>) : IDashboardSearchParameters => {
  let updatedSearchParameters : IDashboardSearchParameters = {
    ...defaultDashboardSearchParameters,
    ...parameter,
  }

  // try to get data from session storage
  const sessionStorageRawJson = sessionStorage.getItem(SESSION_STORAGE_DASHBOARD_SEARCH_PARAMETERS);
  if (sessionStorageRawJson) {
    const sessionStorageSearchParameters : IDashboardSearchParameters = JSON.parse(sessionStorageRawJson);
    updatedSearchParameters = {
      ...sessionStorageSearchParameters,
      ...parameter,
    }
  }

  // update session storage
  const jsonString = JSON.stringify(updatedSearchParameters);
    sessionStorage.setItem(SESSION_STORAGE_DASHBOARD_SEARCH_PARAMETERS, jsonString);

  return updatedSearchParameters;
}

export const getDefaultDashboardGridFilters = () : IDashboardGridFilters => {

  let defaultGridFilters = defaultDashboardGridFilters;

  // try to get data from session storage
  const sessionStorageRawJson = sessionStorage.getItem(SESSION_STORAGE_DASHBOARD_GRID_FILTERS);
  if (sessionStorageRawJson) {
    const sessionStorageGridFilters : IDashboardGridFilters = JSON.parse(sessionStorageRawJson);
    if (sessionStorageGridFilters) {
      if ("sortColumn" in sessionStorageGridFilters) {
        defaultGridFilters.sortColumn = sessionStorageGridFilters.sortColumn;
      }
      if ("sortDirection" in sessionStorageGridFilters) {
        defaultGridFilters.sortDirection = sessionStorageGridFilters.sortDirection;
      }
      if ("descriptionFilter" in sessionStorageGridFilters) {
        defaultGridFilters.descriptionFilter = sessionStorageGridFilters.descriptionFilter;
      }
      if ("trancheFilter" in sessionStorageGridFilters) {
        defaultGridFilters.trancheFilter = sessionStorageGridFilters.trancheFilter;
      }
      if ("identifierFilter" in sessionStorageGridFilters) {
        defaultGridFilters.identifierFilter = sessionStorageGridFilters.identifierFilter;
      }
      if ("createdDateFilter" in sessionStorageGridFilters) {
        defaultGridFilters.createdDateFilter = sessionStorageGridFilters.createdDateFilter;
      }
      if ("createdByFilter" in sessionStorageGridFilters) {
        defaultGridFilters.createdByFilter = sessionStorageGridFilters.createdByFilter;
      }
      if ("setupStatusFilter" in sessionStorageGridFilters) {
        defaultGridFilters.setupStatusFilter = sessionStorageGridFilters.setupStatusFilter;
      }
      if ("riskAnalyticsStatusFilter" in sessionStorageGridFilters) {
        defaultGridFilters.riskAnalyticsStatusFilter = sessionStorageGridFilters.riskAnalyticsStatusFilter;
      }
      if ("euSecuritizationStatusFilter" in sessionStorageGridFilters) {
        defaultGridFilters.euSecuritizationStatusFilter = sessionStorageGridFilters.euSecuritizationStatusFilter;
      }
      if ("erisaStatusFilter" in sessionStorageGridFilters) {
        defaultGridFilters.erisaStatusFilter = sessionStorageGridFilters.erisaStatusFilter;
      }
      if ("readyForTradingStatusFilter" in sessionStorageGridFilters) {
        defaultGridFilters.readyForTradingStatusFilter = sessionStorageGridFilters.readyForTradingStatusFilter;
      }
    }
  }

  return defaultGridFilters;
}

export const updateDashboardGridFilters = (parameter: Partial<IDashboardGridFilters>) : IDashboardGridFilters => {
  let updatedGridFilters : IDashboardGridFilters = {
    ...defaultDashboardGridFilters,
    ...parameter,
  }

  // try to get data from session storage
  const sessionStorageRawJson = sessionStorage.getItem(SESSION_STORAGE_DASHBOARD_GRID_FILTERS);
  if (sessionStorageRawJson) {
    const sessionStorageGridFilters : IDashboardGridFilters = JSON.parse(sessionStorageRawJson);
    updatedGridFilters = {
      ...sessionStorageGridFilters,
      ...parameter,
    }
  }

  // update session storage
  const jsonString = JSON.stringify(updatedGridFilters);
    sessionStorage.setItem(SESSION_STORAGE_DASHBOARD_GRID_FILTERS, jsonString);

  return updatedGridFilters;
}
