import { ExternalAppMetadata } from '@platform/app-registry';
import { lazy } from 'react';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const coreApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
    {
        type: 'internal',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        id: 'trap',
        name: 'trap',
        title: 'TRAP',
        env: HighestEnv.prod,
        entryPointUrl: '/trap',
        path: '/trap/*',
        team: 'R2',
        component: lazy(() => import('@r2/core/src/App')),
        description: '',
    },
    {
        type: 'internal',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Risk,
        id: 'nippon-risk-monitoring',
        name: 'nippon-risk-monitoring',
        title: 'Nippon Risk Monitoring',
        env: HighestEnv.prod,
        entryPointUrl: '/trap',
        path: '/trap/*',
        team: 'R2',
        component: lazy(() => import('@r2/core/src/App')),
        description: '',
    },
    {
        type: 'internal',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Risk,
        id: 'arc-dashboard',
        name: 'arc-dashboard',
        title: 'ARC Dashboard (Beta)',
        env: HighestEnv.prod,
        entryPointUrl: '/trap',
        path: '/trap/*',
        team: 'R2',
        component: lazy(() => import('@r2/core/src/App')),
        description: '',
    },
];
