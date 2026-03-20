/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Tag, Button, Col, Row, Space, Tooltip, Typography, Divider } from 'antd';
import { AppstoreAddOutlined, SaveOutlined } from '@ant-design/icons';
import JsonInfoModal from '../../../components/common/JsonInfoModal';

type DesignerHeaderProps = {
    templateId: string;
    versionId: string;
    loaded: any;
    loading: boolean;
    isPublished: boolean;
    isDraft: boolean;
    isDarkHud: boolean;
    designerHeaderBackground: string;
    borderStyle: string;
    boxShadow?: string;
    textColor: string;
    secondaryTextColor: string;
    buttonBackground: string;
    buttonBorder: string;
    buttonTextColor: string;
    saveDisabledReason?: string;
    publishDisabledReason?: string;
    onOpenLibrary: () => void;
    onSaveDraft: () => void;
    onPublish: () => void;
    onBack: () => void;
};

export default function DesignerHeader(props: DesignerHeaderProps) {
    const loadedStatus = String(props.loaded?.status ?? '').toUpperCase();

    const statusTag = (() => {
        if (!props.templateId || !props.versionId) return <Tag>NEW</Tag>;
        if (props.isPublished) return <Tag>PUBLISHED</Tag>;
        if (props.isDraft) return <Tag>DRAFT</Tag>;
        return <Tag>{loadedStatus || 'UNKNOWN'}</Tag>;
    })();

    const displayName = props.loaded?.name || props.loaded?.templateName || 'Untitled Template';

    const displayKind = (() => {
        const kind = String(props.loaded?.kind ?? props.loaded?.templateKind ?? '').toLowerCase();

        if (kind === 'landing') return 'Landing Template';
        if (kind === 'workflow') return 'Workflow Template';
        return 'Template';
    })();

    const loadedInfo = (
        <JsonInfoModal
            title="Loaded Version Raw JSON"
            data={props.loaded ?? {}}
            tooltip="Loaded Version JSON"
        />
    );

    const mastheadGlowA = props.isDarkHud ? 'rgba(255,255,255,0.10)' : 'rgba(109,94,252,0.14)';

    const mastheadGlowB = props.isDarkHud ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.12)';

    const mastheadBeam = props.isDarkHud
        ? 'linear-gradient(100deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.00) 32%, rgba(255,255,255,0.04) 62%, rgba(255,255,255,0.00) 100%)'
        : 'linear-gradient(100deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.00) 32%, rgba(255,255,255,0.22) 62%, rgba(255,255,255,0.00) 100%)';

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                minHeight: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                padding: '8px 4px 10px 4px',
                boxSizing: 'border-box',
                overflow: 'hidden',
                background: 'transparent',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        width: 260,
                        height: 120,
                        left: -24,
                        top: -34,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${mastheadGlowA} 0%, rgba(255,255,255,0.00) 72%)`,
                        filter: 'blur(24px)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: 320,
                        height: 140,
                        right: -30,
                        top: -40,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${mastheadGlowB} 0%, rgba(255,255,255,0.00) 72%)`,
                        filter: 'blur(28px)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: mastheadBeam,
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: props.designerHeaderBackground,
                        opacity: 0.9,
                    }}
                />
            </div>

            <Row
                align="middle"
                justify="space-between"
                style={{
                    width: '100%',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <Col flex="auto">
                    <Space align="center" size={6}>
                        <div
                            onClick={props.onBack}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                minWidth: 0,
                                flex: 1,
                                cursor: 'pointer',
                            }}
                        >
                            <div
                                style={{
                                    width: 30,
                                    height: 30,
                                    display: 'grid',
                                    placeItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <AppstoreAddOutlined style={{ fontSize: 16 }} />
                            </div>

                            <div style={{ minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        lineHeight: '18px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    TRAP
                                </div>
                                <Typography.Text
                                    style={{
                                        display: 'block',
                                        marginTop: 2,
                                        fontSize: 11,
                                        lineHeight: '14px',
                                        // color: subtleText,
                                        letterSpacing: 0.2,
                                    }}
                                >
                                    TCW Risk Analytics Portal
                                </Typography.Text>
                            </div>
                        </div>
                    </Space>
                </Col>
                <Col flex="auto">
                    <Space size={6} align="center">
                        <Typography.Text
                            strong
                            style={{
                                color: props.textColor,
                                fontSize: 16,
                                lineHeight: '18px',
                            }}
                        >
                            {displayName}
                        </Typography.Text>
                        <Divider type="vertical" />
                        <Typography.Text
                            style={{
                                color: props.secondaryTextColor,
                                fontSize: 11,
                                lineHeight: '14px',
                            }}
                        >
                            {displayKind}
                        </Typography.Text>
                        <Divider type="vertical" />
                        {statusTag}
                        <Divider type="vertical" />
                        <Space align="center" size={8}>
                            {loadedInfo}
                        </Space>
                    </Space>
                </Col>

                <Col>
                    {!props.templateId || !props.versionId ? (
                        <Space wrap>
                            <Button
                                onClick={props.onBack}
                                style={{
                                    height: 32,
                                    borderRadius: 8,
                                    border: 'none',
                                    boxShadow: 'none',
                                    fontWeight: 600,
                                    background: props.buttonBackground,
                                    color: props.buttonTextColor,
                                    paddingInline: 10,
                                }}
                            >
                                Back to TRAP Landing
                            </Button>
                        </Space>
                    ) : (
                        <Space wrap size={8}>
                            <Button
                                icon={<AppstoreAddOutlined />}
                                type="text"
                                onClick={props.onOpenLibrary}
                                disabled={props.isPublished}
                                style={{
                                    fontWeight: 600,
                                }}
                            >
                                Add Widget
                            </Button>
                            <Tooltip
                                title={
                                    !!props.publishDisabledReason
                                        ? `Publish (${props.publishDisabledReason})`
                                        : null
                                }
                            >
                                <Button
                                    icon={<SaveOutlined />}
                                    type="text"
                                    onClick={props.onPublish}
                                    disabled={!!props.publishDisabledReason}
                                    style={{
                                        fontWeight: 600,
                                    }}
                                >
                                    Publish
                                </Button>
                            </Tooltip>
                        </Space>
                    )}
                </Col>
            </Row>
        </div>
    );
}
