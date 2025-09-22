import { InternalAppMetadata } from '@platform/app-registry';  
import { lazy } from 'react';  
import { HighestEnv, NavbarHeader, NavbarSubHeader } from './types';
  
export const internalApps: InternalAppMetadata[] = [  
  {  
    type: 'internal',  
    id: 'home',  
    name: 'home',  
    title: 'Home',  
    path: '/',  
    team: 'platform',  
    env: HighestEnv.prod,  
    component: lazy(() => import('@platform/homepage/src/App'))  
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
];  