import { WorkflowTabModel } from '../../features/landing/types/landing.types';
import { create } from 'zustand';

type TabsState = {
    activeTab: string;
    tabs: WorkflowTabModel[];
    setActiveTab: (tab: string) => void;
    setTabs: (tabs: WorkflowTabModel[]) => void;
};

export const useTabsStore = create<TabsState>((set) => ({
    activeTab: 'landing',
    tabs: [],
    setTabs: (tabs) =>
        set(() => ({
            tabs: tabs,
        })),
    setActiveTab: (tab) =>
        set(() => ({
            activeTab: tab,
        })),
}));
