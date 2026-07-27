import IdentityWidget from '../widgets/common/identity/IdentityWidget';
import CapitalStructureWidget from '../widgets/securitized-credit/capital-structure/CapitalStructureWidget';

import type { WidgetRegistryEntry } from '../types/widget';
import DataGridWidget from '../widgets/common/data-grid/DataGridWidget';
import ArcDashboardWidget from '../widgets/common/arc-dashboard/ArchDashboardWidget';
import RecentWorkflowsWidget from '../widgets/landing/recent-workflows/RecentWorkflowsWidget';
import { CounterTileWidget } from '../widgets/common/counter/CounterTile';
import { LinkWidget } from '../widgets/common/link/LinkWidget';
import { PeriodRadioGroup } from '../widgets/equity-research/PeriodRadioGroup/PeriodRadioGroup';
import { CheckboxWidget } from '../widgets/common/checkbox/Checkbox';
import { KPIComparisonWidget } from '../widgets/equity-research/KPIComparisonWidget/KPIComparisonWidget';
import { ScDealDetailsWidget } from '../widgets/securitized-credit/DealDetailsWidget/ScDealDetailsWidget';
import { ScTranchesWidget } from '../widgets/securitized-credit/TranchesWidget/ScTranchesWidget';
import { ScTrancheDetailWidget } from '../widgets/securitized-credit/TrancheDetailWidget/ScTrancheDetailWidget';
import { AnalystsCheckboxGroupWidget } from '../widgets/equity-research/AnalystsCheckboxGroup/AnalystsCheckboxGroup';
import { ChartControlCheckboxGroup } from '../widgets/equity-research/ChartControlCheckboxGroup/ChartControlCheckboxGroup';
import { AnalystPBChartWidget } from '../widgets/equity-research/AnalystPBChartWidget/AnalystPBChart';
import PerformanceAnalysisLineChartWidget from '../widgets/equity-research/PerformanceAnalysis/PerformanceAnalysisLineChartWidget';
import CDIUploadWidget from '../widgets/securitized-credit/cdi-upload/CDIUploadWidget';
import SecurityLookupWidget from '../widgets/securitized-credit/security-lookup/SecurityLookupWidget';
import { TextWidget } from '../widgets/common/text/Text';
import { CommentWidget } from '../widgets/dram/comment/CommentWidget';
import { DateSelect } from '../widgets/common/date-select/DateSelect';
import { ButtonWidget } from '../widgets/common/button/Button';
import { TreeWidget } from '../widgets/common/tree/Tree';
import { RadioButton } from '../widgets/common/radio-button/RadioButton';
import { DynamicText } from '../widgets/common/dynamic-text/DynamicText';
import { TabsControl } from '../widgets/dram/tabs-control/TabsControl';
import { PortfolioInfo } from '../widgets/dram/info/PortfolioInfo';
import AssetStagingWidget from '../widgets/securitized-credit/new-asset/asset-staging/AssetStagingWidget';
import { HeatGridWidget } from '../widgets/common/heatgrid/HeatGridWidget';
import { SummaryPanelWidget } from '../widgets/common/summary-panel/SummaryPanel';

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
        emitsKeys: ['asset.staged.trancheId', 'asset.staged.trancheName', 'asset.isNew'],
    },
    cwd_new_asset_staging_01: {
        id: 'cwd_new_asset_staging_01',
        component: AssetStagingWidget,
        category: 'SecuritizedCredit',
        visibleIn: ['workflow'],
        listensToKeys: [
            'deal.id',
            'deal.name',
            'asset.staged.trancheId',
            'asset.staged.trancheName',
            'analysis.sessionId',
            'scenario.selectedResultId',
            'scenario.selectedSummary',
            'asset.isNew',
            'workflow.refresh',
        ],
        emitsKeys: [],
    },
    cwd_common_data_grid_01: {
        id: 'cwd_common_data_grid_01',
        component: DataGridWidget,
        category: 'Common',
        visibleIn: ['workflow'],
        listensToKeys: ['security.cusip'],
        emitsKeys: [],
    },
    wd_analysts_checkbox_group: {
        id: 'wd_analysts_checkbox_group',
        component: AnalystsCheckboxGroupWidget,
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
    wd_chart_control_checkbox_group: {
        id: 'wd_chart_control_checkbox_group',
        component: ChartControlCheckboxGroup,
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
    cwd_arc_dashboard: {
        id: 'cwd_arc_dashboard',
        component: ArcDashboardWidget,
        category: 'Common',
        visibleIn: ['landing', 'workflow'],
        listensToKeys: ['security.cusip'],
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
    cwd_common_summary_panel_01: {
        id: 'cwd_common_summary_panel_01',
        component: SummaryPanelWidget,
        category: 'View',
        visibleIn: ['workflow'],
        listensToKeys: [],
        emitsKeys: [],
    }
};