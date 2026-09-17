/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { ReactNode, useEffect, useState } from 'react';
import { getUserPreferenceByApplication, upsertPreference } from '../api/trap';
import { useGetUserLogin } from '../state/User/hooks';
import { APPLICATION_KEYS } from './constants';

export type UserProfileContextValue = {
    updateProfile: (key: string, value: unknown) => void;
    updateWidgetValue: (workflow: string, widget: string, payload: unknown) => void;
    profile?: Record<string, any>; //TODO: type better
    widgetsProfile?: Record<string, unknown>; //TODO: type better
};
export const UserProfileContext = React.createContext<UserProfileContextValue | undefined>(
    undefined
);

export function useUserProfile() {
    const context = React.useContext(UserProfileContext);
    if (!context) throw new Error('useUserProfile must be used within a UserProfileProvider');
    return context;
}

//TODO: add error handling
export function UserProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<Record<string, unknown> | undefined>();
    const [widgetsProfile, setWidgetsProfile] = useState<Record<string, unknown> | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const login = useGetUserLogin();

    const updateWidgetValue = (workflow: string, widget: string, payload: unknown) => {
        upsertPreference({
            application: APPLICATION_KEYS.WIDGETS,
            profile: {
                ...widgetsProfile,
                [workflow]: {
                    [widget]: payload,
                },
            },
        });
    };
    const updateProfile = (key: string, value: unknown) => {
        // This logger is needed for testing
        console.info('UPDATE', key, value);
        upsertPreference({
            application: APPLICATION_KEYS.SETTINGS,
            profile: { ...profile, [key]: value },
        });
    };

    const initValues = async () => {
        try {
            const applicationProfile = await getUserPreferenceByApplication(
                APPLICATION_KEYS.SETTINGS
            );
            const widgetProfile = await getUserPreferenceByApplication(APPLICATION_KEYS.WIDGETS);
            setWidgetsProfile(widgetProfile?.profile);
            setProfile(applicationProfile?.profile);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (login && login !== 'Unknown') {
            setIsLoading(true);
            initValues();
        }
    }, [login]);

    return (
        <UserProfileContext.Provider
            value={{
                updateProfile,
                updateWidgetValue,
                profile,
                widgetsProfile,
            }}
        >
            {isLoading ? null : children}
        </UserProfileContext.Provider>
    );
}
