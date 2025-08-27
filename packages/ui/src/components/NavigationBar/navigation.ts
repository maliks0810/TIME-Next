import { TTTLinks } from './ttt-links.js';

export const navigationData = [
    {
        header: 'Portfolio Management',
        subHeaders: [
            {
                title: 'Aladdin Portfolio Management',
                links: [
                    {
                        title: TTTLinks.TOD.title,
                        url: TTTLinks.TOD.url,
                        newTab: true,
                        disabled: TTTLinks.TOD.disabled,
                    },
                ],
            },
            {
                title: 'Investment Management Solutions',
                links: [
                    {
                        title: 'IM Target Viewer',
                        url: 'https://sector-summary-webapp.pd.tcw.com/credit/home',
                        newTab: true,
                        disabled: false
                    },
                    {
                        title: 'IM (Aladdin Integrated Tools)',
                        url: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=aladdin',
                        newTab: false,
                        disabled: false
                    },
                    {
                        title: 'IM (Retired Tools)',
                        url: 'http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=legacy',
                        newTab: false,
                        disabled: false
                    }
                ]
            }
        ],
    },
    {
        header: 'Research & Analysis',
        subHeaders: [
            {
                title: 'Fundamental',
                links: [
                    {
                        title: 'Security Analyzer',
                        url: 'http://localhost:5406/Tools/SecurityAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH',
                        newTab: false,
                        disabled: false,
                    },
                    {
                        title: 'ABS - SLB',
                        url: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=14,SWITCH',
                        newTab: false,
                        disabled: false,
                    },
                    {
                        title: 'CLO - SLB',
                        url: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=16,SWITCH',
                        newTab: false,
                        disabled: false,
                    },
                    {
                        title: "CLO - iSLB",
                        url: "http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=CLO,SWITCH",
                        newTab: false,
                        disabled: false
                    },
                    {
                        title: 'CMBS - SLB',
                        url: 'http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=12,SWITCH',
                        newTab: false,
                        disabled: false,
                    },
                    {
                        title: 'Agency MBS SLB',
                        url: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Agency%20RMBS,SWITCH',
                        newTab: false,
                        disabled: false,
                    },
                    {
                        title: 'Non-Agency RMBS SLB',
                        url: 'http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Non-Agency%20RMBS,SWITCH',
                        newTab: false,
                        disabled: false,
                    },
                    {
                        title: 'CLO Analytics',
                        url: 'http://localhost:5406/Tools/CLOAnalytics?tdenv=prod2&PARALLEL_ENV=SWITCH',
                        newTab: false,
                        disabled: false,
                    },
                    {
                        title: 'CMBS Deal Ranking',
                        url: 'http://localhost:5406/Tools/CMBSDealRanking?tdenv=prod2&PARALLEL_ENV=SWITCH',
                        newTab: false,
                        disabled: false,
                    },
                    {
                        title: 'Holdings Surveillance',
                        url: 'http://localhost:5406/Tools/HoldingsSurveillance?tdenv=prod2&PARALLEL_ENV=SWITCH',
                        newTab: false,
                        disabled: false,
                    },
                    // {
                    //     title: "TRAP",
                    //     url: "https://trap-parallel.pd.tcw.com/",
                    //     newTab: true,
                    //     disabled: false
                    // },
                ],
            },
            {
                title: 'ESG',
                links: [
                    {
                        title: 'Securitized ESG Criteria Analyzer',
                        url: 'https://trap-parallel.pd.tcw.com/sustain/esg/analyze',
                        newTab: true,
                        disabled: false,
                    },
                    {
                        title: 'Securitized Carbon Emissions Analyzer',
                        url: 'https://trap-parallel.pd.tcw.com/sustain/ce/clo',
                        newTab: true,
                        disabled: false,
                    },                    
                ],
            },
            {
                title: 'Market',
                links: [
                    {
                        title: 'Credit News',
                        url: 'https://trap-parallel.pd.tcw.com/leveredfinance/news',
                        newTab: true,
                        disabled: false
                    }                  
                ]
            },         
            {
                title: 'Other',
                links: [
                    {
                        title: TTTLinks.TIP.title,
                        url: TTTLinks.TIP.url,
                        newTab: true,
                        disabled: TTTLinks.TIP.disabled,
                    },
                ],
            },
        ],
    },
    {
        header: 'Risk & Performance',
        subHeaders: [
            {
                title: 'Performance',
                links: [
                    {
                        title: 'Client Returns',
                        url: 'https://trap-parallel.pd.tcw.com/riskreturn/returns/client-return-portfolio',
                        newTab: true,
                        disabled: false,
                    },
                    {
                        title: 'Attribution Analysis',
                        url: 'https://trap-parallel.pd.tcw.com/riskreturn/returns/attribution-analysis',
                        newTab: true,
                        disabled: false,
                    },
                    {
                        title: 'Returns Overlay Upload',
                        url: 'https://trap-parallel.pd.tcw.com/riskreturn/returns/returns-overlay-upload',
                        newTab: true,
                        disabled: false,
                    },
                ],
            },
        ],
    },
    {
        header: 'Compliance',
        subHeaders: [
            {
                title: 'Research',
                links: [
                    {
                        title: 'Under Construction',
                        url: '',
                        newTab: true,
                        disabled: true,
                    },
                ],
                
            },
            {
                title: 'Governance',
                links: [
                    {
                        title: 'AI Usage Request Form',
                        url: 'https://workflow.corp.tcw.com/Runtime/Runtime/Form/TCW%20Workdesk?FormName=Form/AI.AiUsageRequest-wd.fm',
                        newTab: true,
                        disabled: false,
                    },
                ],
                
            },  
            {
                title: 'Regulations',
                links: [
                    {
                        title: 'EU Securitization',
                        url: 'https://tipeu.corp.tcw.com/',
                        newTab: true,
                        disabled: false,
                    },
                ],
                
            },                      
        ],
    },
    {
        header: 'Client Management',
        subHeaders: [
            {
                title: 'Research',
                links: [
                    // {
                    //     title: 'RatingsGuard.ai',
                    //     url: 'ratings-guard',
                    //     newTab: false,
                    //     disabled: false,
                    //     resource: "ratings",
                    //     action: "view",
                    // },
                ],
            },
        ],
    },
    {
        header: 'Support',
        subHeaders: [
            {
                title: 'General',
                links: [
                    {
                        title: 'GEM',
                        url: 'https://app.powerbi.com/groups/me/apps/3bc63f1b-3cb6-49d4-bf4f-24c8c0ea3a5e/reports/33271b9b-d03f-4bfc-b350-eb964d2cc850/ba46ae49a5fb77d0654b?experience=power-bi',
                        newTab: true,
                        disabled: false,
                    },
                    {
                        title: 'Business Events',
                        url: 'https://app.powerbi.com/links/oHDAvEyDht?ctid=b730b432-2098-413f-bd4a-014acdf7c72e&pbi_source=linkShare&bookmarkGuid=e0a09b46-58ca-4182-af2d-6cfec40e899a',
                        newTab: true,
                        disabled: false,
                    },
                    {
                        title: 'Recon TODvsTDC',
                        url: 'https://app.powerbi.com/links/wPQ2LRhUp5?ctid=b730b432-2098-413f-bd4a-014acdf7c72e&pbi_source=linkShare',
                        newTab: true,
                        disabled: false,
                    },
                    {
                        title: 'Test TOD',
                        url: 'feature-alpha',
                        newTab: false,
                        disabled: false,
                    },
                                        {
                        title: 'Test TOD - No Global Styling',
                        url: 'feature-beta',
                        newTab: false,
                        disabled: false,
                    },
                    // {
                    //     title: 'Request Access to Ratings Guard',
                    //     url: 'ratings-access-request',
                    //     newTab: false,
                    //     disabled: false,
                    // },
                ],
            },
        ],
    },
];
