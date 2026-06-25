import React, { useMemo, useState, useEffect, useCallback } from "react";
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

const buildStateFromColumns = (
  allColumns: NormalizedColumnConfig[]
): PersistedGridState => ({
  order: allColumns.map((c) => c.id),
  widths: Object.fromEntries(
    allColumns
      .filter((c) => typeof c.width === "number")
      .map((c) => [c.id, c.width as number])
  ),
  visibility: Object.fromEntries(allColumns.map((c) => [c.id, c.visible])),
});

/**
 * Supports BOTH persisted formats:
 * 1) PersistedGridState
 * 2) NormalizedColumnConfig[]   <-- your parent onSave currently writes this
 */
const safeParseState = (
  raw: string | null
): PersistedGridState | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;

    // Case 1: saved as NormalizedColumnConfig[]
    if (Array.isArray(parsed)) {
      const cols = parsed as NormalizedColumnConfig[];
      return buildStateFromColumns(cols);
    }

    // Case 2: saved as PersistedGridState
    if (parsed && typeof parsed === "object") {
      const p = parsed as Partial<PersistedGridState>;

      return {
        order: Array.isArray(p.order) ? p.order : [],
        widths:
          p.widths && typeof p.widths === "object"
            ? (p.widths as Record<string, number>)
            : {},
        visibility:
          p.visibility && typeof p.visibility === "object"
            ? (p.visibility as Record<string, boolean>)
            : {},
      };
    }

    return null;
  } catch {
    return null;
  }
};

const mergeStoredStateWithColumns = (
  allColumns: NormalizedColumnConfig[],
  stored: PersistedGridState | null
): PersistedGridState => {
  const base = buildStateFromColumns(allColumns);

  if (!stored) {
    return base;
  }

  const validIds = new Set(allColumns.map((c) => c.id));

  return {
    order: [
      ...stored.order.filter((id) => validIds.has(id)),
      ...base.order.filter((id) => !stored.order.includes(id)),
    ],
    widths: {
      ...base.widths,
      ...Object.fromEntries(
        Object.entries(stored.widths).filter(([id]) => validIds.has(id))
      ),
    },
    visibility: {
      ...base.visibility,
      ...Object.fromEntries(
        Object.entries(stored.visibility).filter(([id]) => validIds.has(id))
      ),
    },
  };
};

export const DramGridProvider: React.FC<Props> = ({
  config,
  storageKey,
  allColumns,
  children,
}) => {
  /**
   * Initial load:
   * - read saved layout from localStorage if present
   * - otherwise use incoming allColumns
   */
  const [state, setState] = useState<PersistedGridState>(() => {
    const stored = safeParseState(localStorage.getItem(storageKey));
    return mergeStoredStateWithColumns(allColumns, stored);
  });

  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(null);

  /**
   * IMPORTANT:
   * When parent applies a new layout (changes allColumns),
   * we must override order + visibility in memory immediately.
   *
   * This is what makes "Apply" work.
   *
   * We intentionally DO NOT read from localStorage here,
   * because otherwise saved layout would override the applied session layout.
   */
  useEffect(() => {
    setState((prev) => {
      const nextOrder = allColumns.map((c) => c.id);
      const nextVisibility = Object.fromEntries(
        allColumns.map((c) => [c.id, c.visible])
      );
      const nextWidths = {
        ...prev.widths,
        ...Object.fromEntries(
          allColumns
            .filter((c) => typeof c.width === "number")
            .map((c) => [c.id, c.width as number])
        ),
      };

      return {
        order: nextOrder,
        visibility: nextVisibility,
        widths: nextWidths,
      };
    });
  }, [allColumns]);

  /**
   * When storageKey changes (for example asset class changes),
   * reload the saved layout for that key.
   */
  useEffect(() => {
    const stored = safeParseState(localStorage.getItem(storageKey));

    if (stored) {
      setState(mergeStoredStateWithColumns(allColumns, stored));
    } else {
      setState(buildStateFromColumns(allColumns));
    }
  }, [storageKey, allColumns, config]);

  const setColumnWidth = useCallback((id: string, width: number): void => {
    setState((prev) => ({
      ...prev,
      widths: {
        ...prev.widths,
        [id]: Math.max(80, width),
      },
    }));
  }, []);

  const setColumnVisibility = useCallback((id: string, visible: boolean): void => {
    setState((prev) => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [id]: visible,
      },
    }));
  }, []);

  const reorderColumns = useCallback((activeId: string, overId: string): void => {
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
  }, []);

  const applyColumnLayout = useCallback((columns: NormalizedColumnConfig[]): void => {
    setState((prev) => ({
      order: columns.map((c) => c.id),
      visibility: Object.fromEntries(columns.map((c) => [c.id, c.visible])),
      widths: {
        ...prev.widths,
        ...Object.fromEntries(
          columns
            .filter((c) => typeof c.width === "number")
            .map((c) => [c.id, c.width as number])
        ),
      },
    }));
  }, []);

  const resetLayout = useCallback((): void => {
    setState(buildStateFromColumns(allColumns));
  }, [allColumns]);

  const value = useMemo(
    () => ({
      state,
      setColumnWidth,
      setColumnVisibility,
      reorderColumns,
      applyColumnLayout,
      resetLayout,
      draggingColumnId,
      dropTargetColumnId,
      setDraggingColumnId,
      setDropTargetColumnId,
      allColumns,
    }),
    [
      state,
      setColumnWidth,
      setColumnVisibility,
      reorderColumns,
      applyColumnLayout,
      resetLayout,
      draggingColumnId,
      dropTargetColumnId,
      allColumns,
    ]
  );

  return (
    <DramGridContext.Provider value={value}>
      {children}
    </DramGridContext.Provider>
  );
};