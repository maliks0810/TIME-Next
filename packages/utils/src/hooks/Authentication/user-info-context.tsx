/* eslint-disable react/react-in-jsx-scope */
import { createContext, useState, useContext, useEffect } from 'react';
import { AppProviderProps } from '../User-Profile/provider-children';
import { UserInfo } from './user-info';
import { useBumpUserProfile, usePersistUserProfile } from '../User-Profile/user-profile';

const defaultUserInfo: UserInfo = { email: '', isAdmin: false };
const UserInfoContext = createContext<UserInfo>(defaultUserInfo);
const UpdateUserInfoContext = createContext<(userInfo: UserInfo, skipPersist?: boolean) => void>(
    (i) => i
);

export function useUserInfo() {    
    return useContext(UserInfoContext);
}

export function useUpdateUserInfo() {
    return useContext(UpdateUserInfoContext);
}

export function UserInfoProvider({ children }: AppProviderProps) {
    const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
    const saveUserProfile = usePersistUserProfile();
    const bumpUserProfile = useBumpUserProfile();

    const saveUserInfo = (userInfo: UserInfo, skipPersist?: boolean) => {
        setUserInfo(userInfo);
        //For now, just checking favorites, but a more comprehensive check will be needed for more info later
        if (!skipPersist && userInfo?.accessToken && userInfo?.favorites) {
            saveUserProfile.run(userInfo);
        }
    };

    useEffect(() => {
        console.log('user info updated');
    }, [userInfo]);

    useEffect(() => {
        if (userInfo?.accessToken) {
            bumpUserProfile.run();
        }
    }, [userInfo.accessToken, bumpUserProfile]);

    return (
        <UpdateUserInfoContext.Provider value={saveUserInfo}>
            <UserInfoContext.Provider value={userInfo}>{children}</UserInfoContext.Provider>
        </UpdateUserInfoContext.Provider>
    );
}
