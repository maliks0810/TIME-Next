import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';
import { lazy } from 'react';

export const portfolioManagementApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.AladdinPortfolioManagement,
        type: 'external',
        title: 'TOD',
        devUrl: 'https://tod-dev.np.tcw.com/',
        qaUrl: 'https://tod-qa.np.tcw.com/',
        prodUrl: 'https://tod.pd.tcw.com/',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod,
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        type: 'external',
        title: 'IM Target Viewer',
        devUrl: 'https://sector-summary-webapp.pd.tcw.com/credit/home',
        qaUrl: 'https://sector-summary-webapp.pd.tcw.com/credit/home',
        prodUrl: 'https://sector-summary-webapp.pd.tcw.com/credit/home',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod,
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        type: 'external',
        title: 'IM (Aladdin Integrated Tools)',
        devUrl: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=aladdin',
        qaUrl: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=aladdin',
        prodUrl: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=aladdin',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod,
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        type: 'external',
        title: 'IM (Retired Tools)',
        devUrl: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=legacy',
        qaUrl: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=legacy',
        prodUrl: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=legacy',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod,
    },
    {
        type: 'internal',
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.AladdinPortfolioManagement,
        id: 'tdm',
        name: 'TDM',
        title: 'Security Setup Dashboard',
        env: HighestEnv.prod,
        path: '/iod/tdm/*',
        team: 'IOD',
        component: lazy(() => import('@IOD/tdm/src/App')),
        description: '',
    },
    // PLOP_INJECT_APP
];
