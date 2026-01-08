import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const productApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
    {
        type: 'external',
        header: NavbarHeader.Products,
        subHeader: NavbarSubHeader.AssetBackFinance,
        title: 'Deal On-Boarding',
        devUrl: 'https://apps.powerapps.com/play/e/default-b730b432-2098-413f-bd4a-014acdf7c72e/a/4fa730d9-1fd6-4ab3-a460-847fbdbe0551?tenantId=b730b432-2098-413f-bd4a-014acdf7c72e&hint=8cabc42e-b795-4f1b-85fd-50094d9429e2&sourcetime=1763404281102&hideNavBar=true',
        newTab: true,
        disabled: false,
        env: HighestEnv.dev
    },
    {
        type: 'external',
        header: NavbarHeader.Products,
        subHeader: NavbarSubHeader.AssetBackFinance,
        title: 'Funding Notice',
        devUrl: 'https://apps.powerapps.com/play/e/4f3b2f38-58a4-e653-bace-9904742e810a/a/c6eacfa8-4f67-4d9a-a71a-e2a64275bd7f?tenantId=b730b432-2098-413f-bd4a-014acdf7c72e&hint=a0873fd2-32ce-40dc-b3dc-174ff00bbb7e&sourcetime=1760043234045',
        newTab: true,
        disabled: false,
        env: HighestEnv.dev
    },
]