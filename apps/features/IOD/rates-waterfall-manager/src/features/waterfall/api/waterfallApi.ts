import { useIsFetching, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { WaterfallGraph } from '../model/waterfallTypes';

const API_BASE = import.meta.env.VITE_PDM_API_BASE;
const WATERFALL_PATH = '/waterfall';
const WATERFALL_AUDIT_PATH = '/waterfall/audit';

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error(`API ${response.status}: ${url}`);
  return response.json();
}

async function sendJson<TResponse>(
  url: string,
  init: RequestInit & { body?: string },
): Promise<TResponse> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    ...init,
  });

  if (!response.ok) throw new Error(`API ${response.status}: ${url}`);
  if (response.status === 204) return undefined as TResponse;
  return response.json();
}

export type SaveWaterfallGraphRequest = {
  changeReason?: string | null;
  graph: WaterfallGraph;
};

export type WaterfallAuditEvent = {
  auditEventId: number;
  entityType: string;
  entityId?: string | null;
  actionType: string;
  changeReason?: string | null;
  beforeJson?: string | null;
  afterJson?: string | null;
  actor: string;
  actedAt: string;
  requestId?: string | null;
};

export function waterfallGraphUrl(): string {
  return apiUrl(WATERFALL_PATH);
}

export function waterfallAuditUrl(): string {
  return apiUrl(WATERFALL_AUDIT_PATH);
}

export async function getWaterfallGraph(): Promise<WaterfallGraph> {
  return fetchJson<WaterfallGraph>(waterfallGraphUrl());
}

export async function saveWaterfallGraph(request: SaveWaterfallGraphRequest): Promise<void> {
  return sendJson<void>(waterfallGraphUrl(), {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

export async function getWaterfallAudit(): Promise<WaterfallAuditEvent[]> {
  return fetchJson<WaterfallAuditEvent[]>(waterfallAuditUrl());
}

export function useWaterfallRefreshStatus() {
  const queryClient = useQueryClient();
  const count = useIsFetching({ queryKey: ['waterfall'] });

  return {
    isFetching: count > 0,
    refetchAll: () => queryClient.invalidateQueries({ queryKey: ['waterfall'] }),
  };
}

export function useWaterfallGraph(enabled = true) {
  return useQuery({
    queryKey: ['waterfall', 'graph'],
    queryFn: getWaterfallGraph,
    enabled,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

export function useWaterfallAudit(enabled = true) {
  return useQuery({
    queryKey: ['waterfall', 'audit'],
    queryFn: getWaterfallAudit,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useSaveWaterfallGraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveWaterfallGraph,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['waterfall'] });
    },
  });
}

