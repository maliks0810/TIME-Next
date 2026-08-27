import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import App from './App';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { Security } from '@okta/okta-react';

import { ErrorBoundary } from './ErrorBoundary';
import { oktaConfig } from './okta-config';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/global.css';

const oktaAuth = new OktaAuth(oktaConfig.oidc);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <Security
                oktaAuth={oktaAuth}
                restoreOriginalUri={async (_auth: OktaAuth, originalUri: string) => {
                    const navigate = useNavigate();
                    navigate(toRelativeUrl(originalUri || '', window.location.origin));
                }}
            >
                <BrowserRouter>
                    <App oktaAuth={oktaAuth} />
                </BrowserRouter>
            </Security>
        </ErrorBoundary>
    </React.StrictMode>
);
