import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';
import { lazy } from 'react';

export const riskPerformanceApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
    {
        type: 'external',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Client Returns',
        devUrl: 'https://trap.pd.tcw.com/riskreturn/returns/client-return-portfolio', // Please update if dev link available
        qaUrl: 'https://trap.pd.tcw.com/riskreturn/returns/client-return-portfolio', // Please update if qa link available
        prodUrl: 'https://trap.pd.tcw.com/riskreturn/returns/client-return-portfolio',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod,
    },
    {
        type: 'external',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Attribution Analysis',
        devUrl: 'https://trap.pd.tcw.com/riskreturn/returns/attribution-analysis', // Please update if dev link available
        qaUrl: 'https://trap.pd.tcw.com/riskreturn/returns/attribution-analysis', // Please update if qa link available
        prodUrl: 'https://trap.pd.tcw.com/riskreturn/returns/attribution-analysis',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod,
    },
    {
        type: 'external',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Returns Overlay Upload',
        devUrl: 'https://trap.pd.tcw.com/riskreturn/returns/returns-overlay-upload', // Please update if dev link available
        qaUrl: 'https://trap.pd.tcw.com/riskreturn/returns/returns-overlay-upload', // Please update if qa link available
        prodUrl: 'https://trap.pd.tcw.com/riskreturn/returns/returns-overlay-upload',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod,
    },
    {
        type: 'internal',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Risk,
        id: '@r2/arc',
        name: 'analytics-risk-controller',
        title: 'Analytics Risk Controller',
        env: HighestEnv.prod,
        path: '/risk/arc',
        team: 'R2',
        // component: lazy(() => import('../../../apps/features/trap/arc/src/App')),
        component: lazy(() => import('@r2/arc/src/App')),
        description: '',
    },
    {
        type: 'internal',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Risk,
        id: '@r2/arc',
        name: 'analytics-risk-controller',
        title: 'Analytics Risk Controller',
        env: HighestEnv.prod,
        path: '/risk/arc',
        team: 'R2',
        // component: lazy(() => import('../../../apps/features/trap/arc/src/App')),
        component: lazy(() => import('@r2/arc/src/App')),
        description: '',
    },

    // PLOP_INJECT_APP
];
