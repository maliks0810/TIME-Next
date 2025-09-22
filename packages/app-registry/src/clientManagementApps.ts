import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, NavbarHeader, NavbarSubHeader } from './types';

export const clientManagementApps: ExternalAppMetadata[] = [
        {
        type: 'external',
        header: NavbarHeader.ClientManagement,
        subHeader: NavbarSubHeader.Research,
        title: 'Under Construction',
        url: '',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
]