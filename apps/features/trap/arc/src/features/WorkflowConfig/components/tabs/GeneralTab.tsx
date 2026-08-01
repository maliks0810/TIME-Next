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

    const assetTypeFormValue = Form.useWatch('assetType', form);
    const assetSubTypeFormValue = Form.useWatch('assetSubType', form);

    const initialFormValues = {
        workflowId: draft.workflowId || undefined,
        assetType: draft.assetType,
        assetSubType: draft.assetSubType,
        collateralType: draft.collateralType,
        isActive: draft.isActive,
    };

    useEffect(() => {
        const fetchMetaDataForGeneralTab = async () => {
            try {
                const reponse = await getMetaData();
                setMetaData(reponse.data);

                if (draft.configurationId > 0) {
                    form.setFieldsValue({ assetType: draft.assetType });
                    if (draft.assetSubType != undefined) {
                        form.setFieldsValue({ assetSubType: draft.assetSubType });

                        if (draft.collateralType != undefined) {
                            form.setFieldsValue({ collateralType: draft.collateralType });
                        }
                    }
                }

                const workflowReponse = await getWorkflowMetaData();
                setWorkflowMetaData(workflowReponse.data);

            } catch (e) {
                console.error('Unable to fetch meta data', e);
            }
        };

        fetchMetaDataForGeneralTab();
    }, []);

    const assetTypes = metaData?.assetTypes || [];
    const assetSubTypes =
        assetTypes?.find(at => at.assetTypeValue === assetTypeFormValue)?.assetSubTypes || [];
    const collateralTypes =
        assetSubTypes?.find(ast => ast.assetSubTypeValue === assetSubTypeFormValue)?.collateralTypes || [];

    // Handlers for cascading selects    
    const onAssetTypeChange = (value: string) => {
        form.setFieldsValue({ assetType: value });
        form.setFieldsValue({ assetSubType: null });
        form.setFieldsValue({ collateralType: null });

        form.resetFields([
            'assetSubType',
            'collateralType',
        ]);
    };

    const onAssetSubTypeChange = (value: string) => {
        form.setFieldsValue({ assetSubType: value });
        form.setFieldsValue({ collateralType: null });

        form.resetFields([
            'collateralType',
        ]);
    };

    const onCollateralTypeChange = (value: string) => {
        form.setFieldsValue({ collateralType: value });
    };

    return (
        <Form
            form={form}
            initialValues={initialFormValues}
            onValuesChange={onChange}
        >
            <div className='generalTabcontainer'>
                <label htmlFor="workflowId">
                    <strong>Workflow</strong>
                </label>
                <Form.Item name="workflowId" noStyle rules={[{ required: true }]}>
                    <Select
                        id="workflowId"
                        className='generalTabSelect'
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
                        onChange={onAssetTypeChange}
                        placeholder="Select Asset Type"
                        defaultValue="NARMBS"
                        className='generalTabSelect'
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
                        onChange={onAssetSubTypeChange}
                        placeholder="Select Asset Sub Type"
                        className='generalTabSelect'
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
                        placeholder="Select Collateral Type"
                        onChange={onCollateralTypeChange}
                        className='generalTabSelect'
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