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
        hideFooter: true,
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
        hideFooter: true,
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
        hideFooter: true,
    },
    {
        "type": "internal",
        "header": NavbarHeader.ResearchAnalysis,
        "subHeader": NavbarSubHeader.Fundamental,
        "id": "narmbs-security-analyzer",
        "name": "narmbs-security-analyzer",
        "title": "NARMBS Security Analyzer",
        env: HighestEnv.prod,
        "path": "/trap?template_id=t_7a904c0e156c83139d9c518cba260312", // As the URL is hardcoded for production only, for other environments this URL will be redirected to /trap  page
        "team": "R2",
        component: lazy(() => import('@r2/core/src/App')),
        "description": "",
    }
];
