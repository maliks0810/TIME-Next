import { useTabsStore } from './tabStore';

export const useSetActiveTab = () => useTabsStore((store) => store.setActiveTab);
export const useGetActiveTab = () => useTabsStore((store) => store.activeTab);

export const useSetTabs = () => useTabsStore((store) => store.setTabs);

export const useGetTabs = () => useTabsStore((store) => store.tabs);
