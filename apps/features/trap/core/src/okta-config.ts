const CLIENT_ID = import.meta.env.VITE_REACT_APP_OKTA_CLIENT_ID || '{clientId}';
const ISSUER = import.meta.env.VITE_REACT_APP_OKTA_ISSUER || 'https://tcw.okta.com/oauth2/default';  
const AUTHORIZATION_URL = import.meta.env.VITE_REACT_APP_OKTA_AUTHORIZATION_URL || 'https://tcw.okta.com/oauth2/default/v1/authorize'
const OKTA_TESTING_DISABLEHTTPSCHECK = import.meta.env.VITE_REACT_APP_OKTA_TESTING_DISABLEHTTPSCHECK === 'true' || false;
const BASENAME = import.meta.env.VITE_PUBLIC_URL || '';
const REDIRECT_URI = `${window.location.origin}${BASENAME}/login/callback`;
const SCOPES = (import.meta.env.VITE_REACT_APP_OKTA_SCOPES?.split(/\s+/)) || ['openid', 'profile', 'email'];

export const oktaConfig = {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    authorizeUrl: AUTHORIZATION_URL,
    redirectUri: REDIRECT_URI,
    scopes: SCOPES,
    pkce: false,
    disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK,
  }
};
