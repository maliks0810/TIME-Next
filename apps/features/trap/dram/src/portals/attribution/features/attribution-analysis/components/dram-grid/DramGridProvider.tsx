import React, { useMemo, useState, useEffect } from "react";
import DramGridContext from "./DramGridContext";
import type {
  GridConfigResponse,
  PersistedGridState,
  NormalizedColumnConfig,
} from "./types";

interface Props {
  config: GridConfigResponse;
  storageKey: string;
  allColumns: NormalizedColumnConfig[];
  children: React.ReactNode;
}

const buildDefaultState = (config: GridConfigResponse): PersistedGridState => ({
  order: config.columnConfigs.all.map((c) => c.id),
  widths: {},
  visibility: {},
});

export const DramGridProvider: React.FC<Props> = ({
  config,
  storageKey,
  allColumns,
  children
}) => {
  const [state, setState] = useState<PersistedGridState>(() => {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : buildDefaultState(config);
  });

  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const setColumnWidth = (id: string, width: number): void => {
    setState((prev) => ({
      ...prev,
      widths: { ...prev.widths, [id]: Math.max(80, width) },
    }));
  };

  const setColumnVisibility = (id: string, visible: boolean): void => {
    setState((prev) => ({
      ...prev,
      visibility: { ...prev.visibility, [id]: visible },
    }));
  };

  const reorderColumns = (activeId: string, overId: string): void => {
    if (activeId === overId) return;

    setState((prev) => {
      const order = [...prev.order];
      const from = order.indexOf(activeId);
      const to = order.indexOf(overId);

      if (from === -1 || to === -1) return prev;

      order.splice(from, 1);
      order.splice(to, 0, activeId);

      return { ...prev, order };
    });
  };

  const value = useMemo(
    () => ({
      state,
      setColumnWidth,
      setColumnVisibility,
      reorderColumns,

      draggingColumnId,
      dropTargetColumnId,

      setDraggingColumnId,
      setDropTargetColumnId,

      allColumns,
    }),
    [
      state,
      draggingColumnId,
      dropTargetColumnId,
      allColumns,
    ]
  );

  return <DramGridContext.Provider value={value}>{children}</DramGridContext.Provider>;
};