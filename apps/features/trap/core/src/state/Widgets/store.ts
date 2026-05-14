import { create } from 'zustand';
import { ChannelId, WidgetValueType } from './types';

type WidgetsState = {
    channels: Record<ChannelId, Record<string, { [key: string]: WidgetValueType }>>;
    setValueToChannel: ({
        channelId,
        key,
        value,
        activeTab,
    }: {
        channelId: ChannelId;
        key: string;
        value: WidgetValueType;
        activeTab: string;
    }) => void;
};

export const useWidgetsStore = create<WidgetsState>((set) => {
    return {
        channels: {
            1: {},
            2: {},
            3: {},
            4: {},
        },

        setValueToChannel: ({ channelId = '1', activeTab, key, value }) =>
            set((state) => ({
                channels: {
                    ...state.channels,

                    [channelId]: {
                        ...state.channels[channelId],
                        [activeTab]: {
                            ...state.channels[channelId][activeTab],
                            [key]: value,
                        },
                    },
                },
            })),
    };
});
