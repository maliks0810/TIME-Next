import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import { WorkflowConfig, WorkflowConfigRequest } from './lib/types';
import {
    createWorkflowConfig,
    deleteWorkflowConfig,
    getWorkflowConfigs,
    updateWorkflowConfig,
} from './lib/services';
import { extractResponseArray } from '../../lib/helpers';
import { ConfigList } from './components/ConfigList';
import { ConfigDetails } from './components/ConfigDetails';

// Sentinel id used for an unsaved draft created via the "New" button.
const NEW_CONFIG_ID = 0;

const buildBlankConfig = (): WorkflowConfig => ({
    configurationId: NEW_CONFIG_ID,
    workflowId: '',
    assetType: '',
    assetSubType: undefined,
    collateralType: undefined,
    isActive: true,
    defaultOverrides: [],
    defaultOverridesJson: '',
    workflowRules: {
        rules: [],
        defaultRule: 'Full Review'
    },
    workflowConfigurationJson: '',
    lastModifiedBy: '',
    lastModifiedAt: '',
});

// Two configs collide when they share the same (workflowId, assetType, assetSubType, collateralType).
const sameTuple = (a: WorkflowConfigRequest, b: WorkflowConfig): boolean =>
    a.workflowId === b.workflowId &&
    a.assetType === b.assetType &&
    (a.assetSubType ?? '') === (b.assetSubType ?? '') &&
    (a.collateralType ?? '') === (b.collateralType ?? '');

export const WorkflowConfigPanel = () => {
    const [configs, setConfigs] = useState<WorkflowConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<WorkflowConfig | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    const loadConfigs = useCallback(async (): Promise<WorkflowConfig[]> => {
        setLoading(true);
        try {
            const res = await getWorkflowConfigs();
            let list = extractResponseArray(res.data) as unknown as WorkflowConfig[];

            list = list.map(element => {
                element.defaultOverrides = JSON.parse(element.defaultOverridesJson);
                element.workflowRules = JSON.parse(element.workflowConfigurationJson);
                return element;
            });
            setConfigs(list);
            return list;
        } catch {
            messageApi.error('Failed to load workflow configurations.');
            return [];
        } finally {
            setLoading(false);
        }
    }, [messageApi]);

    useEffect(() => {
        loadConfigs();
    }, [loadConfigs]);

    const handleNew = () => setSelectedConfig(buildBlankConfig());

    const handleSave = async (request: WorkflowConfigRequest) => {
        const editingId = selectedConfig?.configurationId ?? NEW_CONFIG_ID;

        const duplicate = configs.some(
            (config) => config.configurationId !== editingId && sameTuple(request, config)
        );
        if (duplicate) {
            messageApi.error(
                'A configuration with the same Workflow, Asset Type, Sub Type and Collateral already exists.'
            );
            return;
        }

        try {
            const isUpdate = editingId !== NEW_CONFIG_ID;
            const res = isUpdate
                ? await updateWorkflowConfig(editingId, request)
                : await createWorkflowConfig(request);

            messageApi.success(
                isUpdate ? 'Configuration updated.' : 'Configuration created.'
            );

            const list = await loadConfigs();
            const savedId = res.data?.response?.configurationId;
            setSelectedConfig(
                list.find((config) => config.configurationId === savedId) ??
                list.find((config) => sameTuple(request, config)) ??
                null
            );
        } catch {
            messageApi.error('Failed to save configuration. Please try again.');
        }
    };

    const handleClone = async (config: WorkflowConfig) => {
        try {
            await createWorkflowConfig(config);
            messageApi.success('Configuration cloned.');
            await loadConfigs();
        } catch {
            messageApi.error('Failed to clone configuration. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteWorkflowConfig(id);
            messageApi.success('Configuration deleted.');
            if (selectedConfig?.configurationId === id) {
                setSelectedConfig(null);
            }
            await loadConfigs();
        } catch {
            messageApi.error('Failed to delete configuration. Please try again.');
        }
    };

    return (
        <div className="workflowConfigPanel">
            {contextHolder}
            <ConfigList
                configs={configs}
                loading={loading}
                selectedConfig={selectedConfig}
                onSelect={setSelectedConfig}
                onClone={handleClone}
                onDelete={handleDelete}
                onNew={handleNew}
            />
            <ConfigDetails
                config={selectedConfig}
                onSave={handleSave}
                onClose={() => setSelectedConfig(null)}
            />
        </div>
    );
};
