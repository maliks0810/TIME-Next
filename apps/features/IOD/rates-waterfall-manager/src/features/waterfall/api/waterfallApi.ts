import { useIsFetching, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { WaterfallGraph } from '../model/waterfallTypes';

const API_BASE = import.meta.env.VITE_PDM_API_BASE;
//const API_BASE = 'http://localhost:5000/iod/v1/api';
const WATERFALL_PATH = '/waterfall';
const WATERFALL_AUDIT_PATH = '/waterfall/audit';
const OKTA_TOKEN_STORAGE_KEY = 'okta-token-storage';

type OktaTokenStorage = {
  accessToken?: {
    accessToken?: string | null;
  } | null;
};

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

function getOktaAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw =
      window.localStorage.getItem(OKTA_TOKEN_STORAGE_KEY) ??
      window.sessionStorage.getItem(OKTA_TOKEN_STORAGE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as OktaTokenStorage;
    const token = parsed.accessToken?.accessToken;
    return token && token.trim() ? token : null;
  } catch {
    return null;
  }
}

function buildHeaders(headers?: HeadersInit): Headers {
  const next = new Headers(headers);
  const accessToken = getOktaAccessToken();

  if (accessToken && !next.has('Authorization')) {
    next.set('Authorization', `Bearer ${accessToken}`);
  }

  return next;
}

function buildJsonHeaders(headers?: HeadersInit): Headers {
  const next = buildHeaders(headers);

  if (!next.has('Content-Type')) {
    next.set('Content-Type', 'application/json');
  }

  return next;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: buildHeaders(),
  });

  if (!response.ok) throw new Error(`API ${response.status}: ${url}`);
  return response.json();
}

async function sendJson<TResponse>(
  url: string,
  init: RequestInit & { body?: string },
): Promise<TResponse> {
  const { headers, ...rest } = init;
  const response = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: buildJsonHeaders(headers),
  });

  if (!response.ok) throw new Error(`API ${response.status}: ${url}`);
  if (response.status === 204) return undefined as TResponse;
  return response.json();
}

export type SaveWaterfallGraphRequest = {
  changeReason?: string | null;
  graph: WaterfallGraph;
};

export type SaveWaterfallGraphResult = {
  changed: boolean;
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

export async function saveWaterfallGraph(
  request: SaveWaterfallGraphRequest,
): Promise<SaveWaterfallGraphResult> {
  return sendJson<SaveWaterfallGraphResult>(waterfallGraphUrl(), {
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
