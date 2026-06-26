import { ReviewType } from '../../../lib/types';

export const REVIEW_TYPE_OPTIONS: { label: ReviewType; value: ReviewType }[] = [
    { label: 'Full Automation', value: 'Full Automation' },
    { label: 'Inputs Review', value: 'Inputs Review' },
    { label: 'Analytics Review', value: 'Analytics Review' },
    { label: 'Full Review', value: 'Full Review' },
];

// Exact colors already defined in src/lib/styles.scss, keyed by review type for the THEN badge.
export const REVIEW_TYPE_COLORS: Record<ReviewType, string> = {
    'Full Automation': '#709e46', // .advanceButton green
    'Inputs Review': '#b86544', // .actionBarHeader orange
    'Analytics Review': '#287064', // .securitySettingsHeader teal
    'Full Review': '#a02cc7', // .claimButton purple
};

export const CALLABLE_SELECT_OPTIONS = [
    { label: 'Y', value: 'Y' },
    { label: 'N', value: 'N' },
    { label: 'C', value: 'C' },
];

// Reuses the collateral type values used across RequestNewAsset and AssetInfoSelectCollateralType.
export const COLLATERAL_TYPE_OPTIONS = [
    { label: 'Closed-End Second (CES)', value: 'CES' },
    { label: 'Non-Qualified Mortgage (NQM)', value: 'NQM' },
    { label: 'Prime Jumbo (PJ)', value: 'PJ' },
    { label: 'Non-Performing Loan (NPL)', value: 'NPL' },
    { label: 'Home Equity Line of Credit (HELOC)', value: 'HELOC' },
    { label: 'Re-Performing Loan (RPL)', value: 'RPL' },
    { label: 'Single Family Rental (SFR)', value: 'SFR' },
    { label: 'Agency Investor (AGI)', value: 'AGI' },
    { label: 'Residential Transition Loans (RTL)', value: 'RTL' },
    { label: 'Legacy (LEG)', value: 'LEG' },
    { label: 'Credit Risk Transfer (CRT)', value: 'CRT' },
    { label: 'Manufactured Housing (MH)', value: 'MH' },
    { label: 'Other (OTH)', value: 'OTH' },
];

export const WORKFLOW_OPTIONS = [
    { label: 'Standard RMBS', value: 'WF-RMBS-STD' },
    { label: 'Expedited Review', value: 'WF-EXPEDITED' },
    { label: 'Manual Only', value: 'WF-MANUAL' },
    { label: 'Full Automation', value: 'WF-AUTO' },
];

// Mirrors the SECURITY_SETTINGS option sets used in RequestNewAsset/index.tsx.
export const INTEREST_RATE_SCENARIO_OPTIONS = [
    { label: 'Forward', value: 'Forward' },
    { label: 'Nominal', value: 'Nominal' },
];

export const MODEL_FAMILY_OVERRIDE_OPTIONS = [
    { label: 'BRS v6.5', value: 'BRS v6.5' },
    { label: 'BRS v6.4', value: 'BRS v6.4' },
    { label: 'BRS v2.2', value: 'BRS v2.2' },
    { label: 'BRCLO v2.01', value: 'BRCLO v2.01' },
    { label: 'STATIC', value: 'STATIC' },
];

export const PREPAYMENT_DEFAULT_TYPE_OPTIONS = [
    { label: 'CDR', value: 'CDR' },
    { label: 'SDA', value: 'SDA' },
];
