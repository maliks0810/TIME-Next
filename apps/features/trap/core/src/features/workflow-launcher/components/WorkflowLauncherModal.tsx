/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import {
    Alert,
    Button,
    Empty,
    Input,
    Modal,
    Segmented,
    Select,
    Space,
    Typography,
    theme,
} from 'antd';
import { AppstoreOutlined, FolderOpenOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { CLASS1_OPTIONS, CLASS2_OPTIONS, CLASS3_OPTIONS } from '../../../config/workflowClasses';

import WorkflowLauncherCard from './WorkflowLauncherCard';
import { useWorkflowLauncherData } from '../hooks/useWorkflowLauncherData';
import type {
    LauncherMode,
    MineFilter,
    WorkflowLaunchSelection,
} from '../types/workflowLauncher.types';
import { createDraftVersion, createTemplate } from '../../../api/trap';
import { useUserInfo } from '../../../../../../../../packages/utils/src/hooks/Authentication/user-info-context';

type Props = {
    open: boolean;
    onClose: () => void;
    isDarkHud: boolean;
    hudBackground: string;
    onLaunchWorkflow?: (selection: WorkflowLaunchSelection) => Promise<void> | void;
    onEditWorkflow?: (selection: WorkflowLaunchSelection) => void;
    onActivateLanding?: (selection: { templateId: string; templateVersionId: string }) => void;
};

export default function WorkflowLauncherModal(props: Props) {
    const {
        open,
        onClose,
        isDarkHud,
        hudBackground,
        onLaunchWorkflow,
        onEditWorkflow,
        onActivateLanding,
    } = props;

    const nav = useNavigate();
    const { token } = theme.useToken();
    const modalPanelBackground = isDarkHud ? 'rgba(0,0,0,0.32)' : 'rgba(255,255,255,0.78)';

    const modalBorder = isDarkHud
        ? '1px solid rgba(255,255,255,0.14)'
        : `1px solid ${token.colorBorderSecondary}`;

    const modalHeaderBackground = isDarkHud
        ? hudBackground
        : `linear-gradient(180deg, ${token.colorBgContainer} 0%, ${token.colorBgElevated} 100%)`;

    const sidebarBackground = isDarkHud ? 'rgba(255,255,255,0.04)' : token.colorBgContainer;

    const centerPanelBackground = isDarkHud ? 'rgba(255,255,255,0.03)' : token.colorBgElevated;

    const rightPanelBackground = isDarkHud ? 'rgba(255,255,255,0.02)' : token.colorBgContainer;

    const titleColor = isDarkHud ? '#fff' : token.colorText;
    const secondaryTextColor = isDarkHud ? 'rgba(255,255,255,0.82)' : token.colorTextSecondary;

    const { login } = useUserInfo();

    const [mode, setMode] = React.useState<LauncherMode>('public');
    const [mineFilter, setMineFilter] = React.useState<MineFilter>('ALL');
    const [selectedClass1, setSelectedClass1] = React.useState<string>('All');
    const [selectedClass2, setSelectedClass2] = React.useState<string>('All');
    const [selectedClass3, setSelectedClass3] = React.useState<string>('All');
    const [search, setSearch] = React.useState('');

    const [createName, setCreateName] = React.useState('');
    const [createKind, setCreateKind] = React.useState<'landing' | 'workflow'>('workflow');
    const [createVisibility, setCreateVisibility] = React.useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');
    const [createClass1, setCreateClass1] = React.useState<string | undefined>(undefined);
    const [createClass2, setCreateClass2] = React.useState<string | undefined>(undefined);
    const [createClass3, setCreateClass3] = React.useState<string | undefined>(undefined);
    const [createLoading, setCreateLoading] = React.useState(false);
    const [createError, setCreateError] = React.useState('');
    const isCreatingLanding = createKind === 'landing';

    const currentUser = localStorage.getItem('debug-user') || login;

    const {
        loading,
        refreshLauncherData,
        publicClass2Options,
        publicClass3Options,
        publicItems,
        mineItems,
        launchItem,
        editItem,
        cloneItem,
        renameItem,
        publishItem,
        toggleVisibility,
        deleteItem,
    } = useWorkflowLauncherData({
        mineFilter,
        search,
        selectedClass1,
        selectedClass2,
        selectedClass3,
        onEditWorkflow,
        onLaunchWorkflow,
        closeModal: onClose,
    });

    const myLandingItems = mineItems.filter(
        (item) => String(item.kind ?? '').toLowerCase() === 'landing' && item.scopeType === 'USER'
    );

    const departmentLandingItems = [...mineItems, ...publicItems].filter(
        (item) =>
            String(item.kind ?? '').toLowerCase() === 'landing' && item.scopeType === 'AUDIENCE'
    );

    const myWorkflowItems = mineItems.filter(
        (item) => String(item.kind ?? '').toLowerCase() !== 'landing'
    );

    const publicWorkflowItems = publicItems.filter(
        (item) => String(item.kind ?? '').toLowerCase() !== 'landing'
    );
    React.useEffect(() => {
        if (open) {
            void refreshLauncherData();
        }
    }, [open, refreshLauncherData]);

    React.useEffect(() => {
        if (open) return;

        setMode('public');
        setMineFilter('ALL');
        setSelectedClass1('All');
        setSelectedClass2('All');
        setSelectedClass3('All');
        setSearch('');

        setCreateName('');
        setCreateKind('workflow');
        setCreateVisibility('PRIVATE');
        setCreateClass1(undefined);
        setCreateClass2(undefined);
        setCreateClass3(undefined);
        setCreateError('');
    }, [open]);

    React.useEffect(() => {
        if (mode !== 'public') return;
        setSelectedClass2('All');
        setSelectedClass3('All');
    }, [selectedClass1, mode]);

    React.useEffect(() => {
        if (mode !== 'public') return;
        setSelectedClass3('All');
    }, [selectedClass2, mode]);

    const class1FilterOptions = React.useMemo(
        () => ['All', ...CLASS1_OPTIONS.filter((value) => value !== 'All')],
        []
    );

    const class2FilterOptions = React.useMemo(() => {
        const source =
            selectedClass1 !== 'All' ? (CLASS2_OPTIONS[selectedClass1] ?? []) : publicClass2Options;

        return ['All', ...Array.from(new Set(source.filter((value) => value && value !== 'All')))];
    }, [selectedClass1, publicClass2Options]);

    const class3FilterOptions = React.useMemo(() => {
        const source =
            selectedClass1 !== 'All' && selectedClass2 !== 'All'
                ? (CLASS3_OPTIONS[selectedClass1]?.[selectedClass2] ?? [])
                : publicClass3Options;

        return ['All', ...Array.from(new Set(source.filter((value) => value && value !== 'All')))];
    }, [selectedClass1, selectedClass2, publicClass3Options]);

    React.useEffect(() => {
        if (!isCreatingLanding) return;

        setCreateVisibility('PRIVATE');
        setCreateClass1(undefined);
        setCreateClass2(undefined);
        setCreateClass3(undefined);
    }, [isCreatingLanding]);

    const leftNavItems: Array<{ key: LauncherMode; label: string; icon: React.ReactNode }> = [
        { key: 'new', label: 'New Workflow', icon: <PlusOutlined /> },
        { key: 'public', label: 'Public Workflows', icon: <AppstoreOutlined /> },
        { key: 'mine', label: 'My Workflows', icon: <FolderOpenOutlined /> },
        { key: 'landing', label: 'Landing', icon: <FolderOpenOutlined /> },
    ];

    const createDisabled =
        !createName.trim() ||
        (!isCreatingLanding && (!createClass1 || !createClass2 || !createClass3)) ||
        createLoading;

    const handleCreateWorkflow = async () => {
        const name = createName.trim();
        const class1 = isCreatingLanding ? undefined : createClass1;
        const class2 = isCreatingLanding ? undefined : createClass2;
        const class3 = isCreatingLanding ? undefined : createClass3;

        if (!name) {
            setCreateError('Name is required.');
            return;
        }

        if (!isCreatingLanding && (!class1 || !class2 || !class3)) {
            setCreateError('Name, Class-1, Class-2, and Class-3 are required.');
            return;
        }

        setCreateLoading(true);
        setCreateError('');

        try {
            const tpl: any = await createTemplate({
                name,
                kind: createKind,
                visibility: isCreatingLanding ? 'PRIVATE' : createVisibility,
                class1,
                class2,
                class3,
            });

            console.log('created template', tpl);

            const tv: any = await createDraftVersion(tpl.id);

            console.log('created draft version', tv);

            if (!tpl?.id) {
                throw new Error('Template create returned no template id');
            }

            if (!tv?.id) {
                throw new Error('Draft create returned no version id');
            }

            onClose();
            nav(
                `designer?templateId=${encodeURIComponent(String(tpl.id))}&versionId=${encodeURIComponent(String(tv.id))}`
            );
        } catch (err: any) {
            const raw = err?.message || err?.response?.body?.error || 'Failed to create workflow';

            if (String(raw).toLowerCase().includes('already exists')) {
                setCreateError(
                    'That workflow name is already taken for this Class-1 / Class-2 / Class-3 combination.'
                );
            } else {
                setCreateError(String(raw));
            }
        } finally {
            setCreateLoading(false);
        }
    };

    const renderPane = (mode: LauncherMode) => {
        switch (mode) {
            case 'new':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Typography.Title level={5} style={{ margin: 0 }}>
                            New Workflow
                        </Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Define the workflow first, then create the draft and open Designer.
                        </Typography.Text>
                    </div>
                );

            case 'landing':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Typography.Title level={5} style={{ margin: 0 }}>
                            Landing
                        </Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Activate the Landing template you want to use for the Home tab.
                        </Typography.Text>
                    </div>
                );

            case 'public':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <Typography.Title level={5} style={{ margin: 0 }}>
                                Classification
                            </Typography.Title>
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                Shared workflows grouped by Class-1, Class-2, and Class-3.
                            </Typography.Text>
                        </div>

                        <div>
                            <Typography.Text strong style={{ fontSize: 12 }}>
                                Class-1
                            </Typography.Text>
                            <Space wrap size={[8, 8]} style={{ width: '100%', marginTop: 8 }}>
                                {class1FilterOptions.map((value) => {
                                    const item = { label: value, value };
                                    const active = selectedClass1 === item.value;
                                    return (
                                        <Button
                                            key={item.value}
                                            size="small"
                                            type={active ? 'primary' : 'default'}
                                            onClick={() => {
                                                setSelectedClass1(item.value);
                                                setSelectedClass2('All');
                                                setSelectedClass3('All');
                                            }}
                                            style={{ borderRadius: 999 }}
                                        >
                                            {item.label}
                                        </Button>
                                    );
                                })}
                            </Space>
                        </div>

                        <div>
                            <Typography.Text strong style={{ fontSize: 12 }}>
                                Class-2
                            </Typography.Text>
                            <Space wrap size={[8, 8]} style={{ width: '100%', marginTop: 8 }}>
                                {class2FilterOptions.map((value) => {
                                    const item = { label: value, value };
                                    const active = selectedClass2 === item.value;
                                    return (
                                        <Button
                                            key={item.value}
                                            size="small"
                                            type={active ? 'primary' : 'default'}
                                            onClick={() => {
                                                setSelectedClass2(item.value);
                                                setSelectedClass3('All');
                                            }}
                                            style={{ borderRadius: 999 }}
                                        >
                                            {item.label}
                                        </Button>
                                    );
                                })}
                            </Space>
                        </div>

                        <div>
                            <Typography.Text strong style={{ fontSize: 12 }}>
                                Class-3
                            </Typography.Text>
                            <Space wrap size={[8, 8]} style={{ width: '100%', marginTop: 8 }}>
                                {class3FilterOptions.map((value) => {
                                    const item = { label: value, value };
                                    const active = selectedClass3 === item.value;
                                    return (
                                        <Button
                                            key={item.value}
                                            size="small"
                                            type={active ? 'primary' : 'default'}
                                            onClick={() => setSelectedClass3(item.value)}
                                            style={{ borderRadius: 999 }}
                                        >
                                            {item.label}
                                        </Button>
                                    );
                                })}
                            </Space>
                        </div>
                    </div>
                );

            case 'mine':
            default:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Typography.Title level={5} style={{ margin: 0 }}>
                            Filters
                        </Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Narrow your workflows by lifecycle and visibility.
                        </Typography.Text>
                        <Segmented
                            block
                            value={mineFilter}
                            options={[
                                { label: 'All', value: 'ALL' },
                                { label: 'Draft', value: 'DRAFT' },
                                { label: 'Published', value: 'PUBLISHED' },
                                { label: 'Public', value: 'PUBLIC' },
                                { label: 'Private', value: 'PRIVATE' },
                            ]}
                            onChange={(value) => setMineFilter(value as MineFilter)}
                        />
                    </div>
                );
        }
    };

    const renderList = (mode: LauncherMode) => {
        if (loading)
            return <Typography.Text type="secondary">Loading workflows...</Typography.Text>;
        switch (mode) {
            case 'landing': {
                return (
                    <>
                        <>
                            <Typography.Text strong style={{ fontSize: 12 }}>
                                Department Landing
                            </Typography.Text>
                            {departmentLandingItems.length === 0 ? (
                                <Empty description="No department landing found" />
                            ) : (
                                departmentLandingItems.map((item) => (
                                    <WorkflowLauncherCard
                                        key={item.templateId}
                                        item={item}
                                        launchLabel="Activate"
                                        onLaunch={() => {
                                            if (!onActivateLanding) return;

                                            const versionId =
                                                item.latestPublished?.id ?? item.latestDraft?.id;

                                            if (!item.templateId || !versionId) return;

                                            onActivateLanding({
                                                templateId: item.templateId,
                                                templateVersionId: versionId,
                                            });

                                            onClose();
                                        }}
                                        onClone={cloneItem}
                                    />
                                ))
                            )}
                        </>
                        <Typography.Text strong style={{ fontSize: 12 }}>
                            My Landing
                        </Typography.Text>
                        {myLandingItems.length === 0 ? (
                            <Empty description="No landings found" />
                        ) : (
                            myLandingItems.map((item) => (
                                <WorkflowLauncherCard
                                    key={item.templateId}
                                    item={item}
                                    mine
                                    launchLabel="Activate"
                                    onLaunch={() => {
                                        if (!onActivateLanding) return;

                                        const versionId =
                                            item.latestPublished?.id ?? item.latestDraft?.id;

                                        if (!item.templateId || !versionId) {
                                            return;
                                        }

                                        onActivateLanding({
                                            templateId: item.templateId,
                                            templateVersionId: versionId,
                                        });

                                        onClose();
                                    }}
                                    onClone={cloneItem}
                                    onEdit={editItem}
                                    onRename={renameItem}
                                    onPublish={publishItem}
                                    onToggleVisibility={toggleVisibility}
                                    onDelete={deleteItem}
                                />
                            ))
                        )}
                    </>
                );
            }
            case 'public':
                {
                    if (publicWorkflowItems.length === 0)
                        return <Empty description="No workflows found" />;
                }
                return publicWorkflowItems.map((item) => (
                    <WorkflowLauncherCard
                        key={item.templateId}
                        item={item}
                        mine={mineItems.some(
                            ({ ownerUserId, templateId }) =>
                                String(ownerUserId ?? '')
                                    .trim()
                                    .toLowerCase() === String(currentUser).trim().toLowerCase() &&
                                item.templateId === templateId
                        )}
                        onLaunch={(x) => launchItem(x, 'mine')}
                        onClone={cloneItem}
                        onEdit={editItem}
                        onRename={renameItem}
                        onPublish={publishItem}
                        onToggleVisibility={toggleVisibility}
                        onDelete={deleteItem}
                    />
                ));

            case 'mine': {
                if (myWorkflowItems.length === 0) return <Empty description="No workflows found" />;
                return myWorkflowItems.map((item) => (
                    <WorkflowLauncherCard
                        key={item.templateId}
                        item={item}
                        mine
                        onLaunch={(x) => launchItem(x, 'mine')}
                        onClone={cloneItem}
                        onEdit={editItem}
                        onRename={renameItem}
                        onPublish={publishItem}
                        onToggleVisibility={toggleVisibility}
                        onDelete={deleteItem}
                    />
                ));
            }
            default:
                return null;
        }
    };
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={1320}
            styles={{
                content: {
                    borderRadius: 20,
                    padding: 0,
                    overflow: 'hidden',
                    background: modalPanelBackground,
                    boxShadow: isDarkHud
                        ? '0 12px 40px rgba(0,0,0,0.35)'
                        : '0 12px 36px rgba(15,23,42,0.12)',
                    border: modalBorder,
                    maxHeight: '72vh',
                },
                body: {
                    padding: 0,
                    borderRadius: 20,
                    background: modalPanelBackground,
                    backdropFilter: isDarkHud ? 'blur(10px)' : 'blur(6px)',
                    WebkitBackdropFilter: isDarkHud ? 'blur(10px)' : 'blur(6px)',
                },
                header: {
                    display: 'none',
                },
            }}
        >
            <div
                style={{
                    padding: 20,
                    background: modalHeaderBackground,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                }}
            >
                <Space size={12} align="start">
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            display: 'grid',
                            placeItems: 'center',
                            background: isDarkHud ? 'rgba(255,255,255,0.12)' : token.colorPrimaryBg,
                            color: isDarkHud ? '#fff' : token.colorPrimary,
                        }}
                    >
                        <PlusOutlined />
                    </div>
                    <div>
                        <Typography.Title level={4} style={{ margin: 0, color: titleColor }}>
                            Launch Workflow
                        </Typography.Title>
                        <Typography.Text style={{ color: secondaryTextColor }}>
                            Start fresh, use a shared workflow, or manage one of your own.
                        </Typography.Text>
                    </div>
                </Space>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 440px minmax(0, 1fr)',
                    minHeight: 560,
                }}
            >
                <div
                    style={{
                        borderRight: `1px solid ${token.colorBorderSecondary}`,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        background: sidebarBackground,
                    }}
                >
                    <Input.Search
                        allowClear
                        placeholder="Search workflows"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {leftNavItems.map((navItem) => (
                            <Button
                                key={navItem.key}
                                type={mode === navItem.key ? 'primary' : 'text'}
                                icon={navItem.icon}
                                onClick={() => setMode(navItem.key)}
                                style={{
                                    height: 38,
                                    justifyContent: 'flex-start',
                                    borderRadius: 6,
                                }}
                            >
                                {navItem.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div
                    style={{
                        borderRight: `1px solid ${token.colorBorderSecondary}`,
                        padding: 16,
                        background: centerPanelBackground,
                        overflowY: 'auto',
                    }}
                >
                    {renderPane(mode)}
                </div>

                <div
                    style={{
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        overflow: 'hidden',
                        background: rightPanelBackground,
                    }}
                >
                    {mode === 'new' ? (
                        <div
                            style={{
                                border: `1px solid ${token.colorBorderSecondary}`,
                                borderRadius: 8,
                                padding: 16,
                                background: rightPanelBackground,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                            }}
                        >
                            <Typography.Title level={5} style={{ margin: 0 }}>
                                + New Workflow
                            </Typography.Title>

                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                Create the template first. Designer will open only after the draft
                                is created.
                            </Typography.Text>

                            {createError ? (
                                <Alert type="error" showIcon message={createError} />
                            ) : null}

                            <div>
                                <Typography.Text strong style={{ fontSize: 12 }}>
                                    Name
                                </Typography.Text>
                                <Input
                                    value={createName}
                                    onChange={(e) => setCreateName(e.target.value)}
                                    placeholder="Workflow name"
                                    style={{ marginTop: 6 }}
                                />
                            </div>

                            <div
                                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
                            >
                                <div>
                                    <Typography.Text strong style={{ fontSize: 12 }}>
                                        Kind
                                    </Typography.Text>
                                    <Select
                                        value={createKind}
                                        onChange={(v: 'landing' | 'workflow') => setCreateKind(v)}
                                        style={{ width: '100%', marginTop: 6 }}
                                        options={[
                                            { value: 'workflow', label: 'Workflow' },
                                            { value: 'landing', label: 'Landing' },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <Typography.Text strong style={{ fontSize: 12 }}>
                                        Visibility
                                    </Typography.Text>
                                    <Select
                                        value={isCreatingLanding ? 'PRIVATE' : createVisibility}
                                        onChange={(v: 'PRIVATE' | 'PUBLIC') =>
                                            setCreateVisibility(v)
                                        }
                                        disabled={isCreatingLanding}
                                        style={{ width: '100%', marginTop: 6 }}
                                        options={[
                                            { value: 'PRIVATE', label: 'Private' },
                                            { value: 'PUBLIC', label: 'Public' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div>
                                <Typography.Text strong style={{ fontSize: 12 }}>
                                    Class-1
                                </Typography.Text>
                                <Space wrap size={[8, 8]} style={{ width: '100%', marginTop: 8 }}>
                                    {CLASS1_OPTIONS.map((value) => {
                                        const active = createClass1 === value;
                                        return (
                                            <Button
                                                key={value}
                                                size="small"
                                                type={active ? 'primary' : 'default'}
                                                disabled={isCreatingLanding}
                                                onClick={() => {
                                                    setCreateClass1(value);
                                                    setCreateClass2(undefined);
                                                    setCreateClass3(undefined);
                                                }}
                                                style={{ borderRadius: 999 }}
                                            >
                                                {value}
                                            </Button>
                                        );
                                    })}
                                </Space>
                            </div>

                            <div>
                                <Typography.Text strong style={{ fontSize: 12 }}>
                                    Class-2
                                </Typography.Text>
                                <Space wrap size={[8, 8]} style={{ width: '100%', marginTop: 8 }}>
                                    {(createClass1 ? (CLASS2_OPTIONS[createClass1] ?? []) : []).map(
                                        (value) => {
                                            const active = createClass2 === value;
                                            return (
                                                <Button
                                                    key={value}
                                                    size="small"
                                                    type={active ? 'primary' : 'default'}
                                                    disabled={isCreatingLanding || !createClass1}
                                                    onClick={() => {
                                                        setCreateClass2(value);
                                                        setCreateClass3(undefined);
                                                    }}
                                                    style={{ borderRadius: 999 }}
                                                >
                                                    {value}
                                                </Button>
                                            );
                                        }
                                    )}
                                </Space>
                            </div>

                            <div>
                                <Typography.Text strong style={{ fontSize: 12 }}>
                                    Class-3
                                </Typography.Text>
                                <Space wrap size={[8, 8]} style={{ width: '100%', marginTop: 8 }}>
                                    {(createClass1 && createClass2
                                        ? (CLASS3_OPTIONS[createClass1]?.[createClass2] ?? [])
                                        : []
                                    ).map((value) => {
                                        const active = createClass3 === value;
                                        return (
                                            <Button
                                                key={value}
                                                size="small"
                                                type={active ? 'primary' : 'default'}
                                                disabled={
                                                    isCreatingLanding ||
                                                    !createClass1 ||
                                                    !createClass2
                                                }
                                                onClick={() => setCreateClass3(value)}
                                                style={{ borderRadius: 999 }}
                                            >
                                                {value}
                                            </Button>
                                        );
                                    })}
                                </Space>
                            </div>

                            <Space style={{ marginTop: 8 }}>
                                <Button onClick={onClose}>Cancel</Button>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    loading={createLoading}
                                    disabled={createDisabled}
                                    onClick={handleCreateWorkflow}
                                >
                                    Create Workflow
                                </Button>
                            </Space>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 12 }}>
                                <Typography.Title level={5} style={{ margin: 0 }}>
                                    {mode === 'public'
                                        ? 'Public Workflows'
                                        : mode === 'landing'
                                          ? 'Landing'
                                          : 'My Workflows'}
                                </Typography.Title>
                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                    {mode === 'public'
                                        ? 'Launch or clone shared workflows.'
                                        : mode === 'landing'
                                          ? 'Activate the Landing template that should drive the Home tab.'
                                          : 'Launch, edit, clone, rename, publish, change visibility, or delete workflows you own.'}
                                </Typography.Text>
                                {mode === 'public' ? (
                                    <Typography.Text
                                        type="secondary"
                                        style={{ fontSize: 12, display: 'block', marginTop: 4 }}
                                    >
                                        Showing {publicWorkflowItems.length} workflow
                                        {publicWorkflowItems.length === 1 ? '' : 's'}
                                    </Typography.Text>
                                ) : null}
                            </div>

                            <div
                                style={{
                                    overflowY: 'auto',
                                    minHeight: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 10,
                                    paddingRight: 4,
                                    flexBasis: 0,
                                    flexGrow: 1,
                                }}
                            >
                                {renderList(mode)}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}
