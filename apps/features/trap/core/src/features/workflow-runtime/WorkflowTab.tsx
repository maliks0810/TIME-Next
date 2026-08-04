import RuntimeCanvas from './components/RuntimeCanvas';
import RuntimeEmptyState from './components/RuntimeEmptyState';
import { useWorkflowRuntime } from './hooks/useWorkflowRuntime';
import type { WorkflowTabProps } from './types/workflowRuntime.types';

export default function WorkflowTab(props: WorkflowTabProps) {
    const { loadingWorkflow, layoutFromCompiled, runtimeItems } = useWorkflowRuntime(props);
    if (layoutFromCompiled.length === 0) {
        return <RuntimeEmptyState loadingWorkflow={loadingWorkflow} hasLayout={false} />;
    }
    return (
        <div style={{ width: '100%' }}>
            <RuntimeCanvas layout={layoutFromCompiled} runtimeItems={runtimeItems} />
        </div>
    );
}