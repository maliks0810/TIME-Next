import type { WorkflowContext } from '../../../state/contextBus';

export type Template = {
    id: string;
    name: string;
};

export type TemplateVersion = {
    id: string;
    templateId: string;
    version: number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
};

export type WorkflowTabModel = {
    key: string;
    workflowId: string;
    title: string;
    templateId: string;
    templateVersionId: string;
    templateVersionStatus: string;
    initialContext?: WorkflowContext;
};

export type RecentWorkflowItem = {
    id: string;
    label: string;
    description?: string;
    templateId?: string;
    versionId?: string;
};

export type LandingTabProps = {
    onOpenWorkflow: (ws: WorkflowTabModel) => void;
    activeLandingSelection?: {
        templateId: string;
        templateVersionId: string;
    };
};
