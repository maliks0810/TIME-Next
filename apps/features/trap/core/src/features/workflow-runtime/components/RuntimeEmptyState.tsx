import React from 'react';
import { Alert } from 'antd';

type RuntimeEmptyStateProps = {
    loadingWorkflow: boolean;
    hasLayout: boolean;
};

export default function RuntimeEmptyState(props: RuntimeEmptyStateProps) {
    if (props.loadingWorkflow && !props.hasLayout) {
        return <Alert type="info" showIcon message="Loading workflow..." />;
    }

    return <Alert type="warning" showIcon message="No saved layout found for this workflow" />;
}
