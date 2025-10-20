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
    subHeader: NavbarSubHeader.QRE,  
    type: 'internal',  
    id: '@r2/qre',  
    name: 'R2-Model-Catalog',  
    title: 'R2-Model-Catalog',  
    path: '/qre/catalog',  
    team: 'R2',  
    env: HighestEnv.dev,  
    component: lazy(() => import('@r2/qre/src/pages/model-catalog/model-catalog'))  
  },    
];  