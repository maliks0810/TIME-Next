import IdentityWidget from '../widgets/common/identity/IdentityWidget';
import CapitalStructureWidget from '../widgets/securitized-credit/capital-structure/CapitalStructureWidget';

import type { WidgetRegistryEntry } from '../types/widget';
import RecentWorkflowsWidget from '../widgets/landing/recent-workflows/RecentWorkflowsWidget';

export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
    cwd_identity: {
        id: 'cwd_identity',
        component: IdentityWidget,
        category: 'Common',
        visibleIn: ['workflow'],

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
};
