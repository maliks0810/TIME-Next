import { RecentSearch } from './types';

export const MOCK_RECENT_SEARCHES: RecentSearch[] = [
    {
        name: 'ARMT 2005-8 — 7A2',
        cusip: '007036QT6',
        isin: 'US007036QT65',
        assetType: 'NA-RMBS',
        collateralType: 'ALT-A',
        context: {
            'deal.name': 'ARMT 2005-8',
            'analysis.sessionId': 'sess_armt_2005_8',
        },
    },
    {
        name: 'ARMT 2005-8 — 7M1',
        cusip: '007036QX7',
        isin: 'US007036QX75',
        assetType: 'NA-RMBS',
        collateralType: 'ALT-A',
        context: {
            'deal.name': 'ARMT 2005-8',
            'analysis.sessionId': 'sess_armt_2005_8',
        },
    },
    {
        name: 'ARMT 2005-8 — 6A1',
        cusip: '007036QQ2',
        isin: 'US007036QQ25',
        assetType: 'NA-RMBS',
        collateralType: 'Prime',
        context: {
            'deal.name': 'ARMT 2005-8',
            'analysis.sessionId': 'sess_armt_2005_8',
        },
    },
    {
        name: 'FNMA 2024-M3',
        cusip: '31418XAA2',
        isin: 'US31418XAA25',
        assetType: 'CMBS',
        collateralType: 'Agency',
        context: {
            'deal.name': 'FNMA 2024-M3',
            'analysis.sessionId': 'sess_fnma_2024',
        },
    },
];