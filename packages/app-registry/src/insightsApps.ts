import { ExternalAppMetadata } from '@platform/app-registry';
import { lazy } from 'react';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const insightsApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
    {
        type: 'internal',
        header: NavbarHeader.Insights,
        subHeader: NavbarSubHeader.ReportCenter,
        id: '@de/report-catalog',
        name: 'report-catalog',
        title: 'Report Catalog',
        env: HighestEnv.prod,
        path: '/de/report-catalog',
        team: 'R2',
        component: lazy(() => import('@de/report-catalog/src/App')),
        description: ''
    },
    {
        type: 'internal',
        header: NavbarHeader.Insights,
        subHeader: NavbarSubHeader.ReportCenter,
        id: '@de/report-catalog-admin',
        name: 'report-catalog-admin',
        title: 'Report Catalog - Admin',
        env: HighestEnv.prod,
        path: '/de/report-catalog/admin',
        team: 'R2',
        component: lazy(() => import('@de/report-catalog-admin/src/App')),
        description: ''
    },
    {
        type: 'internal',
        header: NavbarHeader.Insights,
        subHeader: NavbarSubHeader.ReportCenter,
        id: '@de/tracer',
        name: 'tracer',
        title: 'TRACE',
        env: HighestEnv.prod,
        path: '/report-center/trace/SSRS Insights/Schedules & Email Distribution List/f1eda6b7-7581-493b-b52d-1f4d07c08d81/370014d3-7020-47a2-ab69-47b246c0f903', //SSRS Insights Report
        team: 'DE',
        component: lazy(() => import('@de/tracer/src/App')),
        description: ''
    },
];
