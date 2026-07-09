import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Select, Switch, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import {
    PlusOutlined,
} from '@ant-design/icons';
import { WorkflowConfig, WorkflowsCollection } from '../lib/types';
import { getWorkflowMetaData } from '../lib/services';

type ConfigListProps = {
    configs: WorkflowConfig[];
    loading: boolean;
    selectedConfig: WorkflowConfig | null;
    onSelect: (config: WorkflowConfig) => void;
    onClone: (config: WorkflowConfig) => void;
    onDelete: (id: number) => void;
    onNew: () => void;
};

const ACTIVE_FILTER_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

export const ConfigList = ({
    configs,
    loading,
    selectedConfig,
    onSelect,
    onNew,
}: ConfigListProps) => {
    const [search, setSearch] = useState('');
    const [workflowFilter, setWorkflowFilter] = useState<string>('all');
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [workflowMetaData, setWorkflowMetaData] = useState<WorkflowsCollection | null>(null);

    useEffect(() => {

        const fetch = async () => {
            try {

                const workflowReponse = await getWorkflowMetaData();
                setWorkflowMetaData(workflowReponse.data);

            } catch (e) {
                console.error('Unable to fetch meta data', e);
            }
        };

        fetch();
    }, []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return configs.filter((config) => {
            const matchesTerm =
                !term ||
                [config.assetType, config.assetSubType, config.collateralType, config.workflowId]
                    .filter(Boolean)
                    .some((field) => String(field).toLowerCase().includes(term));
            const matchesWorkflow = workflowFilter === 'all' || config.workflowId === workflowFilter;
            const matchesActive =
                activeFilter === 'all' ||
                (activeFilter === 'active' ? config.isActive : !config.isActive);
            return matchesTerm && matchesWorkflow && matchesActive;
        });
    }, [configs, search, workflowFilter, activeFilter]);

    const columns: TableColumnsType<WorkflowConfig> = [
        { title: 'Asset Type', dataIndex: 'assetType', key: 'assetType' },
        {
            title: 'Sub Type',
            dataIndex: 'assetSubType',
            key: 'assetSubType',
            render: (value?: string) => value ?? '—',
        },
        {
            title: 'Collateral',
            dataIndex: 'collateralType',
            key: 'collateralType',
            render: (value?: string) => value ?? '—',
        },
        { title: 'Workflow', dataIndex: 'workflowName', key: 'workflowName' },
        {
            title: 'Active',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 70,
            render: (value: boolean) => <Switch checked={value} disabled size="small" />,
        },
        {
            title: 'Modified',
            dataIndex: 'lastModifiedBy',
            key: 'lastModifiedBy',
            defaultSortOrder: 'descend',
            sorter: (a, b) => (a.lastModifiedAt || '').localeCompare(b.lastModifiedAt || ''),
            render: (value: string | undefined) => value ?? '—',
        }
    ];

    return (
        <div className="configListContainer">
            <div style={{ display: 'flex', gap: 8, padding: 8, flexWrap: 'wrap' }}>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onNew}>
                    New
                </Button>
                <Input.Search
                    size="small"
                    allowClear
                    placeholder="Search configs"
                    style={{ width: 300 }}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                    size="small"
                    style={{ width: 300 }}
                    value={workflowFilter}
                    onChange={setWorkflowFilter}
                    options={[{ label: 'All Workflows', value: 'all' }, ...workflowMetaData?.workflowItems
                        .map(workflowItem => ({
                            label: workflowItem.workflowName || workflowItem.workflowCode,
                            value: workflowItem.workflowId,
                        })) || []]}
                />
                <Select
                    size="small"
                    style={{ width: 110 }}
                    value={activeFilter}
                    onChange={setActiveFilter}
                    options={ACTIVE_FILTER_OPTIONS}
                />
            </div>

            <Table
                rowKey="configurationId"
                size="small"
                loading={loading}
                columns={columns}
                dataSource={filtered}
                pagination={false}
                onRow={(record) => ({ onClick: () => onSelect(record) })}
                rowClassName={(record) =>
                    record.configurationId === selectedConfig?.configurationId
                        ? 'niSelectedRow'
                        : ''
                }
            />
        </div>
    );
};
