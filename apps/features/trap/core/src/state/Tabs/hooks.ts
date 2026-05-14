import { useTabsStore } from './tabStore';

export const useSetActiveTab = () => useTabsStore((store) => store.setActiveTab);
export const useGetActiveTab = () => useTabsStore((store) => store.activeTab);
