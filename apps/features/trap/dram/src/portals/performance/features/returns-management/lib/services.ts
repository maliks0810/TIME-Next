// performance/api/v1
import * as URI from 'uri-js';
import { ImportRowCollectionResponse, MergeLogRowCollectionResponse } from './types';
import { serviceRequest } from './serviceUtils';

const resolveUri = (baseUri?: string, relativeUri?: string): string => URI.resolve(URI.normalize(baseUri || ''), relativeUri || '');

const BASE_DRAM_2_SERVICE_PATH = import.meta.env.VITE_R2_TRAP_DRAM_2_SERVICE;
const BASE_DRAM_2_PATH = resolveUri(BASE_DRAM_2_SERVICE_PATH, './api/performance/');
const buildDram2Url = (path: string) => resolveUri(BASE_DRAM_2_PATH, path);

const BASE_RTN_ATTR_SERVICE_PATH = import.meta.env.VITE_R2_TRAP_DRAM_1_SERVICE;
const BASE_RTN_ATTR_PATH = resolveUri(BASE_RTN_ATTR_SERVICE_PATH, './rtn-attribution/api/v2/');
const buildUrl = (path: string) => resolveUri(BASE_RTN_ATTR_PATH, path);

export const URL_PERF_OVERLAY_BULK_CSV_UPLOAD = buildUrl('./perf-overlay-bulk-csv/');
export const URL_PERF_OVERLAY_CSV_FILE = buildUrl('./perf-overlay-imports-csv/');

export const getImports = () =>
  serviceRequest(buildDram2Url('./perf-overlay-imports/'))().get<
    ImportRowCollectionResponse>('');
export const getMergeLogs = ()  =>
  serviceRequest(buildDram2Url('./perf-overlay-merge-log/'))().get<
  MergeLogRowCollectionResponse>('');