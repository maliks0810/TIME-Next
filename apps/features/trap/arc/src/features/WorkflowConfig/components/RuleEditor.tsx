import { useEffect } from 'react';
import { Form, Modal, Select, Switch } from 'antd';
import { WorkflowRule } from '../lib/types';
import { CALLABLE_SELECT_OPTIONS, REVIEW_TYPE_OPTIONS } from '../lib/constants';

type RuleEditorProps = {
    open: boolean;
    // null when adding a brand new rule, otherwise the rule being edited.
    initialRule: WorkflowRule | null;
    onSubmit: (rule: WorkflowRule) => void;
    onCancel: () => void;
};

const DEFAULT_RULE: WorkflowRule = {
    callable: 'Y',
    speedOverridesExist: false,
    reviewType: 'Inputs Review',
};

export const RuleEditor = ({ open, initialRule, onSubmit, onCancel }: RuleEditorProps) => {
    const [form] = Form.useForm<WorkflowRule>();

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialRule ?? DEFAULT_RULE);
        }
    }, [open, initialRule, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        onSubmit(values);
    };

    return (
        <Modal
            title={initialRule ? 'Edit Rule' : 'Add Rule'}
            open={open}
            onOk={handleOk}
            okText="Save Rule"
            onCancel={onCancel}
            destroyOnHidden
        >
            <Form
                form={form}
                initialValues={DEFAULT_RULE}
                style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr',
                    gap: 14,
                    alignItems: 'center',
                    padding: '12px 0',
                }}
            >
                <label htmlFor="callable">
                    <strong>Callable</strong>
                </label>
                <Form.Item name="callable" noStyle rules={[{ required: true }]}>
                    <Select id="callable" style={{ width: 120 }} options={CALLABLE_SELECT_OPTIONS} />
                </Form.Item>

                <label htmlFor="speedOverridesExist">
                    <strong>Speed Overrides Exist</strong>
                </label>
                <Form.Item name="speedOverridesExist" noStyle valuePropName="checked">
                    <Switch
                        style={{
                            width: '20px',
                        }} />
                </Form.Item>

                <label htmlFor="reviewType">
                    <strong>Review Type</strong>
                </label>
                <Form.Item name="reviewType" noStyle rules={[{ required: true }]}>
                    <Select id="reviewType" style={{ width: 200 }} options={REVIEW_TYPE_OPTIONS} />
                </Form.Item>
            </Form>
        </Modal>
    );
};
