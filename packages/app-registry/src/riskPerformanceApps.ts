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
        type: 'internal',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        id: '@r2/dram',
        name: 'performance-analysis',
        title: 'Performance Returns',
        env: HighestEnv.prod,

        path: '/dram/performance/dashboard',
        team: 'R2',
        component: lazy(() => import('@r2/dram/src/portals/performance/index')),
        description: '',
    },
    {
        type: 'internal',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        id: '@r2/dram',
        name: 'strategy-alert-monitor',
        title: 'Strategy Alerting and Monitoring (Beta)',
        env: HighestEnv.prod,

        path: '/dram/performance/sam',
        team: 'R2',
        component: lazy(
            () => import('@r2/dram/src/portals/performance/features/strategy-performance/index')
        ),
        description: '',
    },
    {
        type: 'internal',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        id: '@r2/dram',
        name: 'time-attribution-analysis',
        title: 'Attribution Analysis (Beta)',
        env: HighestEnv.prod,

        path: '/dram/attribution/dashboard',
        team: 'R2',
        component: lazy(() => import('@r2/dram/src/portals/attribution/index')),
        description: '',
    },
    {
        type: 'internal',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        id: '@r2/dram',
        name: 'returns-overlay-upload',
        title: 'Returns Overlay Upload',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod,
        path: '/dram/performance/returns-overlay-upload',
        team: 'R2',
        component: lazy(
            () => import('@r2/dram/src/portals/performance/features/returns-management/index')
        ),
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
    {
        type: 'internal',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Risk,
        id: '@r2/dram',
        name: 'nippon-risk-monitor',
        title: 'TIME – Nippon Reporting UI',
        env: HighestEnv.prod,

        path: '/dram/risk/dashboard',
        team: 'R2',
        component: lazy(() => import('@r2/dram/src/portals/risk/index')),
        description: '',
    },
    // PLOP_INJECT_APP
];
