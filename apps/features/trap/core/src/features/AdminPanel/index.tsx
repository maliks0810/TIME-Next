/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { Card, Button, Input, Form, Select, Collapse, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    api,
    createAdminResource,
    deleteAdminResource,
    patchAdminResource,
    type Container,
} from './lib/api';
import { CodeEditor } from './components/CodeEditor';
import { useUserInfo } from '@platform/utils';
import { IS_PROD, ALLOWED_USERS_LIST } from '../../utils/constants';
import { QueryEditor } from './components/QueryEditor';
import styles from './styles.module.scss';

export const AdminPanel = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const nav = useNavigate();
    const { email } = useUserInfo();
    const [form] = Form.useForm();
    const containerId = Form.useWatch('containerId', form);

    useEffect(() => {
        if (email !== '' && IS_PROD && !ALLOWED_USERS_LIST.includes(email)) {
            nav('/trap');
        }
    }, [email]);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (error) {
            console.warn(error);
        }
    }, [error]);

    const [containers] = useState<Container[]>([
        {
            id: 'widgetDefinitions',
            partitionKey: '/category',
        },
        {
            id: 'workflows',
            partitionKey: '/category',
        },
        {
            id: 'templateVersions',
            partitionKey: '/category',
        },
        {
            id: 'templates',
            partitionKey: '/category',
        },
    ]);

    const selectedContainer = useMemo(
        () => containers.find((container) => container.id === containerId) ?? null,
        [containerId]
    );

    const [results, setResults] = useState<any[]>([]);

    const navToLanding = () => {
        nav('/trap');
    };

    const onAdd = async (json: JSON) => {
        const containerId = form.getFieldValue('containerId');
        try {
            await createAdminResource({ container: containerId, data: json });
            messageApi.success(`New Entity Added to container ${containerId}`);
        } catch (e: any) {
            messageApi.error(e?.message ?? 'Add Entity failed');
        }
    };

    const onUpdate = async (json: JSON, patchId: string) => {
        const containerId = form.getFieldValue('containerId');
        try {
            await patchAdminResource({
                container: containerId,
                patch: json,
                id: patchId,
            });
            messageApi.success(`Entity ${patchId} updated in ${containerId}`);
        } catch (e: any) {
            messageApi.error(e?.message ?? 'Update Entity failed');
        }
    };

    const onDelete = async () => {
        try {
            const deleteId = form.getFieldValue('deleteItemId');
            const containerId = form.getFieldValue('deleteContainerValue');
            await deleteAdminResource({ container: containerId, id: deleteId });
            messageApi.success(`${deleteId} deleted from ${containerId}`);
        } catch (e: any) {
            messageApi.error(e?.message ?? 'Delete Operation failed');
        }
    };

    const onQuery = async (query: string, params: any) => {
        setError(null);
        try {
            const res = await api.query(containerId, query, params);
            setResults(res);
        } catch (e: any) {
            setError(e?.message ?? 'Delete failed');
        }
    };

    if (!email) {
        return null;
    }

    return (
        <Form
            form={form}
            initialValues={{
                containerId: 'widgetDefinitions',
            }}
        >
            {contextHolder}
            <div className={styles.adminContentContainer}>
                <div className={styles.adminPanelColumn}>
                    <Card className={styles.flex1}>
                        <div className={styles.adminContentContainer}>
                            <h3>Explorer</h3>
                            <Button onClick={navToLanding}>Back to TRAP</Button>
                        </div>

                        <Form.Item
                            label="Container"
                            name="containerId"
                            style={{ padding: '24px 8px' }}
                        >
                            <Select>
                                {containers.map((container) => (
                                    <option key={container.id} value={container.id}>
                                        {container.id}
                                    </option>
                                ))}
                            </Select>
                        </Form.Item>

                        <div className="hint">
                            Partition key path:{' '}
                            <b>{selectedContainer?.partitionKey ?? '(unknown)'}</b>
                        </div>
                    </Card>

                    <Card className={styles.flex1}>
                        <h3>Query</h3>
                        <QueryEditor onQuery={onQuery} readOnly />
                    </Card>
                    <Card className={styles.flex1}>
                        <h3>Delete</h3>
                        <Form.Item name="deleteItemId" label="id">
                            <Input style={{ maxWidth: 240 }} placeholder="item id" />
                        </Form.Item>

                        <Form.Item name="deleteContainerValue" label="container">
                            <Select style={{ maxWidth: 240 }}>
                                {containers.map((container) => (
                                    <option key={container.id} value={container.id}>
                                        {container.id}
                                    </option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Button onClick={onDelete}>Delete</Button>
                        <p className="hint">
                            Cosmos deletes require both <b>id</b> and <b>container</b>.
                        </p>
                    </Card>
                </div>
                <div className={styles.adminPanelColumn}>
                    <Card>
                        <Collapse
                            accordion
                            defaultActiveKey={'1'}
                            items={[
                                {
                                    key: '1',
                                    label: `Insert / Upsert`,
                                    children: (
                                        <CodeEditor
                                            height="calc(100vh - 325px)"
                                            path="insertUpsert"
                                            onAdd={onAdd}
                                            onUpdate={onUpdate}
                                        />
                                    ),
                                },
                                {
                                    key: '2',
                                    label: `Results (${results.length}`,
                                    children: (
                                        <CodeEditor
                                            path="results"
                                            height="calc(100vh - 295px)"
                                            readOnly
                                        />
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </div>
            </div>
        </Form>
    );
};
