/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Button, Dropdown, Space, Tag, Typography, theme } from 'antd';
import {
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    FolderOpenOutlined,
    MoreOutlined,
    ShareAltOutlined,
    UploadOutlined,
} from '@ant-design/icons';

import type { WorkflowLauncherItem } from '../types/workflowLauncher.types';

function StatusTag({ status }: { status?: string }) {
    if (!status) return null;

    const color = status === 'PUBLISHED' ? 'green' : status === 'DRAFT' ? 'gold' : 'default';

    return <Tag color={color}>{status}</Tag>;
}

function classLabel(value?: string) {
    return (value ?? '').trim() || 'Unclassified';
}

type Props = {
    item: WorkflowLauncherItem;
    mine?: boolean;
    launchLabel?: string;
    onLaunch: (item: WorkflowLauncherItem) => void | Promise<void>;
    onClone: (item: WorkflowLauncherItem) => void | Promise<void>;
    onEdit?: (item: WorkflowLauncherItem) => void | Promise<void>;
    onRename?: (item: WorkflowLauncherItem) => void | Promise<void>;
    onPublish?: (item: WorkflowLauncherItem) => void | Promise<void>;
    onToggleVisibility?: (item: WorkflowLauncherItem) => void | Promise<void>;
    onDelete?: (item: WorkflowLauncherItem) => void | Promise<void>;
};

export default function WorkflowLauncherCard(props: Props) {
    const { token } = theme.useToken();
    const {
        item,
        mine,
        launchLabel = 'Launch',
        onLaunch,
        onClone,
        onEdit,
        onRename,
        onPublish,
        onToggleVisibility,
        onDelete,
    } = props;

    const actionItems = [
        mine && onEdit
            ? {
                  key: 'edit',
                  label: 'Edit',
                  icon: <EditOutlined />,
                  onClick: () => onEdit(item),
              }
            : null,
        mine && onRename
            ? {
                  key: 'rename',
                  label: 'Rename',
                  icon: <EditOutlined />,
                  onClick: () => onRename(item),
              }
            : null,
        {
            key: 'clone',
            label: 'Clone',
            icon: <CopyOutlined />,
            onClick: () => onClone(item),
        },
        mine && item.latestDraft && onPublish
            ? {
                  key: 'publish',
                  label: 'Publish',
                  icon: <UploadOutlined />,
                  onClick: () => onPublish(item),
              }
            : null,
        mine && onToggleVisibility
            ? {
                  key: 'visibility',
                  label: item.visibility === 'PUBLIC' ? 'Make Private' : 'Make Public',
                  icon: <ShareAltOutlined />,
                  onClick: () => onToggleVisibility(item),
              }
            : null,
        mine && onDelete
            ? {
                  key: 'delete',
                  label: 'Delete',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => onDelete(item),
              }
            : null,
    ].filter(Boolean) as any[];

    const launchStatus = item.latestDraft?.status ?? item.latestPublished?.status ?? '';
    const versionLabel = item.latestDraft
        ? `Draft v${item.latestDraft.version}`
        : item.latestPublished
          ? `Published v${item.latestPublished.version}`
          : 'No active version';

    const classPath = [
        classLabel(item.class1),
        classLabel(item.class2),
        classLabel(item.class3),
    ].join(' / ');

    return (
        <div
            style={{
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 8,
                background: token.colorBgContainer,
                padding: 14,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                }}
            >
                <div style={{ minWidth: 0, flex: 1 }}>
                    <Typography.Text strong style={{ fontSize: 14 }}>
                        {item.templateName}
                    </Typography.Text>

                    <div style={{ marginTop: 4 }}>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {classPath}
                        </Typography.Text>
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <Space size={6} wrap>
                            <StatusTag status={launchStatus} />
                            <Tag>{item.visibility}</Tag>
                            {String(item.kind ?? '').toLowerCase() === 'landing' &&
                            item.scopeType === 'AUDIENCE' ? (
                                <Tag color="blue">Department</Tag>
                            ) : null}
                            {String(item.kind ?? '').toLowerCase() === 'landing' &&
                            item.scopeType === 'USER' ? (
                                <Tag color="purple">Landing</Tag>
                            ) : null}
                            {item.sourceTemplateId ? <Tag>Cloned</Tag> : null}
                            <Tag>{versionLabel}</Tag>
                        </Space>
                    </div>
                </div>

                <Space size={8}>
                    <Button
                        size="small"
                        icon={<FolderOpenOutlined />}
                        onClick={() => onLaunch(item)}
                    >
                        {launchLabel}
                    </Button>

                    <Dropdown trigger={['click']} menu={{ items: actionItems }}>
                        <Button size="small" icon={<MoreOutlined />} />
                    </Dropdown>
                </Space>
            </div>
        </div>
    );
}
