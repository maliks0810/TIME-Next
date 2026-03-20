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
      name: 'Request Submitted',
      className: 'status-orange'
    },
    {
      name: 'Security Review Complete',
      className: 'status-darkorange'
    },
    {
      name: 'Security Setup Complete',
      className: 'status-darkorange'
    },
    {
      name: 'Ready for Trading',
      className: 'status-green'
    },
    {
      name: 'Cancelled',
      className: 'status-purple'
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
      name: 'Analytics In Progress',
      className: 'status-orange'
    },
    {
      name: 'Analytics In Progress (Manual)',
      className: 'status-darkorange'
    },
    {
      name: 'Analytics Complete',
      className: 'status-green'
    },
    {
      name: 'Analytics Error',
      className: 'status-red'
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

export const EuSecuritizationStatuses: IStatusProperties[] = [
    {
      name: 'Not Selected',
      className: 'status-gray'
    },
    {
      name: 'EU Securitization Requested',
      className: 'status-orange'
    },
    {
      name: 'EU Securitization in Progress',
      className: 'status-blue'
    },
    {
      name: 'EU Securitization Compliant',
      className: 'status-green'
    },
    {
      name: 'EU Securitization Not Compliant',
      className: 'status-green'
    },
    {
      name: 'Not Required',
      className: 'status-green'
    },
];

export const ErisaStatuses: IStatusProperties[] = [
    {
      name: 'Not Selected',
      className: 'status-gray'
    },
    {
      name: 'ERISA Requested',
      className: 'status-orange'
    },
    {
      name: 'ERISA in Progress',
      className: 'status-blue'
    },
    {
      name: 'ERISA Eligible',
      className: 'status-green'
    },
    {
      name: 'ERISA Ineligible',
      className: 'status-green'
    },
    {
      name: 'Not Required',
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

export const EuSecuritizationStatusesRecord: Record<string, IStatusProperties> = EuSecuritizationStatuses.reduce((rec, statusProperty) => {
  rec[statusProperty.name] = statusProperty;
  return rec;
}, {} as Record<string, IStatusProperties>);

export const ErisaStatusesRecord: Record<string, IStatusProperties> = ErisaStatuses.reduce((rec, statusProperty) => {
  rec[statusProperty.name] = statusProperty;
  return rec;
}, {} as Record<string, IStatusProperties>);

