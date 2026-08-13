import { Button, Empty, Space, Typography, theme } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';

const { Text } = Typography;

type WorkflowItem = {
    id: string;
    label: string;
    description?: string;
    templateId?: string;
};

const DEFAULT_ITEMS: WorkflowItem[] = [];

export default function RecentWorkflowsWidget({ result, uiActions }: WidgetComponentProps) {
    const { token } = theme.useToken();

    const data = (result ?? {}) as {
        title?: string;
        subtitle?: string;
        items?: WorkflowItem[];
    };

    const title = data.title ?? 'Recent Workflows';
    const subtitle = data.subtitle ?? 'Quick launch from Landing';

    const rawItems: WorkflowItem[] = Array.isArray(data.items) ? data.items : DEFAULT_ITEMS;

    const items = rawItems.slice(0, 5);

    const openWorkflow = (item: WorkflowItem) => {
        const action = uiActions?.openWorkflow;

        if (!action) return;

        action({
            target: {
                templateId: item.templateId,
                title: item.label,
            },
            context: {},
        });
    };

    return (
        <WidgetCardShell>
            <div
                style={{
                    height: '100%',
                    padding: 0,
                    boxSizing: 'border-box',
                    background: `linear-gradient(180deg, ${token.colorFillAlter} 0%, ${token.colorBgContainer} 100%)`,
                    color: token.colorText,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ marginBottom: 8 }}>
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: token.colorText,
                        }}
                    >
                        {title}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {subtitle}
                    </Text>
                </div>

                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    {items.length === 0 ? (
                        <div
                            style={{
                                flex: 1,
                                minHeight: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px dashed ${token.colorBorder}`,
                                borderRadius: 6,
                                background: token.colorBgContainer,
                            }}
                        >
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No recent workflows available"
                            />
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    border: `1px solid ${token.colorBorderSecondary}`,
                                    borderRadius: 6,
                                    padding: 6,
                                    background: token.colorBgContainer,
                                    boxShadow: token.boxShadowTertiary,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: 8,
                                    }}
                                >
                                    <div style={{ minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 600,
                                                lineHeight: 1.2,
                                                marginBottom: 4,
                                                color: token.colorText,
                                            }}
                                        >
                                            {item.label}
                                        </div>

                                        {item.description ? (
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {item.description}
                                            </Text>
                                        ) : null}
                                    </div>

                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<RightOutlined />}
                                        onClick={() => openWorkflow(item)}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </Space>
            </div>
        </WidgetCardShell>
    );
}
