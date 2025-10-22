import { InternalAppMetadata } from '@platform/app-registry';  
import { lazy } from 'react';  
import { HighestEnv } from './types';
  
export const defaultApps: InternalAppMetadata[] = [  
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
];  