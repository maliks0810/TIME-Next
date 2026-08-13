
// Re-export the WorkflowConfig domain types defined in the shared src/lib/types.ts so feature

import { AssetType } from '../../../lib/types';

// components can import them from a local barrel.
export type {
    Callable,
    ReviewType,
    WorkflowRule,
    WorkflowConfig,
    WorkflowConfigRequest,
    PayloadItem,
    WorkflowRuleConfig
} from '../../../lib/types';

// A single versioned record returned by the workflow-config history endpoint.
export type WorkflowConfigHistory = {
    modifiedBy: string;
    modifiedAt: string;
    before: string;
    after: string;
};

export type MetaDataResponse = {
    assetTypes: AssetType[];
}
export type WorkflowItem = {
    workflowId: number;
    workflowCode: string;
    workflowName: string;
}

export type WorkflowsCollection = {
    workflowItems: WorkflowItem[];
}

