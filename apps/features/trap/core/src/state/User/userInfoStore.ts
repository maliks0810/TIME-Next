import { create } from 'zustand';

export type UserInfo = {
    name?: string;
    id?: string;
    login?: string;
    email: string;
    idToken?: string;
    accessToken?: string;
    phone?: string;
    avatar?: string;
    claims?: any;
    isAdmin: boolean;
    favorites?: any[];
    authorizations?: any[];
    TIME_Role?: string;
};
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

type userInfoState = {
    userInfo: UserInfo;
    setUserInfo: (userInfo: UserInfo) => void;
};

export const useUserInfoStore = create<userInfoState>((set) => ({
    userInfo: userInfoDefault,

    setUserInfo: (userInfo) =>
        set(() => ({
            userInfo,
        })),
}));
