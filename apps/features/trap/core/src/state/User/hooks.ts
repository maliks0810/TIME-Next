import { useActiveUserStore } from './activeUserStore';

export const useSetActiveUser = () => useActiveUserStore((store) => store.setActiveUser);
export const useGetActiveUser = () => useActiveUserStore((store) => store.activeUser);
