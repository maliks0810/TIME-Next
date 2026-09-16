import IdentityWidget from '../widgets/common/identity/IdentityWidget';
import CapitalStructureWidget from '../widgets/securitized-credit/capital-structure/CapitalStructureWidget';

import type { WidgetRegistryEntry } from '../types/widget';
import RecentWorkflowsWidget from '../widgets/landing/recent-workflows/RecentWorkflowsWidget';
import { CounterTileWidget } from '../widgets/common/counter/CounterTile';
import { LinkWidget } from '../widgets/common/link/LinkWidget';
import { PeriodRadioGroup } from '../widgets/equity-research/PeriodRadioGroup/PeriodRadioGroup';
import { CheckboxWidget } from '../widgets/common/checkbox/Checkbox';
import { KPIComparisonWidget } from '../widgets/equity-research/KPIComparisonWidget/KPIComparisonWidget';
import { ScDealDetailsWidget } from '../widgets/securitized-credit/DealDetailsWidget/ScDealDetailsWidget';
import { ScTranchesWidget } from '../widgets/securitized-credit/TranchesWidget/ScTranchesWidget';
import { ScTrancheDetailWidget } from '../widgets/securitized-credit/TrancheDetailWidget/ScTrancheDetailWidget';
import { AnalystPBChartWidget } from '../widgets/equity-research/AnalystPBChartWidget/AnalystPBChart';
import PerformanceAnalysisLineChartWidget from '../widgets/equity-research/PerformanceAnalysis/PerformanceAnalysisLineChartWidget';
import CDIUploadWidget from '../widgets/securitized-credit/cdi-upload/CDIUploadWidget';
import SecurityLookupWidget from '../widgets/securitized-credit/security-lookup/SecurityLookupWidget';
import { TextWidget } from '../widgets/common/text/Text';
import { CommentWidget } from '../widgets/dram/comment/CommentWidget';
import { MultiSelectWidget } from '../widgets/common/MultiSelectWidget/MultiSelectWidget';
import { DateSelect } from '../widgets/common/date-select/DateSelect';
import { ButtonWidget } from '../widgets/common/button/Button';
import { TreeWidget } from '../widgets/common/tree/Tree';
import { RadioButton } from '../widgets/common/radio-button/RadioButton';
import { DynamicText } from '../widgets/common/dynamic-text/DynamicText';
import { TabsControl } from '../widgets/dram/tabs-control/TabsControl';
import { PortfolioInfo } from '../widgets/dram/info/PortfolioInfo';
import AssetStagingWidget from '../widgets/securitized-credit/new-asset/asset-staging/AssetStagingWidget';
import ScenarioMatrixWidget from '../widgets/securitized-credit/new-asset/scenario-matrix/ScenarioMatrixWidget';
import { HeatGridWidget } from '../widgets/common/heatgrid/HeatGridWidget';
import { GridRegistry } from '../widgets/common/data-grid/GridRegistry';
import { Input } from '../widgets/common/input/Input';
import { SummaryPanelWidget } from '../widgets/common/summary-panel/SummaryPanel';
import { ChartWidget } from '../widgets/common/chart/ChartWidget';
import { GeoMapWidget } from '../widgets/common/geo-map/GeoMapWidget';
import { TableWidget } from '../widgets/common/table/TableWidget';
import { TitleWidget } from '../widgets/common/title/TitleWidget';
import { FilterBarWidget } from '../widgets/common/filter-bar/FilterBarWidget';
import { PortfolioAnalysisScope } from '../widgets/dram/portfolio-analysis-scope/PortfolioAnalysisScope';
import UploaderWidget from '../widgets/common/uploader/UploaderWidget';

export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
    cwd_identity: {
        id: 'cwd_identity',
        component: IdentityWidget,
        category: 'Common',
        visibleIn: ['workflow'],

        listensToKeys: ['security.cusip'],
        emitsKeys: [],
    },
    cwd_sc_deal_details_01: {
        id: 'cwd_sc_deal_details_01',
        component: ScDealDetailsWidget,
        category: 'SecuritizedCredit',
        visibleIn: ['workflow'],
        listensToKeys: ['deal.id', 'deal.name', 'analysis.sessionId', 'workflow.refresh'],
        emitsKeys: [],
    },
    cwd_sc_tranches_01: {
        id: 'cwd_sc_tranches_01',
        component: ScTranchesWidget,
        category: 'SecuritizedCredit',
        visibleIn: ['workflow'],
        listensToKeys: ['deal.id', 'analysis.sessionId', 'workflow.refresh'],
        emitsKeys: ['tranche.id', 'tranche.name'],
    },
    cwd_sc_tranche_detail_01: {
        id: 'cwd_sc_tranche_detail_01',
        component: ScTrancheDetailWidget,
        category: 'SecuritizedCredit',
        visibleIn: ['workflow'],
        listensToKeys: [
            'deal.id',
            'deal.name',
            'tranche.id',
            'tranche.name',
            'analysis.sessionId',
            'workflow.refresh',
        ],
        emitsKeys: ['tranche.id', 'tranche.name', 'asset.isNew'],
    },
    cwd_new_asset_staging_01: {
        id: 'cwd_new_asset_staging_01',
        component: AssetStagingWidget,
        category: 'SecuritizedCredit',
        visibleIn: ['workflow'],
        listensToKeys: [
            'deal.id',
            'deal.name',
            'tranche.id',
            'tranche.name',
            'analysis.sessionId',
            'scenario.selectedResultId',
            'scenario.selectedSummary',
            'asset.isNew',
            'workflow.refresh',
        ],
        emitsKeys: [],
    },
    cwd_scenario_matrix_01: {
        id: 'cwd_scenario_matrix_01',
        component: ScenarioMatrixWidget,
        category: 'SecuritizedCredit',
        visibleIn: ['workflow'],
        listensToKeys: [
            'deal.id',
            'deal.name',
            'tranche.id',
            'tranche.name',
            'analysis.sessionId',
            'workflow.refresh',
        ],
        emitsKeys: ['scenario.selectedResultId', 'scenario.selectedSummary'],
    },
    cwd_common_data_grid_01: {
        id: 'cwd_common_data_grid_01',
        component: GridRegistry,
        category: 'Common',
        visibleIn: ['workflow'],
        listensToKeys: ['security.cusip'],
        emitsKeys: [],
    },
    wd_multi_select: {
        id: 'wd_multi_select',
        component: MultiSelectWidget,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    wd_kpi_comparison: {
        id: 'wd_kpi_comparison',
        component: KPIComparisonWidget,
        category: 'Equity',
        visibleIn: ['workflow'],
    },
    wd_analyst_performance_bar_chart: {
        id: 'wd_analyst_performance_bar_chart',
        component: AnalystPBChartWidget,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_checkbox: {
        id: 'wd_period_radio_group',
        component: CheckboxWidget,
        category: 'Control',
        visibleIn: ['workflow', 'landing'],
        listensToKeys: [],
        emitsKeys: [],
    },
    wd_period_radio_group: {
        id: 'wd_period_radio_group',
        component: PeriodRadioGroup,
        category: 'Control',
        visibleIn: ['workflow', 'landing'],
        listensToKeys: [],
        emitsKeys: [],
    },

    cwd_recent_workflows: {
        id: 'cwd_recent_workflows',
        component: RecentWorkflowsWidget,
        category: 'Signal',
        visibleIn: ['landing'],

        listensToKeys: [],
        emitsKeys: [],
    },

    cwd_capital_structure: {
        id: 'cwd_capital_structure',
        component: CapitalStructureWidget,
        category: 'SecuritizedCredit',
        visibleIn: ['workflow'],

        listensToKeys: ['security.cusip'],
        emitsKeys: [],
    },
    cwd_common_counter_tile_01: {
        id: 'cwd_common_counter_tile_01',
        component: CounterTileWidget,
        category: 'Common',
        visibleIn: ['workflow', 'landing'],

        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_common_link: {
        id: 'cwd_common_link',
        component: LinkWidget,
        category: 'Common',
        visibleIn: ['landing', 'workflow'],

        listensToKeys: [],
        emitsKeys: [],
    },
    wd_analyst_performance_line_chart_01: {
        id: 'wd_analyst_performance_line_chart_01',
        component: PerformanceAnalysisLineChartWidget,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_text: {
        id: 'cwd_text',
        component: TextWidget,
        category: 'Common',
        visibleIn: ['landing', 'workflow'],
    },
    wd_cdi_upload_widget: {
        id: 'wd_cdi_upload_widget',
        component: CDIUploadWidget,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    wd_sc_security_lookup_01: {
        id: 'wd_sc_security_lookup_01',
        component: SecurityLookupWidget,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    wd_comment_widget: {
        id: 'wd_comment_widget',
        component: CommentWidget,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_date_select: {
        id: 'cwd_date_select',
        component: DateSelect,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_button: {
        id: 'cwd_button',
        component: ButtonWidget,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_tree: {
        id: 'cwd_tree',
        component: TreeWidget,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_radio: {
        id: 'cwd_radio',
        component: RadioButton,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_dynamic_text: {
        id: 'cwd_dynamic_text',
        component: DynamicText,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    wd_tabs_control: {
        id: 'wd_tabs_control',
        component: TabsControl,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    wd_portfolio_info: {
        id: 'wd_portfolio_info',
        component: PortfolioInfo,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_heatmap: {
        id: 'cwd_heatmap',
        component: HeatGridWidget,
        category: 'View',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_input: {
        id: 'cwd_input',
        component: Input,
        category: 'View',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_common_summary_panel_01: {
        id: 'cwd_common_summary_panel_01',
        component: SummaryPanelWidget,
        category: 'View',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_common_chart_01: {
        id: 'cwd_common_chart_01',
        component: ChartWidget,
        category: 'View',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_common_geo_map_01: {
        id: 'cwd_common_geo_map_01',
        component: GeoMapWidget,
        category: 'View',
        visibleIn: ['workflow'],
        listensToKeys: ['deal.name', 'filter.state'],
        emitsKeys: ['filter.state'],
    },
    cwd_common_table_01: {
        id: 'cwd_common_table_01',
        component: TableWidget,
        category: 'View',
        visibleIn: ['workflow', 'landing'],
        listensToKeys: [
            'deal.name',
            'filter.state',
            'filter.fico',
            'filter.ltv',
            'filter.coupon',
            'filter.manufacturer',
            'filter.new_used',
        ],
        emitsKeys: [],
    },
    cwd_common_title_01: {
        id: 'cwd_common_title_01',
        component: TitleWidget,
        category: 'View',
        visibleIn: ['workflow', 'landing'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_common_filter_bar_01: {
        id: 'cwd_common_filter_bar_01',
        component: FilterBarWidget,
        category: 'View',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    cwd_file_uploader: {
        id: 'cwd_file_uploader',
        component: UploaderWidget,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    ds_common_portfolio_analysis_scope_01: {
        id: 'ds_common_portfolio_analysis_scope_01',
        component: PortfolioAnalysisScope,
        category: 'Control',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    },
    // Currently Not deploying below functionality to production. Skip code review
    // ds_common_performance_grid_01: {
    //     id: 'ds_common_performance_grid_01',
    //     component: PerformanceGrid,
    //     category: 'Control',
    //     visibleIn: ['workflow'],
    //     listensToKeys: [],
    //     emitsKeys: [],
    // }
};
