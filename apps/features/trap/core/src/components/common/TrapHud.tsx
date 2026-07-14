import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown, Space } from 'antd';
import {
    AppstoreOutlined,
    ArrowRightOutlined,
    BgColorsOutlined,
    CheckOutlined,
    CompassOutlined,
    SettingOutlined,
} from '@ant-design/icons';

import { useUserInfo } from '@platform/utils';
import {
    useTheme,
    THEME_OPTIONS,
    type ThemeName,
    getThemeSurfaceMeta,
} from '../../theme/ThemeContext';
import { ConfigureUserModal } from '../../features/workflow-launcher/components/ConfigureUserModal';
import WorkflowLauncherModal from '../../features/workflow-launcher/components/WorkflowLauncherModal';
import { WorkflowLaunchSelection } from '../../features/workflow-launcher/types/workflowLauncher.types';
import { IS_PROD, ALLOWED_USERS_LIST } from '../../utils/constants';

type TrapHudProps = {
    onExport: () => void;
    onLaunchWorkflow?: (selection: WorkflowLaunchSelection) => Promise<void> | void;
    onEditWorkflow?: (selection: WorkflowLaunchSelection) => void;
    onActivateLanding?: (selection: { templateId: string }) => void;
};

export default function TrapHud({
    // onExport,
    onLaunchWorkflow,
    onEditWorkflow,
    onActivateLanding,
}: TrapHudProps) {
    const nav = useNavigate();
    const { themeName, setTheme } = useTheme();
    const { email } = useUserInfo();
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
        themeName === 'dumpsterFire' ||
        themeName === 'matrix';

    const LIGHT_THEME_OPTIONS = THEME_OPTIONS.filter((opt) =>
        ['default', 'holiday', 'ocean', 'sunset', 'forest', 'solarizedLight'].includes(opt.value)
    );

    const DARK_THEME_OPTIONS = THEME_OPTIONS.filter((opt) =>
        ['dark', 'neonMint', 'vaporwave', 'neonGlow', 'solarizedDark'].includes(opt.value)
    );

    const TCW_THEME_OPTIONS = THEME_OPTIONS.filter((opt) =>
        ['plumGradient', 'goldGradient', 'greenGradient', 'blueGradient'].includes(opt.value)
    );

    const RSQUARE_THEME_OPTIONS = THEME_OPTIONS.filter((opt) =>
        ['cyberpunk', 'dreamy', 'ink', 'dumpsterFire'].includes(opt.value)
    );

    const MOVIE_THEME_OPTIONS = THEME_OPTIONS.filter((opt) => ['matrix'].includes(opt.value));

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
                    <span>{opt.label}</span>
                    {themeName === opt.value ? <CheckOutlined /> : <span style={{ width: 14 }} />}
                </Space>
            ),
            onClick: () => setTheme(opt.value as ThemeName),
        }));

    const handleSettingsMenuClick = ({ key }: { key: string }) => {
        switch (key) {
            case 'admin-panel':
                nav('admin', { replace: true });
                break;

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

    const getProtectedSettings = () =>
        !IS_PROD || ALLOWED_USERS_LIST.includes(email)
            ? [
                  { type: 'divider' as const },
                  {
                      key: 'admin-panel',
                      label: (
                          <Space
                              size={8}
                              style={{ width: '100%', justifyContent: 'space-between' }}
                          >
                              <span>Admin Panel</span>
                              <ArrowRightOutlined />
                          </Space>
                      ),
                  },
                  { type: 'divider' as const },
                  { key: 'debug-user-header', label: 'Debug User', disabled: true },
                  ...renderCurrentUserOption(),
                  {
                      key: 'debug-user-jane',
                      label: (
                          <Space
                              size={8}
                              style={{ width: '100%', justifyContent: 'space-between' }}
                          >
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
                          <Space
                              size={8}
                              style={{ width: '100%', justifyContent: 'space-between' }}
                          >
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
                          <Space
                              size={8}
                              style={{ width: '100%', justifyContent: 'space-between' }}
                          >
                              <span>Clear</span>
                          </Space>
                      ),
                  },
                  { type: 'divider' as const },
                  {
                      key: 'debug-user-configure',
                      label: (
                          <Space
                              size={8}
                              style={{ width: '100%', justifyContent: 'space-between' }}
                          >
                              <span>Configure User</span>
                          </Space>
                      ),
                  },
              ]
            : [];
    const settingsMenu = {
        items: [
            {
                key: 'settings-theme',
                label: 'Theme',
                popupClassName: 'trap-theme-submenu-popup',
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
            ...getProtectedSettings(),
            { type: 'divider' as const },
            {
                key: 'settings-placeholder',
                label: 'More settings coming soon',
                disabled: true,
            },
        ],
    };
    const subtleText = isDarkHud ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.58)';

    const strongText = isDarkHud ? '#ffffff' : 'rgba(15,23,42,0.96)';

    const hudSurface = meta.isGradientTheme
        ? isDarkHud
            ? 'rgba(255,255,255,0.035)'
            : 'rgba(255,255,255,0.34)'
        : isDarkHud
          ? 'rgba(255,255,255,0.025)'
          : 'rgba(255,255,255,0.28)';

    const hudBorder = meta.isGradientTheme
        ? isDarkHud
            ? 'rgba(255,255,255,0.055)'
            : 'rgba(15,23,42,0.075)'
        : isDarkHud
          ? 'rgba(255,255,255,0.055)'
          : 'rgba(15,23,42,0.045)';

    const hudAccentGradient = meta.isGradientTheme
        ? meta.accentGradient
        : isDarkHud
          ? 'linear-gradient(90deg, rgba(59,130,246,0.14), rgba(168,85,247,0.10), rgba(255,255,255,0.02))'
          : 'linear-gradient(90deg, rgba(59,130,246,0.09), rgba(109,94,252,0.08), rgba(255,255,255,0.14))';

    const hudSoftOverlay = meta.isGradientTheme
        ? `linear-gradient(135deg, ${meta.hudGlow || 'rgba(255,255,255,0.05)'} 0%, rgba(255,255,255,0.00) 58%)`
        : isDarkHud
          ? 'radial-gradient(circle at 20% 0%, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.00) 46%), radial-gradient(circle at 82% 0%, rgba(168,85,247,0.05) 0%, rgba(168,85,247,0.00) 48%)'
          : 'radial-gradient(circle at 20% 0%, rgba(59,130,246,0.07) 0%, rgba(59,130,246,0.00) 46%), radial-gradient(circle at 82% 0%, rgba(109,94,252,0.06) 0%, rgba(109,94,252,0.00) 48%)';

    const ghostButtonStyle: React.CSSProperties = {
        height: 28,
        borderRadius: 7,
        border: 'none',
        boxShadow: 'none',
        fontWeight: 600,
        background: 'transparent',
        color: strongText,
        paddingInline: 9,
    };

    const primaryButtonStyle: React.CSSProperties = {
        ...ghostButtonStyle,
        background: isDarkHud ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.07)',
        color: strongText,
    };

    const iconButtonStyle: React.CSSProperties = {
        ...ghostButtonStyle,
        width: 28,
        minWidth: 28,
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
        background: isDarkHud ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
    };

    return (
        <>
            <style>
                {`
                    .trap-settings-dropdown .ant-dropdown-menu {
                        min-width: 190px;
                    }

                    .trap-theme-submenu-popup .ant-dropdown-menu,
                    .trap-theme-submenu-popup .ant-menu {
                        min-width: 200px;
                    }

                    .trap-theme-submenu-popup .ant-dropdown-menu-item,
                    .trap-theme-submenu-popup .ant-menu-item {
                        white-space: nowrap;
                    }

                    .trap-theme-submenu-popup .ant-dropdown-menu-submenu-title,
                    .trap-theme-submenu-popup .ant-menu-submenu-title {
                        white-space: nowrap;
                    }
                `}
            </style>
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: 52,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '6px 8px',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    background: hudSurface,
                    border: `1px solid ${hudBorder}`,
                    boxShadow: 'none',
                    borderRadius: 4,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
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
                    {/* Soft theme-aware background wash */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: hudSoftOverlay,
                        }}
                    />

                    {/* Thin theme accent line */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: 1,
                            background: hudAccentGradient,
                            opacity: isDarkHud || meta.isGradientTheme ? 0.38 : 0.28,
                        }}
                    />

                    {/* Subtle glass highlight */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                                'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 62%)',
                            opacity: isDarkHud ? 0.08 : 0.34,
                        }}
                    />
                </div>

                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            width: 26,
                            height: 26,
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
                                fontSize: 16,
                                fontWeight: 700,
                                lineHeight: '18px',
                                color: strongText,
                                textTransform: 'uppercase',
                            }}
                        >
                            TRAP
                        </div>
                        <span
                            style={{
                                display: 'block',
                                marginTop: 1,
                                fontSize: 10,
                                lineHeight: '12px',
                                color: subtleText,
                                letterSpacing: 0.2,
                            }}
                        >
                            TCW Risk Analytics Portal
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexShrink: 0,
                    }}
                >
                    {currentDebugUser ? (
                        <span style={debugPillStyle}>{currentDebugUser}</span>
                    ) : null}

                    <Button
                        type="primary"
                        icon={<CompassOutlined />}
                        onClick={() => setLaunchModalOpen(true)}
                        style={primaryButtonStyle}
                    >
                        Launch Workspace
                    </Button>

                    {/* <Button icon={<ExportOutlined />} onClick={onExport} style={ghostButtonStyle}>
                        Export
                    </Button> */}

                    <Dropdown
                        trigger={['click']}
                        placement="bottomRight"
                        overlayClassName="trap-settings-dropdown"
                        menu={{
                            ...settingsMenu,
                            onClick: handleSettingsMenuClick,
                            subMenuCloseDelay: 0.8,
                        }}
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
