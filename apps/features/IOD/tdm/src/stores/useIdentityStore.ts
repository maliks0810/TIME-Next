import { create } from 'zustand';
import type { StoreApi } from 'zustand';
import { IdentityActions, IdentityState, IdentityStore } from './types';

const INITIAL_STATE: IdentityState = {
  userIdentity: null,
  isIdentityLoaded: false,
}

export const useIdentityStore = create<IdentityState & IdentityActions>()(
  (set: StoreApi<IdentityStore>['setState']) => ({
    ...INITIAL_STATE,

    setUserIdentity: (auth) => set({ userIdentity: auth }),
    setIdentityLoaded: (loaded) => set({ isIdentityLoaded: loaded }),
  })
)
