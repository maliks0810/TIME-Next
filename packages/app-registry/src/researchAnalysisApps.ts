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
        devUrl: 'http://localhost:5406/Tools/SecurityAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/SecurityAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/SecurityAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'ABS - SLB',
        devUrl: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=14,SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=14,SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=14,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CLO - SLB',
        devUrl: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=16,SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=16,SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=16,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CLO - iSLB',
        devUrl: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=CLO,SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=CLO,SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=CLO,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CMBS - SLB',
        devUrl: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=12,SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=12,SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=12,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Agency MBS SLB',
        devUrl: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Agency%20RMBS,SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Agency%20RMBS,SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Agency%20RMBS,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Non-Agency RMBS SLB',
        devUrl: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Non-Agency%20RMBS,SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Non-Agency%20RMBS,SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Non-Agency%20RMBS,SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CLO Analytics',
        devUrl: 'http://localhost:5406/Tools/CLOAnalytics?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/CLOAnalytics?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/CLOAnalytics?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'CMBS Deal Ranking',
        devUrl: 'http://localhost:5406/Tools/CMBSDealRanking?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/CMBSDealRanking?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/CMBSDealRanking?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Holdings Surveillance',
        devUrl: 'http://localhost:5406/Tools/HoldingsSurveillance?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/HoldingsSurveillance?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/HoldingsSurveillance?tdenv=prod2&PARALLEL_ENV=SWITCH',
        newTab: false,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Fundamental,
        title: 'Loan Analyzer',
        devUrl: 'http://localhost:5406/Tools/CMBSLoanAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/CMBSLoanAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/CMBSLoanAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH',
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
        devUrl: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH',
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
        devUrl: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH',
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
        devUrl: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/CMBSOverlayMgr?tdenv=prod2&PARALLEL_ENV=SWITCH',
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
        devUrl: 'http://localhost:5406/Tools/CMBXSummary?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if dev link available
        qaUrl: 'http://localhost:5406/Tools/CMBXSummary?tdenv=prod2&PARALLEL_ENV=SWITCH', // Please update if qa link available
        prodUrl: 'http://localhost:5406/Tools/CMBXSummary?tdenv=prod2&PARALLEL_ENV=SWITCH',
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
        devUrl: 'https://trap-parallel.pd.tcw.com/sustain/esg/analyze', // Please update if dev link available
        qaUrl: 'https://trap-parallel.pd.tcw.com/sustain/esg/analyze', // Please update if qa link available
        prodUrl: 'https://trap-parallel.pd.tcw.com/sustain/esg/analyze',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.ESG,
        title: 'Securitized Carbon Emissions Analyzer',
        devUrl: 'https://trap-parallel.pd.tcw.com/sustain/ce/clo', // Please update if dev link available
        qaUrl: 'https://trap-parallel.pd.tcw.com/sustain/ce/clo', // Please update if qa link available
        prodUrl: 'https://trap-parallel.pd.tcw.com/sustain/ce/clo',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Market,
        title: 'Credit News',
        devUrl: 'https://trap-parallel.pd.tcw.com/leveredfinance/news', // Please update if dev link available
        qaUrl: 'https://trap-parallel.pd.tcw.com/leveredfinance/news', // Please update if qa link available
        prodUrl: 'https://trap-parallel.pd.tcw.com/leveredfinance/news',
        newTab: true,
        disabled: false,
        env: HighestEnv.prod
    },
    {
        type: 'external',
        header: NavbarHeader.ResearchAnalysis,
        subHeader: NavbarSubHeader.Other,
        title: 'TIP',
        sandboxUrl: 'https://tipuat.corp.tcw.com/',
        devUrl: 'https://tipuat.corp.tcw.com/',
        qaUrl: 'https://tipuat.corp.tcw.com/',
        prodUrl: 'https://tip.corp.tcw.com/',
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
        env: HighestEnv.prod,
        component: lazy(() => import('@r2/qre/src/App'))
    },
    // PLOP_INJECT_APP
]