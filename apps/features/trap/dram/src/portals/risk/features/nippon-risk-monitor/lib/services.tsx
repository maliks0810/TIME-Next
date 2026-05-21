
// api/nippon
import * as URI from 'uri-js';
import { serviceRequest } from '../lib/serviceUtils';
import { DownloadReportParams, RunBuyMaintainRequest } from './types';
const resolveUri = (baseUri?: string, relativeUri?: string): string => URI.resolve(URI.normalize(baseUri || ''), relativeUri || '');

const BASE_DRAM_2_SERVICE_PATH = import.meta.env.VITE_R2_TRAP_DRAM_2_SERVICE;
const BASE_DRAM_2_NIPPON_PATH = resolveUri(BASE_DRAM_2_SERVICE_PATH, './api/nippon/');
const buildDram2Url = (path: string) => resolveUri(BASE_DRAM_2_NIPPON_PATH, path);

//https://dram-qa.np.tcw.com/api/nippon/reports?reporting_date=2026-03-31&report_type=Buy%20and%20Maintain"
const URL_REPORTS_URL = buildDram2Url('./reports/details');

export const fetchNipponReportsService = (reporting_date: string) => {
	return serviceRequest(`${URL_REPORTS_URL}?report_type=Buy%20and%20Maintain&reporting_date=${encodeURIComponent(reporting_date)}`)().get('');
}

//https://dram-qa.np.tcw.com/api/nippon/reports/month-summary?report_type=Buy%20and%20Maintain
const URL_REPORTS_SUMMARY_URL = buildDram2Url('./reports/month-summary?report_type=Buy%20and%20Maintain');
export const fetchNipponReportSummaryService = () =>
	serviceRequest(URL_REPORTS_SUMMARY_URL)().get('');

//insurance url
const R2_TRAP_BASE_SERVICE_INSURANCE = import.meta.env.VITE_R2_TRAP_BASE_SERVICE_INSURANCE;
const R2_TRAP_INSURANCE_API_PATH = import.meta.env.VITE_R2_TRAP_INSURANCE_API_PATH;
const API_PATHS = {
  BUY_MAINTAIN: `${R2_TRAP_INSURANCE_API_PATH}/buy_maintain`,
  DOWNLOAD_REPORTS: `${R2_TRAP_INSURANCE_API_PATH}/download_reports`,
};

export const downloadReportService = (params: DownloadReportParams) => serviceRequest(`${R2_TRAP_BASE_SERVICE_INSURANCE}${API_PATHS.DOWNLOAD_REPORTS}`)().get('', {
    params,
    responseType: 'arraybuffer',
    transformResponse: [(data) => data],
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  export const runBuyMaintainService = (request: RunBuyMaintainRequest) => serviceRequest(`${R2_TRAP_BASE_SERVICE_INSURANCE}${API_PATHS.BUY_MAINTAIN}`)().post('', {
    test_mode: false,
    validate_output: false,
    upload_to_azure: true,
    ...request,
  });

const URL_WORKSHEET_LIST_URL = buildDram2Url('./worksheets/?report_type=Buy%20and%20Maintain');

export const fetchNipponWorksheetListService = (reporting_date: string, file_name: string) => {
	return serviceRequest(`${URL_WORKSHEET_LIST_URL}&reporting_date=${encodeURIComponent(reporting_date)}&file_name=${encodeURIComponent(file_name)}`)().get('');
}
const URL_WORKSHEET_DETAILS_URL = buildDram2Url('./worksheets/details/?report_type=Buy%20and%20Maintain');
export const fetchNipponWorksheetDetailsService = (reporting_date: string, file_name: string,worksheet_name: string) => {
	return serviceRequest(`${URL_WORKSHEET_DETAILS_URL}&reporting_date=${encodeURIComponent(reporting_date)}&file_name=${encodeURIComponent(file_name)}&worksheet_name=${worksheet_name}&limit=200`)().get('');
}