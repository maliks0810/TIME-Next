import { create } from 'zustand';
import type { StoreApi } from 'zustand';

interface DashboardState {
  dmAnalystAssignments: Record<number, string>;
  isDmAnalystDropdownOpen: boolean;
  notifiedRequestIds: Set<number>;
}

interface DashboardActions {
  setDmAnalyst: (requestId: number, analystEmail: string) => void;
  setDmAnalystDropdownOpen: (open: boolean) => void;
  setDmAnalystAssignments: (rows: { id: number; email: string | null }[]) => void;
  seedDmAnalystAssignments: (rows: { id: number; email: string | null }[]) => void;
  addNotifiedRequestId: (id: number) => void;
}

type DashboardStore = DashboardState & DashboardActions;

export const useDashboardStore = create<DashboardStore>()(
  (set: StoreApi<DashboardStore>['setState']) => ({
    dmAnalystAssignments: {},
    isDmAnalystDropdownOpen: false,
    notifiedRequestIds: new Set<number>(),
    addNotifiedRequestId: (id: number) =>
      set((prev: DashboardStore) => ({ notifiedRequestIds: new Set(prev.notifiedRequestIds).add(id) })),
    setDmAnalyst: (requestId: number, analystEmail: string) =>
      set((prev: DashboardStore) => ({
        dmAnalystAssignments: { ...prev.dmAnalystAssignments, [requestId]: analystEmail}
      })),
    setDmAnalystDropdownOpen: (open: boolean) => set({ isDmAnalystDropdownOpen: open }),
    
    setDmAnalystAssignments: (rows: { id: number; email: string | null }[]) =>
      set((prev: DashboardStore) => {
        const assignments: Record<number, string> = {};
        for (const { id, email } of rows) {
          if (email) {
            assignments[id] = email;
          }
        }

        return Object.keys(assignments).length
          ? { dmAnalystAssignments: { ...assignments } }
          : prev;
      }),
    
    // only seeds rows not already in store - preserves in-session user selections across polls
    seedDmAnalystAssignments: (rows: { id: number; email: string | null }[]) =>
      set((prev: DashboardStore) => {
        const patch: Record<number, string> = {};
        for (const { id, email } of rows) {
          if (!(id in prev.dmAnalystAssignments) && email) {
            patch[id] = email;
          }
        }

        return Object.keys(patch).length
          ? { dmAnalystAssignments: { ...prev.dmAnalystAssignments, ...patch } }
          : prev;
      }),
  }),
);
