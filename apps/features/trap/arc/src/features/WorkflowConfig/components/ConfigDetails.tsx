import { useEffect, useState } from 'react';
import { Button, Tabs } from 'antd';
import { GeneralTab } from './tabs/GeneralTab';
import { DefaultOverridesTab } from './tabs/DefaultOverridesTab';
import { WorkflowLogicTab } from './tabs/WorkflowLogicTab';
import { HistoryTab } from './tabs/HistoryTab';
import { PayloadItem, WorkflowConfig, WorkflowConfigRequest, WorkflowRuleConfig } from '../lib/types';

type ConfigDetailsProps = {
    config: WorkflowConfig | null;
    onSave: (updated: WorkflowConfigRequest) => Promise<void>;
    onClose: () => void;
};

const buildRequest = (d: WorkflowConfig): WorkflowConfigRequest => ({
    ...d,
    defaultOverridesJson: JSON.stringify(d.defaultOverrides),
    workflowConfigurationJson: JSON.stringify(d.workflowRules),
});

export const ConfigDetails = ({ config, onSave, onClose }: ConfigDetailsProps) => {
    const [draft, setDraft] = useState<WorkflowConfig | null>(config);
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);

    // Reset the working copy whenever a different configuration is selected.
    useEffect(() => {
        setDraft(config);
        setActiveTab('general');
    }, [config]);

    if (!draft) {
        return (
            <div
                className="configDetailsContainer"
                style={{ alignItems: 'center', justifyContent: 'center', color: '#999' }}
            >
                Select a configuration to view details
            </div>
        );
    }

    const updateGeneral = (partial: Partial<WorkflowConfig>) =>
        setDraft((prev) => (prev ? { ...prev, ...partial } : prev));

    const setOverrides = (defaultOverrides: PayloadItem[]) =>
        setDraft((prev) => (prev ? { ...prev, defaultOverrides } : prev));

    const setRules = (workflowRules: WorkflowRuleConfig) =>
        setDraft((prev) => (prev ? { ...prev, workflowRules } : prev));


    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(buildRequest(draft));
        } finally {
            setSaving(false);
        }
    };

    const items = [
        {
            key: 'general',
            label: 'General',
            children:
                <GeneralTab
                    key={draft.configurationId}
                    draft={draft}
                    onChange={updateGeneral}
                />
        },
        {
            key: 'overrides',
            label: 'Default Overrides',
            children:
                <DefaultOverridesTab
                    key={draft.configurationId}
                    draft={draft}
                    onChange={setOverrides}
                />
        },
        {
            key: 'logic',
            label: 'Workflow Logic',
            children:
                <WorkflowLogicTab
                    draft={draft}
                    onRulesChange={setRules}
                />
        },
        {
            key: 'history',
            label: 'History',
            children:
                <HistoryTab configId={draft.configurationId} />
        },
    ];

    return (
        <div className="configDetailsContainer">
            <div style={{ display: 'flex', gap: 12, paddingTop: 12, justifyContent: 'flex-end' }}>
                <Button className="advanceButton" loading={saving} onClick={handleSave}>
                    Save
                </Button>
                <Button onClick={onClose}>Cancel</Button>
            </div>
            <Tabs
                className="tabsWrapper"
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
            />
        </div>
    );
};
