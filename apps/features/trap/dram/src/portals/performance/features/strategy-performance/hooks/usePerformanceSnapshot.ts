import { useEffect, useState } from "react";
import { mapFlatRecordsToSnapshot } from "../model/mappers";
import type {
  PerformanceSnapshotApiResponse,
  DRAMApiResponse,
} from "../api/types";
import { fetchFuncDailyReturnsService } from "../api/services";

type State = {
  data: PerformanceSnapshotApiResponse;
  loading: boolean;
  error: string | null;
};

export function usePerformanceSnapshot(): State {
  const [state, setState] = useState<State>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const resp = await fetchFuncDailyReturnsService();
        const payload: unknown = resp?.data;

        if (!payload || typeof payload !== "object") {
          throw new Error("Invalid API response");
        }

        const typed = payload as DRAMApiResponse;
        const rows = typed.data.grids.flatMap((g) => g.rows);

        if (!cancelled) {
          setState({
            data: mapFlatRecordsToSnapshot(rows),
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            data: [],
            loading: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}