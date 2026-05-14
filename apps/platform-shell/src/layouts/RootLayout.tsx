import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider } from '@platform/utils';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar, Footer } from '@platform/ui';
import { UserInfoProvider, UserLoader } from '@platform/utils';
import { appRegistry, ExternalAppMetadata, InternalAppMetadata } from '@platform/app-registry';


type AppMetadata = InternalAppMetadata | ExternalAppMetadata;

function isInternalApp(app: AppMetadata): app is InternalAppMetadata {
    return app.type === 'internal';
}

function normalizeBasePath(path: string) {
    if (!path) return '/';

    let base = path.endsWith('/*') ? path.slice(0, -2) : path;

    if (base.length > 1 && base.endsWith('/')) base = base.slice(0, -1);

    if (!base.startsWith('/')) base = `/${base}`;

    return base || '/';
}

function toPathname(maybeUrlOrPath?: string) {
    if (!maybeUrlOrPath) return '/';
    const raw = maybeUrlOrPath.trim();

    if (/^https?:\/\//i.test(raw)) {
        try {
            return new URL(raw).pathname || '/';
        } catch {
        }
    }

    return raw.startsWith('/') ? raw : `/${raw}`;
}

function getAppBase(app: AppMetadata): string {
    const source = (isInternalApp(app) ? app.entryPointUrl : undefined) ??
    app.path ?? '/';

    return normalizeBasePath(toPathname(source));
}

function findActiveApp(pathname: string): AppMetadata | undefined {
    const apps = appRegistry.getAllApps();

    const sorted = [...apps].sort(
        (a, b) => getAppBase(b).length - getAppBase(a).length
    );

    const current =
        pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

    return sorted.find((app) => {
        const base = getAppBase(app);

        if (base === '/') return current === '/';
        return current === base || current.startsWith(base + '/');
    });
}


export function RootLayout() {
    const activeApp = findActiveApp(location.pathname);
    const hideFooter = activeApp?.hideFooter ?? false;

    const httpLink = new HttpLink({
        uri: import.meta.env.VITE_REACT_APP_TIME_PROFILE_AGQL_URL,
    });

    const rootClient = new ApolloClient({
        cache: new InMemoryCache(),
        link: httpLink,
    });

    return (
        <ApolloProvider client={rootClient}>
            <UserInfoProvider appName={import.meta.env.VITE_APP_NAME}>
                <UserLoader>
                    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <Navbar />

                        <Box sx={{ minHeight: 'calc(100vh - 70px)' }}>
                            <Outlet />
                        </Box>

                       {!hideFooter && <Footer />}

                    </Box>
                </UserLoader>
            </UserInfoProvider>
        </ApolloProvider>
    );
}
