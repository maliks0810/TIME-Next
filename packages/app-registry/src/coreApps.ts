import { ExternalAppMetadata } from '@platform/app-registry';
import { lazy } from 'react';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const coreApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
    {
        type: 'internal',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        id: 'core-workflow',
        name: 'core-workflow',
        title: 'Core Workflow',
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
        id: 'core-workflow',
        name: 'core-workflow',
        title: 'Nippon Risk Monitoring',
        env: HighestEnv.prod,
        entryPointUrl: '/trap',
        path: '/trap/*',
        team: 'R2',
        component: lazy(() => import('@r2/core/src/App')),
        description: '',
    },
];
