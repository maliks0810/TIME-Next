export interface IStatusProperties {
  id: number;
  name: string;
  className: string;
}

export const SetupStatuses: IStatusProperties[] = [
    {
      id: 1,
      name: 'Draft - Duplicate Request',
      className: 'status-gray'
    },
    {
      id: 2,
      name: 'Request Initiated',
      className: 'status-blue'
    },
    {
      id: 3,
      name: 'Pending Trader Details',
      className: 'status-darkorange'
    },
    {
      id: 4,
      name: 'Pending DM Review',
      className: 'status-yellow'
    },
    {
      id: 5,
      name: 'Aladdin Setup (Native Fields) In Progress',
      className: 'status-purple'
    },
    {
      id: 6,
      name: 'Aladdin Setup (Native Fields) Complete',
      className: 'status-red'
    },
    {
      id: 7,
      name: 'CDF Setup In Progress',
      className: 'status-lightblue'
    },
    {
      id: 8,
      name: 'CDF Setup Partially Complete',
      className: 'status-orange'
    },
    {
      id: 9,
      name: 'CDF Setup Complete',
      className: 'status-green'
    },
];

export const RiskAnalyticsStatuses: IStatusProperties[] = [
    {
      id: 1,
      name: 'Not Started',
      className: 'status-gray'
    },
    {
      id: 2,
      name: 'Analytics Requested',
      className: 'status-blue'
    },
    {
      id: 3,
      name: 'Analytics Verified In Aladdin',
      className: 'status-green'
    },
];

export const ReadyForTradingStatuses: IStatusProperties[] = [
    {
      id: 1,
      name: 'Not Ready',
      className: 'status-gray'
    },
    {
      id: 2,
      name: 'Ready For Prelim',
      className: 'status-orange'
    },
    {
      id: 3,
      name: 'Ready',
      className: 'status-green'
    },
];

export const SetupStatusesRecord: Record<string, IStatusProperties> = SetupStatuses.reduce((rec, statusProperty) => {
  rec[statusProperty.name] = statusProperty;
  return rec;
}, {} as Record<string, IStatusProperties>);

export const RiskAnalyticsStatusesRecord: Record<string, IStatusProperties> = RiskAnalyticsStatuses.reduce((rec, statusProperty) => {
  rec[statusProperty.name] = statusProperty;
  return rec;
}, {} as Record<string, IStatusProperties>);

export const ReadyForTradingStatusesRecord: Record<string, IStatusProperties> = ReadyForTradingStatuses.reduce((rec, statusProperty) => {
  rec[statusProperty.name] = statusProperty;
  return rec;
}, {} as Record<string, IStatusProperties>);

