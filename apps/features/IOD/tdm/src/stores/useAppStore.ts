import { create } from 'zustand';

interface AppState {
  // reserved for future cross-page states
}

export const useAppStore = create<AppState>()(() => ({}));
