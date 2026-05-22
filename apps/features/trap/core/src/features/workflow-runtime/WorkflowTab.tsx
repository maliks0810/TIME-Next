import { Space } from 'antd';

import RuntimeCanvas from './components/RuntimeCanvas';
import RuntimeEmptyState from './components/RuntimeEmptyState';
import { useWorkflowRuntime } from './hooks/useWorkflowRuntime';
import type { WorkflowTabProps } from './types/workflowRuntime.types';

export default function WorksflowTab(props: WorkflowTabProps) {
    const { loadingWorkflow, layoutFromCompiled, runtimeItems } = useWorkflowRuntime(props);

    return (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {layoutFromCompiled.length === 0 ? (
                <RuntimeEmptyState
                    loadingWorkflow={loadingWorkflow}
                    hasLayout={layoutFromCompiled.length > 0}
                />
            ) : (
                <RuntimeCanvas layout={layoutFromCompiled} runtimeItems={runtimeItems} />
            )}
        </Space>
    );
}
