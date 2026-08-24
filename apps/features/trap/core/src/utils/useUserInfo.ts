import { useOktaAuth } from '@okta/okta-react';
import { useEffect } from 'react';
import { useSetUserInfo } from '../state/User/hooks';
import { UserInfo } from '../state/User/userInfoStore';

// might need to rethink this
const ADMIN_GROUP = 'VelocityPortalAdmins';

const userInfoDefault: UserInfo = {
    idToken: '',
    name: 'Unknown',
    email: '',
    login: '',
    phone: '',
    isAdmin: false,
    claims: [],
    TIME_Role: '',
};

export const useUserInfo = () => {
    const okta = useOktaAuth();
    const setUserInfo = useSetUserInfo();

    const getUserInfo = async () => {
        const idToken = okta.oktaAuth.getIdToken();
        const userInfo = getUserInfoFromIdToken(idToken);
        const accessToken = okta.oktaAuth.getAccessToken();
        await okta.oktaAuth.getUser().then((data) => {
            userInfo.claims = data;
        });
        const groups = userInfo.claims.groups;
        userInfo.accessToken = accessToken;
        userInfo.login = userInfo.claims.ad_samaccountname as string;
        userInfo.isAdmin = groups ? (groups as string[])?.includes(ADMIN_GROUP) : false;
        userInfo.idToken = idToken ?? '';
        userInfo.TIME_Role = userInfo.TIME_Role;
        return userInfo;
    };

    useEffect(() => {
        getUserInfo().then((data) => {
            setUserInfo(data);
        });
    }, []);
};

const getUserInfoFromIdToken = (idToken: string | undefined): UserInfo => {
    if (idToken) {
        try {
            const parts = getTokenParts(idToken);

            if (parts.length < 3) {
                throw 'Token did not contain enough parts';
            }

            const decodedToken = decode(parts[1]);
            const parsedToken = JSON.parse(decodedToken);

            userInfoDefault.name = swapNameOrder(parsedToken.name);
            userInfoDefault.email = parsedToken.email;
            userInfoDefault.TIME_Role = parsedToken.TIME_Role;
        } catch (e) {
            console.log('Invalid ID Token: ' + e);
            userInfoDefault.name = 'Invalid';
        }
    }
    return userInfoDefault;
};

const swapNameOrder = (name: string) => {
    const splitName = name.split(' ');
    const removeComma = splitName[0].slice(0, -1);
    const newName = splitName[1] + ' ' + removeComma;
    return newName;
};

const getTokenParts = (token: string | undefined): string[] => {
    if (token) {
        return token.split('.');
    }

    return [] as string[];
};

const decode = (part: string): string => {
    return atob(part);
};
