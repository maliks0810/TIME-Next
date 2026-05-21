import axios from 'axios';
import { showErrorMessage, showSuccessMessage } from './notifications';
import { downloadReportService } from './services';
import { DownloadReportParams } from './types';

const DEFAULT_CONTENT_TYPE = 'application/json';
const DEFAULT_TIMEOUT = 120000; // 2 min

export const generateUUID = (): string => crypto.randomUUID();

export const getOktaAccessToken = (): string | undefined => {
    try {
        const raw = localStorage?.getItem('okta-token-storage');
        const token: unknown = JSON.parse(raw ?? '')?.accessToken?.accessToken;
        if (typeof token !== 'string' || !token) return undefined;
        return token.startsWith('Bearer ') ? token.slice('Bearer '.length) : token;
    } catch {
        return undefined;
    }
};

export const serviceRequest =
    (
        baseURL: string,
        contentType: string = DEFAULT_CONTENT_TYPE,
        timeout: number = DEFAULT_TIMEOUT
    ) =>
        () => {
            const accessToken = getOktaAccessToken();
            const authorization = accessToken ? `Bearer ${accessToken}` : undefined;
            console.log(baseURL);
            return axios.create({
                baseURL,
                timeout,
                headers: {
                    'Content-Type': contentType,
                    'X-Correlation-ID': generateUUID(),
                    ...(authorization && { Authorization: authorization }),
                },
            });
        };
export const handleDownloadPackage = async (reportingDate: string, reportType: string) => {
  try {
    const params: DownloadReportParams = {
      report_type: reportType,
      reporting_date: reportingDate,
    };

    const response = await downloadReportService(params);

    const date = new Date(reportingDate);
    const monthName = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const fileName = `Nippon-Reports-${monthName}-${year}.zip`;

    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    showSuccessMessage(`Downloaded ${monthName} ${year} package successfully!`);
  } catch{
    showErrorMessage('Failed to download package');
  }
};

const triggerFileDownload = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const handleDownloadReport = async (
  reportname: string,
  reportingDate: string,
  reportType: string,
) => {
  try {
    const params: DownloadReportParams = {
      report_type: reportType,
      reporting_date: reportingDate,
      file_name: reportname,
    };

    const response = await downloadReportService(params);
    const date = new Date(reportingDate);
    const monthName = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const fileName = `${reportname.replace(/\.[^/.]+$/, '')}-${monthName}-${year}.zip`;

    triggerFileDownload(new Blob([response.data]), fileName);
    showSuccessMessage(`Downloaded ${fileName} successfully!`);
  } catch  {
    showErrorMessage('Failed to download report');
  }
};
