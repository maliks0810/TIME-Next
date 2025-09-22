import { type InternalAppMetadata, type ExternalAppMetadata, type TeamMetadata,
         type AppRegistry } from './types';
import { internalApps } from './internalApps';
import { portfolioManagementApps } from './portfolioManagementApps';
import { researchAnalysisApps } from './researchAnalysisApps';
import { riskPerformanceApps } from './riskPerformanceApps';
import { clientManagementApps } from './clientManagementApps';
import { complianceApps } from './complianceApps';
import { supportApps } from './supportApps';

// going to use discriminated union
// order matters
const apps: (InternalAppMetadata|ExternalAppMetadata)[] = [
    ...internalApps,
    ...portfolioManagementApps,
    ...researchAnalysisApps,
    ...riskPerformanceApps,
    ...clientManagementApps,
    ...complianceApps,
    ...supportApps

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