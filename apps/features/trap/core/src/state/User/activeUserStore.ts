import { create } from 'zustand';

type ActiveUserState = {
    activeUser: string;
    setActiveUser: (user: string) => void;
};

export const useActiveUserStore = create<ActiveUserState>((set) => ({
    activeUser: '',

    setActiveUser: (activeUser) =>
        set(() => ({
            activeUser,
        })),
}));
