import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const aiProductsApps: ExternalAppMetadata[] = [
    {
        type: 'external',
        header: NavbarHeader.AiProducts,
        subHeader: NavbarSubHeader.AiThemes,
        title: 'General Chat (TIP 1.0)',
        url: 'https://tipuat.corp.tcw.com/Dev;Tip;Default2/Topic',
        newTab: true,
        disabled: false,
        env: HighestEnv.dev
    },
    {
        type: 'external',
        header: NavbarHeader.AiProducts,
        subHeader: NavbarSubHeader.AiThemes,
        title: 'EU Sec',
        url: 'https://tipeu-uat.corp.tcw.com/Dev;Runtime;V2/EuSecReview',
        newTab: true,
        disabled: false,
        env: HighestEnv.dev
    },
    {
        type: 'external',
        header: NavbarHeader.AiProducts,
        subHeader: NavbarSubHeader.AiThemes,
        title: 'ESG',
        url: 'https://esgtcwfrontend.jollymushroom-70c04652.eastus2.azurecontainerapps.io/dashboard',
        newTab: true,
        disabled: false,
        env: HighestEnv.dev
    },
    {
        type: 'external',
        header: NavbarHeader.AiProducts,
        subHeader: NavbarSubHeader.AiThemes,
        title: 'Equity.IQ',
        url: 'https://tip2-frontend-np.corp.tcw.com/copilots/equityIq',
        newTab: true,
        disabled: false,
        env: HighestEnv.dev
    },
]