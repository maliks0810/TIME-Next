type OktaTokenStorage = {
  accessToken?: {
    accessToken?: string;
  };
};

const API_BASE = import.meta.env.VITE_PDM_API_BASE ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function getOktaAccessToken(): string | null {
  try {
    const rawTokenStorage = window.localStorage.getItem('okta-token-storage');
    if (!rawTokenStorage) return null;

    const tokenStorage = JSON.parse(rawTokenStorage) as OktaTokenStorage;
    return tokenStorage.accessToken?.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function fetchPfaJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const accessToken = getOktaAccessToken();

  const response = await fetch(url, {
    credentials: 'include',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    signal,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${url}`);
  }

  return response.json() as Promise<T>;
}
