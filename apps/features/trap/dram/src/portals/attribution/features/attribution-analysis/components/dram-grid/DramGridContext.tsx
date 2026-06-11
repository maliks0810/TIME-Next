import { createContext, useContext } from "react";
import type {
  PersistedGridState,
  NormalizedColumnConfig,
} from "./types";

interface DramGridContextValue {
  state: PersistedGridState;

  setColumnWidth: (id: string, width: number) => void;
  setColumnVisibility: (id: string, visible: boolean) => void;
  reorderColumns: (activeId: string, overId: string) => void;

  draggingColumnId: string | null;
  dropTargetColumnId: string | null;

  setDraggingColumnId: (id: string | null) => void;
  setDropTargetColumnId: (id: string | null) => void;

  allColumns: NormalizedColumnConfig[];
}

const DramGridContext = createContext<DramGridContextValue | null>(null);

export const useDramGridContext = (): DramGridContextValue => {
  const ctx = useContext(DramGridContext);
  if (!ctx) throw new Error("DramGridContext not found");
  return ctx;
};

export default DramGridContext;