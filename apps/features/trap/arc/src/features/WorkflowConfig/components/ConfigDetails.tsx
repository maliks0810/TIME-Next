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
    workflowId: d.workflowId,
    assetType: d.assetType,
    assetSubType: d.assetSubType,
    collateralType: d.collateralType,
    isActive: d.isActive,
    defaultOverrides: d.defaultOverrides,
    defaultOverridesJson: JSON.stringify(d.defaultOverrides),
    workflowRules: d.workflowRules,
    workflowConfigurationJson: JSON.stringify(d.workflowRules),
    lastModifiedAt: d.lastModifiedAt,
    lastModifiedBy: d.lastModifiedBy
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
                activeTab === 'general' ? (
                    <GeneralTab
                        key={draft.configurationId}
                        draft={draft}
                        onChange={updateGeneral}
                    />
                ) : null,
        },
        {
            key: 'overrides',
            label: 'Default Overrides',
            children:
                activeTab === 'overrides' ? (
                    <DefaultOverridesTab
                        key={draft.configurationId}
                        draft={draft}
                        onChange={setOverrides}
                    />
                ) : null,
        },
        {
            key: 'logic',
            label: 'Workflow Logic',
            children:
                activeTab === 'logic' ? (
                    <WorkflowLogicTab
                        draft={draft}
                        onRulesChange={setRules}
                    />
                ) : null,
        },
        {
            key: 'history',
            label: 'History',
            children: activeTab === 'history' ? <HistoryTab configId={draft.configurationId} /> : null,
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
