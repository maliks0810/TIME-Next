import React from 'react';
import { Space } from 'antd';

import JsonInfoModal from '../../components/common/JsonInfoModal';

import RuntimeCanvas from './components/RuntimeCanvas';
import RuntimeEmptyState from './components/RuntimeEmptyState';
import { useWorkflowRuntime } from './hooks/useWorkflowRuntime';
import type { WorkflowTabProps } from './types/workflowRuntime.types';

export default function WorksflowTab(props: WorkflowTabProps) {
    const { bus, snapshot, loadingWorkflow, layoutFromCompiled, runtimeItems, workflowInfo } =
        useWorkflowRuntime(props);

    return (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <JsonInfoModal
                    title="Workflow Raw JSON"
                    data={workflowInfo}
                    tooltip="Workflow/Template JSON"
                />
            </div>

            {layoutFromCompiled.length === 0 ? (
                <RuntimeEmptyState
                    loadingWorkflow={loadingWorkflow}
                    hasLayout={layoutFromCompiled.length > 0}
                />
            ) : (
                <RuntimeCanvas
                    layout={layoutFromCompiled}
                    runtimeItems={runtimeItems}
                    snapshot={snapshot}
                    bus={bus}
                />
            )}
        </Space>
    );
}
