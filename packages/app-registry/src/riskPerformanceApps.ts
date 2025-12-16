import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const riskPerformanceApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
{
        type: 'external',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Client Returns',
        devUrl: 'https://trap.pd.tcw.com/riskreturn/returns/client-return-portfolio',
        prodUrl: 'https://trap.pd.tcw.com/riskreturn/returns/client-return-portfolio',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Attribution Analysis',
        devUrl: 'https://trap.pd.tcw.com/riskreturn/returns/attribution-analysis',
        prodUrl: 'https://trap.pd.tcw.com/riskreturn/returns/attribution-analysis',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Returns Overlay Upload',
        devUrl: 'https://trap.pd.tcw.com/riskreturn/returns/returns-overlay-upload',
        prodUrl: 'https://trap.pd.tcw.com/riskreturn/returns/returns-overlay-upload',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    // PLOP_INJECT_APP
]