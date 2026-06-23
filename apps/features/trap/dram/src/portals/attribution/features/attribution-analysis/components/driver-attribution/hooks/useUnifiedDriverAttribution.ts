import { useCallback, useRef, useState } from "react";
import { runUnifiedDriverAttribution } from "../api/unifiedDriverAttributionApi";
import type {
  UnifiedDriverAttributionRequest,
  UnifiedDriverAttributionResponse,
} from "../types/unifiedDriverAttribution";

export interface UseUnifiedDriverAttributionResult {
  data: UnifiedDriverAttributionResponse | null;
  loading: boolean;
  error: string | null;
  run: (request: UnifiedDriverAttributionRequest) => Promise<void>;
  clear: () => void;
}

export function useUnifiedDriverAttribution(): UseUnifiedDriverAttributionResult {
  const abortRef = useRef<AbortController | null>(null);
  const [data, setData] = useState<UnifiedDriverAttributionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback((): void => {
    abortRef.current?.abort();
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  const run = useCallback(async (request: UnifiedDriverAttributionRequest): Promise<void> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await runUnifiedDriverAttribution(request, controller.signal);
      setData(response);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Failed to run driver attribution analysis");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  return { data, loading, error, run, clear };
}
