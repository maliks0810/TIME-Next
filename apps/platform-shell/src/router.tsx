import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { LoginCallback, Security } from '@okta/okta-react';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react'
import { oktaConfig } from './okta-config';
import { Routes, Route, Navigate, useNavigate  } from 'react-router-dom';
import { Suspense } from 'react';
import { RootLayout } from './layouts/RootLayout';
import { AppMetadata, appRegistry } from '@platform/app-registry';
import { Authenticator, UserInfoProvider, UserLoader } from '@platform/utils';


const oktaAuth = new OktaAuth(oktaConfig.oidc);
// add a circular progress for non loading items from mui materials
export function AppRouter() {
    const apps = appRegistry.getAllApps();
    const navigate = useNavigate();
    const restoreOriginalUri = async (auth: OktaAuth, originalUri: string) => {
        console.log(auth);
        navigate(toRelativeUrl(originalUri || '', window.location.origin));
    };

    const httpLink = new HttpLink({
        uri: import.meta.env.VITE_REACT_APP_TIME_PROFILE_AGQL_URL,
    });

    const client = new ApolloClient({
        cache: new InMemoryCache(),
        link: httpLink,
    });


    return (
            <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>

            <Routes>

                <Route path="/" element={
                        <Authenticator
                            success={
                                // Need to think about this structure
                                <ApolloProvider client={client}>
                                    {/* <UserInfoProvider appName={import.meta.env.VITE_APP_NAME}> */}
                                     <UserInfoProvider >
                                        <UserLoader>
                                            <RootLayout />
                                        </UserLoader>
                                    </UserInfoProvider>
                                </ApolloProvider>
                            }
                        />
                    }>
                    {apps.map((app: AppMetadata) => {
                        if(app.external && app.url) {
                            return (
                                <Route
                                    key={app.id}
                                    path={app.path === '/' ? undefined: app.path}
                                    index={app.path === '/'}
                                    element={<Navigate to={app.url} replace />}
                                />
                            );
                        }
                        if(app.component) {
                            return (
                                <Route
                                    key={app.id}
                                    path={app.path === '/' ? undefined : app.path}
                                    index={app.path === '/'}
                                    element={
                                        <Suspense>
                                            <app.component />
                                        </Suspense>
                                    }
                                />
                            );
                        }
                        return null;
                    })}

                </Route>
                <Route path="/login/callback" element={<LoginCallback />} />

            </Routes>
         </Security>
    );
}
