import { useUserInfoStore } from './userInfoStore';

export const useSetUserInfo = () => useUserInfoStore((store) => store.setUserInfo);
export const useGetActiveUser = () => useUserInfoStore((store) => store.userInfo.name);

export const useGetUserEmail = () => useUserInfoStore((store) => store.userInfo.email);
export const useGetUserClaims = () => useUserInfoStore((store) => store.userInfo.claims);
export const useGetUserLogin = () => useUserInfoStore((store) => store.userInfo.login);
