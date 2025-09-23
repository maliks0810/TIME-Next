import { type InternalAppMetadata, type ExternalAppMetadata, type TeamMetadata,
         type AppRegistry, 
         HighestEnv} from './types';
import { internalApps } from './internalApps';
import { portfolioManagementApps } from './portfolioManagementApps';
import { researchAnalysisApps } from './researchAnalysisApps';
import { riskPerformanceApps } from './riskPerformanceApps';
import { clientManagementApps } from './clientManagementApps';
import { complianceApps } from './complianceApps';
import { supportApps } from './supportApps';
import { aiProductsApps } from './aiProductsApps';

const currentEnv = import.meta.env.VITE_APP_ENV;

// going to use discriminated union
// order matters
const apps: (InternalAppMetadata|ExternalAppMetadata)[] = [
    ...internalApps,
    ...portfolioManagementApps,
    ...researchAnalysisApps,
    ...riskPerformanceApps,
    ...clientManagementApps,
    ...complianceApps,
    ...aiProductsApps,
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
    currentEnv: HighestEnv;

    constructor(currentEnv: string) {
        this.currentEnv = this.convertToHighestEnv(currentEnv);
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
        return Array.from(this.apps.values()).filter(app => this.isAppAvailableInCurrentEnv(app.env));
    }

    getNavigationItems(): (InternalAppMetadata|ExternalAppMetadata)[] {
        return this.getAllApps().filter(app => !app.requiresAuth || app.path !== '/')
    }

    // Logic is if HighestEnv is Prod, it will be displayed in all env.
    private isAppAvailableInCurrentEnv(appEnv: HighestEnv): boolean {
        const envOrder = [HighestEnv.dev, HighestEnv.qa, HighestEnv.prod];
        const currentEnvIndex = envOrder.indexOf(this.currentEnv);
        const appEnvIndex = envOrder.indexOf(appEnv);
        return appEnvIndex >= currentEnvIndex;
    }

    private convertToHighestEnv(env: string): HighestEnv {  
        switch (env) {
            case 'dev':
                return HighestEnv.dev;
            case 'development':
                return HighestEnv.dev;
            case 'qa':
                return HighestEnv.qa;
            case 'prod':
                return HighestEnv.prod;
            case 'production':
                return HighestEnv.prod;
            default:
                throw new Error(`Unknown environment: ${env}`);
        }
    }
}

export const appRegistry = new AppRegistryImpl(currentEnv);