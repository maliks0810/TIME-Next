import React from 'react';
import MultiPersonaLandingPage from '../../pages/MultiPersonaLandingPage';
import EquityPersonaHomePage from '../../pages/EquityPersonaHomePage';
import EquityWorkspacePage from '../../pages/EquityWorkspacePage';
import EquityWizardPage from '../../pages/EquityWizardPage';
import EmergingMarketWorkspace from '../../pages/EmergingMarketWorkspace';


/** 1. Define keys FIRST -- add new key here */
export type TabKey = 'dashboard' | 'eq-landing' | 'eq-workspace' | 'em-workspace' | 'wizard';

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
      <MultiPersonaLandingPage
        onCallback={(key: string) => {
          if (isTabKey(key)) navigate(key);
        }}
      />
    ),
  },
  'eq-landing': {
    label: 'Attribution Analysis Landing',
    getChildren: (navigate) => (
      <EquityPersonaHomePage
        onConfigure={() => navigate('wizard')}
        onComplete={() => navigate('eq-workspace')}
      />
    ),
  },
  'eq-workspace': {
    label: 'Equity Attribution Analysis',
    getChildren: () => <EquityWorkspacePage />,
  },
  wizard: {
    label: 'Configure Entry Equity Attribution Analysis',
    getChildren: (navigate) => (
      <EquityWizardPage onComplete={() => navigate('eq-workspace')} />
    ),
  },
  'em-workspace': {
    label: 'EM Attribution Analysis',
    getChildren: () => <EmergingMarketWorkspace />
  },
} as const;

/** 5. Safe runtime guard */
export function isTabKey(value: string): value is TabKey {
  return (Object.keys(TAB_CONFIG) as readonly string[]).includes(value);
}

/** 6. Typed Object.keys helper */
export function typedKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}
