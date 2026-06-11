export const STATUSES = [
    'Correction',
    'Manual',
    'Analytics Input Pending Review',
    'Analytics Input Sent To Aladdin',
    'Analytics Calculation In Progress',
    'Analytics Pending Review',
    'Analytics Sent To Aladdin',
    'Analytics Verified In Aladdin',
    'Abandoned',
    'Cancelled',
    'Invalid Request',
];

export enum STATUSES_ENUM {
    INPUT_PENDING_REVIEW = 'Analytics Input Pending Review',
    INPUT_SENT_TO_ALADDIN = 'Analytics Input Sent To Aladdin',
    CALCUALTION_IN_PROGRESS = 'Analytics Calculation In Progress',
    ANALYTICS_PENDING_REVIEW = 'Analytics Pending Review',
    ANALYTICS_SENT_TO_ALADDIN = 'Analytics Sent To Aladdin',
    ANALYTICS_VERIFIED_IN_ALADDIN = 'Analytics Verified In Aladdin',
    ANALYTICS_INPUT_VERIFIED_IN_ALADDIN = 'ANALYTICS INPUT VERIFIED IN ALADDIN',
    ABANDONED = 'Abandoned',
    INVALID_REQUEST = 'Invalid Request',
}

export const COMMON_COLLATERAL_TYPES = ['NQM', 'CES', 'NPL'];

export const CALLABLE_OPTIONS = [
    { label: 'Yes (Y)', value: 'Y' },
    { label: 'No (N)', value: 'N' },
    { label: 'Clean up (C)', value: 'C' },
];

export const PREPAYMENT_TYPE_OPTIONS_ALL = [
    { label: 'ABS', value: 'ABS' },
    { label: 'CPJ', value: 'CPJ' },
    { label: 'CPR', value: 'CPR' },
    { label: 'HEP', value: 'HEP' },
    { label: 'MHP', value: 'MHP' },
    { label: 'PPC', value: 'PPC' },
    { label: 'PSA', value: 'PSA' },
];

export const PREPAYMENT_TYPE_OPTIONS_CMBS = [
    { label: 'ABS', value: 'ABS' },
    { label: 'CPJ', value: 'CPJ' },
    { label: 'CPP', value: 'CPP' },
    { label: 'CPR', value: 'CPR' },
    { label: 'CPY', value: 'CPY' },
];

export const PUBLISH_BUTTON_HELPTEXT =
    'Enabled for call/speed overridable assets in ANALYTICS INPUT PENDING REVIEW status and for collateral type is CES, NPL or NQM.';
export const PUBLISH_ANALYTICS_BUTTON_HELPTEXT =
    'Enabled for assets whose status is ANALYTICS PENDING REVIEW.';
export const PUBLISH_TDC_BUTTON_HELPTEXT =
    'Enabled for assets whose status is ANALYTICS SENT TO ALADDIN or MANUAL';
export const RUN_ANALYTICS_BUTTON_HELPTEXT =
    'Enabled for no override required bonds rightaway, for other bonds only when Status is ANALYTICS INPUT SENT TO ALADDIN, MANUAL, ANALYTICS INPUT PENDING REVIEW or INVALID REQUEST.';
export const ABANDON_BUTTON_HELPTEXT =
    'Enabled only when status is neither ANALYTICS VERIFIED IN ALADDIN nor ABANDONED.';
export const PREVIEW_BOND_BUTTON_TEXT = 'Enabled only when collateral type is CES, NPL or NQM';
export const PREVIEW_ANALYTICS_BUTTON_TEXT = 'Enabled only when analytics are available.';
export const PREVIEW_STATIC_BUTTON_TEXT = 'Enabled only when an asset has call/speed overrides.';
export const MANUAL_BUTTON_HELP_TEXT = 'Click this button to switch to manual mode.';

export const DOWNLOAD_BRS_ANALYTICS_BUTTON_TEXT = 'Enabled only when analytics overrides are published to BRS.';
export const DOWNLOAD_BRS_BOND_BUTTON_TEXT = 'Enabled only when a Bond Feature has been published to BRS.';
export const DOWNLOAD_BRS_STATIC_BUTTON_TEXT = 'Enabled only when a Static Scenario Override has been published to BRS.';

export const ANALYTICS_INTERFACE = '315';
export const BOND_INTERFACE = '324';
export const STATIC_INTERFACE = '425';

export const ACCEPT_BUTTON_HELPTEXT =
    'Enabled for status Correction or Cancel.';
export const REJECT_BUTTON_HELPTEXT =
    'Enabled for status Correction or Cancel.';
