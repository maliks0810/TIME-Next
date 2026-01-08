import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const complianceApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
    //     {
    //     type: 'external',
    //     header: NavbarHeader.Compliance,
    //     subHeader: NavbarSubHeader.Research,
    //     title: 'Under Construction',
    //     devUrl: '',
    //     newTab: false,
    //     disabled: true,
    //     env: HighestEnv.prod
    // },
    {
        type: 'external',
        header: NavbarHeader.Compliance,
        subHeader: NavbarSubHeader.Governance,
        title: 'AI Usage Request Form',
        devUrl: 'https://workflow.corp.tcw.com/Runtime/Runtime/Form/TCW%20Workdesk?FormName=Form/AI.AiUsageRequest-wd.fm',
        qaUrl: 'https://workflow.corp.tcw.com/Runtime/Runtime/Form/TCW%20Workdesk?FormName=Form/AI.AiUsageRequest-wd.fm',
        prodUrl: 'https://workflow.corp.tcw.com/Runtime/Runtime/Form/TCW%20Workdesk?FormName=Form/AI.AiUsageRequest-wd.fm',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.Compliance,
        subHeader: NavbarSubHeader.Regulations,
        title: 'EU Securitization',
        devUrl: 'https://tipeu.corp.tcw.com/',
        qaUrl: 'https://tipeu.corp.tcw.com/',
        prodUrl: 'https://tipeu.corp.tcw.com/',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    // PLOP_INJECT_APP
]