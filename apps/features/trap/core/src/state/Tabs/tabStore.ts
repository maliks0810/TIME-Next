import { create } from 'zustand';

type TabsState = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

export const useTabsStore = create<TabsState>((set) => ({
    activeTab: 'landing',

    setActiveTab: (tab) =>
        set(() => ({
            activeTab: tab,
        })),
}));
