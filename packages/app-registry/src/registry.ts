import { lazy } from 'react';
import { type AppMetadata, type TeamMetadata, type AppRegistry, NavbarHeader, NavbarSubHeader } from './types';

const apps: AppMetadata[] = [
    {
        id: 'home',
        name: 'home',
        title: 'Home',
        path: '/',
        team: 'platform',
        external: false,
        component: lazy(() => import('@platform/platform-shell/src/layouts/HomePage'))
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.AladdinPortfolioManagement,
        title: 'TOD',
        url: 'https://tod.pd.tcw.com/',
        id: 'TOD',
        name: 'TOD',
        external: true,
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        title: 'IM Target Viewer',
        url: 'https://sector-summary-webapp.pd.tcw.com/credit/home',
        id: 'IM Target Viewer',
        name: 'IM Target Viewer',
        external: true,
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        title: 'IM (Aladdin Integrated Tools)',
        url: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=aladdin',
        id: 'IM (Aladdin Integrated Tools)',
        name: 'IM (Aladdin Integrated Tools)',
        external: true,
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        title: 'IM (Retired Tools)',
        url: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=legacy',
        id: 'IM (Retired Tools)',
        name: 'IM (Retired Tools)',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Security Analyzer',
        url: 'http://localhost:5406/Tools/SecurityAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH',
        id: 'Security Analyzer',
        name: 'Security Analyzer',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'ABS - SLB',
        url: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=14,SWITCH',
        id: 'ABS - SLB',
        name: 'ABS - SLB',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CLO - SLB',
        url: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=16,SWITCH',
        id: 'CLO - SLB',
        name: 'CLO - SLB',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CLO - iSLB',
        url: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=CLO,SWITCH',
        id: 'CLO - iSLB',
        name: 'CLO - iSLB',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CMBS - SLB',
        url: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=12,SWITCH',
        id: 'CMBS - SLB',
        name: 'CMBS - SLB',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Agency MBS SLB',
        url: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Agency%20RMBS,SWITCH',
        id: 'Agency MBS SLB',
        name: 'Agency MBS SLB',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Non-Agency RMBS SLB',
        url: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Non-Agency%20RMBS,SWITCH',
        id: 'Non-Agency RMBS SLB',
        name: 'Non-Agency RMBS SLB',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CLO Analytics',
        url: 'http://localhost:5406/Tools/CLOAnalytics?tdenv=prod2&PARALLEL_ENV=SWITCH',
        id: 'CLO Analytics',
        name: 'CLO Analytics',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CMBS Deal Ranking',
        url: 'http://localhost:5406/Tools/CMBSDealRanking?tdenv=prod2&PARALLEL_ENV=SWITCH',
        id: 'CMBS Deal Ranking',
        name: 'CMBS Deal Ranking',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Holdings Surveillance',
        url: 'http://localhost:5406/Tools/HoldingsSurveillance?tdenv=prod2&PARALLEL_ENV=SWITCH',
        id: 'Holdings Surveillance',
        name: 'Holdings Surveillance',
        external: true,
    },
    // todo: Need to add http post with postBody for bucket/cohort/overrides/cmbx manager
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.ESG,
        title: 'Securitized ESG Criteria Analyzer',
        url: 'https://trap-parallel.pd.tcw.com/sustain/esg/analyze',
        id: 'Securitized ESG Criteria Analyzer',
        name: 'Securitized ESG Criteria Analyzer',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.ESG,
        title: 'Securitized Carbon Emissions Analyzer',
        url: 'https://trap-parallel.pd.tcw.com/sustain/ce/clo',
        id: 'Securitized Carbon Emissions Analyzer',
        name: 'Securitized Carbon Emissions Analyzer',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Market,
        title: 'Credit News',
        url: 'https://trap-parallel.pd.tcw.com/leveredfinance/news',
        id: 'Credit News',
        name: 'Credit News',
        external: true,
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Other,
        title: 'TIP',
        url: 'https://tip.corp.tcw.com/',
        id: 'TIP',
        name: 'TIP',
        external: true,
    },
    {
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Client Returns',
        url: 'https://trap-parallel.pd.tcw.com/riskreturn/returns/client-return-portfolio',
        id: 'Client Returns',
        name: 'Client Returns',
        external: true,
    },
    {
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Attribution Analysis',
        url: 'https://trap-parallel.pd.tcw.com/riskreturn/returns/attribution-analysis',
        id: 'Attribution Analysis',
        name: 'Attribution Analysis',
        external: true,
    },
    {
        header: NavbarHeader.RiskPerformance,
        subHeader: NavbarSubHeader.Performance,
        title: 'Returns Overlay Upload',
        url: 'https://trap-parallel.pd.tcw.com/riskreturn/returns/returns-overlay-upload',
        id: 'Returns Overlay Upload',
        name: 'Returns Overlay Upload',
        external: true,
    },
    {
        header: NavbarHeader.Compliance,
        subHeader: NavbarSubHeader.Research,
        title: 'Under Construction',
        url: '',
        id: 'Under Construction',
        name: 'Under Construction',
        external: true,
    },
    {
        header: NavbarHeader.Compliance,
        subHeader: NavbarSubHeader.Governance,
        title: 'AI Usage Request Form',
        url: 'https://workflow.corp.tcw.com/Runtime/Runtime/Form/TCW%20Workdesk?FormName=Form/AI.AiUsageRequest-wd.fm',
        id: 'AI Usage Request Form',
        name: 'AI Usage Request Form',
        external: true,
    },
    {
        header: NavbarHeader.Compliance,
        subHeader: NavbarSubHeader.Regulations,
        title: 'EU Securitization',
        url: 'https://tipeu.corp.tcw.com/',
        id: 'EU Securitization',
        name: 'EU Securitization',
        external: true,
    },
    {
        header: NavbarHeader.ClientManagement,
        subHeader: NavbarSubHeader.Research,
        title: 'Under Construction',
        url: '',
        id: 'Under Construction',
        name: 'Under Construction',
        external: true,
    },
    {
        header: NavbarHeader.Support,
        subHeader: NavbarSubHeader.General,
        title: 'GEM',
        url: 'https://app.powerbi.com/groups/me/apps/3bc63f1b-3cb6-49d4-bf4f-24c8c0ea3a5e/reports/33271b9b-d03f-4bfc-b350-eb964d2cc850/ba46ae49a5fb77d0654b?experience=power-bi',
        id: 'GEM',
        name: 'GEM',
        external: true,
    },
    {
        header: NavbarHeader.Support,
        subHeader: NavbarSubHeader.General,
        title: 'Business Events',
        url: 'https://app.powerbi.com/links/oHDAvEyDht?ctid=b730b432-2098-413f-bd4a-014acdf7c72e&pbi_source=linkShare&bookmarkGuid=e0a09b46-58ca-4182-af2d-6cfec40e899a',
        id: 'Business Events',
        name: 'Business Events',
        external: true,
    },
    {
        header: NavbarHeader.Support,
        subHeader: NavbarSubHeader.General,
        title: 'Recon TODvsTDC',
        url: 'https://app.powerbi.com/links/wPQ2LRhUp5?ctid=b730b432-2098-413f-bd4a-014acdf7c72e&pbi_source=linkShare',
        id: 'Recon TODvsTDC',
        name: 'Recon TODvsTDC',
        external: true,
    },
]

const teams: TeamMetadata[] = [
    {
        id: 'platform',
        name: 'platform',
        displayName: 'Platform Engineering',
        apps: ['home']
    }
]

class AppRegistryImpl implements AppRegistry {
    apps: Map<string, AppMetadata>;
    teams: Map<string, TeamMetadata>;

    constructor() {
        this.apps = new Map(apps.map(app => [app.id, app]));
        this.teams = new Map(teams.map(team => [team.id, team]));
    }

    getApp(id: string): AppMetadata | undefined {
        return this.apps.get(id);
    }

    getTeamApp(teamId: string): AppMetadata[] {
        const team = this.teams.get(teamId);
        if (!team) return [];
        return team.apps.map(appId => this.apps.get(appId))
            .filter((app): app is AppMetadata => app !== undefined);  
    }

    getAllApps(): AppMetadata[] {
        return Array.from(this.apps.values());
    }

    getNavigationItems(): AppMetadata[] {
        return this.getAllApps().filter(app => !app.requiresAuth || app.path !== '/')
    }

}

export const appRegistry = new AppRegistryImpl();