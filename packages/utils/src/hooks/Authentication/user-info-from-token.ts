/* eslint-disable @typescript-eslint/no-explicit-any */
import { useOktaAuth } from "@okta/okta-react";
import { UserInfo } from "./user-info";

// might need to rethink this
const ADMIN_GROUP = 'VelocityPortalAdmins';

export const useOktaUserInfo = () : {get: () => Promise<UserInfo>} => {
    const okta = useOktaAuth();
    
    return {get: async () => {
        const idToken = okta.oktaAuth.getIdToken();   
        const userInfo = getUserInfoFromIdToken(idToken);     
        const accessToken = okta.oktaAuth.getAccessToken();
        userInfo.claims = await okta.oktaAuth.getUser();
        const groups = userInfo.claims.groups;        
        userInfo.accessToken = accessToken;
        userInfo.login = userInfo.claims.ad_samaccountname as string;
        userInfo.isAdmin =  groups ? (groups as string[])?.includes(ADMIN_GROUP) : false;
        userInfo.idToken = idToken ?? '';
        return userInfo;        
    }}
}

export const getUserInfoFromIdToken = (idToken: string | undefined): UserInfo => {

    const userInfo: UserInfo = { idToken: "", name: "Unknown", email: "", login: "", phone: "", isAdmin: false, claims: [] };

    if (idToken) {
        try {
            const parts = getTokenParts(idToken);

            if (parts.length < 3) {
                throw "Token did not contain enough parts";
            }

            const decodedToken = decode(parts[1]);
            const parsedToken = JSON.parse(decodedToken);
            console.log(parsedToken);
            userInfo.name = swapNameOrder(parsedToken.name);
            userInfo.email = parsedToken.email;
        }
        catch (e) {
            console.log("Invalid ID Token: " + e);
            userInfo.name = "Invalid";
        }
    }
    return userInfo;
}

export const swapNameOrder = (name: string ) => {
    const splitName = name.split(' ');
    const removeComma = splitName[0].slice(0, -1);
    const newName = splitName[1] + " " + removeComma;
    return newName;
}

export const getAccessTokenInfo = (accessToken: string | undefined) : any => {
    if (!accessToken) {
        return {};
    }
    const parts = getTokenParts(accessToken);
    const decodedToken = decode(parts[1]);
    const parsedToken = JSON.parse(decodedToken);    
    return parsedToken;
}

export const getTokenParts = (token: string | undefined): string[] => {

    if (token) {
        return token.split(".");
    }

    return [] as string[];
}

export const decode = (part: string): string => {
    return atob(part);     
}
