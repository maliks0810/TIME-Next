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
    }
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