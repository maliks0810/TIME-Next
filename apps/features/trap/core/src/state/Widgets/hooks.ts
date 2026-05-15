import { ChannelId } from './types';
import { useWidgetsStore } from './store';
import { useGetActiveTab } from '../Tabs/hooks';
export const useGetAllContext = ({ channelId = '1' }: { channelId?: ChannelId }) => {
    const activeTab = useGetActiveTab();

    return useWidgetsStore((store) => store.channels[channelId]?.[activeTab]);
};
export const useGetWidgetValue = ({
    channelId = '1',
    key,
}: {
    channelId?: ChannelId;
    key?: string;
}) => {
    const activeTab = useGetActiveTab();
    return key ? useWidgetsStore((store) => store.channels[channelId]?.[activeTab]?.[key]) : null;
};

export const useSetWidgetValue = () => {
    const setValueToChannel = useWidgetsStore((store) => store.setValueToChannel);

    return setValueToChannel;
};
