import { lazy } from 'react';
import { type InternalAppMetadata, type ExternalAppMetadata, type TeamMetadata,
         type AppRegistry, HighestEnv, NavbarHeader, NavbarSubHeader } from './types';

// going to use discriminated union
const apps: (InternalAppMetadata|ExternalAppMetadata)[] = [
    {
        type: 'internal',
        id: 'home',
        name: 'home',
        title: 'Home',
        path: '/',
        team: 'platform',
        env: HighestEnv.prod,
        component: lazy(() => import('@platform/platform-shell/src/layouts/HomePage'))
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.AladdinPortfolioManagement,
        type: 'internal',
        id: 'testing',
        name: 'testing',
        title: 'testing',
        path: '/testing',
        team: 'testing',
        env: HighestEnv.prod,
        component: lazy(() => import('@testing/alpha/src/App'))
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.AladdinPortfolioManagement,
        type: 'external',
        title: 'TOD',
        url: 'https://tod.pd.tcw.com/',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        type: 'external',
        title: 'IM Target Viewer',
        url: 'https://sector-summary-webapp.pd.tcw.com/credit/home',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        type: 'external',
        title: 'IM (Aladdin Integrated Tools)',
        url: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=aladdin',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        header: NavbarHeader.PortfolioManagement,
        subHeader: NavbarSubHeader.InvestmentManagementSolutions,
        type: 'external',
        title: 'IM (Retired Tools)',
        url: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=legacy',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        type: 'external',
        title: 'Security Analyzer',
        url: 'http://localhost:5406/Tools/SecurityAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'ABS - SLB',
        url: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=14,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CLO - SLB',
        url: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=16,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CLO - iSLB',
        url: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=CLO,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CMBS - SLB',
        url: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=12,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Agency MBS SLB',
        url: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Agency%20RMBS,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Non-Agency RMBS SLB',
        url: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Non-Agency%20RMBS,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CLO Analytics',
        url: 'http://localhost:5406/Tools/CLOAnalytics?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CMBS Deal Ranking',
        url: 'http://localhost:5406/Tools/CMBSDealRanking?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Holdings Surveillance',
        url: 'http://localhost:5406/Tools/HoldingsSurveillance?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Loan Analyzer',
        url: 'http://localhost:5406/Tools/CMBSLoanAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        httpMethod: 'POST',
        postBody: JSON.stringify({"tdiconath":"books.png","tdfriendlyname":"Loan Analyzer"}),
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Bucket Manager',
        url: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        httpMethod: 'POST',
        postBody: JSON.stringify({"LOAN_OVERLAY_TYPE_ID":"1","tdiconath":"books.png","tdfriendlyname":"Bucket Manager"}),
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Cohort Manager',
        url: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        httpMethod: 'POST',
        postBody: JSON.stringify({"tdiconath":"books.png","tdfriendlyname":"Cohort Manager"}),
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Overrides Manager',
        url: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        httpMethod: 'POST',
        postBody: JSON.stringify({"LOAN_OVERLAY_TYPE_ID":"2","tdiconath":"books.png","tdfriendlyname":"Overrides Manager"}),
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CMBX Summary',
        url: 'http://localhost:5406/Tools/CMBXSummary?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        httpMethod: 'POST',
        postBody: JSON.stringify({"tdiconath":"books.png","tdfriendlyname":"CMBX Summary"}),
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.ESG,
        title: 'Securitized ESG Criteria Analyzer',
        url: 'https://trap-parallel.pd.tcw.com/sustain/esg/analyze',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.ESG,
        title: 'Securitized Carbon Emissions Analyzer',
        url: 'https://trap-parallel.pd.tcw.com/sustain/ce/clo',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Market,
        title: 'Credit News',
        url: 'https://trap-parallel.pd.tcw.com/leveredfinance/news',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Other,
        title: 'TIP',
        url: 'https://tip.corp.tcw.com/',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
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
    {
        type: 'external',
        header: NavbarHeader.Compliance,
        subHeader: NavbarSubHeader.Research,
        title: 'Under Construction',
        url: '',
        newTab: false,
        disabled: true,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.Compliance,
        subHeader: NavbarSubHeader.Governance,
        title: 'AI Usage Request Form',
        url: 'https://workflow.corp.tcw.com/Runtime/Runtime/Form/TCW%20Workdesk?FormName=Form/AI.AiUsageRequest-wd.fm',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.Compliance,
        subHeader: NavbarSubHeader.Regulations,
        title: 'EU Securitization',
        url: 'https://tipeu.corp.tcw.com/',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
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
    {
        type: 'external',
        header: NavbarHeader.Support,
        subHeader: NavbarSubHeader.General,
        title: 'GEM',
        url: 'https://app.powerbi.com/groups/me/apps/3bc63f1b-3cb6-49d4-bf4f-24c8c0ea3a5e/reports/33271b9b-d03f-4bfc-b350-eb964d2cc850/ba46ae49a5fb77d0654b?experience=power-bi',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.Support,
        subHeader: NavbarSubHeader.General,
        title: 'Business Events',
        url: 'https://app.powerbi.com/links/oHDAvEyDht?ctid=b730b432-2098-413f-bd4a-014acdf7c72e&pbi_source=linkShare&bookmarkGuid=e0a09b46-58ca-4182-af2d-6cfec40e899a',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.Support,
        subHeader: NavbarSubHeader.General,
        title: 'Recon TODvsTDC',
        url: 'https://app.powerbi.com/links/wPQ2LRhUp5?ctid=b730b432-2098-413f-bd4a-014acdf7c72e&pbi_source=linkShare',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
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
    apps: Map<string, InternalAppMetadata|ExternalAppMetadata>;
    teams: Map<string, TeamMetadata>;

    constructor() {
        this.apps = new Map(apps.map(app => [app.title, app]));
        this.teams = new Map(teams.map(team => [team.id, team]));
    }

    getApp(id: string): InternalAppMetadata | ExternalAppMetadata | undefined {
        return this.apps.get(id);
    }

    getTeamApp(teamId: string): (InternalAppMetadata|ExternalAppMetadata)[] {
        const team = this.teams.get(teamId);
        if (!team) return [];
        return team.apps.map(appId => this.apps.get(appId))
            .filter((app): app is InternalAppMetadata => app !== undefined);  
    }

    getAllApps(): (InternalAppMetadata|ExternalAppMetadata)[] {
        return Array.from(this.apps.values());
    }

    getNavigationItems(): (InternalAppMetadata|ExternalAppMetadata)[] {
        return this.getAllApps().filter(app => !app.requiresAuth || app.path !== '/')
    }

}

export const appRegistry = new AppRegistryImpl();