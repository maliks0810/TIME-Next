import { ExternalAppMetadata } from '@platform/app-registry';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const aiProductsApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
    {
        type: 'external',
        header: NavbarHeader.AIProducts,
        subHeader: NavbarSubHeader.AIThemes,
        title: 'General Chat (TIP 1.0)',
        devUrl: 'https://tipuat.corp.tcw.com/Dev;Tip;Default2/Topic',
        newTab: true,
        disabled: false,
        env: HighestEnv.dev
    },
    {
        type: 'external',
        header: NavbarHeader.AIProducts,
        subHeader: NavbarSubHeader.AIThemes,
        title: 'EU Sec',
        devUrl: 'https://tipeu-uat.corp.tcw.com/Dev;Runtime;V2/EuSecReview',
        newTab: true,
        disabled: false,
        env: HighestEnv.dev
    },
    {
        type: 'external',
        header: NavbarHeader.AIProducts,
        subHeader: NavbarSubHeader.AIThemes,
        title: 'ESG',
        devUrl: 'https://esgtcwfrontend.jollymushroom-70c04652.eastus2.azurecontainerapps.io/dashboard',
        newTab: true,
        disabled: false,
        env: HighestEnv.dev
    },
    {
        type: 'external',
        header: NavbarHeader.AIProducts,
        subHeader: NavbarSubHeader.AIThemes,
        title: 'Equity.IQ',
        sandboxUrl: 'https://tip2-frontend-np.corp.tcw.com/copilots/equityIq',
        devUrl: 'https://tip2-frontend-np.corp.tcw.com/copilots/equityIq',
        qaUrl: 'https://tip2-frontend-np.corp.tcw.com/copilots/equityIq',
        prodUrl: 'https://tip2-frontend-pd.corp.tcw.com/',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    // PLOP_INJECT_APP
]