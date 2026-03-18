export const STATUSES = [
    'Manual',
    'Analytics Input Pending Review',
    'Analytics Input Sent To Aladdin',
    'Analytics Calculation In Progress',
    'Analytics Pending Review',
    'Analytics Sent To Aladdin',
    'Analytics Verified In Aladdin',
    'Abandoned',
    'Invalid Request',
];

export enum STATUSES_ENUM {
    INPUT_PENDING_REVIEW = 'Analytics Input Pending Review',
    INPUT_SENT_TO_ALADDIN = 'Analytics Input Sent To Aladdin',
    CALCUALTION_IN_PROGRESS = 'Analytics Calculation In Progress',
    ANALYTICS_PENDING_REVIEW = 'Analytics Pending Review',
    ANALYTICS_SENT_TO_ALADDIN = 'Analytics Sent To Aladdin',
    ANALYTICS_VERIFIED_IN_ALADDIN = 'Analytics Verified In Aladdin',
    ABANDONED = 'Abandon',
    INVALID_REQUEST = 'Invalid Request',
}

export const COMMON_COLLATERAL_TYPES = ['NQM', 'CES', 'NPL'];

export const CALLABLE_OPTIONS = [
    { label: 'Yes (Y)', value: 'Y' },
    { label: 'No (N)', value: 'N' },
    { label: 'Clean up (C)', value: 'C' },
];

export const PUBLISH_BUTTON_HELPTEXT = 'Enabled for callable assets in ANALYTICS INPUT PENDING REVIEW status and for collateral type is CES, NPL or NQM.';
export const PUBLISH_ANALYTICS_BUTTON_HELPTEXT = 'Enabled for assets whose status is ANALYTICS PENDING REVIEW.';
export const PUBLISH_TDC_BUTTON_HELPTEXT = 'Enabled for assets whose status is ANALYTICS SENT TO ALADDIN or MANUAL';
export const RUN_ANALYTICS_BUTTON_HELPTEXT = 'Enabled for non callable bonds rightaway, for other bonds only when Status is ANALYTICS INPUT SENT TO ALADDIN, MANUAL, ANALYTICS INPUT PENDING REVIEW or INVALID REQUEST.';
export const ABANDON_BUTTON_HELPTEXT = 'Enabled only when status is neither ANALYTICS VERIFIED IN ALADDIN nor ABANDONED.';
export const PREVIEW_BOND_BUTTON_TEXT = 'Enabled only when collateral type is CES, NPL or NQM';
export const PREVIEW_ANALYTICS_BUTTON_TEXT = 'Enabled only when analytics are available.';
export const PREVIEW_STATIC_BUTTON_TEXT = 'Enabled only for callable assets.';
