import * as URI from "uri-js";

/* ---------------------------------- */
/*  Utility */
/* ---------------------------------- */

const resolveUri = (baseUri?: string, relativeUri?: string): string =>
  URI.resolve(URI.normalize(baseUri ?? ""), relativeUri ?? "");

/* ---------------------------------- */
/*  Base Paths */
/* ---------------------------------- */

const BASE_DRAM_2_SERVICE_PATH: string =
  import.meta.env.VITE_R2_TRAP_DRAM_2_SERVICE;

const BASE_DRAM_2_PATH: string = resolveUri(
  BASE_DRAM_2_SERVICE_PATH,
  "./api/attribution/"
);
const BASE_WITHOUT_ATTRIB_PATH : string = resolveUri(
  BASE_DRAM_2_SERVICE_PATH,
  "./api/"
);

export const buildDram2Url = (path: string): string =>
  resolveUri(BASE_DRAM_2_PATH, path);

export const buildDram2UrlNonAttribution= (path: string): string =>
  resolveUri(BASE_WITHOUT_ATTRIB_PATH, path);

const BASE_RTN_ATTR_SERVICE_PATH = import.meta.env.VITE_R2_TRAP_DRAM_1_SERVICE;
const BASE_RTN_ATTR_PATH = resolveUri(BASE_RTN_ATTR_SERVICE_PATH, './rtn-attribution/api/v2/');
export const buildDram1Url = (path: string) => resolveUri(BASE_RTN_ATTR_PATH, path);




