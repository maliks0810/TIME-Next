import { useOktaAuth } from "@okta/okta-react";
import { useCallback } from "react";

export function useBearerToken(): (noPrefix?: boolean) => Promise<string> {
    const okta = useOktaAuth();
    return useCallback(async (noPrefix?: boolean) => {
        if(!okta?.oktaAuth) {
            throw new Error('Context for OktaAuth is not set or is unavailable.');
        }
        
        const token = await okta?.oktaAuth?.getOrRenewAccessToken();

        if(!token) {
            throw new Error('Unable to retrieve Okta Access Token.');
        }
        return (token.startsWith('Bearer ') || noPrefix) ? token : 'Bearer ' + token;
    },[okta?.oktaAuth]);
}