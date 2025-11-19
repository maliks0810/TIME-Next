import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';
// @ts-ignore
import { lazy } from 'react';

export const riskPerformanceApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
{
        type: 'external',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Client Returns',
        url: 'https://trap-parallel.pd.tcw.com/riskreturn/returns/client-return-portfolio',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Attribution Analysis',
        url: 'https://trap-parallel.pd.tcw.com/riskreturn/returns/attribution-analysis',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Returns Overlay Upload',
        url: 'https://trap-parallel.pd.tcw.com/riskreturn/returns/returns-overlay-upload',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    // PLOP_INJECT_APP
]