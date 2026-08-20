import type React from "react";

export type SnapshotReportId =
  | "daily-flash"
  | "tcw-funds"
  | "tcw-ucits-usd"
  | "tcw-ucits-eur"
  | "tcw-strategy";

export type SnapshotBookMode = "book" | "focus";
export type SnapshotPaperSize = "LETTER" | "LEGAL" | "A4";
export type SnapshotOrientation = "LANDSCAPE" | "PORTRAIT";
export type SnapshotVersion = "INTERNAL" | "CLIENT";

export interface SnapshotEmbedProps {
  embedded?: boolean;
  allowStandaloneExport?: boolean;
  currency?: "USD" | "EUR";
}

export interface SnapshotReportStatus {
  ready: boolean;
  warningCount: number;
  error?: string;
}

export interface SnapshotReportDefinition {
  id: SnapshotReportId;
  sequence: number;
  shortTitle: string;
  title: string;
  allowStandaloneExport: boolean;
  component: React.ComponentType<SnapshotEmbedProps>;
  componentProps?: SnapshotEmbedProps;
}

export interface SnapshotBookPdfRequest {
  asOfDate: string;
  reports: SnapshotReportId[];
  includeCoverPage: boolean;
  coverTitle: string;
  coverSubtitle?: string;
  preparedFor?: string;
  preparedBy?: string;
  includeTableOfContents: boolean;
  includeDisclosures: boolean;
  includeWarningAppendix: boolean;
  startEachReportOnNewPage: boolean;
  paperSize: SnapshotPaperSize;
  orientation: SnapshotOrientation;
  version: SnapshotVersion;
  showPageNumbers: boolean;
}
