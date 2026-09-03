/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { LoginCallback } from '@okta/okta-react';
import { BackTop, ConfigProvider, Layout, App as AntdApp } from 'antd';
import { Route, Routes } from 'react-router-dom';

import TrapLandingPage from './pages/TrapLandingPage';
import WidgetStudioConfigurePage from './features/widget-studio/WidgetStudioConfigurePage';
import 'devextreme/dist/css/dx.light.css';
import './styles/datagrid-theme-bridge.scss';
import './styles/scrollbars.scss';

import { AdminPanel } from './features/AdminPanel';
import { useGetUserClaims, useGetUserRole } from './state/User/hooks';
import { MessageInitializer } from './components/common/MessageInitializer';
import { CustomTheme, resolveTheme } from './theme/customThemes';
import { PreviewTheme, ThemeContext } from './theme/ThemeContext';
import { useUserInfo } from './utils/useUserInfo';
import { getUserPreferenceByApplication, upsertPreference } from './api/trap';
import { UserProfileProvider } from './context/UserPreferenceContext';
import { APPLICATION_KEYS, THEME_KEYS } from './context/constants';
import { Authenticator } from './Authenticator';

const { Content } = Layout;

const APP_SHELL_MIN_WIDTH = 1180;
const CONTENT_MAX_WIDTH = 1880;
const APP_HORIZONTAL_PADDING = 16;
const APP_TOP_PADDING = 16;

export default function App({ oktaAuth }: any) {
    const [themeName, setThemeName] = React.useState<string>('default');
    // User-authored themes (loaded from the Core API → Cosmos, via mocked GraphQL in the harness)
    // + a transient preview the editor pushes while you tweak tokens.
    const [customThemes, setCustomThemes] = React.useState<CustomTheme[]>([]);
    const [preview, setPreview] = React.useState<PreviewTheme>(null);

    useUserInfo();
    const refetchThemes = React.useCallback(async () => {
        const themeProfile = await getUserPreferenceByApplication(APPLICATION_KEYS.THEME);
        setCustomThemes(themeProfile?.[THEME_KEYS.CUSTOM_THEMES]);
        // fetchCustomThemes()
        //     .then(setCustomThemes)
        //     .catch(() => {
        //         /* leave current list on transient errors */
        //     });
    }, []);
    React.useEffect(() => {
        refetchThemes();
    }, [refetchThemes]);

    useEffect(() => {
        return () => {
            if (oktaAuth?.options?.restoreOriginalUri)
                oktaAuth.options.restoreOriginalUri = undefined;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (oktaAuth?.options?.restoreOriginalUri)
                oktaAuth.options.restoreOriginalUri = undefined;
        };
    }, []);

    React.useEffect(() => {
        getUserPreferenceByApplication(APPLICATION_KEYS.THEME).then(({ profile }) => {
            setCustomThemes(profile?.[THEME_KEYS.CUSTOM_THEMES]);
            setThemeName(profile?.[THEME_KEYS.ACTIVE_THEME]);
        });
    }, []);
    // Optimistic write-through: update local state immediately, persist via GraphQL, and refetch
    // to reconcile if the mutation fails.
    const upsertCustomTheme = React.useCallback(
        (theme: CustomTheme) => {
            const newThemes = customThemes.some((custom) => custom.id === theme.id)
                ? customThemes.map((custom) => (custom.id === theme.id ? theme : custom))
                : [...customThemes, theme];

            setCustomThemes(newThemes);
            upsertPreference({
                application: APPLICATION_KEYS.THEME,
                profile: {
                    [THEME_KEYS.ACTIVE_THEME]: themeName,
                    [THEME_KEYS.CUSTOM_THEMES]: newThemes,
                },
            });
            // saveCustomThemeRemote(theme).catch(() => refetchThemes());
        },
        [refetchThemes]
    );
    const deleteCustomTheme = React.useCallback(
        (id: string) => {
            const newThemes = customThemes.filter((custom) => custom.id !== id);
            setCustomThemes(newThemes);
            const newName = themeName === id ? 'default' : themeName;
            setThemeName(newName);

            upsertPreference({
                application: APPLICATION_KEYS.THEME,
                profile: {
                    [THEME_KEYS.ACTIVE_THEME]: newName,
                    [THEME_KEYS.CUSTOM_THEMES]: newThemes,
                },
            });
            // deleteCustomThemeRemote(id).catch(() => refetchThemes());
        },
        [refetchThemes]
    );

    const claims = useGetUserClaims();
    const userRole = useGetUserRole();

    useUserInfo();

    React.useEffect(() => {
        if (Object.keys(claims).length > 0) {
            sessionStorage.setItem('okta-user', claims.ad_samaccountname);
            sessionStorage.setItem('okta-name', claims.name);
            sessionStorage.setItem('OrgLevel1', claims.OrgLevel1);
            sessionStorage.setItem('OrgLevel2', claims.OrgLevel2);
            sessionStorage.setItem('OrgLevel4', claims.OrgLevel4);
            sessionStorage.setItem('okta-email', claims.email);
            sessionStorage.setItem('okta-role', userRole || 'Analyst');
        }
    }, [claims]);

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

    const setTheme = (name: string) => {
        setThemeName(name);

        upsertPreference({
            application: APPLICATION_KEYS.THEME,
            profile: {
                [THEME_KEYS.ACTIVE_THEME]: name,
                [THEME_KEYS.CUSTOM_THEMES]: customThemes,
            },
        });
    };
    return (
        <ThemeContext.Provider
            value={{
                themeName: effectiveThemeName,
                setTheme: setTheme,
                customThemes,
                upsertCustomTheme,
                deleteCustomTheme,
                setPreview,
            }}
        >
            <UserProfileProvider>
                <ConfigProvider theme={{ ...themeConfig, cssVar: true }}>
                    <AntdApp>
                        <MessageInitializer />
                        <BackTop />
                        <Layout
                            style={{
                                height: 'calc(100vh - 70px)',
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
                                    <Route
                                        path="/"
                                        element={<Authenticator success={<TrapLandingPage />} />}
                                    />

                                    <Route path="admin" element={<AdminPanel />} />
                                    <Route
                                        path="studio/configure"
                                        element={<WidgetStudioConfigurePage />}
                                    />
                                    <Route path="/login/callback" element={<LoginCallback />} />
                                </Routes>
                            </Content>
                        </Layout>
                    </AntdApp>
                </ConfigProvider>
            </UserProfileProvider>
        </ThemeContext.Provider>
    );
}
