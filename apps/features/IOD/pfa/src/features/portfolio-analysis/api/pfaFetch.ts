type OktaTokenStorage = {
  accessToken?: {
    accessToken?: string;
  };
};

type PfaRequestOptions = {
  signal?: AbortSignal;
  includeAuthorization?: boolean;
  credentials?: RequestCredentials;
};

const API_BASE = import.meta.env.VITE_PDM_API_BASE ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function getOktaAccessToken(): string | null {
  try {
    const rawTokenStorage = window.localStorage.getItem("okta-token-storage");
    if (!rawTokenStorage) return null;

    const tokenStorage = JSON.parse(rawTokenStorage) as OktaTokenStorage;
    return tokenStorage.accessToken?.accessToken ?? null;
  } catch {
    return null;
  }
}

function requestHeaders(
  accept?: string,
  includeAuthorization = true,
): HeadersInit | undefined {
  const accessToken = includeAuthorization ? getOktaAccessToken() : null;
  if (!accessToken && !accept) return undefined;

  return {
    ...(accept ? { Accept: accept } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function readErrorResponse(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const body = (await response.json()) as Record<string, unknown>;
      const message = body.detail ?? body.title ?? body.error;
      return message == null ? JSON.stringify(body) : String(message);
    }

    return await response.text();
  } catch {
    return "";
  }
}

export async function fetchPfaJson<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: requestHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchPfaArrowBuffer(
  url: string,
  options: PfaRequestOptions = {},
): Promise<ArrayBuffer> {
  const {
    signal,
    includeAuthorization = true,
    credentials = "include",
  } = options;

  const response = await fetch(url, {
    credentials,
    headers: requestHeaders(
      "application/vnd.apache.arrow.stream",
      includeAuthorization,
    ),
    signal,
  });

  if (!response.ok) {
    const responseMessage = await readErrorResponse(response);
    const suffix = responseMessage ? ` ${responseMessage}` : "";
    throw new Error(`Arrow API ${response.status}: ${url}.${suffix}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/vnd.apache.arrow.stream")) {
    throw new Error(
      `Unexpected benchmark Arrow response type: ${contentType || "missing content-type"}`,
    );
  }

  // The browser handles any HTTP content encoding before arrayBuffer resolves.
  return response.arrayBuffer();
}
