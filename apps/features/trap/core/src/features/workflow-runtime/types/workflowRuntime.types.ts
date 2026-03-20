/* eslint-disable  @typescript-eslint/no-explicit-any */
import type { ContextBus } from '../../../state/contextBus';

export type WorkflowTabProps = {
    workflowId: string;
    templateId: string;
    templateVersionId: string;
    onClose: () => void;
    bus?: ContextBus;
    initialContext?: Record<string, any>;
};
