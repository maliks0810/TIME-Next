/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { apolloClient } from "./apollo/client";
import {
  PRISM_EQUITIES_DROPLIST_QUERY,
  PRISM_EQUITIES_BUYLIST_QUERY,
  PRISM_EQUITIES_COVERAGE_QUERY,
  PRISM_EQUITIES_ANALYST_PERFORMANCE_QUERY,
} from "./gqlQueries";
import type { EquitiesAnalystBuyListQuery } from "../portals/equity-research/features/analyst-buylist/lib/types";

export const serviceRequest = (
  baseURL: string,
  contentType = "application/json",
  timeout = 10000
) => {
  return () => {
    return axios.create({
      baseURL,
      headers: { "Content-Type": contentType },
      timeout,
    });
  };
};
const toIsoZ = (s: string) => {
  const raw = String(s ?? '').trim();

  // Remove a single trailing dot like: "2026-03-01T00:00:00."
  const cleaned = raw.replace(/\.$/, '');

  // If already has timezone info, keep it
  if (/[zZ]$/.test(cleaned) || /[+-]\d{2}:\d{2}$/.test(cleaned)) return cleaned;

  // Date-only (YYYY-MM-DD) => UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return `${cleaned}T00:00:00.000Z`;

  // Has time, no millis, no timezone => add millis + Z
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(cleaned)) return `${cleaned}.000Z`;

  // Has millis (1-3 digits), no timezone => normalize to 3 digits + Z
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{1,3}$/.test(cleaned)) {
    const [base, ms] = cleaned.split('.');
    return `${base}.${ms.padEnd(3, '0').slice(0, 3)}Z`;
  }

  // Fallback: parse and normalize
  return new Date(cleaned).toISOString();
};

const prismBaseUrl = `${import.meta.env.VITE_R2_TRAP_PRISM_SERVICE}/api/v1`;
const appendEquity = "/equity/analyst";

// Graph QL Calls
export const getBuyList = () =>
  apolloClient.query<EquitiesAnalystBuyListQuery>({
    query: PRISM_EQUITIES_BUYLIST_QUERY,
    fetchPolicy: "no-cache",
  });

export const getDroppedList = () =>
  apolloClient.query<any>({
    query: PRISM_EQUITIES_DROPLIST_QUERY,
    fetchPolicy: "no-cache",
  });

export const getCoverageList = () =>
  apolloClient.query<any>({
    query: PRISM_EQUITIES_COVERAGE_QUERY,
    fetchPolicy: "cache-first",
  });


export const getAnalystPerformanceListByDate = (targetDate: {
  startDate: string;
  endDate: string;
}) => {
  return apolloClient.query<any>({
    query: PRISM_EQUITIES_ANALYST_PERFORMANCE_QUERY,
    variables: {
      request: {
        analystNames: [],
        startDate: toIsoZ(targetDate.startDate),
        endDate: toIsoZ(targetDate.endDate),
      },
    },
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  });
};

// -------------------- Equity REST URLs and Calls --------------------
const prismEquityListOfActiveAnalysts =
  prismBaseUrl + appendEquity + "/performance/analysts";

export const getActiveAnalystsLists = () =>
  serviceRequest(prismEquityListOfActiveAnalysts)().get("");

// -------------------- Weekly Equities (Live Funds) Export --------------------
const prismLiveFundsBaseUrl = import.meta.env.VITE_R2_TRAP_PRISM_BASE_URL;

// Server-generated weekly equities workbook (binary .xlsx response)
export const getWeeklyEquitiesExport = () =>
  serviceRequest(prismLiveFundsBaseUrl, "application/json", 60000)().get(
    "/iint/api/v1/equity/live-funds/export",
    { responseType: "blob" }
  );

// export const getAnalystPerformanceListByDate = (targetDate: {
//   startDate: string;
//   endDate: string;
// }) => serviceRequest(prismEquityAnalystPerformanceList)().post("/filter", targetDate);