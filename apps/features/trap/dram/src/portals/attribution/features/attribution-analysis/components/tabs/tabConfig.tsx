import React from 'react';
import PortfolioManagerPersonaHomePage from '../../pages/PortfolioManagerPersonaHomePage';
import PMAHomePage from '../../pages/attribution/PMAHomePage';
import { DiagnosticsWorkspacePage } from '../../pages/diagnostics/DiagnosticsWorkspacePage';
import AtributionAnalysisWorkspace from '../../pages/attribution/AtributionAnalysisWorkspace';
import PMAAdminPage from '../../pages/attribution/PMAAdminPage';
import { DriverAnalysisWorkspace } from '../driver-analysis-config/DriverAnalysisWorkspace';


/** 1. Define keys FIRST -- add new key here */
export type TabKey = 'pm-landing' | 'dashboard'| 'attribution-analysis' | 'diagnostics' | 'admin' | 'driver-analysis';

/** 2. Navigation type */
export type NavigateFn = (key: TabKey) => void;

/** 3. Config entry type */
type TabConfigEntry = Readonly<{
  label: string;
  getChildren: (navigate: NavigateFn) => React.ReactNode;
}>;

/** 4. Strongly-typed config  */
export const TAB_CONFIG: Readonly<Record<TabKey, TabConfigEntry>> = {
  dashboard: {
    label: 'Overview',
    getChildren: (navigate) => (
      <PMAHomePage
        onComplete={() => navigate('dashboard')}
      />
    ),
  },
  'pm-landing': {
    label: ' PM Home',
    getChildren: (navigate) => (
      <PortfolioManagerPersonaHomePage
        onCallback={(key: string) => {
          if (isTabKey(key)) navigate(key);
        }}
      />
    ),
  },
  'attribution-analysis': {
    label: 'Attribution Analysis',
    getChildren: () => (
      <AtributionAnalysisWorkspace
      />
    ),
  },
  'driver-analysis': {
     label: 'Driver Analysis',
    getChildren: () => (
      <DriverAnalysisWorkspace
      />
    ),
  }
  ,
  'diagnostics' : {
    label: 'Diagnostics',
    getChildren: () => <DiagnosticsWorkspacePage />
  },
  'admin' : {
    label: 'Admin',
    getChildren: () => <PMAAdminPage />
  },
} as const;


export function isTabKey(value: string): value is TabKey {
  return (Object.keys(TAB_CONFIG) as readonly string[]).includes(value);
}

export function typedKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}
