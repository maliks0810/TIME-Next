// import { lazy } from 'react';

export interface AppConfig {
    name: string;
    route: string;
    component: React.LazyExoticComponent<React.ComponentType>;
    title: string;
    description: string;
}

export const appRegistry: AppConfig[] = [


    
]