// performance/api/v1
import * as URI from 'uri-js';
import { serviceRequest } from '../lib/serviceUtils';

const resolveUri = (baseUri?: string, relativeUri?: string): string => URI.resolve(URI.normalize(baseUri || ''), relativeUri || '');

const BASE_RTN_ATTR_SERVICE_PATH = import.meta.env.VITE_R2_TRAP_DRAM_1_SERVICE;
const BASE_RTN_ATTR_PATH = resolveUri(BASE_RTN_ATTR_SERVICE_PATH, './rtn-attribution/api/v2/');
const buildUrl = (path: string) => resolveUri(BASE_RTN_ATTR_PATH, path);

const BASE_DRAM_2_SERVICE_PATH = import.meta.env.VITE_R2_TRAP_DRAM_2_SERVICE;
const BASE_DRAM_2_PATH = resolveUri(BASE_DRAM_2_SERVICE_PATH, './api/performance/');
const buildDram2Url = (path: string) => resolveUri(BASE_DRAM_2_PATH, path);

const URL_PORT_LIST = buildUrl('./official-perf-portfolio-list');
const URL_PORT_SUMMARY = buildUrl('./official-perf-portfolio-summary');
const URL_PERFORMANCE_OFFICIAL = buildUrl('./official-performance-returns');
export const fetchPortfolioListService = () => serviceRequest(URL_PORT_LIST)().get('');
export const fetchPortfolioSummaryService = (asOfDate: string | unknown) => serviceRequest(URL_PORT_SUMMARY)().get(`?asOfDate=${asOfDate}`);
export const fetchOfficalPerformanceReturnsService = (portfolioNumber: string) => serviceRequest(URL_PERFORMANCE_OFFICIAL)()
	.get(`?portfolioNumber=${portfolioNumber}`);

const URL_NOTES = buildDram2Url('./notes');
export async function saveNotesService(notes: string, noteType: string, portfolioId: string, userId: string) {
  return serviceRequest(URL_NOTES)().post('', {
    noteText: notes,
    entityType: noteType,
	  noteCategory: "General",
    visibility: "public",
    entityId: portfolioId,
    severity: "Info",
    createdBy: userId
  });
}
export const fetchPerformanceNotesService = (noteType: string | unknown, portfolioId: string) =>
  serviceRequest(URL_NOTES)().get(`?entityType=${noteType}&entityId=${portfolioId}`);

const URL_EXCLUSION_ACCOUNTS = buildDram2Url('./pa/exclusion_accounts/');
export const fetchExclusionAccountsService = () =>
  serviceRequest(URL_EXCLUSION_ACCOUNTS)().get('');