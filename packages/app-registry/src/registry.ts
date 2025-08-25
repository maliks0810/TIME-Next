import { lazy } from 'react';
import type { AppMetadata, TeamMetadata, AppRegistry } from './types';

const apps: AppMetadata[] = [
    {
        id: 'home',
        name: 'home',
        title: 'Home',
        path: '/',
        team: 'platform',
        component: lazy(() => import('@platform/platform-shell/src/pages/HomePage'))
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