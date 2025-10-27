import { ExternalAppMetadata } from '@platform/app-registry';
import { lazy } from 'react';
import { HighestEnv, InternalAppMetadata } from './types';
import { NavbarHeader, NavbarSubHeader } from './navbarHeader.types';
  
export const researchAnalysisApps: (InternalAppMetadata | ExternalAppMetadata)[] = [
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
            header: NavbarHeader.ResearchAnalysis,  
            subHeader: NavbarSubHeader.QRE,  
            type: 'internal',  
            id: '@r2/qre',  
            name: 'R2-Model-Catalog',  
            title: 'Model Catalog',  
            path: '/qre/catalog',  
            team: 'R2',  
            env: HighestEnv.dev,
            component: lazy(() => import('@r2/qre/src/pages/model-catalog/model-catalog'))  
        },    
]