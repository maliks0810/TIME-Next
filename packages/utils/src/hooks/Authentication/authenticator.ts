import { toRelativeUrl } from '@okta/okta-auth-js';
import { useOktaAuth } from '@okta/okta-react';
import { JSX, useEffect, useRef } from 'react';

/*
This component is used as a way to secure routes in conjunction
with the Okta Auth module. The properties inside the props 
data structure include success and loading. The 'success' page 
contains the page that will be shown once the user has successfully
authenticated. This will usually be set to an Okta component called
'Outlet' that renters the child routes instead of a specific page.
The optional 'loading' parameter is a page to be shown while the 
application first checks the authentication status and either
redirects to Okta's login page or the requested URL.
This component works by using the useEffect hook to detect changes
in the oktaAuth state or the tokenContext state. If the authentication
state has changed to authenticated (isAuthenticated === true), the 
auth token from the AuthTokenContext (see App.tsx) can be updated with
the value of the JWT and the 'success' component can be returned. 
Otherwise the AuthTokenContext is not updated and the loading page is
returned.
*/
export function Authenticator(props: {
    success: React.ReactElement | JSX.Element;
    loading?: React.ReactElement | JSX.Element;
}) {
    const { oktaAuth, authState } = useOktaAuth();
    const {success, loading} = props;
    const originalUri = useRef(toRelativeUrl(globalThis.location.href, globalThis.location.origin));

    useEffect(() => {
        //If isAuthenticated is not defined yet, then the auth process is still going
        if (authState?.isAuthenticated == undefined) {
            return;
        }
        console.log("checking user authentication");
        if (!authState?.isAuthenticated) {
            
            oktaAuth.setOriginalUri(originalUri.current);
            oktaAuth.signInWithRedirect();
            console.log('User is not authenticated');
            return;
        }
        console.log("user authenticated");
    }, [oktaAuth, authState?.isAuthenticated]);

    return (authState?.isAuthenticated === true ? success : loading) ?? null;
}
