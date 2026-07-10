import { create } from 'zustand';
import type { StoreApi } from 'zustand';

interface DashboardState {
  dmAnalystAssignments: Record<number, string>;
  isDmAnalystDropdownOpen: boolean;
}

interface DashboardActions {
  setDmAnalyst: (requestId: number, analystEmail: string) => void;
  setDmAnalystDropdownOpen: (open: boolean) => void;
}

type DashboardStore = DashboardState & DashboardActions;

export const useDashboardStore = create<DashboardStore>()(
  (set: StoreApi<DashboardStore>['setState']) => ({
    dmAnalystAssignments: {},
    isDmAnalystDropdownOpen: false,
    setDmAnalyst: (requestId: number, analystEmail: string) =>
      set((prev: DashboardStore) => ({
        dmAnalystAssignments: { ...prev.dmAnalystAssignments, [requestId]: analystEmail}
      })),
    setDmAnalystDropdownOpen: (open: boolean) => set({ isDmAnalystDropdownOpen: open})
  }),
);
