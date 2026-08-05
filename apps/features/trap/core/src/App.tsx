/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { BackTop, ConfigProvider, Layout, App as AntdApp } from 'antd';
import { Route, Routes } from 'react-router-dom';
import { useUserInfo } from '@platform/utils';

import TrapLandingPage from './pages/TrapLandingPage';
import WidgetStudioConfigurePage from './features/widget-studio/WidgetStudioConfigurePage';
import 'devextreme/dist/css/dx.light.css';
import './styles/datagrid-theme-bridge.scss';
import './styles/scrollbars.scss';

import { AdminPanel } from './features/AdminPanel';
import { useSetActiveUser } from './state/User/hooks';
import { MessageInitializer } from './components/common/MessageInitializer';
import {
    CustomTheme,
    fetchCustomThemes,
    saveCustomThemeRemote,
    deleteCustomThemeRemote,
    resolveTheme,
} from './theme/customThemes';
import { PreviewTheme, ThemeContext } from './theme/ThemeContext';

const { Content } = Layout;

const THEME_STORAGE_KEY = 'trap_theme';
const APP_SHELL_MIN_WIDTH = 1180;
const CONTENT_MAX_WIDTH = 1880;
const APP_HORIZONTAL_PADDING = 16;
const APP_TOP_PADDING = 16;

export default function App() {
    const [themeName, setThemeName] = React.useState<string>(() => {
        return localStorage.getItem(THEME_STORAGE_KEY) ?? 'default';
    });
    // User-authored themes (loaded from the Core API → Cosmos, via mocked GraphQL in the harness)
    // + a transient preview the editor pushes while you tweak tokens.
    const [customThemes, setCustomThemes] = React.useState<CustomTheme[]>([]);
    const [preview, setPreview] = React.useState<PreviewTheme>(null);

    const refetchThemes = React.useCallback(() => {
        fetchCustomThemes()
            .then(setCustomThemes)
            .catch(() => {
                /* leave current list on transient errors */
            });
    }, []);
    React.useEffect(() => {
        refetchThemes();
    }, [refetchThemes]);

    // Optimistic write-through: update local state immediately, persist via GraphQL, and refetch
    // to reconcile if the mutation fails.
    const upsertCustomTheme = React.useCallback(
        (t: CustomTheme) => {
            setCustomThemes((list) =>
                list.some((x) => x.id === t.id)
                    ? list.map((x) => (x.id === t.id ? t : x))
                    : [...list, t]
            );
            saveCustomThemeRemote(t).catch(() => refetchThemes());
        },
        [refetchThemes]
    );
    const deleteCustomTheme = React.useCallback(
        (id: string) => {
            setCustomThemes((list) => list.filter((x) => x.id !== id));
            setThemeName((cur) => (cur === id ? 'default' : cur));
            deleteCustomThemeRemote(id).catch(() => refetchThemes());
        },
        [refetchThemes]
    );

    const { claims } = useUserInfo();
    const setActiveUser = useSetActiveUser();

    React.useEffect(() => {
        if (claims) {
            sessionStorage.setItem('okta-user', claims.ad_samaccountname);
            sessionStorage.setItem('okta-name', claims.name);
            sessionStorage.setItem('OrgLevel1', claims.OrgLevel1);
            sessionStorage.setItem('OrgLevel2', claims.OrgLevel2);
            sessionStorage.setItem('OrgLevel4', claims.OrgLevel4);
            sessionStorage.setItem('okta-email', claims.email);
            sessionStorage.setItem('okta-role', claims.role || 'Analyst');
            setActiveUser(claims.name);
        }
    }, [claims]);

    React.useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, themeName);
    }, [themeName]);

    // Dev-only affordance for previewing themes live (no reload, keeps the active tab). Harmless
    // to leave, but only wired under Vite dev.
    React.useEffect(() => {
        if (import.meta.env.DEV) {
            (window as any).__setTheme = (t: string) => setThemeName(t);
        }
    }, []);

    // The active theme resolves any built-in name or custom id; a live preview (from the editor)
    // transiently overrides it while a draft is being tweaked.
    const resolved = React.useMemo(
        () => resolveTheme(themeName, customThemes),
        [themeName, customThemes]
    );
    const themeConfig = preview ? preview.config : resolved.config;
    const appBackground = preview ? preview.appBackground : resolved.appBackground;
    // While previewing, everything keyed off the theme name (surface-meta gradients, data-theme,
    // dark-HUD) uses the draft's identity — never the previously-active theme's.
    const effectiveThemeName = preview ? preview.themeName : themeName;

    return (
        <ThemeContext.Provider
            value={{
                themeName: effectiveThemeName,
                setTheme: setThemeName,
                customThemes,
                upsertCustomTheme,
                deleteCustomTheme,
                setPreview,
            }}
        >
            <ConfigProvider theme={{ ...themeConfig, cssVar: true }}>
                <AntdApp>
                    <MessageInitializer />
                    <BackTop />
                    <Layout
                        style={{
                            minHeight: '100vh',
                            maxWidth: '100vw',
                            minWidth: APP_SHELL_MIN_WIDTH,
                            overflowX: 'auto',
                            background: appBackground,
                            transition: 'background 180ms ease',
                        }}
                    >
                        <Content
                            style={{
                                minWidth: APP_SHELL_MIN_WIDTH,
                                width: '100%',
                                maxWidth: CONTENT_MAX_WIDTH,
                                margin: '0 auto',
                                paddingTop: APP_TOP_PADDING,
                                paddingLeft: APP_HORIZONTAL_PADDING,
                                paddingRight: APP_HORIZONTAL_PADDING,
                                paddingBottom: 16,
                                boxSizing: 'border-box',
                            }}
                        >
                            <Routes>
                                <Route path="/" element={<TrapLandingPage />} />

                                <Route path="admin" element={<AdminPanel />} />
                                <Route
                                    path="studio/configure"
                                    element={<WidgetStudioConfigurePage />}
                                />
                            </Routes>
                        </Content>
                    </Layout>
                </AntdApp>
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}
