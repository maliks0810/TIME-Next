export interface Report {
  reportnum: string;
  reportname: string;
  departmentname: string;
  description: string;
  status: string;
  isuserfavourite: boolean;
  reportlink: string | null;
  reportnotes: string | null;
  actionicon: string | null
}

export type ReportPage = Report[];

export interface ReportCatalogFilters {
  search: string;
  status: string;
  userId: string;
  showOnlyUserFav: boolean;
}

export type ViewerTab = {
  id: string;
  title: string;
  iframeUrl: string;
  rawUrl?: string;
};