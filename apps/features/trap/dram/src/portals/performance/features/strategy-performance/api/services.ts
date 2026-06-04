// performance/api/v1
import * as URI from 'uri-js';
import { serviceRequest } from '../api/serviceUtils';

const resolveUri = (baseUri?: string, relativeUri?: string): string => URI.resolve(URI.normalize(baseUri || ''), relativeUri || '');

const BASE_DRAM_2_SERVICE_PATH = import.meta.env.VITE_R2_TRAP_DRAM_2_SERVICE;
const BASE_DRAM_2_PATH = resolveUri(BASE_DRAM_2_SERVICE_PATH, './api/performance/');
const buildDram2Url = (path: string) => resolveUri(BASE_DRAM_2_PATH, path);

const URL_FUND_DAILY_RETURNS = buildDram2Url('./pa/fund-daily-returns/');
export const fetchFuncDailyReturnsService = () =>
  serviceRequest(URL_FUND_DAILY_RETURNS)().get('');