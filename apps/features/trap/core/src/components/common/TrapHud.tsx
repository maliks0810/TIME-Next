/* eslint-disable  @typescript-eslint/no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown, Space, Typography } from 'antd';
import {
    AppstoreOutlined,
    BgColorsOutlined,
    CheckOutlined,
    ExportOutlined,
    PlusOutlined,
    SettingOutlined,
} from '@ant-design/icons';

import {
    useTheme,
    THEME_OPTIONS,
    type ThemeName,
    getThemeSurfaceMeta,
} from '../../theme/ThemeContext';
import { ConfigureUserModal } from '../../features/workflow-launcher/components/ConfigureUserModal';
import WorkflowLauncherModal from '../../features/workflow-launcher/components/WorkflowLauncherModal';
import { WorkflowLaunchSelection } from '../../features/workflow-launcher/types/workflowLauncher.types';

type TrapHudProps = {
    onExport: () => void;
    onLaunchWorkflow?: (selection: WorkflowLaunchSelection) => Promise<void> | void;
    onEditWorkflow?: (selection: WorkflowLaunchSelection) => void;
    onActivateLanding?: (selection: { templateId: string; templateVersionId: string }) => void;
};

export default function TrapHud({
    // onExport,
    onLaunchWorkflow,
    onEditWorkflow,
    onActivateLanding,
}: TrapHudProps) {
    const nav = useNavigate();
    const { themeName, setTheme } = useTheme();
    const [launchModalOpen, setLaunchModalOpen] = React.useState(false);
    const [configureModalOpen, setConfigureModalOpen] = React.useState(false);
    const [currentDebugUser, setCurrentDebugUser] = React.useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('debug-user') : null
    );

    const meta = getThemeSurfaceMeta(themeName);

    const isDarkHud =
        themeName === 'dark' ||
        themeName === 'neonMint' ||
        themeName === 'vaporwave' ||
        themeName === 'neonGlow' ||
        themeName === 'solarizedDark' ||
        themeName === 'plumGradient' ||
        themeName === 'goldGradient' ||
        themeName === 'greenGradient' ||
        themeName === 'blueGradient' ||
        themeName === 'cyberpunk' ||
        themeName === 'tron' ||
        themeName === 'matrix' ||
        themeName === 'bladeRunner';

    const isDreamyHud = themeName === 'dreamy';

    const LIGHT_THEME_OPTIONS = THEME_OPTIONS.filter((opt) =>
        [
            'default',
            'holiday',
            'ocean',
            'sunset',
            'forest',
            'grape',
            'candy',
            'solarizedLight',
        ].includes(opt.value)
    );

    const DARK_THEME_OPTIONS = THEME_OPTIONS.filter((opt) =>
        ['dark', 'neonMint', 'vaporwave', 'neonGlow', 'solarizedDark'].includes(opt.value)
    );

    const TCW_THEME_OPTIONS = THEME_OPTIONS.filter((opt) =>
        ['plumGradient', 'goldGradient', 'greenGradient', 'blueGradient'].includes(opt.value)
    );

    const RSQUARE_THEME_OPTIONS = THEME_OPTIONS.filter((opt) =>
        ['cyberpunk', 'dreamy'].includes(opt.value)
    );

    const MOVIE_THEME_OPTIONS = THEME_OPTIONS.filter((opt) =>
        ['tron', 'matrix', 'bladeRunner'].includes(opt.value)
    );

    const makeThemeChildren = (options: Array<{ value: ThemeName; label: string }>) =>
        options.map((opt) => ({
            key: `theme-${opt.value}`,
            label: (
                <Space
                    size={8}
                    style={{
                        width: '100%',
                        justifyContent: 'space-between',
                    }}
                >
                    <span>{opt.value === 'tron' ? 'TRON' : opt.label}</span>
                    {themeName === opt.value ? <CheckOutlined /> : <span style={{ width: 14 }} />}
                </Space>
            ),
            onClick: () => setTheme(opt.value as ThemeName),
        }));

    const handleSettingsMenuClick = ({ key }: { key: string }) => {
        switch (key) {
            case 'debug-user-jane':
                localStorage.setItem('debug-user', 'jane');
                setCurrentDebugUser('jane');
                nav('.', { replace: true });
                break;

            case 'debug-user-john':
                localStorage.setItem('debug-user', 'john');
                setCurrentDebugUser('john');
                nav('.', { replace: true });
                break;

            case 'debug-user-clear':
                localStorage.removeItem('debug-user');
                setCurrentDebugUser(null);
                nav('.', { replace: true });
                break;
            case 'debug-user-configure':
                setConfigureModalOpen(true);
                break;
        }
    };

    const handleUserChange = (value: string) => {
        setConfigureModalOpen(false);

        localStorage.setItem('debug-user', value);
        setCurrentDebugUser(value);
        nav('.', { replace: true });
    };
    const renderCurrentUserOption = () => {
        if (currentDebugUser === 'john' || currentDebugUser === 'jane' || !currentDebugUser) {
            return [];
        }
        return [
            {
                key: `debug-user-${currentDebugUser}`,
                label: (
                    <Space size={8} style={{ width: '100%', justifyContent: 'space-between' }}>
                        <span>{currentDebugUser}</span>
                        <CheckOutlined />
                    </Space>
                ),
            },
        ];
    };
    const settingsMenu = {
        items: [
            {
                key: 'settings-theme',
                label: 'Theme',
                icon: <BgColorsOutlined />,
                children: [
                    { key: 'theme-light-header', label: 'Light Themes', disabled: true },
                    ...makeThemeChildren(LIGHT_THEME_OPTIONS),
                    { type: 'divider' as const },
                    { key: 'theme-dark-header', label: 'Dark Themes', disabled: true },
                    ...makeThemeChildren(DARK_THEME_OPTIONS),
                    { type: 'divider' as const },
                    { key: 'theme-tcw-header', label: 'TCW Themes', disabled: true },
                    ...makeThemeChildren(TCW_THEME_OPTIONS),
                    { type: 'divider' as const },
                    { key: 'theme-rsquare-header', label: 'R² Theme', disabled: true },
                    ...makeThemeChildren(RSQUARE_THEME_OPTIONS),
                    { type: 'divider' as const },
                    { key: 'theme-movie-header', label: 'Movie Themes', disabled: true },
                    ...makeThemeChildren(MOVIE_THEME_OPTIONS),
                ],
            },
            { type: 'divider' as const },
            { key: 'debug-user-header', label: 'Debug User', disabled: true },
            ...renderCurrentUserOption(),
            {
                key: 'debug-user-jane',
                label: (
                    <Space size={8} style={{ width: '100%', justifyContent: 'space-between' }}>
                        <span>Jane</span>
                        {currentDebugUser === 'jane' ? (
                            <CheckOutlined />
                        ) : (
                            <span style={{ width: 14 }} />
                        )}
                    </Space>
                ),
            },
            {
                key: 'debug-user-john',
                label: (
                    <Space size={8} style={{ width: '100%', justifyContent: 'space-between' }}>
                        <span>John</span>
                        {currentDebugUser === 'john' ? (
                            <CheckOutlined />
                        ) : (
                            <span style={{ width: 14 }} />
                        )}
                    </Space>
                ),
            },
            {
                key: 'debug-user-clear',
                label: (
                    <Space size={8} style={{ width: '100%', justifyContent: 'space-between' }}>
                        <span>Clear</span>
                    </Space>
                ),
            },

            { type: 'divider' as const },
            {
                key: 'debug-user-configure',
                label: (
                    <Space size={8} style={{ width: '100%', justifyContent: 'space-between' }}>
                        <span>Configure User</span>
                    </Space>
                ),
            },
            { type: 'divider' as const },
            {
                key: 'settings-placeholder',
                label: 'More settings coming soon',
                disabled: true,
            },
        ],
    };
    const subtleText = isDreamyHud
        ? 'rgba(106,90,122,0.72)'
        : isDarkHud
          ? 'rgba(255,255,255,0.70)'
          : 'rgba(15,23,42,0.58)';

    const strongText = isDreamyHud ? '#6b5879' : isDarkHud ? '#ffffff' : 'rgba(15,23,42,0.96)';

    const mastheadGlowA = isDreamyHud
        ? 'rgba(255, 214, 153, 0.38)' // pastel yellow
        : meta.isGradientTheme
          ? 'rgba(255,255,255,0.10)'
          : isDarkHud
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(109,94,252,0.14)';

    const mastheadGlowB = isDreamyHud
        ? 'rgba(255, 182, 193, 0.34)' // pastel pink
        : meta.isGradientTheme
          ? meta.hudGlow || 'rgba(255,255,255,0.08)'
          : isDarkHud
            ? 'rgba(59,130,246,0.10)'
            : 'rgba(59,130,246,0.12)';

    const mastheadGlowC = isDreamyHud
        ? 'rgba(186, 235, 198, 0.34)' // pastel green
        : isDarkHud
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.18)';

    const mastheadBeam = isDreamyHud
        ? 'linear-gradient(100deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.00) 28%, rgba(255,240,245,0.42) 58%, rgba(255,255,255,0.00) 100%)'
        : isDarkHud
          ? 'linear-gradient(100deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.00) 32%, rgba(255,255,255,0.04) 62%, rgba(255,255,255,0.00) 100%)'
          : 'linear-gradient(100deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.00) 32%, rgba(255,255,255,0.22) 62%, rgba(255,255,255,0.00) 100%)';

    const ghostButtonStyle: React.CSSProperties = {
        height: 32,
        borderRadius: 8,
        border: 'none',
        boxShadow: 'none',
        fontWeight: 600,
        background: isDreamyHud ? 'rgba(255,255,255,0.22)' : 'transparent',
        color: strongText,
        paddingInline: 10,
        backdropFilter: isDreamyHud ? 'blur(8px)' : undefined,
        WebkitBackdropFilter: isDreamyHud ? 'blur(8px)' : undefined,
    };

    const primaryButtonStyle: React.CSSProperties = {
        ...ghostButtonStyle,
        background: isDreamyHud
            ? 'linear-gradient(135deg, rgba(255,223,186,0.45) 0%, rgba(255,192,203,0.34) 52%, rgba(186,235,198,0.38) 100%)'
            : isDarkHud
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,23,42,0.07)',
    };

    const iconButtonStyle: React.CSSProperties = {
        ...ghostButtonStyle,
        width: 32,
        minWidth: 32,
        paddingInline: 0,
    };

    const debugPillStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        padding: '0 8px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        color: strongText,
        background: isDreamyHud
            ? 'linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,240,245,0.52) 100%)'
            : isDarkHud
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
    };

    return (
        <>
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
                </div>

                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            display: 'grid',
                            placeItems: 'center',
                            color: strongText,
                            flexShrink: 0,
                        }}
                    >
                        <AppstoreOutlined style={{ fontSize: 16 }} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                lineHeight: '18px',
                                // letterSpacing: 0.1,
                                color: strongText,
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
                                color: subtleText,
                                letterSpacing: 0.2,
                            }}
                        >
                            TCW Risk Analytics Portal
                        </Typography.Text>
                    </div>
                </div>

                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexShrink: 0,
                    }}
                >
                    {currentDebugUser ? (
                        <span style={debugPillStyle}>{currentDebugUser}</span>
                    ) : null}

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setLaunchModalOpen(true)}
                        style={primaryButtonStyle}
                    >
                        Launch
                    </Button>

                    {/* <Button icon={<ExportOutlined />} onClick={onExport} style={ghostButtonStyle}>
                        Export
                    </Button> */}

                    <Dropdown
                        trigger={['click']}
                        menu={{ ...settingsMenu, onClick: handleSettingsMenuClick }}
                    >
                        <Button icon={<SettingOutlined />} style={iconButtonStyle} />
                    </Dropdown>
                </div>
            </div>

            <ConfigureUserModal
                open={configureModalOpen}
                onCancel={() => {
                    setConfigureModalOpen(false);
                }}
                onOk={handleUserChange}
            />

            <WorkflowLauncherModal
                key={currentDebugUser || 'clear'}
                open={launchModalOpen}
                onClose={() => setLaunchModalOpen(false)}
                isDarkHud={isDarkHud}
                hudBackground="transparent"
                onLaunchWorkflow={onLaunchWorkflow}
                onEditWorkflow={onEditWorkflow}
                onActivateLanding={onActivateLanding}
            />
        </>
    );
}
