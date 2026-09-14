/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChannelId } from './types';
import { useWidgetsStore } from './store';
import { useGetActiveTab } from '../Tabs/hooks';
import { useShallow } from 'zustand/shallow';
import { useUserProfile } from '../../context/UserPreferenceContext';
export const useGetAllContext = ({ channelId = '1' }: { channelId?: ChannelId }) => {
    const activeTab = useGetActiveTab();

    return useWidgetsStore((store) => store.channels[channelId]?.[activeTab]);
};

export const useGetWidgetValue = ({
    channelId = '1',
    key,
}: {
    channelId: ChannelId;
    key: string;
}) => {
    const activeTab = useGetActiveTab();
    return useWidgetsStore((store) => store.channels[channelId]?.[activeTab]?.[key]);
};

export const useSetWidgetValue = () => {
    const setValueToChannel = useWidgetsStore((store) => store.setValueToChannel);

    const { updateWidgetValue } = useUserProfile();
    return (value: any) => {
        setValueToChannel(value);
        updateWidgetValue(value.activeTab, value.widgetId, { [value.key]: value });
    };
};

export const useGetWidgetValueArray = ({
    channelId = '1',
    keys,
}: {
    channelId?: ChannelId;
    keys: string[];
}): Record<string, unknown> => {
    const activeTab = useGetActiveTab();
    return useWidgetsStore(
        useShallow((store) =>
            keys
                ? keys.reduce(
                      (acc, cur) => ({
                          ...acc,
                          [cur]: store.channels[channelId]?.[activeTab]?.[cur],
                      }),
                      {}
                  )
                : {}
        )
    );
};
