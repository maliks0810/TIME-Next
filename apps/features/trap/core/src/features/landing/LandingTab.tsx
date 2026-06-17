import LandingCanvas from './components/LandingCanvas';
import { useLanding } from './hooks/useLanding';
import type { LandingTabProps } from './types/landing.types';
import { Alert } from 'antd';

export default function LandingTab(props: LandingTabProps) {
    const { openWorkflowFromRecent, compiledLandingVersion, hasLanding, isLoading, error } =
        useLanding(props);
    if (isLoading) {
        return null;
    }
    if (error) {
        return (
            <Alert
                type="error"
                showIcon
                message="Landing not found"
                description={error}
                style={{ marginTop: 12 }}
            />
        );
    }
    if (!hasLanding) {
        return (
            <Alert
                type="info"
                showIcon
                message="Landing not configured"
                description="Open Workflow Launcher → Landing and activate a Landing template."
                style={{ marginTop: 12 }}
            />
        );
    }

    return (
        <LandingCanvas
            onOpenWorkflowFromRecent={openWorkflowFromRecent}
            compiledLandingVersion={compiledLandingVersion}
        />
    );
}
