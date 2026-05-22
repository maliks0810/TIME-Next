import React from 'react';
import { BackTop, ConfigProvider, Layout } from 'antd';
import { Route, Routes } from 'react-router-dom';
import { useUserInfo } from '@platform/utils';

import TrapLandingPage from './pages/TrapLandingPage';
import TemplateDesignerPage from './features/workflow-designer/WorkflowDesignerPage';
import WidgetStudioConfigurePage from './features/widget-studio/WidgetStudioConfigurePage';
import 'devextreme/dist/css/dx.light.css';
import './styles/datagrid-theme-bridge.scss';

import { ThemeContext, getThemeConfig, ThemeName } from './theme/ThemeContext';
import { AdminPanel } from './features/AdminPanel';
import { useSetActiveUser } from './state/User/hooks';

const { Content } = Layout;

const THEME_STORAGE_KEY = 'trap_theme';
const APP_SHELL_MIN_WIDTH = 1180;
const CONTENT_MAX_WIDTH = 1880;
const APP_HORIZONTAL_PADDING = 16;
const APP_TOP_PADDING = 16;

export default function App() {
    const [themeName, setThemeName] = React.useState<ThemeName>(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
        return saved ?? 'default';
    });
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

    const themeConfig = React.useMemo(() => getThemeConfig(themeName), [themeName]);

    return (
        <ThemeContext.Provider value={{ themeName, setTheme: setThemeName }}>
            <ConfigProvider theme={{ ...themeConfig, cssVar: true }}>
                <BackTop />
                <Layout
                    style={{
                        minHeight: '100vh',
                        maxWidth: '100vw',
                        minWidth: APP_SHELL_MIN_WIDTH,
                        overflowX: 'auto',
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
                            <Route path="designer" element={<TemplateDesignerPage />} />
                            <Route path="admin" element={<AdminPanel />} />
                            <Route
                                path="studio/configure"
                                element={<WidgetStudioConfigurePage />}
                            />
                        </Routes>
                    </Content>
                </Layout>
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}
