export const COUNTER_TILE_STORE_KEY = 'counterTile';
export const ASSET_STAGED_TRANCHE_ID = 'asset.staged.trancheId';
export const ASSET_STAGED_TRANCHE_NAME = 'asset.staged.trancheName';
export const ANALYSTS_KEY = 'analystsControl';
export const CHART_CONTROL_KEY = 'chartControl';
export const PERIOD_RADIO_STORE_KEY = 'period';
export const DYNAMIC_TEXT_KEY = 'dynamicText';
export const ANALYST_PB_KEY = 'analystPerformanceBarChart';
export const DEAL_ID_KEY = 'deal.id';
export const DEAL_NAME_KEY = 'deal.name';
export const ANALYSIS_SESSION_ID_KEY = 'analysis.sessionId';
export const TRANCHE_ID_KEY = 'tranche.id';
export const TRANCHE_NAME_KEY = 'tranche.name';
export const SECURITY_ID_KEY = 'security.id';
export const SECURITY_IDENTIFIER_KEY = 'security.identifier';
export const SECURITY_NAME_KEY = 'security.name';
export const SECURITY_TYPE_KEY = 'security.type';
export const IS_ASSET_NEW_KEY = 'asset.isNew';
export const DRAM_COMMENT_WIDGET_KEY = 'dram.comment';
export const DRAM_ENTITY_ID_KEY = 'dram.entity.id';
export const DRAM_NOTE_TYPE_KEY = 'dram.note.type';
export const DATE_SELECT_KEY = 'common.date';
export const FILTER_STATE_KEY = 'filter.state';

// ── Collateral tape cross-filter (apply / commit) ──
// Two parallel channel namespaces per dimension:
//   stage.<dim>  — pending multi-select, written by emitters (geo map, charts)
//   filter.<dim> — applied, read by data widgets; committed from stage on Apply
// Values are string[] (multi-select). The FilterBar owns Apply / Reset.
export const FILTER_PREFIX = 'filter.';
export const STAGE_PREFIX = 'stage.';
export const COLLATERAL_DIMS = [
    'state',
    'fico',
    'dti',
    'ltv',
    'coupon',
    'days_arr',
    'age',
    'model_year',
    'manufacturer',
    'model',
    'originator',
    'servicer',
    'new_used',
    'vehicle_type',
    'zero_balance_reason',
];
export const COLLATERAL_FILTER_KEYS = COLLATERAL_DIMS.map(
    (dimension) => `${FILTER_PREFIX}${dimension}`,
);
export const COLLATERAL_STAGE_KEYS = COLLATERAL_DIMS.map(
    (dimension) => `${STAGE_PREFIX}${dimension}`,
);
export const COMMON_DATE_GRID_ROW_KEY = 'common.data.grid.row';
export const COMMON_BUTTON_KEY = 'common.button';
export const COMMON_TREE_KEY = 'common.tree.item';
export const CUSIP_KEY = 'cusip';
export const NAIC_RATINGS_KEY = 'naicRatings';

export enum DateFormatEnum {
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
}

export const schemaToStateKeyMap: { [key: string]: string } = {
    'prism.equity.analyst.list': ANALYSTS_KEY,
    'prism.equity.chart.control.list': CHART_CONTROL_KEY,
    'naic.rbc.ratings': NAIC_RATINGS_KEY,
    'naic.portfolio.cusip': CUSIP_KEY,
};