import { Form, Select, Switch } from 'antd';
import { MetaDataResponse, WorkflowConfig, WorkflowsCollection } from '../../lib/types';
import { useEffect, useState } from 'react';
import { getMetaData, getWorkflowMetaData } from '../../lib/services';

type GeneralTabProps = {
    draft: WorkflowConfig;
    onChange: (partial: Partial<WorkflowConfig>) => void;
};

export const GeneralTab = ({ draft, onChange }: GeneralTabProps) => {
    const [form] = Form.useForm();
    const [metaData, setMetaData] = useState<MetaDataResponse | null>(null);
    const [workflowMetaData, setWorkflowMetaData] = useState<WorkflowsCollection | null>(null);
    const [selectedAssetTypeValue, setSelectedAssetTypeValue] = useState<string | null>(null);
    const [selectedAssetSubTypeValue, setSelectedAssetSubTypeValue] = useState<string | null>(null);
    const [selectedCollateralTypeValue, setSelectedCollateralTypeValue] = useState<string | null>(null);

    useEffect(() => {

        const fetch = async () => {
            try {
                const reponse = await getMetaData();
                setMetaData(reponse.data);

                if (draft.configurationId > 0) {
                    setSelectedAssetTypeValue(draft.assetType);
                    if (draft.assetSubType != undefined) {
                        setSelectedAssetSubTypeValue(draft.assetSubType);

                        if (draft.collateralType != undefined) {
                            setSelectedCollateralTypeValue(draft.collateralType);
                        }
                    }
                }

                const workflowReponse = await getWorkflowMetaData();
                setWorkflowMetaData(workflowReponse.data);

            } catch (e) {
                console.error('Unable to fetch meta data', e);
            }
        };

        fetch();
    }, []);

    // const validate = async () => {
    //     // Surface required-field errors before delegating to the parent save handler.
    //     await form.validateFields();
    // };
    // Get filtered lists based on selections and active status  
    const assetTypes = metaData?.assetTypes || [];
    const assetSubTypes =
        assetTypes?.find(at => at.assetTypeValue === selectedAssetTypeValue)?.assetSubTypes || [];
    const collateralTypes =
        assetSubTypes?.find(ast => ast.assetSubTypeValue === selectedAssetSubTypeValue)?.collateralTypes || [];

    // Handlers for cascading selects  
    const onAssetTypeChange = (value: string) => {
        setSelectedAssetTypeValue(value);
        setSelectedAssetSubTypeValue(null);
        setSelectedCollateralTypeValue(null);

        form.resetFields([
            'assetSubType',
            'collateralType',
        ]);
    };

    const onAssetSubTypeChange = (value: string) => {
        setSelectedAssetSubTypeValue(value);
        setSelectedCollateralTypeValue(null);

        form.resetFields([
            'collateralType',
        ]);
    };

    const onCollateralTypeChange = (value: string) => {
        setSelectedCollateralTypeValue(value);
    };

    return (
        <Form
            form={form}
            initialValues={{
                workflowId: draft.workflowId || undefined,
                assetType: draft.assetType,
                assetSubType: draft.assetSubType,
                collateralType: draft.collateralType,
                isActive: draft.isActive,
            }}
            onValuesChange={(changed) => onChange(changed)}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr',
                    gap: 14,
                    alignItems: 'center',
                    padding: '12px 0',
                }}
            >
                <label htmlFor="workflowId">
                    <strong>Workflow</strong>
                </label>
                <Form.Item name="workflowId" noStyle rules={[{ required: true }]}>
                    <Select
                        id="workflowId"
                        style={{
                            width: '350px',
                            padding: '4px',
                            borderRadius: '6px',
                            border: '1px solid lightgray',
                            backgroundColor: 'white',
                        }}
                        placeholder="Select Workflow"
                        options={
                            workflowMetaData?.workflowItems
                                .map(at => ({
                                    label: at.workflowName || at.workflowCode,
                                    value: at.workflowId,
                                })) || []
                        }
                    />
                </Form.Item>

                <label htmlFor="assetType">
                    <strong>Asset Type</strong>
                </label>
                <Form.Item name="assetType" noStyle rules={[{ required: true }]}>
                    <Select
                        value={selectedAssetTypeValue}
                        onChange={onAssetTypeChange}
                        placeholder="Select Asset Type"
                        defaultValue="NARMBS"
                        style={{
                            width: '350px',
                            padding: '4px',
                            borderRadius: '6px',
                            border: '1px solid lightgray',
                            backgroundColor: 'white',
                        }}
                        options={
                            assetTypes
                                .map(at => ({
                                    label: at.assetTypeDescription || at.assetTypeValue,
                                    value: at.assetTypeValue,
                                })) || []
                        }
                    />
                </Form.Item>

                <label htmlFor="assetSubType">
                    <strong>Asset Sub Type</strong>
                </label>
                <Form.Item name="assetSubType" noStyle>
                    <Select
                        value={selectedAssetSubTypeValue}
                        onChange={onAssetSubTypeChange}
                        placeholder="Select Asset Sub Type"
                        style={{
                            width: '350px',
                            padding: '4px',
                            borderRadius: '6px',
                            border: '1px solid lightgray',
                            backgroundColor: 'white',
                        }}
                        options={
                            assetSubTypes
                                .map(at => ({
                                    label: at.assetSubTypeDescription || at.assetSubTypeValue,
                                    value: at.assetSubTypeValue,
                                })) || []
                        }
                    />
                </Form.Item>

                <label htmlFor="collateralType">
                    <strong>Collateral Type</strong>
                </label>
                <Form.Item name="collateralType" noStyle>
                    <Select
                        value={selectedCollateralTypeValue}
                        placeholder="Select Collateral Type"
                        onChange={onCollateralTypeChange}
                        style={{
                            width: '350px',
                            padding: '4px',
                            borderRadius: '6px',
                            border: '1px solid lightgray',
                            backgroundColor: 'white',
                        }}
                        options={
                            collateralTypes
                                .map(at => ({
                                    label: at.collateralTypeDescription || at.collateralTypeValue,
                                    value: at.collateralTypeValue,
                                })) || []
                        }
                    />
                </Form.Item>

                <label htmlFor="isActive">
                    <strong>Active</strong>
                </label>
                <Form.Item name="isActive" noStyle valuePropName="checked">
                    <Switch
                        style={{
                            width: '20px',
                        }} />
                </Form.Item>
            </div>
        </Form>
    );
};
