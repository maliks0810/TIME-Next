import type { NormalisedSummary } from './utils/helpers';

export const summaryPanelPreviewResult: NormalisedSummary = {
    eyebrow: 'Collateral Summary',
    dealName: 'EART 2025-2A',
    collateralType: 'Auto Loan · Subprime',
    asOf: '2026-04-30',
    metrics: [
        { key: 'orig_bal', label: 'Total Orig Balance', value: '$1.25', unit: 'B', accent: true },
        { key: 'curr_bal', label: 'Total Curr Balance', value: '$982.45', unit: 'M' },
        { key: 'wa_coupon', label: 'WA Coupon', value: '18.42', unit: '%' },
        { key: 'wa_ltv', label: 'WA LTV', value: '108.3', unit: '%' },
        { key: 'wa_fico', label: 'WA FICO', value: '612' },
        { key: 'n_loans', label: '# Loans', value: '62,481' },
        { key: 'wa_rem_term', label: 'WA Remaining Term', value: '58', unit: 'mo' },
        { key: 'wa_seasoning', label: 'WA Seasoning', value: '11', unit: 'mo' },
    ],
};