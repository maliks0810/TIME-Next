export const NoTrailingForwardSlash = (url?: string): string | undefined => {

    if (!url) {
        return url;
    }

    url = url.trim();

    if (url.endsWith('/')) {
        return url.slice(0, -1);
    }

    return url;
}


export const IsNullOrEmpty = (str: string | null | undefined): boolean => {
  return str === null || str === undefined || str.trim() === '';
};

export function handleErrors(response: Response):Response {
    if (!response.ok) {
        throw Error(response.statusText || `HTTP error! status: ${response.status}`);
    }
    return response;
}