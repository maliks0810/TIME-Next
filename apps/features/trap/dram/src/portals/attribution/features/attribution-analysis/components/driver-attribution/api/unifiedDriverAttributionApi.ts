import * as URI from 'uri-js';
import type {
  UnifiedDriverAttributionRequest,
  UnifiedDriverAttributionResponse,
} from "../types/unifiedDriverAttribution";

const resolveUri = (baseUri?: string, relativeUri?: string): string => URI.resolve(URI.normalize(baseUri || ''), relativeUri || '');


async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return (await response.json()) as T;
}
const BASE_DRAM_2_SERVICE_PATH = import.meta.env.VITE_R2_TRAP_DRAM_2_SERVICE;
const BASE_DRAM_2_PATH = resolveUri(BASE_DRAM_2_SERVICE_PATH, './api/performance/');
const buildDram2Url = (path: string) => resolveUri(BASE_DRAM_2_PATH, path);

export async function runUnifiedDriverAttribution(
  request: UnifiedDriverAttributionRequest,
  signal?: AbortSignal
): Promise<UnifiedDriverAttributionResponse> {
  const response = await fetch(buildDram2Url("/api/performance/analysis/driver-attribution/unified"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify(request),
  });

  return parseJson<UnifiedDriverAttributionResponse>(response);
}
