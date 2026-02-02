export interface IDashboardSearchParameters {
  searchTerm: string;
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
}

export const defaultDashboardSearchParameters : IDashboardSearchParameters = {
  searchTerm: '',
  startDate: new Date(),
  endDate: new Date(),
}