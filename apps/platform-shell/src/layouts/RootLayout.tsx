import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react'
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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <ApolloProvider client={rootClient}>
                <UserInfoProvider appName={import.meta.env.VITE_APP_NAME}>
                    <UserLoader>
                        <Navbar />
                    </UserLoader>
                </UserInfoProvider>
            </ApolloProvider>
                                                   
                                                        

            <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
                <Outlet />
            </Box>
            <Footer />
        </Box>
    )
}