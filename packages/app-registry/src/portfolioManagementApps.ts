import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';
// @ts-ignore
import { lazy } from 'react';

export const portfolioManagementApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.AladdinPortfolioManagement,
        type: 'external',
        title: 'TOD',
        url: 'https://tod.pd.tcw.com/',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        type: 'external',
        title: 'IM Target Viewer',
        url: 'https://sector-summary-webapp.pd.tcw.com/credit/home',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        type: 'external',
        title: 'IM (Aladdin Integrated Tools)',
        url: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=aladdin',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        type: 'external',
        title: 'IM (Retired Tools)',
        url: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=legacy',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    // PLOP_INJECT_APP
]