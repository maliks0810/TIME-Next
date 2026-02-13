export interface IStatusProperties {
  name: string;
  className: string;
}

export const SetupStatuses: IStatusProperties[] = [
    {
      name: 'Draft - Duplicate Request',
      className: 'status-gray'
    },
    {
      name: 'Request Initiated',
      className: 'status-blue'
    },
    {
      name: 'Pending DM SSAP Review',
      className: 'status-yellow'
    },
    {
      name: 'Pending Trader Details',
      className: 'status-yellow'
    },
    {
      name: 'Request Completed',
      className: 'status-darkorange'
    },
    {
      name: 'Security Risk Analytics Requested',
      className: 'status-red'
    },
    {
      name: 'Security Risk Analytics In Progress',
      className: 'status-purple'
    },
    {
      name: 'Security Risk Analytics Complete',
      className: 'status-lightblue'
    },
    {
      name: 'Security Review',
      className: 'status-orange'
    },
    {
      name: 'Security CDF Review',
      className: 'status-orange'
    },
    {
      name: 'Security Setup Complete',
      className: 'status-darkorange'
    },
    {
      name: 'Ready for Trading',
      className: 'status-green'
    },
];

export const RiskAnalyticsStatuses: IStatusProperties[] = [
    {
      name: 'Not Started',
      className: 'status-gray'
    },
    {
      name: 'Analytics Requested',
      className: 'status-blue'
    },
    {
      name: 'Analytics Verified In Aladdin',
      className: 'status-green'
    },
];

export const ReadyForTradingStatuses: IStatusProperties[] = [
    {
      name: 'Not Ready',
      className: 'status-gray'
    },
    {
      name: 'Ready For Prelim',
      className: 'status-orange'
    },
    {
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

