const CONTENT_TYPE = "Content-Type";
const APP_JSON = "application/json";
const JSON_HEADERS = { "Content-Type": APP_JSON } as const;

export const fetchData = async<T>(url: string, signal?: AbortSignal): Promise<T> => {

    const response: Response = await fetch(url, {
        method: "GET",
        headers: JSON_HEADERS,
        signal
    });

    await assertResponse(response);

    return await readJsonResponse<T>(response);
}

export const postData = async<T extends object, R = void>(
    url: string,
    body: T,
    signal?: AbortSignal
): Promise<R> => {
    const response = await fetch(url, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
        signal
    });

    await assertResponse(response);

    const contentType = response.headers.get(CONTENT_TYPE) ?? "";
    if (contentType.includes(APP_JSON)) {
        return await readJsonResponse<R>(response);
    }

    return undefined as R;
}

const assertResponse = async (response: Response): Promise<void> => {
    if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        throw new Error(`Error ${response.status}: ${text}`);
    }
}

const readJsonResponse = async<T>(response: Response): Promise<T> => {
    var data: T;

    try {
        data = await response.json();
    }
    catch (e) {
        throw new Error(`Failed to parse JSON: ${(e as Error).message}`);
    }

    if (data === null || data === undefined) {
        throw new Error("Empty reponse");
    }

    return data;
}
