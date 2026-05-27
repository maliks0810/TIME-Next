import { ChannelId } from './types';
import { useWidgetsStore } from './store';
import { useGetActiveTab } from '../Tabs/hooks';
import { useShallow } from 'zustand/shallow';
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

    return setValueToChannel;
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
            keys.reduce(
                (acc, cur) => ({ ...acc, [cur]: store.channels[channelId]?.[activeTab]?.[cur] }),
                {}
            )
        )
    );
};
