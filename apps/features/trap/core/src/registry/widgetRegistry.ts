import IdentityWidget from '../widgets/common/identity/IdentityWidget';
import CapitalStructureWidget from '../widgets/securitized-credit/capital-structure/CapitalStructureWidget';

import type { WidgetRegistryEntry } from '../types/widget';
import DataGridWidget from '../widgets/common/data-grid/DataGridWidget';
import ArcDashboardWidget from '../widgets/common/arc-dashboard/ArchDashboardWidget';
import RecentWorkflowsWidget from '../widgets/landing/recent-workflows/RecentWorkflowsWidget';
import { CounterTileWidget } from '../widgets/common/counter/CounterTile';
import { LinkWidget } from '../widgets/common/link/LinkWidget';

export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
    cwd_identity: {
        id: 'cwd_identity',
        component: IdentityWidget,
        category: 'Common',
        visibleIn: ['workflow'],

        listensToKeys: ['security.cusip'],
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
};
