import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider } from '@platform/utils';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar, Footer } from '@platform/ui';
import { UserInfoProvider, UserLoader } from '@platform/utils';

export function RootLayout() {
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

                        <Box sx={{ minHeight: 'calc(100vh - 135px)' }}>
                            <Outlet />
                        </Box>

                        <Footer />

                    </Box>
                </UserLoader>
            </UserInfoProvider>
        </ApolloProvider>
    );
}
