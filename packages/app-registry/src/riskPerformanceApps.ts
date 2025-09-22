import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, NavbarHeader, NavbarSubHeader } from './types';

export const riskPerformanceApps: ExternalAppMetadata[] = [
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
]