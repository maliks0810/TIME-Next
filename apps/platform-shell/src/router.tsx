/* eslint-disable @typescript-eslint/no-explicit-any */
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { LoginCallback, Security } from '@okta/okta-react';
import { oktaConfig } from './okta-config';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { RootLayout } from './layouts/RootLayout';
import { appRegistry } from '@platform/app-registry';
import { Authenticator } from '@platform/utils';
import { OktaRoleRedirector } from './oktaPersonaRedirector';

const oktaAuth = new OktaAuth(oktaConfig.oidc);

export function AppRouter() {
  const apps = appRegistry.getAllApps();
  const navigate = useNavigate();

  const restoreOriginalUri = async (_auth: OktaAuth, originalUri: string) => {
    navigate(toRelativeUrl(originalUri || '', window.location.origin));
  };

  useEffect(() => {
    return () => {
      oktaAuth.options.restoreOriginalUri = undefined;
    };
  }, []);

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <OktaRoleRedirector />

      <Routes>
        <Route
          path="/"
          element={
            <Authenticator
              success={<RootLayout />}
            />
          }
        >
          {apps.map((app: any) => {
            if (app.external && app.url) {
              return (
                <Route
                  key={app.id}
                  path={app.path === '/' ? undefined : app.path}
                  index={app.path === '/'}
                  element={<Navigate to={app.url} replace />}
                />
              );
            }
            if (app.component) {
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Security>
  );
}
