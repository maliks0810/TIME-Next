import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const supportApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
    {
        type: 'external',
        header: NavbarHeader.Support,
        subHeader: NavbarSubHeader.General,
        title: 'GEM',
        prodUrl: 'https://app.powerbi.com/groups/me/apps/3bc63f1b-3cb6-49d4-bf4f-24c8c0ea3a5e/reports/33271b9b-d03f-4bfc-b350-eb964d2cc850/ba46ae49a5fb77d0654b?experience=power-bi',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.Support,
        subHeader: NavbarSubHeader.General,
        title: 'Business Events',
        prodUrl: 'https://app.powerbi.com/links/oHDAvEyDht?ctid=b730b432-2098-413f-bd4a-014acdf7c72e&pbi_source=linkShare&bookmarkGuid=e0a09b46-58ca-4182-af2d-6cfec40e899a',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.Support,
        subHeader: NavbarSubHeader.General,
        title: 'Recon TODvsTDC',
        prodUrl: 'https://app.powerbi.com/links/wPQ2LRhUp5?ctid=b730b432-2098-413f-bd4a-014acdf7c72e&pbi_source=linkShare',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
]