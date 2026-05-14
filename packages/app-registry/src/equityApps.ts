import { lazy } from 'react';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';

export const equityApps: (InternalAppMetadata)[] = [
        {
                header: NavbarHeader.Equity,  
                subHeader: NavbarSubHeader.Budget,  
                type: 'internal',  
                id: '@iod/ebc/maintenance',  
                name: 'IOD-EBC-Maintenance',  
                title: 'Maintenance',  
                path: '/budget/maintenance',  
                team: 'IOD',  
                env: HighestEnv.qa,            
                component: lazy(() => import('@iod/equity-budget-commission/src/pages/budget-maintenance-page'))       
        },
        {
                header: NavbarHeader.Equity,  
                subHeader: NavbarSubHeader.Budget,  
                type: 'internal',  
                id: '@iod/ebc/softdollar',  
                name: 'IOD-EBC-Softdollar',  
                title: 'Soft Dollar Budget',  
                path: '/budget/softdollarbudget',  
                team: 'IOD',                  
                env: HighestEnv.qa,            
                component: lazy(() => import('@iod/equity-budget-commission/src/pages/budget-soft-dollar-page'))       
        },
        {
                header: NavbarHeader.Equity,  
                subHeader: NavbarSubHeader.Budget,  
                type: 'internal',  
                id: '@iod/ebc/researchbudget',  
                name: 'IOD-EBC-ResearchBudget',  
                title: 'Research Budget',  
                path: '/budget/researchbudget',  
                team: 'IOD',                  
                env: HighestEnv.qa,            
                component: lazy(() => import('@iod/equity-budget-commission/src/pages/budget-research-budget-page'))       
        },
        {
                header: NavbarHeader.Equity,  
                subHeader: NavbarSubHeader.Budget,  
                type: 'internal',  
                id: '@iod/ebc/annualresearchbudget',  
                name: 'IOD-EBC-AnnualResearchBudget',  
                title: 'Create Annual Research Budget',  
                path: '/budget/annualresearchbudget',  
                team: 'IOD',                  
                env: HighestEnv.qa,            
                component: lazy(() => import('@iod/equity-budget-commission/src/pages/annual-research-budget-page'))       
        },        
        {
                header: NavbarHeader.Equity,  
                subHeader: NavbarSubHeader.Commission,  
                type: 'internal',  
                id: '@iod/ebc/combinedbudget',  
                name: 'IOD-EBC-CombinedBudget',  
                title: 'Combined Budgets',  
                path: '/commission/combinedbudget',  
                team: 'IOD',                  
                env: HighestEnv.qa,            
                component: lazy(() => import('@iod/equity-budget-commission/src/pages/commission-combinedbudget-page'))       
        },
        {
                header: NavbarHeader.Equity,  
                subHeader: NavbarSubHeader.Commission,  
                type: 'internal',  
                id: '@iod/ebc/commissiontrades',  
                name: 'IOD-EBC-CombinedBudget',  
                title: 'Trades',  
                path: '/commission/trades',  
                team: 'IOD',                  
                env: HighestEnv.qa,            
                component: lazy(() => import('@iod/equity-budget-commission/src/pages/commission-trade-page'))       
        },
        {
                header: NavbarHeader.Equity,  
                subHeader: NavbarSubHeader.Reports,  
                type: 'internal',  
                id: '@iod/ebc/reports',  
                name: 'IOD-EBC-reports',  
                title: 'Reports',  
                path: '/reports',  
                team: 'IOD',                  
                env: HighestEnv.qa,            
                component: lazy(() => import('@iod/equity-budget-commission/src/pages/report-dashboard'))       
        }
    // PLOP_INJECT_APP
]