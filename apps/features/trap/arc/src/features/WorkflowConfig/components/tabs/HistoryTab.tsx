import { useEffect, useState } from 'react';
import { Button, Empty, Modal, Table, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { getWorkflowConfigHistoryById } from '../../lib/services';
import { WorkflowConfigHistory } from '../../lib/types';
import { extractResponseArray, formatIso } from '../../../../lib/helpers';

type HistoryTabProps = {
    configId: number;
};

// Defensive mapping — the history endpoint contract is owned by the backend, so tolerate a few
// common field-name shapes.
const toHistoryRecord = (raw: Record<string, unknown>): WorkflowConfigHistory => ({
    modifiedBy: String(raw.modifiedBy ?? raw.modified_by ?? ''),
    modifiedAt: String(raw.modifiedAt ?? raw.modified_at ?? ''),
    before: String(raw.before),
    after: String(raw.after)
});

export const HistoryTab = ({ configId }: HistoryTabProps) => {
    const [records, setRecords] = useState<WorkflowConfigHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [diffRecord, setDiffRecord] = useState<WorkflowConfigHistory | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (configId <= 0) {
            setRecords([]);
            return;
        }
        setLoading(true);
        getWorkflowConfigHistoryById(configId)
            .then((res) => {
                const rows = extractResponseArray(res.data).map(toHistoryRecord);
                setRecords(rows);
            })
            .catch(() => messageApi.error('Failed to load configuration history.'))
            .finally(() => setLoading(false));
    }, [configId, messageApi]);

    const columns: TableColumnsType<WorkflowConfigHistory> = [
        { title: 'Modified By', dataIndex: 'modifiedBy', key: 'modifiedBy' },
        {
            title: 'Modified Date',
            dataIndex: 'modifiedAt',
            key: 'modifiedAt',
            render: (value: string) => formatIso(value),
        },
        {
            title: 'View Diff',
            key: 'diff',
            width: 110,
            render: (_, record) => (
                <Button size="small" onClick={() => setDiffRecord(record)}>
                    View Diff
                </Button>
            ),
        },
    ];

    if (configId <= 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="History is available after the configuration is saved."
            />
        );
    }
    const formatJson = (data: string) => {

        let parsedData;

        // Parse the outer JSON string  
        try {
            parsedData = JSON.parse(data);
        } catch {
            return `Error parsing input JSON string`;
        }

        // Parse inner JSON strings safely  
        let defaultOverrides = [];
        let workflowConfig = [];

        try {
            defaultOverrides = JSON.parse(parsedData.DefaultOverridesJson);
        } catch {
            defaultOverrides = [`Error parsing DefaultOverridesJson`];
        }

        try {
            workflowConfig = JSON.parse(parsedData.WorkflowConfigurationJson);
        } catch {
            workflowConfig = [`Error parsing WorkflowConfigurationJson`];
        }

        // Replace inner JSON strings with parsed objects  
        const formattedData = {
            ...parsedData,
            DefaultOverridesJson: defaultOverrides,
            WorkflowConfigurationJson: workflowConfig,
        };

        // Return formatted JSON string  
        return JSON.stringify(formattedData, null, 2);
    };

    return (
        <div style={{ paddingTop: 8 }}>
            {contextHolder}
            <Table
                rowKey="version"
                size="small"
                loading={loading}
                columns={columns}
                dataSource={records}
                pagination={false}
            />

            <Modal
                title={'Difference'}
                open={diffRecord !== null}
                onCancel={() => setDiffRecord(null)}
                footer={null}
                width={900}
            >
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            Before
                        </div>
                        <pre style={preStyle}>
                            {diffRecord ? formatJson(diffRecord.before) : '{}'}
                        </pre>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            After
                        </div>
                        <pre style={preStyle}>
                            {diffRecord ? formatJson(diffRecord.after) : '{}'}
                        </pre>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const preStyle: React.CSSProperties = {
    background: '#fafafa',
    border: '1px solid #e8e8e8',
    borderRadius: 4,
    padding: 8,
    fontSize: 11,
    maxHeight: 480,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    width: '400px'
};
