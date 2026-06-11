export type ReturnsOverlayUploadRequestType = {
    beginDate: string,
    endDate: string,
    portfolioNumber: string,
    gross: string | number,
    net: string | number,
    sendToAladdin?: boolean,
    sentToAladdin?: boolean,
    modifiedBy: string,
    modifiedDt: string,
};

export type ImportRowCollectionResponse = {
  results?: ImportRow[],
  message?: string
}

export type ImportRow = {
  importId: number;
  fileName: string;
  blobUrl: string;
  uploadedBy?: string;
  ingestedAtUtc: string;
  portfolio: string;
  beginTrdDt: string;
  endTrdDt: string;
  purpose: string;
  source: string;
  totalReturn: number;
  released: 'Y' | 'N';
};

export type MergeLogRowCollectionResponse = {
  results?: MergeLogRow[],
  message?: string
}
export type MergeLogRow = {
  mergeLogId: number;
  fileName: string;
  fileHashHex?: string;
  startedAtUtc: string;
  completedAtUtc?: string;
  sourceRowCount?: number;
  insertedCount?: number;
  updatedCount?: number;
  noChangeCount?: number;
  status: 'STARTED' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  isShortCircuited: boolean;
  errorMessage?: string;
};
export type ErrorLogRowCollectionResponse = {
  results?: ErrorLogRow[],
  message?: string
}
export type ErrorLogRow = {
  errorId: number;
  mergeLogId: number;
  errorTimeUtc: string;
  errorNumber?: number;
  errorSeverity?: number;
  errorState?: number;
  errorProcedure?: string;
  errorLine?: number;
  errorMessage: string;
};

export type RecomputeResultRowCollectionResponse = {
  results?: RecomputeResultRow[],
  message?: string
}
export type RecomputeResultRow = {
  portfolio: string;
  asOfDate: string;
  period: string; // MTD/QTD/YTD/Custom
  extendedReturn: number;
  benchmarkReturn?: number;
  alpha?: number;
  recomputedAtUtc: string;
  status: 'SUCCESS' | 'FAILED';
  notes?: string;
  durationMs?: number;
};

export type Role = 'ClientServices' | 'PMRA-Analyst-ReadWrite' | 'R2-Developer-ReadWrite' | 'None';
export type Persona = 'Ops' | 'PerformanceAnalyst' | 'Risk' | 'ClientService' | 'None';

export type ImportUploadResult = {
  file: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  rows?: number;
  blobUrl?: string;
  checksum?: string;
  error?: string;
};
