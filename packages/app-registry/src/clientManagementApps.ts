import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const clientManagementApps: ExternalAppMetadata[] = [
        {
        type: 'external',
        header: NavbarHeader.ClientManagement,
        subHeader: NavbarSubHeader.Research,
        title: 'Under Construction',
        url: '',
        newTab: false,
        disabled: true,
        env: HighestEnv.prod
    },
]