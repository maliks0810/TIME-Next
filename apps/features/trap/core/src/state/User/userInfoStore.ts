import { create } from 'zustand';
import { UserInfo } from './types';

const userInfoDefault: UserInfo = {
    idToken: '',
    name: 'Unknown',
    email: '',
    login: '',
    phone: '',
    isAdmin: false,
    claims: {},
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
