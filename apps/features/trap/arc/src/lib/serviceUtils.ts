import axios from 'axios';

const DEFAULT_CONTENT_TYPE = 'application/json';
const DEFAULT_TIMEOUT = 120000; // 2 min

export const generateUUID = (): string => crypto.randomUUID();

export const serviceRequest =
    (
        baseURL: string,
        contentType: string = DEFAULT_CONTENT_TYPE,
        timeout: number = DEFAULT_TIMEOUT
    ) =>
    () =>
        axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': contentType,
                'X-Correlation-ID': generateUUID(),
            },
        });
