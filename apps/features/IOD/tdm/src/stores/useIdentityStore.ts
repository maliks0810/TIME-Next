import { create } from 'zustand';
import type { StoreApi } from 'zustand';
import { IdentityActions, IdentityState, IdentityStore } from './types';

const INITIAL_STATE: IdentityState = {
  userAuth: null
}

export const useIdentityStore = create<IdentityState & IdentityActions>()(
  (set: StoreApi<IdentityStore>['setState']) => ({
    ...INITIAL_STATE,

    setUserAuth: (auth) => set({ userAuth: auth})
  })
)